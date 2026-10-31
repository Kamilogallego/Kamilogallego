const { crearCuenta, autenticar } = require('../../src/cuenta');

const INICIO = Date.UTC(2026, 9, 31, 12, 0, 0);

function trasFallos(cantidad, ahoraMs = INICIO) {
  let cuenta = crearCuenta();
  for (let intento = 0; intento < cantidad; intento += 1) {
    cuenta = autenticar(cuenta, false, ahoraMs).cuenta;
  }
  return cuenta;
}

describe('Regla de bloqueo temporal de cuenta', () => {
  test('CP-01: una cuenta nueva puede entrar con credenciales correctas', () => {
    const resultado = autenticar(crearCuenta(), true, INICIO);

    expect(resultado.accesoPermitido).toBe(true);
    expect(resultado.motivo).toBe('acceso_concedido');
    expect(resultado.cuenta.fallosConsecutivos).toBeCloseTo(0, 8);
    expect(resultado.cuenta.bloqueadaHasta).toBeNull();
  });

  test('CP-02: una clave incorrecta suma un fallo y no bloquea todavía', () => {
    const resultado = autenticar(crearCuenta(), false, INICIO);

    expect(resultado.accesoPermitido).toBe(false);
    expect(resultado.motivo).toBe('clave_incorrecta');
    expect(resultado.cuenta.fallosConsecutivos).toBeCloseTo(1, 8);
    expect(resultado.cuenta.bloqueadaHasta).toBeNull();
  });

  test('CP-03: el cuarto fallo aún no bloquea la cuenta', () => {
    const resultado = autenticar(trasFallos(3), false, INICIO);

    expect(resultado.accesoPermitido).toBe(false);
    expect(resultado.motivo).toBe('clave_incorrecta');
    expect(resultado.cuenta.fallosConsecutivos).toBeCloseTo(4, 8);
    expect(resultado.cuenta.bloqueadaHasta).toBeNull();
  });

  test('CP-04: el quinto fallo inicia exactamente quince minutos de bloqueo', () => {
    const resultado = autenticar(trasFallos(4), false, INICIO);

    expect(resultado.accesoPermitido).toBe(false);
    expect(resultado.motivo).toBe('cuenta_bloqueada');
    expect(resultado.cuenta.fallosConsecutivos).toBeCloseTo(5, 8);
    expect(resultado.cuenta.bloqueadaHasta - INICIO).toBeCloseTo(900000, 8);
  });

  test('CP-06: los intentos durante el bloqueo no extienden el plazo ni suman fallos', () => {
    const bloqueada = trasFallos(5);

    const primerIntento = autenticar(bloqueada, false, INICIO + 60000);
    const segundoIntento = autenticar(primerIntento.cuenta, true, INICIO + 120000);

    for (const resultado of [primerIntento, segundoIntento]) {
      expect(resultado.accesoPermitido).toBe(false);
      expect(resultado.motivo).toBe('cuenta_bloqueada');
      expect(resultado.cuenta.bloqueadaHasta).toBeCloseTo(bloqueada.bloqueadaHasta, 8);
      expect(resultado.cuenta.fallosConsecutivos).toBeCloseTo(5, 8);
    }
  });

  test('CP-07: un acceso correcto reinicia los fallos consecutivos antes del quinto', () => {
    const exito = autenticar(trasFallos(4), true, INICIO + 1000);
    const nuevoFallo = autenticar(exito.cuenta, false, INICIO + 2000);

    expect(exito.accesoPermitido).toBe(true);
    expect(exito.cuenta.fallosConsecutivos).toBeCloseTo(0, 8);
    expect(nuevoFallo.cuenta.fallosConsecutivos).toBeCloseTo(1, 8);
    expect(nuevoFallo.cuenta.bloqueadaHasta).toBeNull();
  });

  test('CP-09: exactamente al cumplir quince minutos permite el acceso correcto', () => {
    const resultado = autenticar(trasFallos(5), true, INICIO + 900000);

    expect(resultado.accesoPermitido).toBe(true);
    expect(resultado.motivo).toBe('acceso_concedido');
    expect(resultado.cuenta.fallosConsecutivos).toBeCloseTo(0, 8);
    expect(resultado.cuenta.bloqueadaHasta).toBeNull();
  });

  test('CP-10: un milisegundo antes del vencimiento continúa bloqueada', () => {
    const resultado = autenticar(trasFallos(5), true, INICIO + 899999);

    expect(resultado.accesoPermitido).toBe(false);
    expect(resultado.motivo).toBe('cuenta_bloqueada');
    expect(resultado.cuenta.bloqueadaHasta - (INICIO + 899999)).toBeCloseTo(1, 8);
  });

  test('CP-11: rechaza claveCorrecta no booleana sin alterar la cuenta', () => {
    const cuenta = Object.freeze(trasFallos(2));

    expect(() => autenticar(cuenta, 'sí', INICIO)).toThrow(TypeError);
    expect(cuenta.fallosConsecutivos).toBeCloseTo(2, 8);
    expect(cuenta.bloqueadaHasta).toBeNull();
  });

  test('CP-12: el bloqueo de una cuenta no impide el acceso de otra', () => {
    const cuentaA = trasFallos(5);
    const cuentaB = crearCuenta();

    const resultadoA = autenticar(cuentaA, true, INICIO + 1000);
    const resultadoB = autenticar(cuentaB, true, INICIO + 1000);

    expect(resultadoA.accesoPermitido).toBe(false);
    expect(resultadoB.accesoPermitido).toBe(true);
    expect(cuentaB.fallosConsecutivos).toBeCloseTo(0, 8);
    expect(cuentaB.bloqueadaHasta).toBeNull();
  });

  test('un fallo al vencer el bloqueo inicia una nueva secuencia de un fallo', () => {
    const resultado = autenticar(trasFallos(5), false, INICIO + 900000);

    expect(resultado.motivo).toBe('clave_incorrecta');
    expect(resultado.cuenta.fallosConsecutivos).toBeCloseTo(1, 8);
    expect(resultado.cuenta.bloqueadaHasta).toBeNull();
  });

  test('las transiciones producen un estado nuevo y conservan el estado de entrada', () => {
    const original = Object.freeze(crearCuenta());
    const resultado = autenticar(original, false, INICIO);

    expect(resultado.cuenta).not.toBe(original);
    expect(original.fallosConsecutivos).toBeCloseTo(0, 8);
    expect(original.bloqueadaHasta).toBeNull();
    expect(resultado.cuenta.fallosConsecutivos).toBeCloseTo(1, 8);
  });

  test.each([-1, NaN, Infinity, '1000', null])('rechaza un tiempo inválido: %p', (ahoraMs) => {
    const original = Object.freeze(crearCuenta());

    expect(() => autenticar(original, true, ahoraMs)).toThrow(RangeError);
    expect(original.fallosConsecutivos).toBeCloseTo(0, 8);
  });
});
