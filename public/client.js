const socket = io();
let card = [];
let cardData = [];

// ✅ Cargar cartas desde cards.json al iniciar
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

// ✅ Recibe la carta del jugador desde el servidor
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

// ✅ Recibe el número/carta sorteada
socket.on('numberDrawn', (num) => {
  const lastNumberEl = document.getElementById('lastNumber');
  const lastImageEl = document.getElementById('lastImage');

  lastNumberEl.textContent = `Salió: ${num}`;
  lastImageEl.innerHTML = ''; // limpia imagen anterior

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

  // ✅ Marca la carta si coincide con alguna de la tarjeta del jugador
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    const text = cell.textContent.trim();
    const dataNum = cell.getAttribute('data-num');

    if (parseInt(text) === num || parseInt(dataNum) === num) {
      cell.classList.add('marked');
    }
  });
});

// ✅ Muestra el nombre del ganador
socket.on('winner', (name) => {
  document.getElementById('winner').textContent = `¡Ganó ${name}! 🎉`;
});

// ✅ Muestra mensajes de estado (esperando jugadores, etc.)
socket.on('message', (msg) => {
  document.getElementById('status').textContent = msg;
});
