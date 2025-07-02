const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const { generateCard } = require('./card'); // Asegúrese que card.js esté también en raíz

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Servir todos los archivos desde la raíz del proyecto
app.use(express.static(path.join(__dirname)));

// Variables de juego
let players = {};
let drawnNumbers = [];
let interval;
let gameInProgress = false;

// Rutas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Socket.IO
io.on('connection', (socket) => {
  console.log(`Nuevo cliente conectado: ${socket.id}`);

  socket.on('join', (name) => {
    if (Object.keys(players).length >= 10) {
      socket.emit('message', '¡El juego ya está lleno!');
      return;
    }

    players[socket.id] = {
      name,
      card: generateCard()
    };

    socket.emit('card', players[socket.id].card);
    io.emit('message', `${name} se ha unido al juego.`);

    // Iniciar juego automáticamente cuando haya al menos 4 jugadores
    if (!gameInProgress && Object.keys(players).length >= 4) {
      startGame();
    }
  });

  socket.on('disconnect', () => {
    if (players[socket.id]) {
      const playerName = players[socket.id].name;
      delete players[socket.id];
      io.emit('message', `${playerName} salió del juego.`);
    }

    if (Object.keys(players).length < 4 && gameInProgress) {
      stopGame();
      io.emit('message', 'Juego detenido. Se necesitan al menos 4 jugadores.');
    }
  });
});

// Inicia el juego
function startGame() {
  gameInProgress = true;
  drawnNumbers = [];

  interval = setInterval(() => {
    if (drawnNumbers.length >= 54) {
      stopGame();
      io.emit('message', '¡Se han agotado las cartas!');
      return;
    }

    let num;
    do {
      num = Math.floor(Math.random() * 54) + 1;
    } while (drawnNumbers.includes(num));

    drawnNumbers.push(num);
    io.emit('numberDrawn', num);
    checkWinners(num);
  }, 4000);
}

// Detiene el juego
function stopGame() {
  gameInProgress = false;
  clearInterval(interval);
}

// Verifica si alguien ganó
function checkWinners(num) {
  for (let id in players) {
    let player = players[id];
    if (player.card.every(n => drawnNumbers.includes(n))) {
      io.emit('winner', player.name);
      stopGame();
      break;
    }
  }
}

// Inicia el servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
