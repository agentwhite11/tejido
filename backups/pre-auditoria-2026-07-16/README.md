# TEJIDO — Descubre lo que mueve a Caucasia

Aplicación web funcional para la Actividad Integradora Final ADSO FT.

## Cómo iniciar en Windows

1. Instala Python 3 si el equipo no lo tiene.
2. Haz doble clic en **INICIAR_TEJIDO.bat**.
3. La aplicación abrirá automáticamente en http://127.0.0.1:8765
4. Para detenerla, cierra la ventana negra o presiona Ctrl+C.

No requiere instalar librerías: usa únicamente componentes incluidos en Python.

## Cuentas de demostración

- Administrador: admin@tejido.co / Admin123!
- Gestor: gestor@tejido.co / Gestor123!
- Ciudadano: ciudadano@tejido.co / Ciudadano123!

## Funcionalidades

- Interfaz responsive para móvil y escritorio.
- Exploración, búsqueda y filtros.
- Detalle, favoritos y reportes.
- Inicio de sesión y control de acceso por roles.
- CRUD completo de publicaciones.
- Flujo borrador → revisión → publicación.
- API REST con validaciones y errores JSON.
- Base SQLite con 10 tablas relacionadas, llaves primarias y foráneas.
- Contraseñas cifradas con PBKDF2-HMAC-SHA256 y sesiones con vencimiento.

## Estructura

- server.py: servidor web, API, seguridad y persistencia.
- public/: interfaz HTML, CSS y JavaScript.
- database.sql: modelo relacional documentado.
- data/tejido.db: se crea automáticamente al iniciar.

## Demostración recomendada

1. Explorar y filtrar contenidos como visitante.
2. Ingresar como Gestor, crear un borrador y enviarlo a revisión.
3. Cerrar sesión e ingresar como Administrador.
4. Aprobar la publicación desde el panel.
5. Abrir el contenido publicado, guardarlo y reportarlo como Ciudadano.

## Nota académica

La aplicación implementa el producto mínimo viable descrito en el documento técnico. Antes de entregar, personaliza integrantes, ficha, enlaces y evidencias; realiza las pruebas del documento y captura los resultados reales.


## Si aparece un error de tablas

No vuelvas a importar database.sql sobre una base ya creada. Ejecuta **REPARAR_BASE_DATOS.bat**: comprobará la integridad, añadirá tablas faltantes y conservará los datos existentes. El proyecto usa SQLite; database.sql no debe importarse directamente en MySQL.
