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
    cell.textContent = num;
    cardDiv.appendChild(cell);
  }
});

socket.on('numberDrawn', (num) => {
  document.getElementById('lastNumber').textContent = `Salió: ${num}`;
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    if (parseInt(cell.textContent) === num) {
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

