const socket = io();
let card = [];
let cardData = [];

// Cargar los datos de las cartas desde cards.json
fetch('cards.json')
  .then(res => res.json())
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
      img.src = carta.image; // Ya no se usa carpeta img/
      img.alt = carta.name;
      img.style.width = '100%';
      img.style.borderRadius = '8px';
      cell.setAttribute('data-num', num);
      cell.appendChild(img);
    } else {
      // Fallback por si no se encuentra la carta
      cell.textContent = num;
      cell.setAttribute('data-num', num);
    }

    cardDiv.appendChild(cell);
  }
});

socket.on('numberDrawn', (num) => {
  document.getElementById('lastNumber').textContent = `Salió: ${num}`;
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
  document.getElementById('winner').textContent = `¡Ganó ${name}!`;
});

socket.on('message', (msg) => {
  document.getElementById('status').textContent = msg;
});

