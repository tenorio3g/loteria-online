const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const { generateCard } = require('./card');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

let players = {};
let drawnNumbers = [];
let interval;
let gameInProgress = false;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on('join', (name) => {
    if (Object.keys(players).length >= 10) {
      socket.emit('message', '¡El juego ya está lleno!');
      return;
    }
    players[socket.id] = { name, card: generateCard() };
    socket.emit('card', players[socket.id].card);
    io.emit('message', `${name} se ha unido al juego.`);

    if (!gameInProgress && Object.keys(players).length >= 4) {
      startGame();
    }
  });

  socket.on('disconnect', () => {
    if (players[socket.id]) {
      const name = players[socket.id].name;
      delete players[socket.id];
      io.emit('message', `${name} salió del juego.`);
    }
    if (Object.keys(players).length < 4 && gameInProgress) {
      stopGame();
      io.emit('message', 'Juego detenido por falta de jugadores.');
    }
  });
});

function startGame() {
  gameInProgress = true;
  drawnNumbers = [];

  interval = setInterval(() => {
    if (drawnNumbers.length >= 54) {
      stopGame();
      io.emit('message', '¡Todas las cartas han salido!');
      return;
    }
    let num;
    do {
      num = Math.floor(Math.random() * 54) + 1;
    } while (drawnNumbers.includes(num));

    drawnNumbers.push(num);
    io.emit('numberDrawn', num);
    checkWinners();
  }, 4000);
}

function stopGame() {
  gameInProgress = false;
  clearInterval(interval);
}

function checkWinners() {
  for (let id in players) {
    const card = players[id].card;
    if (card.every(n => drawnNumbers.includes(n))) {
      io.emit('winner', players[id].name);
      stopGame();
      break;
    }
  }
}

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});