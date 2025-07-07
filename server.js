
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));
app.use(express.json());

const fs = require('fs');

let players = [];
let cards = {};
let drawnNumbers = [];
let gameStarted = false;
let tipoJuego = "normal";

function generateCard() {
  const numbers = [];
  while (numbers.length < 16) {
    const num = Math.floor(Math.random() * 54) + 1;
    if (!numbers.includes(num)) numbers.push(num);
  }
  return numbers;
}

function checkWin(card, marked, tipo) {
  const index = (i, j) => i * 4 + j;

  const isMarked = i => marked.includes(card[i]);

  if (tipo === "llena") {
    return card.every(n => marked.includes(n));
  }

  // Horizontal
  for (let i = 0; i < 4; i++) {
    if ([0, 1, 2, 3].every(j => isMarked(index(i, j)))) return true;
  }

  // Vertical
  for (let j = 0; j < 4; j++) {
    if ([0, 1, 2, 3].every(i => isMarked(index(i, j)))) return true;
  }

  // Diagonales
  if ([0, 1, 2, 3].every(i => isMarked(index(i, i)))) return true;
  if ([0, 1, 2, 3].every(i => isMarked(index(i, 3 - i)))) return true;

  // Cuadro chico (centro 2x2)
  const smallSquare = [5, 6, 9, 10];
  if (smallSquare.every(i => isMarked(i))) return true;

  // Cuadro grande (centro 3x3)
  const bigSquare = [1, 2, 5, 6, 9, 10, 13, 14];
  if (bigSquare.every(i => isMarked(i))) return true;

  return false;
}

app.get('/cards.json', (req, res) => {
  fs.readFile('./cards.json', (err, data) => {
    if (err) return res.status(500).send("Error loading cards.json");
    res.json(JSON.parse(data));
  });
});

io.on('connection', (socket) => {
  socket.on('join', (name) => {
    if (!players.find(p => p.id === socket.id)) {
      players.push({ id: socket.id, name, marked: [] });
      cards[socket.id] = generateCard();
    }

    io.emit('players', players.map(p => p.name));
    socket.emit('card', cards[socket.id]);

    if (players.length >= 4 && !gameStarted) {
      io.emit('ready', true);
    }
  });

  socket.on('iniciar', (tipo) => {
    drawnNumbers = [];
    gameStarted = true;
    tipoJuego = tipo;

    // Generar nueva carta para todos y limpiar marcados
    players = players.map(p => {
      cards[p.id] = generateCard();
      return { ...p, marked: [] };
    });

    // Enviar nuevas cartas y reiniciar pantalla
    for (let p of players) {
      io.to(p.id).emit('card', cards[p.id]);
    }

    io.emit('winner', ''); // Limpiar nombre del ganador
    io.emit('message', '¡Nuevo juego iniciado!');

    tipoJuego = tipo;
    gameStarted = true;
    drawnNumbers = [];
    io.emit('message', '¡Juego iniciado!');
    drawNumber();
  });

  socket.on('disconnect', () => {
    players = players.filter(p => p.id !== socket.id);
    delete cards[socket.id];
    io.emit('players', players.map(p => p.name));
    if (players.length < 4) io.emit('ready', false);
  });
});

function drawNumber() {
  if (drawnNumbers.length >= 54) return;

  let num;
  do {
    num = Math.floor(Math.random() * 54) + 1;
  } while (drawnNumbers.includes(num));

  drawnNumbers.push(num);
  io.emit('numberDrawn', num);

  let winner = null;
  for (let p of players) {
    const card = cards[p.id];
    const marked = card.filter(n => drawnNumbers.includes(n));
    if (checkWin(card, marked, tipoJuego)) {
      winner = p.name;
      break;
    }
  }

  if (winner) {
    io.emit('winner', winner);
    gameStarted = false;
    return;
  }

  setTimeout(drawNumber, 3000);
}

http.listen(process.env.PORT || 3000, () => {
  console.log('Servidor en puerto 3000');
});
