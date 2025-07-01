const socket = io();
let card = [];

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

    // Mostrar imagen si es el número 1 (El Gallo)
    if (num === 1) {
      const img = document.createElement('img');
      img.src = 'img/public/Img/images (2) (16).jpeg';  // Asegúrese de que esté en public/img/gallo.png
      img.alt = 'El Gallo';
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
  document.getElementById('lastNumber').textContent = `Salió: ${num}`;
  const cells = document.querySelectorAll('.cell');

  cells.forEach(cell => {
    const text = cell.textContent.trim();
    const dataNum = cell.getAttribute('data-num');

    // Para cartas con texto (números)
    if (parseInt(text) === num) {
      cell.classList.add('marked');
    }

    // Para cartas con imagen (como el gallo)
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
