const MILISEGUNDOS_POR_MINUTO = 60 * 1000;

function minutosRestantes(bloqueadaHasta, ahoraMs) {
  const milisegundosRestantes = Math.max(0, bloqueadaHasta - ahoraMs);
  return milisegundosRestantes / MILISEGUNDOS_POR_MINUTO;
}

module.exports = { minutosRestantes };
