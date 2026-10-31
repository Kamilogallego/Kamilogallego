const MAXIMO_FALLOS = 5;
const DURACION_BLOQUEO_MS = 15 * 60 * 1000;

function crearCuenta() {
  return { fallosConsecutivos: 0, bloqueadaHasta: null };
}

// claveCorrecta representa el resultado de una verificación externa de credenciales.
// Este módulo solo modela el bloqueo; no almacena ni comprueba contraseñas.
function autenticar(cuenta, claveCorrecta, ahoraMs) {
  if (typeof claveCorrecta !== 'boolean') {
    throw new TypeError('claveCorrecta debe ser un booleano');
  }
  if (typeof ahoraMs !== 'number' || !Number.isFinite(ahoraMs) || ahoraMs < 0) {
    throw new RangeError('ahoraMs debe ser un número finito mayor o igual que cero');
  }

  const estado = { ...cuenta };
  if (estado.bloqueadaHasta !== null) {
    if (ahoraMs < estado.bloqueadaHasta) {
      return { accesoPermitido: false, motivo: 'cuenta_bloqueada', cuenta: estado };
    }
    estado.fallosConsecutivos = 0;
    estado.bloqueadaHasta = null;
  }

  if (claveCorrecta) {
    estado.fallosConsecutivos = 0;
    return { accesoPermitido: true, motivo: 'acceso_concedido', cuenta: estado };
  }

  estado.fallosConsecutivos += 1;
  if (estado.fallosConsecutivos >= MAXIMO_FALLOS) {
    estado.bloqueadaHasta = ahoraMs + DURACION_BLOQUEO_MS;
    return { accesoPermitido: false, motivo: 'cuenta_bloqueada', cuenta: estado };
  }

  return { accesoPermitido: false, motivo: 'clave_incorrecta', cuenta: estado };
}

module.exports = { crearCuenta, autenticar };
