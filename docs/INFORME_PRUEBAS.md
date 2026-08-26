# Informe de pruebas automáticas de TEJIDO

**Fecha de ejecución:** 16 de julio de 2026  
**Suite evaluada:** `tests/test_api.py`  
**Resultado:** **8 de 8 casos aprobados**  
**Comprobaciones funcionales:** **20 de 20 correctas**

## 1. Objetivo

La suite comprueba automáticamente el funcionamiento principal del backend de TEJIDO antes de la presentación. Las pruebas se concentran en:

- disponibilidad del servidor y conexión con SQLite;
- autenticación y reconocimiento de roles;
- privacidad de borradores;
- creación y edición de publicaciones;
- validación de datos incorrectos;
- manejo controlado de recursos inexistentes;
- flujo de revisión y publicación;
- respuesta correcta ante archivos estáticos inexistentes.

Estas pruebas verifican la API y sus reglas de negocio. No sustituyen la revisión visual de la interfaz.

## 2. Entorno temporal y protección de la base real

La suite no trabaja directamente sobre `data/tejido.db`. Antes de iniciar:

1. Crea una carpeta temporal mediante la biblioteca estándar de Python.
2. Copia `data/tejido.db` dentro de esa carpeta.
3. Configura el servidor para utilizar exclusivamente la copia temporal.
4. Inicia una instancia local en `127.0.0.1` con un puerto libre asignado automáticamente.
5. Ejecuta las peticiones HTTP contra esa instancia.
6. Detiene el servidor y elimina el entorno temporal al finalizar.

Por esta razón, las publicaciones, sesiones, favoritos y demás registros creados durante las pruebas **no modifican ni contaminan `data/tejido.db`**.

La suite utiliza únicamente módulos incluidos con Python: `unittest`, `urllib`, `tempfile`, `threading`, `json`, `shutil` e `importlib`.

## 3. Comando de ejecución

Desde una terminal ubicada en la carpeta `outputs\tejido-app`, ejecutar:

```powershell
py -m unittest discover -s tests -p "test_api.py" -v
```

Si el comando `py` no está disponible, usar:

```powershell
python -m unittest discover -s tests -p "test_api.py" -v
```

## 4. Matriz de resultados

| Caso | Comprobaciones | Resultado esperado | Resultado obtenido | Estado |
|---|---:|---|---|---|
| 01. Salud y roles | 3 | La API responde `200`, informa SQLite y reconoce conjuntamente los roles ADMIN, GESTOR y CIUDADANO. | Servicio disponible, motor `sqlite` y tres roles correctos. | ✅ Aprobado |
| 02. Listado público | 2 | El listado responde `200` y no expone borradores al gestor desde la exploración general. | Todos los registros recibidos tienen estado `PUBLISHED`. | ✅ Aprobado |
| 03. Privacidad de borradores | 2 | El administrador puede crear el borrador y un gestor ajeno recibe `403` al intentar abrirlo. | Creación `201` y acceso ajeno rechazado con `403`. | ✅ Aprobado |
| 04. Actualización de contenido | 3 | La edición responde `200` y persiste tanto la imagen nueva como la fecha final. | Imagen y `end_date` coinciden con los valores enviados. | ✅ Aprobado |
| 05. Validaciones | 3 | Tipo inexistente, categoría incompatible y JSON malformado deben responder `400`. | Los tres datos incorrectos produjeron errores JSON controlados con `400`. | ✅ Aprobado |
| 06. Relaciones inexistentes | 2 | Guardar o reportar una publicación inexistente debe responder `404`. | Favorito inexistente `404` y reporte inexistente `404`. | ✅ Aprobado |
| 07. Moderación | 4 | Primer envío `200`, segundo envío `409`, publicación del administrador `200` y edición posterior no permitida `409`. | Las cuatro transiciones devolvieron exactamente los estados esperados. | ✅ Aprobado |
| 08. Archivo estático inexistente | 1 | Un recurso CSS que no existe debe responder `404`, no devolver la página principal. | Respuesta `404`. | ✅ Aprobado |
| **Total** | **20** | **20 comprobaciones correctas** | **20 comprobaciones correctas** | **✅ 20/20** |

Para este conteo, la identificación correcta de los tres roles se registra como una comprobación conjunta. Los inicios de sesión y las publicaciones auxiliares creadas por los métodos de preparación son precondiciones de los casos, no comprobaciones adicionales de la matriz.

## 5. Resultado de la ejecución

La ejecución verificada produjo el siguiente resumen:

```text
Ran 8 tests

OK
```

Resultado consolidado:

- Casos ejecutados: **8**
- Casos aprobados: **8**
- Casos fallidos: **0**
- Errores inesperados: **0**
- Comprobaciones funcionales aprobadas: **20 de 20**
- Base de datos real modificada: **No**

## 6. Pruebas manuales todavía necesarias

### 6.1 Interfaz responsive

Revisar visualmente al menos en anchos de 360 px, 768 px y 1366 px:

- encabezado y menú móvil;
- tarjetas y textos sin desbordamiento;
- ventanas de inicio de sesión, detalle y perfil;
- botones de cierre visibles;
- formularios utilizables con teclado y pantalla táctil.

### 6.2 Mapa con conexión a internet

El mapa utiliza recursos externos de OpenStreetMap, por lo que debe probarse con internet:

- carga completa del mapa;
- selección de cada publicación de la lista;
- movimiento hacia la ubicación elegida;
- marcador nativo visible;
- enlace para abrir la ubicación exacta;
- comportamiento comprensible cuando no hay conexión.

### 6.3 Asistente Hilo

Comprobar la experiencia completa como usuario:

- abrir y cerrar a Hilo;
- burbuja de presentación y cambios de pose;
- opciones de eventos, oportunidades, mapa y talento;
- preguntas escritas y respuestas mostradas;
- buzón de sugerencias y confirmación del ticket;
- adaptación del panel en móvil;
- navegación con teclado y tecla `Escape`.

## 7. Conclusión

El flujo principal del backend SQLite queda respaldado por una suite repetible y aislada. Los ocho casos automáticos y sus veinte comprobaciones pasaron correctamente. Antes de la entrega final solo es necesario completar las pruebas manuales de presentación visual, acceso a OpenStreetMap y experiencia conversacional de Hilo.
