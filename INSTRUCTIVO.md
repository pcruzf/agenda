# Agenda de consultorio — puesta en marcha

Son tres pasos. El primero alcanza para usarla; los otros dos son para tener
la misma agenda en el celular y en la PC.

---

## Paso 1 — Publicar la app (10 minutos, una sola vez)

La app tiene que estar en una dirección `https://` para que Google acepte
conectarse. Abrirla como archivo suelto ya no alcanza.

La opción más durable y gratuita es GitHub Pages:

1. Creá una cuenta en <https://github.com> si no tenés.
2. Creá un repositorio nuevo, público, llamado por ejemplo `agenda`.
3. Subí todos los archivos: `index.html`, `tablero.html`, `sw.js`,
   `manifest.json`, `icon-180.png`, `icon-192.png`, `icon-512.png`
   (botón *Add file → Upload files*).
4. Entrá en *Settings → Pages*. En *Source* elegí `Deploy from a branch`,
   rama `main`, carpeta `/ (root)`. Guardá.
5. A los dos o tres minutos te queda una dirección así:
   `https://TUUSUARIO.github.io/agenda/`

Que el repositorio sea público no expone tus datos: lo público es el código
de la app, no la información de los pacientes.

**Instalarla en el celular:**

- *Android:* abrí la dirección en Chrome → menú ⋮ → *Instalar aplicación*.
- *iPhone o iPad:* abrila **en Safari** (no en Chrome) → botón Compartir →
  *Agregar a pantalla de inicio*. En iOS solo Safari instala la app.

En la PC, Chrome o Edge muestran un ícono de instalar en la barra de
direcciones. Funciona igual en Windows, Mac y Linux.

**En iPhone, instalarla no es opcional.** Safari borra los datos guardados
por un sitio si pasás siete días sin abrirlo. Esa regla no se aplica a las
apps agregadas a la pantalla de inicio. Si además tenés Drive configurado
(paso 2), aunque se borrara el dispositivo, los datos vuelven al
sincronizar.

Gracias al `sw.js`, después de la primera visita abre aunque estés sin
conexión. Los cambios que hagas offline se sincronizan cuando vuelva internet.

---

## Paso 2 — Crear el ID de cliente de Google (15 minutos, una sola vez)

Esto autoriza a *tu* app a guardar un archivo en *tu* Drive. No hay costo.

1. Entrá a <https://console.cloud.google.com/> con tu cuenta de Google.
2. Arriba a la izquierda, creá un proyecto nuevo. Nombre: `Agenda consultorio`.
3. Habilitá **las dos** APIs. En el buscador de arriba escribí cada una,
   entrá y tocá **Habilitar**:
   - **Google Drive API** (para el archivo privado de pacientes)
   - **Google Sheets API** (para la planilla compartida de reservas)

   Si te salteás la segunda, la app va a decir *Falta habilitar la API de
   Google Sheets*: volvé acá y habilitala.
4. Andá a **APIs y servicios → Pantalla de consentimiento de OAuth**:
   - Tipo de usuario: **Externo**. Crear.
   - Nombre de la app: `Agenda consultorio`. Correo de asistencia: el tuyo.
     Datos de contacto del desarrollador: el tuyo. Guardar y continuar.
   - En *Permisos* no agregues nada. Guardar y continuar.
   - En **Usuarios de prueba**, agregá tu propia dirección de Gmail.
     Este paso es obligatorio: si no, Google te va a rechazar el acceso.
   - Guardar.
5. Andá a **APIs y servicios → Credenciales → Crear credenciales →
   ID de cliente de OAuth**:
   - Tipo: **Aplicación web**.
   - En **Orígenes autorizados de JavaScript** agregá exactamente la
     dirección del paso 1, **sin la barra final**:
     `https://TUUSUARIO.github.io`
   - Crear.
6. Copiá el **ID de cliente** (termina en `.apps.googleusercontent.com`).

---

## Paso 3 — Conectar la app

1. Abrí la app, andá a **Ajustes → Sincronizar con Google Drive**.
2. Pegá el ID de cliente y tocá **Guardar y conectar**.
3. Google te va a pedir permiso. Va a aparecer un cartel diciendo que la app
   no está verificada: es normal, es tu propia app. Tocá *Configuración
   avanzada → Ir a Agenda consultorio*.
4. Repetí lo mismo en el otro dispositivo, con **el mismo ID y la misma
   cuenta de Google**.

Listo. En tu Drive va a aparecer un archivo `agenda-consultorio.json`.
No lo edites ni lo muevas a la papelera.

---

## Cómo sincroniza

Sincroniza sola: al abrir la app, unos segundos después de cada cambio, y
cada vez que volvés a la pantalla. Arriba, al lado de la fecha, dice el
estado (*al día*, *hace 5 min*, *sin conexión*).

**No se pisan los cambios entre dispositivos.** Cada paciente y cada consulta
guarda su propia marca de tiempo, y al sincronizar se combinan quedando la
versión más nueva de cada uno. Podés marcar asistencias en el celular
mientras la PC quedó abierta con datos viejos: no se pierde nada. Solo si
editás *la misma consulta* en los dos lados sin sincronizar en el medio,
queda la edición más reciente.

Si el permiso vence (pasa cada tanto), el encabezado dice *falta reconectar*
en naranja: tocá ahí mismo y se reconecta. No hace falta ir a Ajustes.

**En iPhone esto pasa más seguido.** Safari bloquea las cookies de terceros,
así que la renovación automática del permiso de Google falla donde en Chrome
funcionaría sola. En la práctica: al abrir la app puede pedirte un toque en
*falta reconectar* antes de sincronizar. La agenda entretanto funciona
completa, solo que sin subir los cambios todavía.

---

## Qué funciona en cada dispositivo

| | Android | iPhone / iPad | PC |
|---|---|---|---|
| Usar la agenda completa | sí | sí | sí |
| Instalar con ícono propio | sí | sí, desde Safari | sí |
| Abrir sin conexión | sí | sí | sí |
| Recordatorios por WhatsApp | sí | sí | sí, con WhatsApp Web |
| Sincronizar con Drive | automático | con un toque cada tanto | automático |
| Descargar el CSV del mes | sí | sí, va a *Archivos* | sí |

En iOS todos los navegadores usan el motor de Safari por dentro, así que
Chrome en iPhone se comporta igual que Safari. La única diferencia real es
que solo Safari puede agregar la app a la pantalla de inicio.

---

## Consultorio compartido (varias psicólogas, dos salas)

### Qué ve cada una

| | Vos | Las demás |
|---|---|---|
| Tus pacientes, teléfonos, aranceles, asistencia | Sí | **No, nunca** |
| Tus horas reservadas y en qué sala | Sí | Sí, con tu nombre |
| Tu facturación mensual | Sí | No |

Los datos de pacientes **nunca salen del Drive privado de cada una**. Lo único
que se comparte es: fecha, hora, duración, sala y nombre de la psicóloga. Por
eso la planilla compartida se puede abrir delante de cualquiera.

### Armado (lo hace una sola persona, una vez)

1. Creá una planilla nueva en <https://sheets.google.com>. Llamala
   `Reservas consultorio`.
2. No hace falta preparar nada adentro: la app crea sola la pestaña
   **Reservas** y sus encabezados la primera vez que sincroniza.
3. Compartila con todas, con permiso de **Editor**.
4. Copiá el ID de la planilla: en la dirección
   `docs.google.com/spreadsheets/d/`**`ESTO_DE_ACA`**`/edit`
   (también podés pegar la dirección entera, la app la recorta.)
5. En el proyecto de Google Cloud (paso 2 de más arriba), agregá el correo de
   **cada psicóloga** en *Usuarios de prueba*. Sin eso, Google les rechaza el acceso.

Todas usan **el mismo ID de cliente** y **la misma planilla**, pero **cada una
con su cuenta de Google**. Cada una tendrá su propio archivo privado de
pacientes en su propio Drive.

### Fijar los códigos en el archivo (muy recomendado)

**Estos archivos ya vienen con los códigos del consultorio cargados**, en el
bloque que está arriba de todo de `index.html` y de `tablero.html`:

```
const CONSULTORIO = {
  clienteId: "502751961059-....apps.googleusercontent.com",
  hojaId:    "1gs_xYxJKDtr...."
};
```

Por eso ninguna psicóloga tiene que pegar nada: la app los toma sola.
**Pasar el ID de cliente por mensaje era la causa más común del
`Error 401: invalid_client`**, porque el texto llega cortado.

Si algún día cambian los códigos, se editan acá y se corrigen en todos los
dispositivos con solo recargar. Al hacer un commit no hay que tocar nada:
los valores viajan en el archivo.

Para confirmar que quedó bien: en **Ajustes → Diagnóstico** tiene que decir
*ID fijado en el archivo: sí*.

### Configuración en cada teléfono o PC

En **Ajustes → Consultorio compartido**:
- **Tu nombre profesional**: lo que van a ver las demás en tus horas.
- **ID de la planilla**: el del paso 4.
- **Sala que usás más seguido**: queda preseleccionada al agendar.

Y en **Ajustes → Sincronizar con Google Drive**, el ID de cliente, como antes.

### Cómo funciona el día a día

La pestaña **Día** muestra las dos salas lado a lado. Tus horas aparecen con
el nombre del paciente; las de las demás, con el nombre de la psicóloga y en
letra itálica más tenue. Los huecos libres se tocan para reservar esa sala a
esa hora.

Si intentás reservar una sala que ya está tomada —por vos o por una colega—
la app te avisa antes de guardar y te deja decidir.

### El tablero: ver la semana y el mes completos

`tablero.html` es una página aparte, pensada para planificar. Se abre desde
**Horario general**, en la barra principal de la app, o directo:

```
https://TUUSUARIO.github.io/agenda/tablero.html
```

Conviene que cada una la guarde en favoritos, o la agregue a la pantalla de
inicio como un acceso más.

Qué muestra:

- **Semana**: las dos salas, una debajo de la otra. Sábado y domingo solo
  aparecen si alguien reservó ese fin de semana; si no, la semana se muestra
  de lunes a viernes y las columnas quedan más anchas. Cada
  reserva es un bloque del color de la psicóloga. **Los huecos libres se
  dibujan con su duración** ("2 h libre"), así se ve de un vistazo dónde entra
  alguien. Los huecos solo aparecen en días que ya tienen algo agendado.
- **Mes**: el calendario entero, con las reservas de cada día y cuánto queda
  libre. Tocando un día se abre esa semana.
- **Filtros**: se puede apagar una sala o dejar visible solo a algunas
  psicólogas, para ver la agenda de una sola persona.
- **Imprimir**: sale apaisado y con los colores, para colgar en la pared.
- Flechas ← → para moverse, tecla **T** para volver a hoy.
- La flecha **‹** de arriba a la izquierda vuelve a la agenda. En el celular
  el botón atrás del sistema también funciona: el tablero abre dentro de la
  app, no en una ventana aparte.

Se actualiza sola cada 5 minutos y al volver a la pestaña.

**Antes de subirlo**, completá el bloque `CONSULTORIO` de `tablero.html` con
el mismo ID de cliente y el mismo ID de planilla que pusiste en `index.html`.

#### El tablero abre sin pedir cuenta de Google

Está configurado con la planilla publicada como CSV (`csvPublicado`), así que
cualquiera del equipo lo abre sin login. Eso evita de raíz los errores de
permisos, pero tiene una contrapartida que conviene tener presente:

**Cualquiera que llegue al enlace ve los nombres de las psicólogas y sus
horarios de trabajo.** No hay datos de pacientes, pero sí queda expuesto quién
trabaja y cuándo. Como el repositorio de GitHub es público, la dirección del
CSV es hallable.

Para volver a exigir cuenta de Google: vaciá `csvPublicado` en `tablero.html`
y despublicá la planilla (*Archivo → Compartir → Publicar en la web →
Detener publicación*). El tablero pasa a pedir login solo, sin más cambios.

Una diferencia práctica: lo publicado por Google se refresca cada algunos
minutos, así que el tablero puede mostrar una reserva recién hecha con un poco
de retraso. La app, en cambio, chequea la planilla en vivo al agendar, así que
el aviso de sala ocupada siempre está al día.

### Ver las reservas fuera de la app

Si alguna vez necesitás ver el dato crudo, entrá a la planilla desde Drive. Cada fila es una reserva: fecha, hora, hora de fin, minutos,
sala, profesional y estado.

La planilla es el registro crudo. Para planificar conviene usar el tablero,
que lee estos mismos datos y los muestra por semana y por mes.

**No edites ni borres filas de la pestaña `Reservas` a mano.** La app la
reescribe: los cambios manuales se pierden y podés desordenar reservas de
otras. Si hay que corregir algo, se hace desde la app.

### Avisar el resumen del mes a cada paciente

Al terminar el mes, en **Mes → Enviar resúmenes a los pacientes** aparece la
lista de quienes tuvieron consultas cobrables, con la cantidad y el total.

Tocando cada uno se ve el mensaje ya armado y se manda por WhatsApp, igual que
los recordatorios. Al enviarlo queda marcado como *enviado*, así no se manda
dos veces ni se saltea a nadie. La marca se sincroniza entre tus dispositivos.
También se puede marcar o desmarcar a mano.

- Si el mes tiene consultas sin marcar, avisa antes: el total estaría incompleto.
- Si alguien no tiene teléfono cargado, ofrece copiar el mensaje.
- Desde la tabla del mes también se puede tocar directamente a un paciente.

El texto se edita en **Ajustes → Mensaje de resumen de fin de mes**. Admite
`{nombre}`, `{nombreCompleto}`, `{mes}`, `{anio}`, `{cantidad}`, `{asistidas}`,
`{faltas}`, `{detalle}` (las fechas), `{arancel}` y `{total}`.

Por defecto dice algo así:

> Hola Ana, te paso el resumen de agosto: 3 consultas (03/08, 10/08, 17/08).
> Total: $ 4.500. Cualquier duda avisame. ¡Gracias!

Nota: si tenés activado el cobro de faltas, `{cantidad}` y `{detalle}` incluyen
las faltas cobradas, porque es lo que se está facturando. Si preferís
distinguirlas, usá `{asistidas}` y `{faltas}` por separado en la plantilla.

### Dar de baja varias consultas de una vez

Cuando alguien suspende la terapia por vacaciones o deja de venir, no hace
falta ir consulta por consulta. En **Pacientes → (la persona) → Suspender o
eliminar varias**:

1. Elegí el período (hay atajos de 2 semanas, 1 mes y 3 meses).
2. Aparecen listadas todas las consultas de esa persona en ese período, ya
   marcadas. Destildá las que quieras conservar.
3. Elegí qué hacer:
   - **Suspender**: quedan registradas como canceladas, no se facturan y la
     sala se libera para las demás. Es lo indicado para vacaciones.
   - **Eliminar**: desaparecen del todo. Pide confirmar dos veces.

Solo alcanza a las consultas del período elegido: las anteriores y las que
ya estaban canceladas no se tocan.

### Límites que conviene saber

- La planilla publica las reservas de los últimos 90 días en adelante.
  Lo más viejo queda en el archivo privado de cada una, no se pierde.
- Si dos psicólogas reservan **la misma sala a la misma hora en el mismo
  minuto**, sin que ninguna haya sincronizado en el medio, pueden quedar las
  dos anotadas. Es poco probable pero posible: si el horario es muy disputado,
  conviene mirar la pestaña Día antes de confirmar.
- Cancelar una consulta libera la sala para las demás en la próxima
  sincronización (unos segundos).

---

## Sobre los datos de los pacientes

Estás guardando nombres, teléfonos y asistencia a consultas. En Uruguay eso
es dato personal, y si el contexto es de salud, dato sensible según la ley
18.331. Tres cosas concretas:

- El archivo queda en tu Drive privado, no en un servidor mío ni de terceros.
- Poné clave o huella en el celular: quien lo desbloquee entra a la agenda.
- Seguí usando **Exportar** de vez en cuando. Drive es sincronización, no
  respaldo: si borrás algo por error, se borra en todos lados.

Si en algún momento esto pasa a ser una herramienta institucional y no
personal, conviene consultarlo con quien corresponda antes de seguir.

---

## Si algo falla

| Síntoma | Causa habitual |
|---|---|
| `redirect_uri_mismatch` o `origin mismatch` | El origen del paso 2.5 no coincide. Tiene que ser el dominio solo, sin `/agenda/` ni barra final. |
| `access_denied` | Falta agregar tu correo en *Usuarios de prueba*. |
| Dice *sin sincronizar* y no avanza | Probá **Sincronizar ahora** en Ajustes; abre la ventana de permisos. |
| El celular muestra la versión vieja | Cambiá `agenda-v2` por `agenda-v3` en `sw.js`, volvé a subirlo y recargá. |
| *Falta habilitar la API de Google Sheets* | Andá a Google Cloud → APIs y servicios → Habilitar API, buscá **Google Sheets API** y habilitala. Después tocá *Reintentar la planilla*. |
| *Falta el permiso de planillas* | La app pide un permiso nuevo que antes no existía. En Ajustes tocá *Guardar y conectar* y aceptá **todas** las casillas que muestra Google. |
| *Sin permiso sobre la planilla* | Pedí que te la compartan como **Editor**, no como lector. |
| *No se encontró la planilla* | El ID está mal. Podés pegar la dirección entera de la planilla: la app recorta sola el ID. |
| *Tocá para conectar con Google* | Normal: el navegador no deja abrir la ventana de Google sin un toque. Tocá el estado en el encabezado o *Sincronizar ahora*. |
| **Error 401: invalid_client** | El ID de cliente está mal o incompleto (típico si se pasó por mensaje). Fijalo en el bloque `CONSULTORIO` del archivo, o revisá en Ajustes → Diagnóstico que diga *formato correcto*. |
| **Error 401: deleted_client** | Se borró la credencial en Google Cloud. Creá una nueva y actualizá el bloque `CONSULTORIO`. |
| **Acceso bloqueado / access_denied** | Falta el correo de esa psicóloga en *Usuarios de prueba* del proyecto de Cloud. Agregalo y que reintente. |
| **Error 403: disallowed_useragent** | Abrió el enlace dentro de WhatsApp o Instagram. Google bloquea esos navegadores: hay que abrirlo en Chrome (Android) o Safari (iPhone) e instalar la app desde ahí. |
| **origin_mismatch** | La dirección desde la que se abre no está en *Orígenes autorizados de JavaScript*. Comparala con el campo *Origen* del Diagnóstico: tienen que ser idénticas. |
| No aparece *Instalar aplicación* | Solo funciona sobre `https://`, no con el archivo local. En iPhone usá Safari, no Chrome. |
| iPhone: la ventana de Google no abre | Safari bloquea las emergentes que no salen de un toque. Tocá *falta reconectar* en el encabezado, o *Sincronizar ahora* en Ajustes. |
| iPhone: se perdieron los datos | Safari borra el almacenamiento tras siete días sin abrir el sitio. Agregala a la pantalla de inicio y configurá Drive. |

---

## Cuando alguien reporta un problema

Pedile que vaya a **Ajustes → Diagnóstico** y toque *Copiar diagnóstico*, y
que te lo mande. Ahí vas a ver el origen exacto, si el ID de cliente está bien
formado, si abrió la app en un navegador embebido y cuál fue el último error.
Con eso se resuelve casi todo sin tener el teléfono a mano.

## Actualizar la app más adelante

Subí el `index.html` nuevo al repositorio reemplazando el anterior y cambiá
el número de versión en `sw.js`. Tus datos no se tocan: viven en Drive y en
el dispositivo, no en el código.
