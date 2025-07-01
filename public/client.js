const socket = io();
let card = [];
let cardData = [];

// ✅ Cargar datos de cartas desde cards.json
fetch('cards.json')
  .then(response => response.json())
  .then(data => {
    cardData = data;
  });

function joinGame() {
  const name = document.getElementById('name').value;
  if (name.trim()) {
    socket.emit('join', name);
  }
}

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
      img.src = `img/${carta.image}`;
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
  const lastNumberEl = document.getElementById('lastNumber');
  const lastImageEl = document.getElementById('lastImage');

  lastNumberEl.textContent = `Salió: ${num}`;
  lastImageEl.innerHTML = '';

  const carta = cardData.find(c => c.id === num);
  if (carta) {
    const img = document.createElement('img');
    img.src = `img/${carta.image}`;
    img.alt = carta.name;
    img.style.width = '150px';
    img.style.borderRadius = '12px';
    lastImageEl.appendChild(img);
    lastNumberEl.textContent = `Salió: ${carta.name}`;
  }

  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    const text = cell.textContent.trim();
    const dataNum = cell.getAttribute('data-num');

    if (parseInt(text) === num || parseInt(dataNum) === num) {
      cell.classList.add('marked');
    }
  });
});

socket.on('winner', (name) => {
  document.getElementById('winner').textContent = `¡Ganó ${name}! 🎉`;
});

socket.on('message', (msg) => {
  document.getElementById('status').textContent = msg;
});
