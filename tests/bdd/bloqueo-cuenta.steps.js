const path = require('node:path');
const { loadFeature, defineFeature } = require('jest-cucumber');
const { crearCuenta, autenticar } = require('../../src/cuenta');

const feature = loadFeature(path.join(__dirname, 'bloqueo-cuenta.feature'));

defineFeature(feature, (test) => {
  test('Denegar una contraseña correcta durante el bloqueo (CP-05)', ({ given, when, then, and }) => {
    let cuenta;
    let vencimientoOriginal;
    let resultado;
    const ahoraMs = Date.UTC(2026, 9, 31, 12, 1, 0);

    given('una cuenta bloqueada desde hace un minuto por cinco fallos consecutivos', () => {
      cuenta = crearCuenta();
      for (let intento = 0; intento < 5; intento += 1) {
        cuenta = autenticar(cuenta, false, ahoraMs - 60000).cuenta;
      }
      vencimientoOriginal = cuenta.bloqueadaHasta;
    });

    when('intento iniciar sesión con la contraseña correcta', () => {
      resultado = autenticar(cuenta, true, ahoraMs);
    });

    then('el acceso es denegado por el bloqueo temporal', () => {
      expect(resultado.accesoPermitido).toBe(false);
      expect(resultado.motivo).toBe('cuenta_bloqueada');
    });

    and('se mantienen el vencimiento original y los cinco fallos', () => {
      expect(resultado.cuenta.bloqueadaHasta).toBeCloseTo(vencimientoOriginal, 8);
      expect(resultado.cuenta.fallosConsecutivos).toBeCloseTo(5, 8);
      expect(cuenta.bloqueadaHasta).toBeCloseTo(vencimientoOriginal, 8);
    });
  });
});
