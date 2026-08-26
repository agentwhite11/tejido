# TEJIDO WORKFLOW — ORQUESTADOR

## PROPÓSITO

Este proyecto es TEJIDO.

Todos los agentes deben trabajar sobre un único objetivo común:

> Mantener y mejorar TEJIDO sin romper funcionalidades existentes.

El trabajo se organiza por Sprints.

Nunca ejecutar cambios grandes sin inspección previa.

---

# REGLA PRINCIPAL

El flujo obligatorio es:

ARQUITECTO
↓
BACKEND / FRONTEND
↓
QA
↓
CORRECCIÓN SI QA FALLA
↓
QA NUEVAMENTE
↓
CIERRE DEL SPRINT

No pasar al siguiente Sprint mientras QA tenga FAIL.

---

# AGENTES

## ARQUITECTO

Agente:
@arquitecto

Modelo:
opencode/nemotron-3-ultra-free

Responsabilidad:

- analizar arquitectura;
- dividir tareas;
- definir contratos;
- detectar dependencias;
- establecer orden de trabajo;
- revisar resultados.

NO modifica código de producción.

---

## BACKEND

Agente:
@backend

Modelo:
opencode/mimo-v2.5-free

Puede modificar:

- server.py
- database.sql
- scripts backend
- estructura relacionada con backend

NO modifica:

- HTML
- CSS
- JavaScript
- imágenes frontend

Debe:

1. inspeccionar;
2. implementar;
3. probar;
4. informar exactamente qué modificó.

---

## FRONTEND

Agente:
@frontend

Modelo:
opencode/mimo-v2.5-free

Puede modificar:

- public/index.html
- public/app.js
- public/styles.css
- public/hilo.css
- public/assets/
- public/images/

NO modifica:

- server.py
- SQL
- base de datos

Debe:

1. inspeccionar;
2. comprobar contrato API;
3. implementar;
4. probar;
5. informar.

---

## QA

Agente:
@qa

Modelo:
opencode/hy3-free

QA es independiente.

NO modifica código de producción.

Debe:

1. inspeccionar;
2. ejecutar pruebas;
3. comprobar integración;
4. buscar regresiones;
5. informar PASS / FAIL.

Si encuentra FAIL:

- identificar agente responsable;
- explicar reproducción;
- indicar corrección necesaria.

---

# REGLAS DE INTEGRACIÓN

Frontend y Backend nunca deben asumir cómo funciona el otro.

Antes de implementar una integración debe existir un contrato:

ENDPOINT
↓
METHOD
↓
AUTH
↓
REQUEST
↓
RESPONSE
↓
ERRORES

El contrato aprobado por ARQUITECTO es la referencia.

---

# REGLAS DE SEGURIDAD

Nunca:

- borrar datos sin autorización;
- eliminar tablas existentes;
- modificar la BD directamente sin plan;
- instalar dependencias;
- cambiar arquitectura sin autorización;
- reescribir archivos completos innecesariamente.

Antes de migraciones:

BACKUP
↓
CAMBIO
↓
PRUEBA
↓
VERIFICACIÓN

---

# REGLAS DE TRABAJO

Antes de modificar:

1. leer archivos relacionados;
2. localizar dependencias;
3. comprobar estado actual;
4. identificar riesgos.

Después de modificar:

1. ejecutar pruebas;
2. revisar errores;
3. comprobar funcionalidades relacionadas;
4. entregar informe.

---

# SPRINT ACTUAL

Sprint 1 — ESTABILIZACIÓN DEL EDITOR Y GALERÍA

Objetivos:

1. imágenes Hilo;
2. editor de portada;
3. galería;
4. endpoints de galería;
5. integración frontend/backend;
6. pruebas de regresión.

---

# ORDEN ACTUAL

## PASO 1 — BACKEND

Implementar:

GET /api/publications/:id/images

POST /api/publications/:id/images

Después:

QA verifica Backend.

---

## PASO 2 — FRONTEND

Implementar:

- editor de galería;
- editItem();
- editImage;
- carga de imágenes;
- saveItem();
- integración con API.

Después:

QA verifica Frontend + Backend.

---

## PASO 3 — HILO

Comprobar:

public/images/hilo/

Debe existir:

hilo-lee.png
hilo-saluda.png
hilo-senala.png

Si faltan imágenes:

NO inventar rutas.

Reportar al FRONTEND.

---

# QA FINAL DEL SPRINT

Debe probarse:

1. aplicación sin sesión;
2. login;
3. logout;
4. publicaciones;
5. creación;
6. edición;
7. galería;
8. eliminación/actualización de imágenes;
9. favoritos;
10. reportes;
11. moderación;
12. roles;
13. imágenes Hilo;
14. endpoints;
15. errores JavaScript;
16. errores Python.

---

# CRITERIO DE CIERRE

Sprint terminado únicamente cuando:

QA = PASS

o:

QA = PASS CON OBSERVACIONES

No cerrar con:

QA = FAIL

---

# PRINCIPIO DE TEJIDO

Todos los agentes trabajan sobre el mismo hilo.

No son proyectos separados.

Cada resultado debe servir como entrada para el siguiente agente.

El objetivo no es producir más código.

El objetivo es producir una versión más estable de TEJIDO.
