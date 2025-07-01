const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

let players = [];
let drawnNumbers = [];
let gameInProgress = false;
let interval;

function generateCard() {
  const set = new Set();
  while (set.size < 16) {
    set.add(Math.floor(Math.random() * 50) + 1);
  }
  return Array.from(set);
}

function drawNumber() {
  if (drawnNumbers.length >= 50) return;
  let number;
  do {
    number = Math.floor(Math.random() * 50) + 1;
  } while (drawnNumbers.includes(number));
  drawnNumbers.push(number);
  io.emit('numberDrawn', number);

  for (let player of players) {
    const matched = player.card.filter(num => drawnNumbers.includes(num));
    if (matched.length === 16) {
      clearInterval(interval);
      io.emit('winner', player.name);
      players = [];
      drawnNumbers = [];
      gameInProgress = false;
      break;
    }
  }
}

io.on('connection', (socket) => {
  console.log('Nuevo jugador conectado:', socket.id);

  socket.on('join', (name) => {
    if (gameInProgress) {
      socket.emit('message', 'Juego en curso, espera la próxima ronda.');
      return;
    }

    const card = generateCard();
    players.push({ id: socket.id, name, card });
    socket.emit('card', card);
    io.emit('message', `${name} se ha unido. Jugadores: ${players.length}/4`);

    if (players.length >= 4) {
      io.emit('message', '¡Comienza el juego!');
      gameInProgress = true;
      interval = setInterval(drawNumber, 3000);
    }
  });

  socket.on('disconnect', () => {
    players = players.filter(p => p.id !== socket.id);
    console.log('Jugador desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});

