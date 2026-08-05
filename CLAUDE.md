# Agenda de consultorio

Aplicación web para un consultorio de psicólogas en Uruguay. En producción en
`https://pcruzf.github.io/agenda/`. Se usa a diario: **los cambios se despliegan
directo a gente trabajando**, así que conviene verificar antes de subir.

---

## Restricciones del proyecto (leer antes de tocar nada)

1. **Sin build, sin dependencias, sin framework.** Todo es HTML/CSS/JS plano en
   archivos únicos autocontenidos. No agregar npm, bundlers, React, Tailwind ni
   CDNs. Se sube el archivo a GitHub Pages y funciona. Esto no es una limitación
   a superar: es lo que hace que la persona que lo mantiene pueda seguir
   haciéndolo.
2. **Todo en español rioplatense**, código y comentarios incluidos: `voseo`
   ("avisame", "tocá", "cargalo"), nombres de funciones y variables en español
   (`vistaSemana`, `huecosDe`, `plata`, `sello`). Mantener ese registro.
3. **Los datos de pacientes nunca salen del Drive privado de cada usuaria.**
   Ver "Modelo de datos". Cualquier cambio que mueva información de pacientes
   hacia la planilla compartida es un error grave, no una decisión de diseño.
4. **Compatibilidad iOS.** Safari no soporta `input type="month"` (por eso hay
   dos `<select>`), bloquea popups que no salen de un gesto directo del usuario,
   y borra el almacenamiento a los 7 días si la app no está instalada. No
   introducir `await` entre el clic y `requestAccessToken()`.

---

## Archivos

| Archivo | Líneas | Rol |
|---|---|---|
| `index.html` | ~2180 | La app completa: agenda, pacientes, cierre mensual, ajustes |
| `tablero.html` | ~715 | Horario compartido de solo lectura (semana / mes) |
| `sw.js` | 36 | Service worker, red-primero con caché de respaldo |
| `manifest.json` | — | Instalación como app (scope `./`) |
| `icon-180/192/512.png` | — | Iconos |
| `INSTRUCTIVO.md` | — | Manual para las usuarias, no técnico |
| `pruebas/*.js` | — | Pruebas en Node sin dependencias; no afectan lo desplegado |

Cada HTML tiene un único `<style>` y un único `<script>` con `"use strict"`.

**Al modificar `index.html` o `tablero.html`, subir la versión del caché en
`sw.js`** (`agenda-v11` → `agenda-v12`), o los teléfonos siguen con la versión
vieja.

---

## Configuración

Bloque `CONSULTORIO` al inicio del `<script>` de ambos HTML. Valores fijados en
el código para que ninguna usuaria tenga que pegar nada (pegar el ID por mensaje
causaba `Error 401: invalid_client` por texto cortado):

```js
const CONSULTORIO = {
  clienteId: "502751961059-...apps.googleusercontent.com",
  hojaId:    "1gs_xYxJKDtr...",
  csvPublicado: "https://docs.google.com/.../pub?...output=csv"  // solo tablero
};
```

En `index.html` estos valores **pisan** lo guardado en el dispositivo al
arrancar, así que corregirlos acá los corrige en todos lados al recargar.

Requiere en Google Cloud: **Drive API y Sheets API habilitadas**, y el correo de
cada psicóloga en *Usuarios de prueba* (la app está en modo Testing).

---

## Modelo de datos

Dos capas separadas. **Esta separación es la garantía de privacidad y no debe
difuminarse.**

### Capa privada — JSON en el Drive de cada usuaria

Archivo `agenda-consultorio.json`, creado por la app con scope `drive.file`
(Google solo le da acceso a los archivos que ella misma creó, así que una
instancia no puede leer el archivo de otra usuaria ni aunque quisiera).

```js
db = {
  pacientes: [{ id, nombre, apellido, telefono, arancel, notas, mod }],
  consultas: [{ id, pacienteId, fecha, hora, dur, sala, monto, notas,
                estado, recordado, movida, origen, mod }],
  config:    { ...CONFIG_DEF },
  configMod: 0,          // marca de tiempo de config
  borrados:  {},         // id -> timestamp (papelera)
  avisos:    {}          // "AAAA-MM:pacienteId" -> timestamp (resumen enviado)
}
```

- `fecha`: `"AAAA-MM-DD"` · `hora`: `"HH:MM"` · `dur`: minutos · `sala`:
  `"naranja"` | `"azul"`
- `estado`: `"pendiente"` | `"asistio"` | `"falto"` | `"cancelada"`
- `nombre` es **solo el nombre de pila** y `apellido` va aparte. Usar los
  ayudantes: `nombreLargo(p)` para mostrar, `pilaDe(id)` para saludar en los
  mensajes, `inicialesDe(p)` para el avatar (saltea partículas: "María del
  Carmen Silva Pérez" da MP). **No partir el nombre por espacios**: eso fallaba
  con apellidos compuestos y con quien quedó cargado "Apellido, Nombre".
  Los pacientes anteriores a este cambio se migran una vez al arrancar
  (`apellido === undefined` → se parte el primer término).
- `monto` y `arancel`: entero, o `""` si no se cargó. `importeDe(c)` cae al
  arancel del paciente cuando la consulta no tiene monto propio.
- `mod`: timestamp de última modificación. **Obligatorio en todo cambio.**

### Capa compartida — una planilla de Google para todas

Pestaña `Reservas`, creada automáticamente si falta. Solo estas columnas:

```
id | fecha | hora | fin | minutos | sala | profesional | estado | actualizado | propietaria
```

Sin pacientes, sin teléfonos, sin importes. `propietaria` es `config.profId`
(identificador anónimo autogenerado, no es el correo).

### Alquiler de salas (solo la administradora)

**Quién lo ve:** solo los `profId` listados en `CONSULTORIO.administradoras`.
A las demás no se les dibuja ni el panel de Mes ni la sección de Ajustes
(`esAdministradora()`). Es ocultamiento de interfaz, **no** de código:
`index.html` es público y cualquiera puede leerlo. Lo que sí queda privado son
los precios, que viven en el Drive de cada administradora. Cada una encuentra su
`profId` en Ajustes → Diagnóstico.

Con la lista vacía **no lo ve nadie**, ni quien administra. Para que ese estado
no quede mudo, el Diagnóstico muestra "Alquiler de salas: sin configurar"
mientras la lista está vacía, y deja de mostrarlo apenas se carga alguien. No
quitar ese aviso: sin él, el módulo desaparece sin explicación y parece un bug.

`config.alquiler` guarda `{ "<profId>": { nombre, precio } }` — precio por hora
en pesos. Vive en el Drive privado de quien administra el cobro; ninguna otra
psicóloga lo ve, y **no se agrega ninguna columna a la planilla compartida**.

`alquilerMes(mes)` recorre `ajenas` (las reservas publicadas por las demás) y
devuelve `{ filas, horas, total, hay }`. Reglas:

- Se cobra `pendiente`, `asistio` y `falto`; **solo `cancelada` libera el cobro**.
- Prorrateo exacto: `horas = minutos/60` (90 min → 1,5 h). No hay redondeo a hora.
- Sin precio, o precio `0`, la persona no se factura.
- `hay` es `false` si nadie tiene precio: entonces el panel no se dibuja y la
  vista Mes queda idéntica a como la ven las que no administran.

`ajenas` trae **todas** las filas de la planilla, sin filtro de fecha, así que
los meses ya cerrados se facturan bien. El límite de 90 días es solo de
publicación (`Salas.correr()`).

**Cuidado con un caso que importa:** si `ajenas` está vacío porque la planilla
todavía no sincronizó, el panel dice "no se leyeron las reservas", **no** "nadie
usó las salas". Confundir esas dos situaciones en un cálculo de plata lleva a no
cobrarle a nadie. Preservar esa distinción (`Salas.ultima`).

---

## Sincronización

### Drive (objeto `Sync`)

Bajar → `fundir(local, remoto)` → guardar → subir. La fusión es **por registro,
no por archivo**: cada paciente y cada consulta gana o pierde según su `mod`.
Sin esto, marcar asistencias en el celular con la PC abierta perdía datos.

Reglas de `fundir()`:
- De cada `id` sobrevive la versión con `mod` mayor.
- Un `id` en `borrados` se elimina **salvo** que su `mod` sea posterior al
  borrado (editar después de borrar gana).
- Las tumbas se purgan a los 180 días.
- `config` completo gana el de `configMod` mayor (no se fusiona campo a campo).
- `avisos`: unión, gana el timestamp mayor.

**Invariantes verificadas y que hay que preservar:** idempotencia
(`fundir(x,x) === x`), una copia vieja nunca pisa una nueva, los registros sin
`mod` sobreviven (datos previos a esta versión).

### Cuándo se sincroniza

`persistir(urgente)`. Con `urgente` se sincroniza en el acto; sin él, se espera
unos segundos. **Urgente = todo lo que cambia la ocupación de una sala**: alta,
baja, cancelación, reactivación, reprogramación, baja múltiple, borrar un
paciente con sus consultas, restaurar respaldo y borrar todos los datos. Marcar
asistencia, editar notas o cambiar un teléfono no lo son (no alteran la fila
publicada).

Además:

- **Al dejar la app** (`visibilitychange` → oculto, y `pagehide`) se publica lo
  pendiente. Antes solo se sincronizaba al *volver*, que es justo cuando ya no
  hace falta: alguien cancelaba una consulta, se iba, y la sala figuraba ocupada
  para las demás hasta la próxima apertura.
- Las escrituras van con `keepalive: true`, así una petición ya lanzada termina
  aunque se cierre la app.
- Si llega un cambio mientras hay una sincronización corriendo, se anota
  `repetir` y se vuelve a correr al terminar. Antes se descartaba en silencio.
- `Salas.pendiente` marca que hay algo sin publicar; el encabezado muestra
  "publicando…". Se limpia al terminar bien.

Nada de esto pierde datos aunque falle: lo local se guarda siempre y el próximo
`Salas.correr()` recalcula la diferencia contra la planilla. Lo que se acorta es
la ventana en que las demás ven información vieja.

### Planilla (objeto `Salas`)

Lee todas las filas, separa las ajenas (`propietaria !== profId`) hacia la
variable global `ajenas`, y publica/actualiza las propias de los últimos 90
días. Las canceladas se marcan `estado: "cancelada"`, las borradas `"borrada"`.

### Manejo de errores de Google — cuidado acá

Hubo un bucle infinito por tratar cualquier 403 como token vencido: se borraba
un token válido, se reintentaba cada 5 s, indefinidamente. **Reglas actuales:**

- **Solo el 401 invalida el token.** Un 403 puede ser una API sin habilitar o un
  permiso faltante; borrar el token ahí no arregla nada.
- Excepción: 403 con `insufficient|scope` en el mensaje sí invalida (falta un
  scope nuevo).
- `fallos >= 3` corta los reintentos automáticos; solo un toque del usuario los
  reanuda (`Sync.fallos = 0`).
- `silencioUsado` permite **un solo** intento silencioso de token por carga.
- **El token se guarda en `sessionStorage`** (`guardarToken` / `recuperarToken`
  / `olvidarToken`). Ir al horario general es una navegación real: `index.html`
  se descarga y al volver se carga de cero, y sin esto se perdía el token en
  cada ida y vuelta y Google volvía a pedir la cuenta — muy visible en Firefox,
  que bloquea las cookies que Google usa para renovar en silencio. Muere al
  cerrar la app, y los tokens duran ~1 h de todos modos.
- `prompt: "consent"` **solo en la conexión inicial** (`Sync.correr(true, true)`
  desde "Guardar y conectar"). En cualquier otro reintento va vacío: `consent`
  reabre la pantalla de permisos completa aunque ya estén otorgados.
- `mensajeGoogle(status, razon, msg)` traduce a texto accionable en español.
  Ampliarla en vez de mostrar códigos crudos.

---

## Estructura de la interfaz (`index.html`)

`render()` despacha según la variable global `tab` a: `vistaAgenda()`,
`vistaDia()`, `vistaPacientes()`, `vistaMes()`, `vistaAjustes()`. La pestaña
*Horario general* es un `<a href="tablero.html">`, **sin `target="_blank"`**
(con `_blank` el botón atrás de Android cerraba la app entera).

Los diálogos usan `abrir(html)` / `cerrar()` sobre `#velo` > `#hojaModal`. Todo
se re-renderiza con plantillas de cadena; no hay diffing. Escapar **siempre**
con `esc()` lo que venga de datos.

Funciones principales por área:

- Agenda: `tarjeta()`, `conectarTarjetas()`, `menuConsulta()`
- Consultas: `formConsulta(id, pre)`, `reprogramar(id)`, `variasConsultas(id)`
- Día: `vistaDia()`, `ocupacionDe(fecha, sala, exceptoId)` — mezcla propias y
  ajenas para detectar choques de sala
- Pacientes: `vistaPacientes()`, `formPaciente()`, `fichaPaciente()`
- Mes: `datosMes(mes)`, `resumenMes(pacienteId, mes)`, `mensajeCierre()`,
  `pantallaCierres(mes)`, `avisoCierre()`
- Mensajes: `mensajeDe(c, tipo)` con `tipo` `"recordatorio"` | `"cambio"`,
  `enlaceWA()`, `telWhatsApp()`
- Diagnóstico: `diagnostico()` — texto copiable para depurar a distancia

---

## El tablero (`tablero.html`)

Solo lectura. Prefiere `csvPublicado` (sin login); si está vacío usa la Sheets
API con scope `spreadsheets.readonly`.

Decisiones de diseño **deliberadas**, no accidentes:

- **En la grilla se pinta solo lo ocupado.** Se probó dibujar los huecos como
  bloques rotulados y resultó ruidoso: se quitaron. `huecosDe()` sigue en uso,
  pero únicamente para calcular cuántas horas quedan libres (fusiona los
  intervalos ocupados y devuelve los espacios ≥ 30 min).
- **El filtro de psicólogas no altera ningún cálculo ni la estructura.** El
  rango horario, qué días se muestran y el "N reservas · X h libres" salen de
  *todas* las reservas (`semTodas`); el filtro decide solamente qué bloques se
  pintan (`semVisible`), y agrega "· mostrando N". Una sala está ocupada aunque
  tengas apagada a quien la reservó: atar esas cuentas al filtro daba números
  falsos. Vale igual para las horas libres de la vista Mes.
- **Sábado y domingo se ocultan** si nadie reservó ese fin de semana; las
  columnas restantes se ensanchan (`--cols` dinámico).
- Un color estable por psicóloga vía `tonoDe(nombre)` (hash sobre `TONOS`). La
  sala ya está codificada por sección, así que el color codifica la persona.
- Impresión apaisada **con colores** (`print-color-adjust: exact`): el artefacto
  de referencia es el horario que se cuelga en la pared.

---

## Identidad visual

Compartida por ambos archivos, en variables CSS:

```
--pine #0B3D33   --ochre #C98A17   --paper #E9EDEA   --ink #16211F
--line #D3DBD7   sala naranja #C96A17   sala azul #2A6099
serif Georgia (títulos)   system-ui (resto)   .num = cifras tabulares
```

Móvil (< 900 px): barra de 6 pestañas fija abajo, donde llega el pulgar
(verificada sin cortes hasta 320 px). Encabezado sticky.

Escritorio (≥ 900 px): la barra pasa arriba, horizontal y sticky, y el
encabezado se desplaza (`position:static`). En el HTML `<nav>` viene **después**
de `<main>`, así que el reordenamiento se hace con `flex` + `order` en `body`.
El encabezado no queda sticky a propósito: si lo fuera, habría que adivinar su
altura para posicionar la barra debajo. El primer botón se alinea con el borde
de la columna de contenido vía `padding-left: calc(max(0px, (100% - 860px)/2) + 12px)`.

---

## Cómo verificar los cambios

No hay suite de tests. El método usado hasta ahora, que conviene mantener:

0. **Pruebas existentes**: `node pruebas/alquiler.js` (21 casos sobre el cálculo
   de alquiler) y `node pruebas/nombres.js` (21 sobre nombre/apellido, mensajes
   y migración). `pruebas/cargar.js` carga la lógica de `index.html` en un
   contexto de `vm` sin navegador y sirve de base para probar cualquier función
   pura nueva. Ojo: las variables del script no son propiedades del contexto,
   por eso están `poner()` y `evaluar()`; y los objetos que devuelve vienen de
   otro realm, así que `deepStrictEqual` falla aunque el contenido sea igual.
1. **Sintaxis**: extraer el `<script>` con una regex y `node --check`.
2. **Lógica pura**: recortar el archivo hasta antes del bloque de arranque,
   stubbear `document`/`window`/`location`, y ejercitar las funciones. Las áreas
   que más lo necesitan: `fundir()`, `huecosDe()`, `resumenMes()`,
   `ocupacionDe()`, `mesSumar()` (bordes de año), `telWhatsApp()`.
3. **Interfaz**: Playwright con Chromium. Cargar el HTML con `Store.cargar`
   sobrescrito para inyectar datos de ejemplo, capturar `pageerror`, y medir
   (`scrollWidth > clientWidth`) en 320 / 390 / 1200 px antes de dar por buena
   una maquetación.

Casos borde que ya rompieron algo alguna vez: cambio de año en la navegación de
meses, consultas solapadas en la misma sala, huecos de menos de 30 min,
registros heredados sin `mod`, nombres con coma en el CSV, teléfonos con y sin
código de país.

---

## Contexto de uso

Las usuarias son psicólogas, no técnicas. Los mensajes de error tienen que decir
**qué hacer**, no qué falló. Si algo se rompe estando ellas con un paciente
esperando, no hay a quién llamar.

Los datos son sensibles bajo la ley 18.331 uruguaya (datos personales, y de
salud por el contexto). Al agregar funciones, la pregunta por defecto es qué
pasa si alguien más ve esto.
