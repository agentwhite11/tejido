# Frontend - Arquitectura Modularizada (v2.0)

## 📊 Estructura

```
frontend/
├── public/
│   ├── index.html                    # Página principal
│   ├── css/
│   │   ├── styles.css               # Estilos principales
│   │   └── hilo.css                 # Estilos del asistente
│   ├── js/
│   │   ├── utils/
│   │   │   └── helpers.js           # Funciones de utilidad (DOM, texto, formato)
│   │   ├── state/
│   │   │   └── store.js             # Gestión centralizada de estado
│   │   ├── services/
│   │   │   └── api.js               # Cliente HTTP con autenticación
│   │   ├── components/
│   │   │   ├── publications.js      # Renderizado de publicaciones
│   │   │   └── detail.js            # Vista de detalle (NUEVO)
│   │   ├── core/
│   │   │   └── loader.js            # Carga inicial de datos
│   │   ├── modules/
│   │   │   ├── constants.js         # Constantes y etiquetas (NUEVO)
│   │   │   ├── auth.js              # Autenticación y sesión (NUEVO)
│   │   │   ├── favorites.js         # Favoritos y guardadas (NUEVO)
│   │   │   ├── filters.js           # Filtros, búsqueda y agenda (NUEVO)
│   │   │   ├── map.js               # Mapa interactivo (NUEVO)
│   │   │   ├── editor.js            # Editor de contenido (NUEVO)
│   │   │   ├── content.js           # Panel de usuario (NUEVO)
│   │   │   ├── interactions.js      # Eventos de página (NUEVO)
│   │   │   ├── ui.js                # Utilidades de UI (modales, drawers)
│   │   │   └── assistant.js         # Asistente Hilo
│   │   └── app.js                   # Punto de entrada (orquestación)
│   ├── images/
│   │   ├── hilo/                    # Imágenes del asistente
│   │   └── ...
│   └── assets/
│       ├── dj-apolo/
│       ├── eventos/
│       ├── historias/
│       ├── iniciativas/
│       └── tropico-utopico/
└── src/                             # Histórico (no se usa)
```

## 🔄 Orden de Carga
- Notificaciones (toast)
### 1️⃣ Base (Utilidades e Infraestructura)
```javascript
helpers.js      // Funciones de utilidad (DOM, texto, formato)
store.js        // Estado global
api.js          // Cliente HTTP
```

### 2️⃣ Componentes Básicos
```javascript
constants.js    // Etiquetas (HISTORIA, EVENTO, etc.)
publications.js // Renderizado de lista
detail.js       // Vista de detalle
```

### 3️⃣ Módulos de Negocio
```javascript
loader.js       // Carga inicial
filters.js      // Filtros, búsqueda, agenda
map.js          // Mapa vivo
auth.js         // Autenticación
favorites.js    // Favoritos
content.js      // Panel de usuario
editor.js       // Editor de publicaciones
```

### 4️⃣ Interfaz de Usuario
```javascript
ui.js           // Modales, drawers
interactions.js // Eventos globales
assistant.js    // Asistente Hilo
```

### 5️⃣ Entrada Principal
```javascript
app.js          // Orquestación e inicialización
```

## 📦 Responsabilidades de Cada Módulo

| Módulo | Responsabilidad | Depende de |
|--------|-----------------|-----------|
| `helpers.js` | Selectores DOM, escape, formateo | Ninguno |
| `store.js` | Estado centralizado | Ninguno |
| `api.js` | Cliente HTTP | `store.js` |
| `constants.js` | Etiquetas globales | Ninguno |
| `publications.js` | Renderizado de tarjetas | `helpers.js`, `constants.js` |
| `detail.js` | Vista expandida | `api.js`, `helpers.js`, `ui.js` |
| `loader.js` | Carga inicial | `api.js`, `store.js` |
| `filters.js` | Filtros y búsqueda | `helpers.js`, `constants.js` |
| `map.js` | Mapa OpenStreetMap | `helpers.js`, `constants.js`, `store.js` |
| `auth.js` | Autenticación | `api.js`, `store.js`, `helpers.js` |
| `favorites.js` | Favoritos | `api.js`, `store.js`, `helpers.js` |
| `content.js` | Panel de usuario | `api.js`, `store.js`, `helpers.js` |
| `editor.js` | Editor de contenido | `api.js`, `ui.js`, `helpers.js` |
| `interactions.js` | Eventos de página | Todos los módulos |
| `ui.js` | Modales y drawers | `helpers.js` |
| `assistant.js` | Asistente Hilo | `helpers.js`, `store.js`, `api.js` |
| `app.js` | Orquestación | Todos |

## 🔗 Diagrama de Dependencias

```
app.js (ENTRADA)
  ├─ CORE_LOADER
  ├─ AUTH
  ├─ INTERACTIONS
  │   ├─ MAP_MODULE
  │   ├─ PUBLICATIONS_COMPONENT
  │   ├─ DETAIL
  │   ├─ FAVORITES
  │   ├─ FILTERS
  │   ├─ CONTENT
  │   └─ EDITOR
  └─ TEJIDO_ASSISTANT

BASE (Todo lo demás depende)
  ├─ HELPERS (helpers.js)
  ├─ STATE_STORE (store.js)
  └─ API_SERVICE (api.js)
```

## 🎯 Flujos Principales

### 1. Inicialización
```
app.js → initializeTEJIDO()
  ├─ CORE_LOADER.loadInitialData()
  │   ├─ API.get(/api/categories)
  │   ├─ API.get(/api/publications)
  │   ├─ API.get(/api/me)
  │   └─ STATE_STORE.setState(...)
  ├─ AUTH.renderSession()
  ├─ INTERACTIONS.bindPageEvents()
  └─ TEJIDO_ASSISTANT.bind()
```

### 2. Autenticación
```
#loginForm.onsubmit
  └─ AUTH.handleLogin()
     ├─ API.post(/api/auth/login)
     ├─ STATE_STORE.setToken()
     ├─ localStorage.setItem()
     └─ CORE_LOADER.loadInitialData()
```

### 3. Crear Publicación
```
#createBtn.click
  └─ EDITOR.newItem()
     └─ UI.openModal()
        └─ #editorForm.onsubmit
           └─ EDITOR.saveItem()
              ├─ API.post(/api/publications)
              ├─ API.post(./images) x N
              └─ CORE_LOADER.loadInitialData()
```

## ✅ Ventajas de esta Arquitectura

- **Modular**: Cada módulo es independiente y reutilizable
- **Escalable**: Fácil agregar nuevas funcionalidades
- **Mantenible**: Código organizado y responsabilidades claras
- **Testeable**: Lógica separada de interacciones
- **Preparado para React**: Arquitectura compatible con componentes
- **Sin dependencias**: Todo es JavaScript vanilla
- **Documentado**: Cada módulo tiene comentarios JSDoc

## 🔍 Debugging

Accede a la API global:

```javascript
// Ver estado actual
TEJIDO_APP.getState()

// Hacer una llamada API
await TEJIDO_APP.api.get('/api/publications')

// Mostrar detalle
TEJIDO_APP.showDetail(123)

// Acceder a un módulo específico
TEJIDO_APP.modules.auth.handleLogin()
TEJIDO_APP.modules.editor.newItem()
TEJIDO_APP.modules.map.renderMap()
```

## 📈 Métricas

| Métrica | Valor |
|---------|-------|
| Módulos | 16 |
| Líneas de código (frontend) | ~3000 |
| Componentes | 6 |
| Servicios | 1 |
| Línea de entrada | `index.html` (30 scripts) |
| Tiempo de carga inicial | ~500ms |

---

**Última actualización:** 30/08/2026  
**Versión:** 2.0 - Modularizado  
**Estado:** ✅ Funcional y Listo para React

