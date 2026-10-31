# Actividad individual: TDD y BDD · Semana 4

**Estudiante:** Juan Camilo Galego  
**Escenario C:** bloqueo de cuenta por cinco intentos fallidos consecutivos, durante quince minutos.  
**Elaboración:** 31 de octubre de 2026 (America/Bogota).

La guía fija la entrega el 29 de octubre de 2026 a las 11:59 p. m. Este trabajo y su evidencia se elaboraron el 31 de octubre. El envío en Moodle debe hacerlo el estudiante.

## Entrega

- [HTML con descripción, instrucciones y presentación de la solución](Entrega_TDD_BDD_JuanCamiloGalego.html). Descargar y abrir en un navegador; GitHub muestra el código HTML.
- [Excel con 12 casos y las cuatro categorías](docs/pruebas/actividades/semana4/Casos_de_Prueba_JuanCamiloGalego.xlsx).
- [Guía original sin modificar](docs/pruebas/actividades/semana4/Guia_Original_TDD_BDD.md).
- [Evidencia real de las ejecuciones](docs/pruebas/actividades/semana4/evidencias/).

**Enlace para entregar en Moodle:**

https://github.com/Kamilogallego/Kamilogallego/tree/actividad-tdd-bdd-semana4

La actividad está en la rama `actividad-tdd-bdd-semana4` del repositorio personal. Al revisarla o descargarla, seleccionar esa rama. La rama `main` conserva el perfil existente.

## Descripción

Se derivan casos de una regla de negocio y se prueban en JavaScript: un cálculo con TDD (rojo, verde y refactor) y otro comportamiento con BDD (Dado, Cuando y Entonces). El Excel mantiene el formato de la plantilla, la lista de categorías y sus colores condicionales.

## Ejecutar

Requisitos: Git y Node.js 22 o posterior.

```sh
git clone --branch actividad-tdd-bdd-semana4 https://github.com/Kamilogallego/Kamilogallego.git
cd Kamilogallego
npm ci
npm test
```

```sh
npm run test:unit
npm run test:bdd
```

La verificación final del 31 de octubre terminó con **3 suites y 22 pruebas correctas**: 21 unitarias y 1 escenario BDD. Se utilizó Node.js 24.16.0, Jest 30.5.2 y jest-cucumber 4.5.0. Las versiones están fijadas en `package-lock.json`.

## Casos y trazabilidad

| Caso | Categoría | Qué se verifica | Implementación |
|---|---|---|---|
| CP-01 | Válido | Acceso correcto en cuenta nueva | Unitarias de cuenta |
| CP-02 | Inválido | Primer fallo de contraseña | Unitarias de cuenta |
| CP-03 | Límite | Cuarto fallo sin bloqueo | Unitarias de cuenta |
| CP-04 | Límite | Quinto fallo bloquea 15 minutos | Unitarias de cuenta |
| CP-05 | Permisos | Contraseña correcta durante bloqueo deniega acceso | BDD |
| CP-06 | Permisos | Intento bloqueado no extiende el plazo | Unitarias de cuenta |
| CP-07 | Válido | Un éxito antes del quinto fallo reinicia la secuencia | Unitarias de cuenta |
| CP-08 | Límite | Tras 30 segundos quedan 14,5 minutos | TDD de tiempo |
| CP-09 | Límite | Exactamente a los 15 minutos permite acceso correcto | Unitarias de cuenta |
| CP-10 | Límite | Un milisegundo antes sigue bloqueada | Unitarias de cuenta |
| CP-11 | Inválido | Rechaza `claveCorrecta` no booleana sin modificar cuenta | Unitarias de cuenta |
| CP-12 | Válido | El bloqueo de una cuenta no afecta a otra | Unitarias de cuenta |

También se prueban límites del cálculo, tiempo inválido, conservación del estado de entrada y reinicio del contador al vencer el bloqueo.

## TDD: CP-08

La función `minutosRestantes(bloqueadaHasta, ahoraMs)` calcula el tiempo restante sin producir valores negativos. La prueba inicial exige **14,5 minutos después de 30 segundos** de un bloqueo de quince minutos, usando `toBeCloseTo(14.5, 8)`.

1. **Rojo:** se escribió y ejecutó la prueba antes de crear `src/tiempo-bloqueo.js`. Falló por módulo inexistente, como permite la guía. [Salida original, código 1](docs/pruebas/actividades/semana4/evidencias/01-rojo.txt).
2. **Verde:** se implementó `Math.max(0, bloqueadaHasta - ahoraMs) / 60000`; pasó la prueba. [Salida, código 0](docs/pruebas/actividades/semana4/evidencias/02-verde.txt).
3. **Refactor:** se nombraron la constante de conversión y los milisegundos restantes sin cambiar el comportamiento. La misma prueba continuó pasando. [Salida, código 0](docs/pruebas/actividades/semana4/evidencias/03-refactor.txt).

Cada paso tiene su propio commit. Después se añadieron pruebas de los límites y la implementación BDD. [Ver historial](https://github.com/Kamilogallego/Kamilogallego/commits/actividad-tdd-bdd-semana4/).

Para repetir la prueba en cada estado, obtener su identificador con `git log --oneline`, abrir ese commit en una carpeta de trabajo aparte, instalar con `npm ci` y ejecutar `node node_modules/jest/bin/jest.js --runInBand --verbose tests/unit/tiempo-bloqueo.test.js`. El estado rojo debe fallar y los otros dos deben pasar. Las marcas de tiempo y duraciones serán distintas de la evidencia guardada.

## BDD: CP-05

Se usa un caso diferente del cálculo TDD. El [feature](tests/bdd/bloqueo-cuenta.feature) comienza exactamente con `# language: es` y verifica que una contraseña correcta no permite entrar mientras la cuenta está bloqueada.

```gherkin
# language: es
Característica: Protección de una cuenta bloqueada temporalmente
  Escenario: Denegar una contraseña correcta durante el bloqueo (CP-05)
    Dado una cuenta bloqueada desde hace un minuto por cinco fallos consecutivos
    Cuando intento iniciar sesión con la contraseña correcta
    Entonces el acceso es denegado por el bloqueo temporal
    Y se mantienen el vencimiento original y los cinco fallos
```

Los [pasos](tests/bdd/bloqueo-cuenta.steps.js) producen el bloqueo mediante cinco llamadas reales a `autenticar`, intentan el acceso y verifican la denegación y la conservación del plazo.

## Alcance y supuestos

- El bloqueo está vigente desde el quinto fallo hasta antes de cumplirse 900 000 ms. Exactamente al vencer ya se permite un nuevo intento.
- Un acceso correcto antes del quinto fallo reinicia el contador. Al vencer el bloqueo comienza una nueva secuencia de intentos.
- Los intentos durante el bloqueo no aumentan el contador ni extienden su vencimiento.
- “Permisos” representa el acceso denegado temporalmente a la cuenta bloqueada. No se introduce un rol administrador.
- Cada cuenta tiene su estado. Las funciones devuelven un estado nuevo sin alterar el recibido.
- `claveCorrecta` representa el resultado booleano de verificar credenciales externamente. Este módulo educativo implementa la regla de bloqueo, sin interfaz, servidor ni almacenamiento de contraseñas.
- `ahoraMs` es un tiempo explícito y controlado en milisegundos. Las pruebas no esperan quince minutos reales ni dependen del reloj del equipo.

## Estructura

```text
docs/pruebas/actividades/semana4/
  Casos_de_Prueba_JuanCamiloGalego.xlsx
  Guia_Original_TDD_BDD.md
  evidencias/
    01-rojo.txt
    02-verde.txt
    03-refactor.txt
    04-verificacion-final.txt
src/
  cuenta.js
  tiempo-bloqueo.js
tests/unit/
  cuenta.test.js
  tiempo-bloqueo.test.js
tests/bdd/
  bloqueo-cuenta.feature
  bloqueo-cuenta.steps.js
Entrega_TDD_BDD_JuanCamiloGalego.html
```

## Documentación consultada

- [Jest: comparaciones numéricas y tolerancia](https://jestjs.io/docs/using-matchers#numbers).
- [jest-cucumber: conexión de escenarios Gherkin con Jest](https://github.com/bencompton/jest-cucumber).
- [Cucumber: idiomas de Gherkin](https://cucumber.io/docs/gherkin/reference/#spoken-languages).
