# Actividad individual · TDD y BDD
### Pruebas de Software · V semestre · Ingeniería de Software · CUE Alexander von Humboldt

**Nombre completo:** _______________________ **Código:** _______________________
**Fecha de entrega:** Jueves 29/10/2026, 11:59 p. m.

**Esta actividad es individual** — no se entrega por equipo. Cada estudiante sube su propio trabajo a su propio repositorio.

---

## Objetivo

Que derives casos de prueba a partir de un escenario, y luego apliques ese trabajo en código: uno de tus casos se construye con **TDD** (rojo-verde-refactor) y otro con **BDD** (Given-When-Then). Es el mismo flujo que vas a necesitar para avanzar en E2.1, aplicado aquí de forma individual antes de hacerlo en equipo.

## Qué vas a entregar

1. El Excel `Casos_de_Prueba_Individual.xlsx` diligenciado, con los casos de prueba derivados del escenario que elijas — **renómbralo con tu nombre** antes de subirlo: `Casos_de_Prueba_NombreApellido.xlsx` (ejemplo: `Casos_de_Prueba_JuanGallego.xlsx`).
2. El código de **un** caso implementado con TDD, con evidencia de los tres pasos.
3. El código de **un** escenario BDD implementado, con sus pasos (steps).
4. Todo subido a tu propio repositorio, en la ruta que se indica más abajo.

---

## Fase 1 · De la situación a los casos de prueba

Elige **uno** de estos tres escenarios (no repitas el que ya trabajamos en clase el martes 20/10, ni el del examen):

### Opción A — Exportación de reportes
El dashboard permite exportar los indicadores (MAD, MAPE, pronóstico vs. real) a PDF o a Excel, filtrando por producto y por rango de fechas. El botón "Exportar" solo se habilita cuando hay al menos un producto con datos cargados.

### Opción B — Suavización con tendencia (Holt)
El sistema permite ejecutar el método de suavización exponencial con tendencia (Holt) sobre una serie, configurando dos parámetros: α (nivel) y β (tendencia). Ambos deben estar entre 0 y 1.

### Opción C — Bloqueo de cuenta por intentos fallidos
El sistema bloquea temporalmente una cuenta después de 5 intentos fallidos de inicio de sesión consecutivos, por 15 minutos.

Si prefieres, puedes usar una situación real de **tu propio módulo del proyecto** en vez de estas tres — avísale al docente cuál usaste.

### Qué hacer con el escenario elegido

Completa la hoja **Casos** de `Casos_de_Prueba_Individual.xlsx` (adjunto a esta actividad) con mínimo 6 casos de prueba, en el mismo formato relámpago de la clase del Preparcial: ID, qué se prueba, categoría, entrada y resultado esperado. La columna Categoría tiene lista desplegable (Válido, Inválido, Límite, Permisos) — selecciónala en vez de escribirla a mano.

Cubre las 4 categorías al menos una vez. Las filas que no uses, déjalas vacías; no borres el archivo para hacer tu propia tabla.

---

## Fase 2 · TDD sobre un caso de cálculo

Elige **uno de tus propios casos** que implique un cálculo o una regla de validación clara (no uno que dependa de interfaz gráfica). Impleméntalo siguiendo el ciclo completo:

1. **Rojo** — escribe la prueba antes de que exista la función. Confirma que falla (el módulo no existe o el comportamiento no está implementado) y guarda la salida de consola.
2. **Verde** — escribe el código mínimo para que pase. Guarda la salida.
3. **Refactor** — mejora la forma del código sin cambiar el comportamiento. Corre la prueba de nuevo y confirma que sigue en verde.

Si el resultado es numérico, usa tolerancia en la aserción (`toBeCloseTo`, `pytest.approx`, el delta de `assertEquals`, etc. según tu lenguaje), nunca igualdad exacta — igual que en la kata de la clase. Revisa la sintaxis exacta en la sección de "assertions" o "matchers" de la documentación oficial de tu framework (lista más abajo).

## Fase 3 · BDD sobre un caso de comportamiento

Elige **otro** de tus casos, de preferencia uno que dependa de una regla de negocio o de un rol (no el mismo cálculo que ya usaste en la Fase 2). Escribe:

1. Un archivo `.feature` en Gherkin, **en español**, con al menos un escenario Dado-Cuando-Entonces.
2. Los pasos (steps) que conectan el feature con código real que se ejecuta.

```gherkin
# language: es
Característica: ___________________________

  Escenario: ___________________________
    Dado ___________________________
    Cuando ___________________________
    Entonces ___________________________
```

### Cómo se vería lo mismo en inglés

**El `# language:` tiene que ser la primera línea del archivo, sin nada antes** (ni un comentario, ni una línea en blanco) — si no, Cucumber lo ignora y asume inglés por defecto, y tus palabras clave en español ("Característica", "Dado", etc.) no se van a reconocer.

Mismo escenario de la kata de clase, con la etiqueta de idioma cambiada:

```gherkin
# language: en
Feature: Deviation alerts

  Scenario: The error exceeds the configured threshold
    Given an alert threshold configured at 10%
    When the forecast error is 12%
    Then an alert should be generated
```

Y el archivo de pasos (steps) correspondiente — nota que el **import no cambia** entre español e inglés, porque `jest-cucumber` no tiene versión por idioma; lo único que cambia es el texto dentro del `.feature` y la etiqueta `# language`:

```javascript
const { loadFeature, defineFeature } = require('jest-cucumber');
const { shouldGenerateAlert } = require('../src/alerts');

const feature = loadFeature('./tests/deviation-alerts.feature');

defineFeature(feature, (test) => {
  test('The error exceeds the configured threshold', ({ given, when, then }) => {
    let threshold;
    let error;
    let result;

    given('an alert threshold configured at 10%', () => {
      threshold = 10;
    });

    when('the forecast error is 12%', () => {
      error = 12;
      result = shouldGenerateAlert(error, threshold);
    });

    then('an alert should be generated', () => {
      expect(result).toBe(true);
    });
  });
});
```

Entrega tu actividad en español.

---

## Herramientas recomendadas según tu stack

| Lenguaje / stack | TDD (pruebas unitarias) | BDD | Comando para correr |
|---|---|---|---|
| **JavaScript / Node.js** (el del proyecto) | Jest | jest-cucumber o Cucumber.js | `npm test` |
| TypeScript | Jest + ts-jest, o Vitest | jest-cucumber | `npm test` |
| React (componentes de interfaz) | Jest + React Testing Library | Cucumber.js | `npm test` |
| Python | pytest | pytest-bdd o behave | `pytest -v` |
| Java | JUnit 5 | Cucumber-JVM (con Maven o Gradle) | `mvn test` |
| Java, si tu caso es de API | JUnit 5, o nada aparte — Karate trae sus propias aserciones | Karate (Gherkin sin step definitions, pensado para probar endpoints) | `mvn test` |
| PHP | PHPUnit | Behat | `vendor/bin/phpunit` / `vendor/bin/behat` |
| Go (Golang) | Paquete `testing` nativo, o Testify para aserciones más expresivas | Godog | `go test ./...` |
| C# / .NET | xUnit o NUnit | Reqnroll (sucesor de SpecFlow) | `dotnet test` |
| Ruby | RSpec | Cucumber (nació en este ecosistema) | `rspec` / `cucumber` |

Si trabajas en Node.js (el stack oficial del proyecto), usa Jest y jest-cucumber — es lo que ya viste funcionando en la kata de clase. Las demás filas son por si quieres practicar en otro lenguaje, o si tu equipo usa uno distinto.

> **Nota sobre .NET:** si buscas por tu cuenta y encuentras tutoriales de "SpecFlow", ese framework quedó en mantenimiento — la comunidad se movió a **Reqnroll**.

### Antes de instalar cualquiera de estas

Busca la documentación oficial del framework exacto para tu lenguaje antes de instalar nada:

- **Jest** → jestjs.io
- **jest-cucumber** → su repositorio en GitHub (búscalo como "jest-cucumber github")
- **Cucumber.js / Cucumber (cualquier lenguaje)** → cucumber.io/docs
- **pytest** → docs.pytest.org
- **pytest-bdd** → pytest-bdd.readthedocs.io
- **behave** → behave.readthedocs.io
- **JUnit 5** → junit.org/junit5
- **PHPUnit** → phpunit.de
- **Behat** → docs.behat.org
- **Go testing / Godog** → pkg.go.dev/testing y github.com/cucumber/godog
- **xUnit** → xunit.net · **NUnit** → nunit.org
- **Reqnroll** → reqnroll.net
- **RSpec** → rspec.info
- **Karate** → github.com/karatelabs/karate

Si tu framework no está en esta lista, busca "`<tu framework>` official documentation".

---

## Cómo subir esto a Git

Esta actividad es individual, así que va en **tu propio repositorio personal** (no en el del proyecto en equipo). Si no tienes uno, créalo ahora en GitHub o GitLab, público o privado — si es privado, agrega al docente como colaborador.

Estructura de carpetas dentro de tu repositorio (ajusta la extensión según tu lenguaje):

```
/docs/pruebas/actividades/semana4/
    Casos_de_Prueba_NombreApellido.xlsx   ← la hoja Casos de la Fase 1, diligenciada y renombrada con tu nombre
/tests/unit/
    <nombre-de-tu-funcion>.test.js
/tests/bdd/
    <nombre-del-escenario>.feature
    <nombre-del-escenario>.steps.js
```

Recomendaciones para el commit:

- Un commit para la Fase 1 (casos derivados): `docs: agrega casos de prueba derivados del escenario <letra>`
- Para la Fase 2 (TDD), idealmente tres commits separados para dejar evidencia del ciclo: `test: agrega prueba roja para <funcion>` → `feat: implementa <funcion> para pasar la prueba` → `refactor: mejora <funcion> sin cambiar su comportamiento`
- Un commit para la Fase 3 (BDD): `test: agrega escenario BDD para <funcionalidad>`

No hace falta un Pull Request — basta con que el repositorio esté actualizado y el link llegue al docente antes de las 11:59 p. m. de hoy.

---

## Checklist antes de entregar

- [ ] El Excel de casos de prueba tiene mínimo 6 filas y cubre las 4 categorías.
- [ ] El archivo del Excel está renombrado con tu nombre (`Casos_de_Prueba_NombreApellido.xlsx`), no con el nombre genérico de la plantilla.
- [ ] El caso de TDD muestra evidencia real de los tres pasos (no solo el código final en verde).
- [ ] Las aserciones numéricas usan tolerancia, no igualdad exacta.
- [ ] El escenario BDD está en español, en Gherkin, con sus pasos implementados y corriendo.
- [ ] Todo está subido a tu propio repositorio, en la ruta indicada.
- [ ] El escenario elegido no es el mismo que ya se trabajó en clase ni en el examen.
- [ ] El link de tu repositorio llegó al docente antes de las 11:59 p. m.

## Rúbrica breve

| Criterio | Puntos |
|---|---|
| Casos de prueba derivados (variedad de categorías, coherencia) | 30 % |
| TDD: los tres pasos están documentados y la prueba final pasa | 35 % |
| BDD: el escenario es claro, el Entonces es verificable, y corre | 25 % |
| Todo subido correctamente al repositorio | 10 % |

---

## Notas para el docente

- El peso de esta actividad dentro de la nota queda por definir — la fecha y el carácter individual ya se dejaron fijos según tu indicación.
- Al ser individual y con entrega el mismo día, es esperable variación en el nivel de profundidad; la rúbrica da más peso a que el ciclo esté completo y corra, no a la complejidad del caso elegido.
- Las tres opciones de escenario (A, B, C) son nuevas: no se usaron ni en la clase del martes 20/10 (carga de CSV) ni en el examen (configuración de umbral).
- Al ser individual, es más probable que varios estudiantes elijan el mismo escenario — eso es normal; lo que hay que revisar es si los casos derivados y el código son copias idénticas entre dos estudiantes.
