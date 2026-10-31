function minutosRestantes(bloqueadaHasta, ahoraMs) {
  return Math.max(0, bloqueadaHasta - ahoraMs) / 60000;
}

module.exports = { minutosRestantes };
