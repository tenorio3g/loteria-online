function generateCard() {
  const numbers = Array.from({ length: 54 }, (_, i) => i + 1);
  const shuffled = numbers.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 16);
}

module.exports = { generateCard };