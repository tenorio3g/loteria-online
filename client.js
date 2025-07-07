
const socket = io();
let card = [];
let cardData = [];

function joinGame() {
  const name = document.getElementById('name').value;
  if (name.trim()) {
    socket.emit('join', name);
    document.getElementById('winnerFloating').classList.remove('show');
    document.getElementById('winnerFloating').innerHTML = '';
  }
}

function iniciarJuego() {
  const tipoJuego = document.getElementById('tipoJuego').value;
  socket.emit('iniciar', tipoJuego);
}

fetch('cards.json')
  .then(res => res.json())
  .then(data => cardData = data);

socket.on('card', (generatedCard) => {
  card = generatedCard;
  const cardDiv = document.getElementById('card');
  cardDiv.innerHTML = '';
  for (let num of card) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    const carta = cardData.find(c => c.id === num);
    if (carta) {
      const img = document.createElement('img');
      img.src = carta.image;
      img.alt = carta.name;
      cell.setAttribute('data-num', num);
      cell.appendChild(img);
    } else {
      cell.textContent = num;
    }
    cardDiv.appendChild(cell);
  }
});

socket.on('numberDrawn', (num) => {
  const carta = cardData.find(c => c.id === num);
  const floatingCard = document.getElementById('floatingCard');
  const lastNumber = document.getElementById('lastNumber');

  if (carta) {
    lastNumber.textContent = `Salió: ${carta.name}`;
    floatingCard.innerHTML = `<img src="${carta.image}" alt="${carta.name}" style="width: 200px; border-radius: 12px;">`;
    floatingCard.classList.add('show');
    setTimeout(() => floatingCard.classList.remove('show'), 1500);
  }

  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    const dataNum = cell.getAttribute('data-num');
    if (parseInt(dataNum) === num) {
      cell.classList.add('marked');
    }
  });
});

socket.on('winner', (name) => {
  const winnerFloating = document.getElementById('winnerFloating');
  winnerFloating.innerHTML = `<div style="background:#ff4757; color:#fff; padding:20px; border-radius:12px; font-size:24px;">🎉 ¡Ganó ${name}! 🎉</div>`;
  winnerFloating.classList.add('show');
});

socket.on('players', (players) => {
  const playersList = document.getElementById('playersList');
  playersList.innerHTML = "<strong>Jugadores:</strong> " + players.join(', ');
});

socket.on('ready', (isReady) => {
  const btn = document.getElementById('startBtn');
  btn.disabled = !isReady;
  document.getElementById('status').textContent = isReady ? "Listo para iniciar" : "Esperando mínimo 4 jugadores...";
});
