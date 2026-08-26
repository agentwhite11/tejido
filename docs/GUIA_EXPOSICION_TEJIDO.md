# Guía de exposición de TEJIDO

## Objetivo de esta guía

Esta guía está pensada para presentar TEJIDO en **10 minutos**, con palabras sencillas y sin necesidad de memorizar código. Lo más importante es explicar con claridad:

1. Qué problema existe en Caucasia.
2. Cómo TEJIDO ayuda a resolverlo.
3. Qué puede hacer cada usuario.
4. Cómo se conectan la interfaz, el servidor y la base de datos.
5. Qué funciona actualmente y qué se puede mejorar después.

---

## Guion exacto de 10 minutos

### 0:00–0:30 | Saludo y presentación

**Frase para decir:**

> Buenos días. Mi proyecto se llama TEJIDO. Es un aplicativo web diseñado para descubrir lo que mueve a Caucasia: sus eventos, historias, oportunidades, iniciativas y talentos. A continuación voy a explicar el problema que buscamos resolver, cómo funciona la solución y mostraré un recorrido práctico por el sistema.

### 0:30–1:25 | Problema identificado

**Frase para decir:**

> Actualmente, mucha información importante de Caucasia se encuentra dispersa entre Facebook, Instagram, WhatsApp, medios locales y páginas institucionales. Una persona debe revisar muchos lugares para encontrar un evento o una convocatoria. Como consecuencia, se pierden oportunidades, algunos eventos tienen poca asistencia y muchos talentos locales no reciben suficiente visibilidad.

> A partir de esta situación planteamos la siguiente necesidad: reunir y organizar la información local en un espacio sencillo, visual y fácil de consultar.

### 1:25–2:10 | Solución propuesta

**Frase para decir:**

> TEJIDO centraliza esa información en un solo aplicativo. El visitante puede explorar, buscar, filtrar, abrir publicaciones, consultar fechas y lugares y recorrer un mapa. Los usuarios registrados también pueden guardar convocatorias o reportar información. Además, incorporamos a Hilo, un personaje que orienta al visitante y hace que descubrir el contenido sea más cercano y didáctico.

> El propósito se resume en tres palabras: descubrir, conectar y participar.

### 2:10–3:00 | Usuarios y roles

**Frase para decir:**

> El sistema tiene tres perfiles con permisos diferentes. El ciudadano consulta contenido, guarda convocatorias y puede reportar información. El gestor crea y edita sus propias publicaciones y las envía a revisión. El administrador revisa, aprueba, rechaza y controla el contenido de la plataforma.

> La persona no escoge libremente su rol al ingresar. El rol ya está asociado a su cuenta. Además, la protección no depende solamente de ocultar botones: el servidor vuelve a comprobar el rol antes de autorizar cada operación importante.

### 3:00–4:00 | Arquitectura explicada de manera sencilla

**Frase para decir:**

> TEJIDO está compuesto por tres partes principales: frontend, backend y base de datos.

> El frontend es lo que la persona ve y utiliza en el navegador. Está construido con HTML, CSS y JavaScript. El backend está desarrollado con Python y se encarga de recibir solicitudes, validar datos, comprobar permisos y responder. La base de datos conserva usuarios, roles, publicaciones, favoritos, reportes, sugerencias y sesiones.

> Para entenderlo fácilmente, podemos imaginar un restaurante. El frontend es el salón y el menú que ve el cliente. El backend es el personal de cocina que recibe la orden, comprueba lo necesario y prepara la respuesta. La base de datos es la despensa y el archivo donde se conserva la información. La API funciona como el mesero que lleva la solicitud y devuelve el resultado.

### 4:00–7:20 | Demostración funcional

#### 4:00–4:45 | Explorar como visitante

**Acciones:**

1. Mostrar la página de inicio.
2. Bajar hasta “Explorar”.
3. Seleccionar un filtro, por ejemplo “Eventos”.
4. Abrir una tarjeta.

**Frase para decir:**

> Primero estoy usando TEJIDO como visitante. Sin iniciar sesión puedo explorar el contenido, buscar por palabras, filtrar por tipo y abrir una publicación para ver sus detalles. Esto responde a la necesidad principal de encontrar información local con pocas interacciones.

#### 4:45–5:15 | Mapa e Hilo

**Acciones:**

1. Abrir “Mapa vivo” y seleccionar una publicación de la lista.
2. Abrir Hilo y pulsar una opción, por ejemplo “Oportunidades”.

**Frase para decir:**

> El mapa relaciona las publicaciones con lugares del territorio mediante OpenStreetMap. Hilo funciona como guía: ofrece caminos claros y utiliza los contenidos publicados para orientar al visitante.

#### 5:15–6:15 | Flujo del gestor

**Cuenta de demostración:**

- Correo: `gestor@tejido.co`
- Contraseña: `Gestor123!`

**Acciones:**

1. Iniciar sesión como gestor.
2. Abrir el perfil.
3. Mostrar un borrador previamente preparado.
4. Pulsar “Enviar a revisión”.

**Frase para decir:**

> Ahora ingreso como gestor. Este perfil puede crear y editar publicaciones propias. El contenido comienza como borrador y el gestor lo envía a revisión. Aunque haya creado la publicación, no puede aprobarla por sí mismo. Esto ayuda a mantener la calidad de la información.

#### 6:15–7:10 | Flujo del administrador

**Cuenta de demostración:**

- Correo: `admin@tejido.co`
- Contraseña: `Admin123!`

**Acciones:**

1. Cerrar la sesión del gestor.
2. Iniciar sesión como administrador.
3. Abrir la cola de moderación.
4. Aprobar el borrador preparado.

**Frase para decir:**

> El administrador encuentra la publicación en la cola de moderación. Puede aprobarla o rechazarla con una observación. Al aprobarla, su estado cambia a publicada y queda disponible para los visitantes.

#### 7:10–7:20 | Resumen del recorrido

**Frase para decir:**

> En este recorrido demostramos consulta pública, filtros, mapa, orientación con Hilo, inicio de sesión, permisos por rol y el flujo de borrador, revisión y publicación.

### 7:20–8:10 | Base de datos y seguridad

**Frase para decir:**

> La base de datos es relacional. Por ejemplo, cada publicación tiene un autor y una categoría; y un favorito relaciona a un usuario con una publicación. Las llaves primarias identifican cada registro y las llaves foráneas mantienen las relaciones correctas.

> Las contraseñas no se guardan como texto normal. Se protegen con PBKDF2-HMAC-SHA256. Cuando alguien inicia sesión se crea un token aleatorio con vencimiento. El backend también valida los datos y rechaza las operaciones que no corresponden al rol del usuario.

### 8:10–8:55 | Cómo explicar el CSS sin mostrarlo completo

**Frase para decir:**

> CSS controla la presentación visual de TEJIDO. No necesito explicar cada regla individual. Lo organizo mentalmente en cinco ideas: colores, componentes, distribución, interacción y adaptación a celulares. Gracias al CSS, la misma información se presenta de manera ordenada en pantallas grandes y pequeñas.

Las cinco ideas están explicadas con más detalle en la siguiente sección de esta guía.

### 8:55–9:30 | Pruebas y limitaciones

**Frase para decir:**

> Realizamos pruebas manuales de los recorridos principales: exploración, filtros, inicio y cierre de sesión, permisos por rol, creación, revisión, aprobación, favoritos, mapa y adaptación a computador y celular. Las pruebas automatizadas completas quedan como una mejora posterior.

> Esta es una versión académica local. El mapa necesita internet para cargar OpenStreetMap y Hilo funciona mediante reglas y contenidos existentes; todavía no utiliza inteligencia artificial generativa.

### 9:30–10:00 | Conclusión

**Frase para decir:**

> En conclusión, TEJIDO convierte una necesidad real de Caucasia en una solución de software funcional. El aplicativo permite descubrir información, conectar actores del territorio y facilitar la participación de la comunidad. El proyecto demuestra interfaz, lógica de negocio, base de datos, CRUD, autenticación y autorización. Como evolución futura proponemos mejorar la organización del código, ampliar las pruebas, agregar carga segura de imágenes y publicar el sistema en internet. Muchas gracias.

---

## Recorrido de demostración resumido

Practicar siempre este mismo orden:

1. Inicio y propósito de TEJIDO.
2. Filtro de eventos en “Explorar”.
3. Apertura de una publicación.
4. Selección de un elemento en el mapa.
5. Una interacción corta con Hilo.
6. Gestor: mostrar borrador y enviarlo a revisión.
7. Administrador: aprobar ese contenido.
8. Explicar que ahora puede verlo el visitante.

No crear contenido improvisado durante la exposición. Es más seguro preparar el borrador antes y demostrar solamente el cambio de estados.

---

## Analogía para recordar frontend, backend y base de datos

| Parte | Analogía del restaurante | Función en TEJIDO |
|---|---|---|
| Frontend | Salón y menú | Lo que el usuario ve y utiliza. |
| API | Mesero | Lleva solicitudes y devuelve respuestas. |
| Backend | Cocina | Valida, aplica reglas y comprueba permisos. |
| Base de datos | Despensa y archivo | Conserva usuarios, publicaciones y demás registros. |

Ejemplo para decir:

> Cuando el ciudadano presiona Guardar, JavaScript envía la solicitud por la API. Python comprueba que haya iniciado sesión, registra el favorito en la base de datos y devuelve una respuesta para que la interfaz muestre el corazón activado.

---

## Cinco ideas fáciles para explicar el CSS

### 1. Variables de diseño

> Al principio del CSS se definen colores reutilizables, como el verde, amarillo, crema y morado. Así se mantiene una identidad visual uniforme y un cambio de color puede aplicarse en muchos componentes.

Ejemplo conceptual: `--ink` representa el verde principal y `--yellow` el amarillo destacado.

### 2. Componentes

> Cada parte visible tiene sus propias reglas: encabezado, botones, tarjetas, mapa, ventanas e Hilo. Una clase permite reutilizar el mismo diseño en elementos similares.

Ejemplo: todas las tarjetas de contenido comparten una clase y por eso mantienen el mismo borde, espacio y comportamiento.

### 3. Distribución

> Flexbox y Grid permiten ordenar los elementos en filas y columnas sin colocar cada elemento manualmente.

Ejemplo: las tarjetas se distribuyen en columnas en computador y pasan a una sola columna en celular.

### 4. Estados e interacción

> El CSS también muestra cambios cuando una persona pasa el cursor, selecciona un filtro, guarda un favorito o abre una ventana.

Ejemplo: un botón cambia de color cuando está activo.

### 5. Diseño responsive

> Las reglas `@media` adaptan tamaños y distribución según el ancho de la pantalla. Por eso TEJIDO puede utilizarse desde computador o celular.

No es necesario memorizar propiedades. Para la exposición basta mostrar una tarjeta y explicar esas cinco decisiones.

---

## Preguntas probables del instructor

### ¿TEJIDO es una página o un aplicativo web?

> Es un aplicativo web porque no se limita a mostrar información. Tiene autenticación, roles, base de datos, CRUD, favoritos, reportes, moderación y comunicación entre frontend y backend.

### ¿Qué significa CRUD?

> Crear, consultar, actualizar y eliminar. En TEJIDO se aplica principalmente a las publicaciones. La eliminación es lógica: se marca el registro como eliminado para conservar trazabilidad.

### ¿Por qué utilizaron Python?

> Porque permite implementar de manera clara el servidor, las validaciones, los permisos y la conexión con la base de datos. También facilita una demostración local sin una instalación demasiado compleja.

### ¿Los roles solo ocultan botones?

> No. El backend revisa el token y el rol antes de ejecutar una operación. Si un gestor intenta aprobar contenido directamente, el servidor rechaza la solicitud.

### ¿Dónde se guardan los datos?

> La demostración principal utiliza SQLite y conserva los datos en `data/tejido.db`. El proyecto también incluye una adaptación opcional para MySQL.

### ¿Por qué SQLite si el documento menciona MySQL?

> SQLite facilita una demostración local estable y sin depender de otro servicio. Se dejó una versión compatible con MySQL como alternativa para una etapa de despliegue o crecimiento.

### ¿Hilo utiliza inteligencia artificial?

> En esta versión no utiliza inteligencia artificial generativa. Es un asistente guiado por reglas que reconoce intenciones sencillas y consulta los contenidos de TEJIDO.

### ¿Cómo funciona el mapa?

> Las ubicaciones conocidas se relacionan con coordenadas y se visualizan mediante OpenStreetMap. El mapa externo requiere internet.

### ¿Cómo protegen las contraseñas?

> Se almacenan como un hash generado con PBKDF2-HMAC-SHA256, no como texto normal. Las sesiones utilizan tokens aleatorios con vencimiento.

### ¿Qué pruebas hicieron?

> Se realizaron pruebas manuales de los flujos principales y de la adaptación visual. La automatización completa de pruebas queda como una mejora futura.

### ¿Qué mejorarían primero?

> Organizar CSS y JavaScript en módulos, completar pruebas automatizadas, implementar carga segura de imágenes y desplegar el sistema con HTTPS.

### ¿Por qué el CSS es largo?

> Porque reúne el diseño de muchas secciones, estados y tamaños de pantalla. La aplicación funciona, pero la siguiente mejora técnica será separarlo en archivos por responsabilidad para facilitar su mantenimiento.

---

## Lista de verificación antes de presentar

### El día anterior

- [ ] Ensayar el guion completo dos veces con cronómetro.
- [ ] Confirmar que el recorrido dura máximo 10 minutos.
- [ ] Preparar un borrador para enviarlo a revisión.
- [ ] Probar las cuentas de gestor y administrador.
- [ ] Hacer una copia de seguridad de `data/tejido.db`.
- [ ] Guardar capturas del inicio, mapa, Hilo y paneles por rol.
- [ ] Tener una copia del proyecto en una memoria USB o almacenamiento seguro.
- [ ] Verificar que el cargador del computador esté disponible.

### Antes de entrar al salón

- [ ] Iniciar el servidor y no cerrar su terminal.
- [ ] Abrir `http://127.0.0.1:8765/`.
- [ ] Actualizar con `Ctrl + F5`.
- [ ] Verificar que el mapa cargue si hay internet.
- [ ] Dejar el navegador con zoom al 100 %.
- [ ] Cerrar pestañas y programas innecesarios.
- [ ] Desactivar notificaciones personales.
- [ ] Tener las cuentas de demostración anotadas.
- [ ] Dejar abierto el documento o diapositiva de respaldo.

### Durante la presentación

- [ ] Hablar despacio y mirar al instructor.
- [ ] Explicar primero el propósito y después la tecnología.
- [ ] Seguir exactamente el recorrido ensayado.
- [ ] No modificar código en vivo.
- [ ] No afirmar que una función existe si no se demostró.
- [ ] Si algo falla, explicar el objetivo y utilizar el respaldo.

---

## Plan de emergencia

### Si aparece “127.0.0.1 rechazó la conexión”

1. Comprobar que la terminal del servidor siga abierta.
2. Abrir la carpeta del proyecto.
3. Ejecutar `INICIAR_TEJIDO.bat`.
4. Esperar el mensaje que indica que TEJIDO está disponible.
5. Volver al navegador y presionar `Ctrl + F5`.

Si la terminal pregunta **“¿Desea terminar el trabajo por lotes (S/N)?”**, responder `N` para mantener el servidor funcionando.

### Si el mapa no carga

> El aplicativo está funcionando, pero OpenStreetMap es un servicio externo y necesita conexión a internet. La lista de publicaciones y sus ubicaciones sigue perteneciendo a TEJIDO.

Después, mostrar una captura preparada del mapa y continuar. No invertir varios minutos intentando repararlo durante la exposición.

### Si no funciona un inicio de sesión

1. Confirmar que no haya espacios en el correo.
2. Usar el botón de la cuenta de demostración correspondiente.
3. Si sigue fallando, mostrar las capturas del panel y explicar el flujo sin ocultar el problema.

### Si el servidor no puede recuperarse

1. Mantener la calma.
2. Abrir las capturas o el video de respaldo.
3. Explicar el recorrido con las evidencias.
4. Mostrar el modelo de base de datos y la estructura de archivos.

Frase útil:

> La demostración local presentó una dificultad en este equipo. Para no detener la sustentación, voy a mostrar las evidencias del mismo flujo funcionando y explicaré cómo se conectan sus componentes.

---

## Advertencias honestas para la sustentación

- **Hilo funciona con reglas**, palabras clave y contenido del sistema. No debe presentarse como inteligencia artificial generativa.
- **SQLite es la base activa en la demostración local predeterminada.** MySQL está disponible como alternativa mediante sus archivos y servidor correspondientes.
- **Las pruebas actuales son principalmente manuales.** No afirmar que existe una cobertura automatizada completa.
- **OpenStreetMap depende de internet.** El resto del aplicativo local puede seguir funcionando si el mapa externo falla.
- **La aplicación es un producto mínimo viable académico.** No debe describirse como un sistema listo para producción.
- **Las cuentas incluidas son cuentas de demostración.** En producción se cambiarían las contraseñas y no se mostrarían públicamente.
- **La carga segura de archivos y el despliegue con HTTPS son mejoras futuras.**
- **El código CSS y JavaScript necesita modularización.** Esto es una mejora de mantenimiento, no significa que el funcionamiento actual sea inválido.

Una respuesta honesta fortalece la presentación. Es mejor decir “esta es una mejora futura” que atribuir al aplicativo una función que todavía no está implementada.
