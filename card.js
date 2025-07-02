function generateCard() {
  const card = new Set();
  while (card.size < 16) {
    const num = Math.floor(Math.random() * 54) + 1;
    card.add(num);
  }
  return Array.from(card);
}

module.exports = { generateCard };
