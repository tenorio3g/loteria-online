
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

const TOTAL_NUMBERS = 54;
let players = [];
let cards = {};
let drawnNumbers = [];
let gameStarted = false;

function generateCard() {
  const nums = [];
  while (nums.length < 16) {
    const rand = Math.floor(Math.random() * TOTAL_NUMBERS) + 1;
    if (!nums.includes(rand)) nums.push(rand);
  }
  return nums;
}

function drawNumber() {
  if (drawnNumbers.length >= TOTAL_NUMBERS) return null;
  let num;
  do {
    num = Math.floor(Math.random() * TOTAL_NUMBERS) + 1;
  } while (drawnNumbers.includes(num));
  drawnNumbers.push(num);
  return num;
}

function checkWinner(card) {
  return card.every(n => drawnNumbers.includes(n));
}

io.on('connection', (socket) => {
  socket.on('join', (name) => {
    players.push(name);
    cards[socket.id] = generateCard();
    socket.emit('card', cards[socket.id]);
    io.emit('players', players);
    io.emit('ready', players.length >= 4);
  });

  socket.on('iniciar', () => {
    if (players.length >= 4 && !gameStarted) {
      gameStarted = true;
      const interval = setInterval(() => {
        const num = drawNumber();
        if (num === null) return clearInterval(interval);
        io.emit('numberDrawn', num);
        for (let id in cards) {
          if (checkWinner(cards[id])) {
            io.emit('winner', players[Object.keys(cards).indexOf(id)]);
            clearInterval(interval);
            break;
          }
        }
      }, 3000);
    }
  });

  socket.on('disconnect', () => {
    players.splice(Object.keys(cards).indexOf(socket.id), 1);
    delete cards[socket.id];
    io.emit('players', players);
    io.emit('ready', players.length >= 4);
  });
});

http.listen(3000, () => {
  console.log('Servidor en puerto 3000');
});
