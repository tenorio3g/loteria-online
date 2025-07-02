
const socket = io();
let card = [];
let cardData = [];

function joinGame() {
  const name = document.getElementById('name').value;
  if (name.trim()) {
    socket.emit('join', name);
  }
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
      img.style.width = '100%';
      img.style.borderRadius = '8px';
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
  const lastNumber = document.getElementById('lastNumber');
  const currentCard = document.getElementById('currentCard');

  if (carta) {
    lastNumber.textContent = `Salió: ${carta.name}`;
    currentCard.innerHTML = `
      <img src="${carta.image}" alt="${carta.name}" style="width: 180px; border-radius: 12px; margin-top: 10px;">
    `;
    if (carta.audio) {
      const sonido = new Audio(carta.audio);
      sonido.play();
    }
  } else {
    lastNumber.textContent = `Salió: ${num}`;
    currentCard.innerHTML = '';
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
  document.getElementById('winner').textContent = `¡Ganó ${name}!`;
});

socket.on('message', (msg) => {
  document.getElementById('status').textContent = msg;
});
