# TEJIDO — REGLAS GENERALES PARA AGENTES

## 1. IDENTIDAD DEL PROYECTO

TEJIDO es una aplicación web académica para descubrir:

- eventos;
- historias;
- oportunidades;
- talentos locales.

El proyecto debe mantenerse simple, estable y fácil de mantener.

---

## 2. TECNOLOGÍAS OFICIALES

Backend:

- Python 3.9+
- biblioteca estándar de Python
- http.server
- ThreadingHTTPServer
- sqlite3
- hashlib
- secrets
- json

Base de datos principal:

- SQLite
- data/tejido.db

Frontend:

- React
- Vite
- JavaScript

No existe obligación de utilizar frameworks.

---

## 3. TECNOLOGÍAS NO INTRODUCIR SIN AUTORIZACIÓN

No introducir:

- Flask
- Django
- FastAPI
- Vue
- Angular
- Webpack
- ORMs innecesarios
- frameworks CSS nuevos

No convertir TEJIDO en otro tipo de proyecto.

---

## 4. REGLA PRINCIPAL

Antes de modificar cualquier archivo:

1. Leer el archivo.
2. Comprender su función.
3. Revisar sus conexiones con otros archivos.
4. Realizar el cambio mínimo necesario.
5. Probar el resultado.

No reescribir archivos completos cuando un cambio pequeño sea suficiente.

---

## 5. PROTECCIÓN DEL PROYECTO

No borrar:

- archivos;
- tablas;
- datos;
- funcionalidades;
- imágenes;

sin una razón técnica clara y autorización cuando corresponda.

No eliminar la base de datos para solucionar errores.

No sobrescribir backups.

---

## 6. BASE DE DATOS

La base de datos principal es:

data/tejido.db

Antes de cambiar la estructura:

- revisar tablas existentes;
- revisar relaciones;
- revisar consultas;
- comprobar dependencias;
- considerar datos existentes.

Los cambios de base de datos deben ser compatibles con el proyecto.

---

## 7. FRONTEND

Los archivos principales están en:

public/

Principalmente:

- index.html
- styles.css
- app.js

Antes de modificar JavaScript:

- buscar dónde se utiliza la función;
- revisar eventos relacionados;
- comprobar llamadas al backend.

Antes de agregar imágenes:

- comprobar que el archivo exista;
- comprobar exactamente la ruta;
- respetar mayúsculas y minúsculas.

---

## 8. BACKEND

El backend principal utiliza Python y la biblioteca estándar.

Antes de modificar server.py:

- localizar el endpoint;
- revisar cómo procesa los datos;
- revisar la respuesta;
- comprobar qué parte del frontend lo utiliza.

No crear endpoints duplicados.

---

## 9. ARQUITECTURA DE AGENTES

TEJIDO utiliza cuatro agentes:

### ARQUITECTO

Planifica y analiza.

No modifica código.

### BACKEND BUILDER

Construye y modifica backend.

### FRONTEND BUILDER

Construye y modifica frontend.

### QA / DOCUMENTADOR

Revisa, prueba y documenta.

No modifica código de producción.

---

## 10. FLUJO DE TRABAJO

El flujo recomendado es:

ARQUITECTO
↓
PLAN
↓
BACKEND BUILDER / FRONTEND BUILDER
↓
IMPLEMENTACIÓN
↓
QA / DOCUMENTADOR
↓
VERIFICACIÓN
↓
APROBACIÓN

No realizar cambios grandes sin planificación.

---

## 11. COORDINACIÓN

Backend y Frontend deben respetar las interfaces existentes.

Si una tarea necesita cambios en ambas partes:

1. identificar primero la dependencia;
2. implementar backend;
3. implementar frontend;
4. verificar integración.

No crear soluciones duplicadas.

---

## 12. HILO

Hilo es un elemento visual importante de TEJIDO.

Las imágenes de Hilo deben utilizar rutas reales existentes.

No inventar nombres de imágenes.

Si una imagen falta:

- reportar el problema;
- indicar la ruta esperada;
- no ocultar silenciosamente el error.

---

## 13. SEGURIDAD

No exponer:

- contraseñas;
- secretos;
- claves;
- credenciales;
- información sensible.

Las contraseñas deben manejarse mediante mecanismos seguros existentes en el proyecto.

No introducir credenciales directamente en el código.

---

## 14. CALIDAD

Cada cambio debe intentar mantener:

- simplicidad;
- estabilidad;
- legibilidad;
- compatibilidad;
- seguridad;
- mantenibilidad.

No agregar complejidad sin necesidad.

---

## 15. REGLA FINAL

El objetivo no es hacer la mayor cantidad de cambios.

El objetivo es hacer:

EL CAMBIO CORRECTO,
EN EL LUGAR CORRECTO,
CON EL MENOR RIESGO POSIBLE.
