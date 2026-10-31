const { minutosRestantes } = require('../../src/tiempo-bloqueo');

describe('CP-08: cálculo de minutos restantes del bloqueo', () => {
  test('después de 30 segundos quedan 14,5 minutos de los 15 iniciales', () => {
    const inicio = Date.UTC(2026, 9, 31, 12, 0, 0);
    const bloqueadaHasta = inicio + 15 * 60 * 1000;
    const ahoraMs = inicio + 30 * 1000;

    expect(minutosRestantes(bloqueadaHasta, ahoraMs)).toBeCloseTo(14.5, 8);
  });
});
