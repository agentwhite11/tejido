# Informe de auditoría previa a la entrega — TEJIDO

**Fecha:** 2026-07-16  
**Proyecto auditado:** `outputs/tejido-app`  
**Propósito:** comprobar el estado real del aplicativo, registrar las correcciones ya aplicadas y separar los pendientes imprescindibles de las mejoras futuras.

## 1. Resultado general

TEJIDO cumple los requisitos técnicos mínimos del aplicativo solicitados en la actividad integradora:

- interfaz web funcional con HTML, CSS y JavaScript;
- navegación, búsqueda, filtros y diseño adaptable;
- backend en Python con API REST;
- inicio de sesión y control de acceso por roles;
- CRUD de publicaciones con eliminación lógica;
- base de datos relacional con llaves primarias y foráneas;
- flujo de borrador, revisión, aprobación y rechazo;
- validación de datos y respuestas de error controladas.

La versión local comprobada utiliza **SQLite**. La base activa contiene **11 tablas**, su prueba de integridad devuelve `ok` y no presenta relaciones foráneas inválidas. El endpoint `/api/health` respondió correctamente e indicó `database: sqlite`.

La aplicación se encuentra en condiciones de ser demostrada localmente. Sin embargo, la entrega académica todavía necesita completar documentación, evidencias y datos del equipo. Este informe **no afirma que el DOCX académico haya sido corregido**.

## 2. Correcciones realmente aplicadas

### 2.1 Backend SQLite — `server.py`

Se comprobaron las siguientes mejoras en el servidor principal:

- validación centralizada de título, resumen, contenido, tipo, categoría, ubicación, fechas, enlace e imagen;
- aceptación de imágenes y enlaces únicamente con direcciones `http` o `https` válidas;
- límite de tamaño para las solicitudes y manejo controlado de JSON inválido;
- comprobación de que la categoría exista, esté activa y corresponda al tipo de publicación;
- almacenamiento y actualización de imagen, fecha inicial, fecha final y enlace;
- sincronización de los detalles de eventos y oportunidades;
- comprobación de existencia antes de guardar favoritos o crear reportes;
- protección de borradores para que solo el autor o el administrador puedan consultarlos;
- control de transiciones: un borrador o rechazado puede pasar a revisión, y solo un contenido en revisión puede aprobarse o rechazarse;
- obligación de registrar un motivo claro cuando el administrador rechaza contenido;
- restricción para que el gestor solo edite borradores o contenidos rechazados;
- respuesta `404` real para archivos estáticos inexistentes;
- eliminación lógica y consultas parametrizadas conservadas.

Estas correcciones fortalecen la lógica de negocio y demuestran que los roles no dependen únicamente de ocultar botones en la interfaz.

### 2.2 Interfaz y lógica del navegador — `public/app.js`

Se verificaron estas correcciones:

- el formulario ya envía y recupera la imagen de una publicación;
- se añadió la fecha final o de cierre;
- el formulario sincroniza tipo y categoría;
- los enlaces externos guardados aparecen en el detalle;
- el enlace de compartir `#contenido-ID` puede volver a abrir la publicación;
- la búsqueda ignora diferencias de mayúsculas y tildes;
- la agenda muestra próximos eventos y evita destacar eventos vencidos;
- Guardadas reúne todos los contenidos marcados como favoritos;
- el enlace móvil de Guardadas solo aparece con una sesión válida;
- el texto del acceso móvil vuelve a “Ingresar a mi cuenta” al cerrar sesión;
- una sesión local inválida se limpia automáticamente;
- los errores al copiar un enlace muestran un mensaje real;
- la opción de boletín se identifica como función de una próxima versión en lugar de simular un registro;
- el renderizado general y el renderizado del mapa se separaron para evitar recargar el mapa en cada búsqueda.

### 2.3 Estructura HTML — `public/index.html`

Se comprobaron estas mejoras:

- límites de longitud coherentes con el backend en los campos principales;
- campo de fecha final o cierre;
- descripción más clara para la URL de imagen;
- Guardadas móvil inicia oculta;
- enlaces del pie de página apuntan a secciones existentes;
- etiquetas y atributos accesibles añadidos en controles relevantes.

### 2.4 Organización visual — CSS

El CSS fue reformateado para hacerlo legible y explicable:

- `styles.css` está dividido mediante comentarios por responsabilidades;
- `hilo.css` conserva por separado el diseño del asistente;
- cada propiedad se muestra en líneas legibles;
- se añadieron reglas de foco visible y navegación accesible;
- se mantuvieron las adaptaciones para computador, tableta y celular.

El objetivo aplicado fue **mejorar la comprensión sin cambiar la identidad visual**. Esto no equivale todavía a una reducción profunda del código: la consolidación de estilos repetidos queda como mejora posterior a la entrega.

### 2.5 README

El `README.md` fue actualizado para describir el proyecto real:

- identifica TEJIDO como aplicativo web;
- explica el inicio manual y que la terminal debe permanecer abierta;
- indica las tecnologías realmente utilizadas;
- declara SQLite como base activa y recomendada;
- aclara que Hilo funciona por reglas y no es IA generativa;
- documenta las 11 tablas;
- incluye cuentas locales, organización de carpetas, recorrido de demostración y ejecución de pruebas;
- presenta MySQL únicamente como alternativa opcional.

### 2.6 Pruebas automáticas

Se añadió `tests/test_api.py`. Las pruebas trabajan sobre una copia temporal de la base y no modifican `data/tejido.db`.

Ejecución comprobada el 2026-07-16:

```text
Ran 8 tests
OK
```

Los ocho casos aprobados cubren:

1. salud de la API y roles;
2. visibilidad pública únicamente de contenido publicado;
3. privacidad de borradores;
4. actualización de imagen y fecha final;
5. validaciones y JSON inválido;
6. relaciones inexistentes con respuesta 404;
7. transiciones de moderación;
8. archivo estático inexistente con respuesta 404.

### 2.7 Script MySQL no destructivo

`database_mysql.sql` ya no contiene instrucciones `DROP TABLE`. Utiliza `CREATE DATABASE IF NOT EXISTS` y `CREATE TABLE IF NOT EXISTS`, por lo que volver a abrirlo no borra deliberadamente las tablas existentes.

Esto solo comprueba que el **script de esquema** dejó de ser destructivo. No demuestra que la versión MySQL completa haya sido probada.

## 3. Decisión para la sustentación

La demostración de mañana debe realizarse con **SQLite** mediante `INICIAR_TEJIDO.bat`.

Razones:

- es la base activa confirmada por `/api/health`;
- pasó la comprobación de integridad;
- no presenta errores de llaves foráneas;
- las ocho pruebas automáticas se ejecutaron sobre este backend;
- no requiere instalar un servidor de base de datos ni paquetes adicionales;
- reduce el riesgo técnico durante una exposición de diez minutos.

MySQL debe presentarse únicamente como una adaptación opcional. No se debe afirmar que está activo si el endpoint de salud muestra `sqlite`.

## 4. Riesgos y pendientes

### P0 — Deben resolverse para completar la entrega académica

- [ ] Completar en el documento académico nombres, ficha, instructor y roles reales.
- [ ] Reemplazar en el documento las tecnologías propuestas por las realmente implementadas.
- [ ] Cambiar los casos marcados como “Pendiente” por resultados reales y evidencias.
- [ ] Incorporar capturas auténticas del aplicativo funcionando.
- [ ] Actualizar el manual de usuario con instalación, acceso, funciones y capturas.
- [ ] Actualizar el manual técnico con Python, JavaScript, CSS, SQLite, arquitectura y estructura reales.
- [ ] Crear el informe `docs/INFORME_PRUEBAS.md`, actualmente mencionado por el README pero aún ausente.
- [ ] Grabar el video de evidencia de 5 a 10 minutos exigido por la actividad.
- [ ] Exportar el documento académico final a PDF después de corregirlo.
- [ ] Preparar la evidencia de participación y rol de cada integrante.

**Advertencia:** el archivo `TEJIDO_Actividad_Integradora_Final_ADSO.docx` no fue modificado durante esta auditoría y no debe presentarse como actualizado.

### P1 — Resolver antes de comprimir o declarar con claridad

- [ ] Realizar una prueba manual final de visitante, gestor, administrador y ciudadano.
- [ ] Capturar la vista de computador y la vista móvil.
- [ ] Confirmar que el borrador de la demostración esté preparado.
- [ ] Guardar una copia de `data/tejido.db` antes del ensayo final.
- [ ] Retirar del paquete final `backups/`, `tmp/`, `__pycache__/` y `public/styles.pre-exposicion.css`.
- [ ] Crear un ZIP limpio y comprobarlo en una ubicación distinta.
- [ ] Preparar capturas o video corto de respaldo si falla el servidor o internet.
- [ ] No depender del mapa para explicar el núcleo del proyecto: OpenStreetMap necesita internet.
- [ ] No presentar `server_mysql.py` como verificado; todavía es una adaptación separada que puede diferir del backend SQLite corregido.
- [ ] Revisar licencias o atribución de las fotografías culturales externas.

### P2 — Mejoras posteriores a la sustentación

- dividir `app.js` en módulos de publicaciones, mapa, autenticación, gestión e Hilo;
- consolidar reglas CSS repetidas sin alterar la apariencia;
- evitar la duplicación entre `server.py` y `server_mysql.py`;
- mantener una sola fuente de verdad para el esquema de base de datos;
- ampliar las pruebas hacia interfaz, accesibilidad y tamaños de pantalla;
- reemplazar ubicaciones predefinidas por geocodificación o coordenadas guardadas;
- servir localmente imágenes autorizadas para reducir dependencias externas;
- incorporar HTTPS, variables de entorno y secretos fuera del código para un despliegue real;
- ampliar el panel administrativo para gestión completa de reportes, usuarios y categorías.

## 5. Checklist de entrega para mañana

### Aplicativo

- [ ] Ejecutar `INICIAR_TEJIDO.bat`.
- [ ] Abrir `http://127.0.0.1:8765/`.
- [ ] Confirmar `http://127.0.0.1:8765/api/health` con `database: sqlite`.
- [ ] Mantener abierta la terminal.
- [ ] Probar inicio y cierre de sesión con las tres cuentas.
- [ ] Probar un filtro, detalle, mapa, Hilo y Guardadas.
- [ ] Probar el flujo Gestor → Revisión → Administrador → Publicado.
- [ ] Ejecutar `python -m unittest discover -s tests -v` y conservar la evidencia del resultado.

### Documento y evidencias

- [ ] Completar portada e integrantes.
- [ ] Corregir arquitectura y tecnologías del DOCX.
- [ ] Actualizar pruebas realizadas.
- [ ] Añadir capturas reales.
- [ ] Completar manual de usuario.
- [ ] Completar manual técnico.
- [ ] Verificar mínimo diez referencias.
- [ ] Exportar DOCX y PDF finales.
- [ ] Crear el informe de pruebas.
- [ ] Grabar y revisar el video de 5 a 10 minutos.

### Sustentación

- [ ] Ensayar el guion de diez minutos con cronómetro.
- [ ] Anotar las cuentas de demostración.
- [ ] Preparar un borrador para moderar.
- [ ] Dejar el navegador al 100 % de zoom.
- [ ] Cerrar notificaciones y pestañas personales.
- [ ] Llevar capturas y video de respaldo.
- [ ] Explicar Hilo como asistente por reglas.
- [ ] Explicar SQLite como base activa y MySQL como opción futura.
- [ ] Declarar que las pruebas automáticas cubren la API y que la interfaz se verificó manualmente.

### Paquete final

- [ ] Conservar código fuente, base, scripts, README, documentos, pruebas e imágenes necesarias.
- [ ] Excluir archivos temporales, cachés y respaldos internos.
- [ ] Nombrar el ZIP de forma clara, por ejemplo `TEJIDO_Entrega_Final_2026.zip`.
- [ ] Extraer el ZIP en otra carpeta y comprobar que el iniciador funciona.
- [ ] Conservar una segunda copia en USB o almacenamiento seguro.

## 6. Conclusión

La parte funcional principal de TEJIDO presenta una base sólida para la sustentación: el backend SQLite fue endurecido, la interfaz corrigió inconsistencias visibles, el CSS es más legible, el README coincide con la implementación y ocho pruebas automáticas fueron aprobadas. La prioridad restante no es realizar una refactorización grande, sino **completar el documento académico, las capturas, los manuales, el informe de pruebas, el video y el paquete final limpio**.
