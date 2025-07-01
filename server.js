const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { generateCard } = require('./card');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

let players = {};
let drawnNumbers = [];
let interval;
let gameInProgress = false;

// ✅ Conexión de nuevo jugador
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  socket.on('join', (name) => {
    if (gameInProgress) {
      socket.emit('message', 'Espera al siguiente juego...');
      return;
    }

    players[socket.id] = {
      name,
      card: generateCard()
    };

    socket.emit('card', players[socket.id].card);
    io.emit('message', `Jugadores conectados: ${Object.keys(players).length}`);

    if (Object.keys(players).length >= 4 && !gameInProgress) {
      startGame();
    }
  });

  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`);
    delete players[socket.id];
    io.emit('message', `Jugadores conectados: ${Object.keys(players).length}`);
  });
});

// ✅ Iniciar juego automáticamente
function startGame() {
  drawnNumbers = [];
  gameInProgress = true;
  io.emit('message', '¡Comienza la lotería!');

  interval = setInterval(() => {
    if (drawnNumbers.length >= 54) {
      clearInterval(interval);
      gameInProgress = false;
      io.emit('message', 'Fin del juego: se acabaron las cartas');
      return;
    }

    let num;
    do {
      num = Math.floor(Math.random() * 54) + 1;
    } while (drawnNumbers.includes(num));

    drawnNumbers.push(num);
    io.emit('numberDrawn', num);

    checkForWinners();
  }, 3000);
}

// ✅ Verificar si alguien ya ganó
function checkForWinners() {
  for (const [id, player] of Object.entries(players)) {
    const matched = player.card.filter(n => drawnNumbers.includes(n));
    if (matched.length >= 16) {
      clearInterval(interval);
      gameInProgress = false;
      io.emit('winner', player.name);
      io.emit('message', `Fin del juego: ganó ${player.name}`);
      break;
    }
  }
}

// ✅ Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
