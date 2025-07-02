// Conexión con el servidor
const socket = io();

// Cartilla del jugador
let card = [];

// Todas las cartas posibles
let cardData = [];

// Reproductor de audio global
let audio = null;

// Cargar cartas desde cards.json
fetch('cards.json')
  .then(res => res.json())
  .then(data => {
    cardData = data;
  });

// Función para unirse al juego
function joinGame() {
  const name = document.getElementById('name').value.trim();
  if (name) {
    socket.emit('join', name);
  } else {
    alert('Ingresa tu nombre');
  }
}

// Recibir cartilla generada
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
      img.src = carta.image; // 👉 sin carpeta
      img.alt = carta.name;
      img.style.width = '80%';
      img.style.borderRadius = '8px';
      cell.setAttribute('data-num', num);
      cell.appendChild(img);
    } else {
      cell.textContent = num;
      cell.setAttribute('data-num', num);
    }

    cardDiv.appendChild(cell);
  }
});

// Recibir carta cantada
socket.on('numberDrawn', (num) => {
  const carta = cardData.find(c => c.id === num);

  if (carta) {
    document.getElementById('lastNumber').textContent = `Salió: ${carta.name}`;

    const lastImageDiv = document.getElementById('lastImage');
    lastImageDiv.innerHTML = '';

    const img = document.createElement('img');
    img.src = carta.image; // 👉 sin carpeta
    img.alt = carta.name;
    img.style.width = '100%';
    img.style.borderRadius = '8px';
    lastImageDiv.appendChild(img);

    // Reproducir sonido en raíz
    if (carta.sound) {
      if (audio) {
        audio.pause();
      }
      audio = new Audio(carta.sound); // 👉 sin carpeta
      audio.play().catch(err => {
        console.warn('No se pudo reproducir el sonido:', err);
      });
    }
  } else {
    document.getElementById('lastNumber').textContent = `Salió: ${num}`;
    document.getElementById('lastImage').innerHTML = '';
  }

  // Marcar carta en la cartilla
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    const dataNum = cell.getAttribute('data-num');
    if (parseInt(dataNum) === num) {
      cell.classList.add('marked');
    }
  });
});

// Mostrar ganador
socket.on('winner', (name) => {
  document.getElementById('winner').textContent = `¡Ganó ${name}!`;
});

// Mensajes de estado
socket.on('message', (msg) => {
  document.getElementById('status').textContent = msg;
});
