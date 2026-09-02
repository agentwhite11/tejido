# TEJIDO - Descubre lo que mueve a Caucasia

## 📊 Proyecto Reorganizado (v2.0)

TEJIDO es una plataforma web académica para descubrimiento territorial que integra historias, eventos, oportunidades y talentos locales en Caucasia, Antioquia.

**Estado:** ✅ Funcional | **Última actualización:** 30/08/2026

---

## 🏗️ Estructura del Proyecto

```
tejido/
├── .config/                      # Configuración del proyecto
│   ├── .opencode/                # Agentes personalizados
│   │   ├── agents/               # Definiciones de roles
│   │   └── tejido-workflow.md    # Workflows y procesos
│   └── README.md
├── .git/                         # Control de versiones
├── archive/                      # Archivos históricos
│   ├── database.sql              # Esquema SQL viejo
│   ├── database_mysql.sql        # Schema MySQL
│   └── README.md
├── backend/                      # Backend modularizado
│   ├── app.py                    # Servidor HTTP
│   ├── config.py                 # Configuración centralizada
│   ├── api/
│   │   └── routes.py             # Rutas y autenticación
│   ├── database/
│   │   ├── connection.py         # Conexión BD
│   │   ├── init_db.py            # Inicialización
│   │   └── schema.sql            # Esquema actual
│   ├── services/
│   │   └── validation.py         # Validación de datos
│   └── README.md
├── backups/                      # Versiones anteriores del proyecto
│   └── pre-*/                    # Snapshots históricos
├── data/                         # Base de datos SQLite
│   └── tejido.db                 # Base de datos principal
├── docs/                         # Documentación
│   ├── GUIA_EXPOSICION_TEJIDO.md # Guía de exposición
│   ├── INFORME_AUDITORIA_PREENTREGA.md
│   ├── INFORME_PRUEBAS.md
│   └── TEJIDO_Actividad_Integradora_Final_ADSO.docx
├── frontend/                     # Frontend modularizado
│   ├── public/                   # Archivos estáticos servidos
│   │   ├── index.html            # Página principal
│   │   ├── css/                  # Estilos
│   │   ├── js/                   # Lógica JavaScript
│   │   ├── images/               # Imágenes
│   │   └── assets/               # Otros recursos
│   ├── src/                      # Histórico de desarrollo
│   └── README.md
├── scripts/                      # Scripts de arranque
│   ├── INICIAR_TEJIDO.ps1        # PowerShell (recomendado)
│   ├── INICIAR_TEJIDO.bat        # Cmd
│   ├── INICIAR_TEJIDO_MYSQL.bat  # Cmd + MySQL
│   └── README.md
├── AGENTS.md                     # Reglas del proyecto
├── CONTINUACION_PROYECTO.md      # Plan de continuación
├── server.py                     # Punto de entrada (wrapper)
├── README.md                     # Este archivo
└── .gitignore                    # Exclusiones de Git
```

---

## 🚀 Arrancar el Proyecto

### Opción 1: PowerShell (Recomendado)
```powershell
cd C:\Users\Bryan\Tejido\tejido
./scripts/INICIAR_TEJIDO.ps1
```

### Opción 2: Python Directo
```bash
cd C:\Users\Bryan\Tejido\tejido
python server.py
```

### Opción 3: Módulo Python
```bash
cd C:\Users\Bryan\Tejido\tejido
python -m backend.app
```

**La app estará en:** `http://127.0.0.1:8765`

---

## ✅ Verificar Funcionamiento

```bash
# Test de salud del servidor
curl http://127.0.0.1:8765/api/health

# Validar sintaxis JavaScript
node --check frontend/public/js/app.js

# Validar todos los módulos
node --check frontend/public/js/utils/helpers.js
node --check frontend/public/js/state/store.js
node --check frontend/public/js/services/api.js
```

Respuesta esperada:
```json
{"status": "ok", "database": "sqlite", "time": "2026-08-30T..."}
```

---

## 📦 Componentes Principales

### Backend
- **Servidor HTTP:** `backend/app.py` - Usa biblioteca estándar de Python
- **Autenticación:** `backend/api/routes.py` - Token Bearer de 8 horas
- **Base de Datos:** SQLite en `data/tejido.db`
- **Validación:** `backend/services/validation.py`

### Frontend
- **React + Vite:** `frontend/src/`
- **Desarrollo:** `npm run dev` desde `frontend/`
- **Respaldo vanilla:** `frontend/public/` durante la migración
- **CSS:** `frontend/src/styles.css` y estilos vanilla heredados
- **JavaScript Modular heredado:**
  - `js/utils/` - Funciones base
  - `js/state/` - Gestión de estado
  - `js/services/` - Cliente HTTP
  - `js/components/` - Componentes reutilizables
  - `js/core/` - Orquestación
  - `js/modules/` - UI e Hilo (asistente)
  - `js/app.js` - Aplicación principal

### Datos
- SQLite en `data/tejido.db`
- Schemas en `backend/database/schema.sql`
- Migrations en `backend/database/init_db.py`

---

## 👥 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Ver todo, moderar, estadísticas, eliminar |
| **GESTOR** | Crear/editar publicaciones, enviar a revisión |
| **CIUDADANO** | Ver publicado, guardar, reportar |

### Cuentas de Demo
- Admin: `admin@tejido.co` / `Admin123!`
- Gestor: `gestor@tejido.co` / `Gestor123!`
- Ciudadano: `ciudadano@tejido.co` / `Ciudadano123!`

---

## 🔧 Configuración

### backend/config.py
```python
HOST = "127.0.0.1"     # Servidor
PORT = 8765            # Puerto
DB_PATH = "data/tejido.db"  # Base de datos
```

### Variables de Ambiente (opcional)
```bash
TEJIDO_HOST=0.0.0.0
TEJIDO_PORT=8080
TEJIDO_DB=postgresql://...
```

---

## 📋 Tipos de Contenido

| Tipo | Descripción | Uso |
|------|-------------|-----|
| **HISTORIA** | Relatos y crónicas | Narrativa del territorio |
| **EVENTO** | Actividades y encuentros | Agenda territorial |
| **OPORTUNIDAD** | Convocatorias y proyectos | Participación |
| **TALENTO** | Personas y artistas | Visibilidad local |
| **INICIATIVA** | Proyectos comunitarios | Colaboración |

---

## 🎯 Próximas Fases

### Fase 3: Optimización Frontend (Actual)
- [ ] Dividir `app.js` en componentes específicos
- [ ] Crear componentes para cada sección
- [ ] Sistema de enrutamiento modular
- [ ] Validación centralizada

### Fase 4: Migración a React
- [x] Crear proyecto React + Vite
- [x] Conectar publicaciones y filtros con la API existente
- [ ] Migrar autenticación, favoritos y editor
- [ ] Migrar mapa y asistente Hilo
- [ ] Retirar frontend vanilla después de completar la paridad

### Fase 5: Mejoras BD (Futuro)
- [ ] Opción: Migrar a PostgreSQL
- [ ] Índices y optimización
- [ ] Backups automatizados
- [ ] Réplicas de seguridad

---

## 📚 Documentación Importante

- **[AGENTS.md](AGENTS.md)** - Reglas generales del proyecto
- **[CONTINUACION_PROYECTO.md](CONTINUACION_PROYECTO.md)** - Plan detallado
- **[frontend/README.md](frontend/README.md)** - Arquitectura frontend
- **[backend/README.md](backend/README.md)** - Arquitectura backend
- **[scripts/README.md](scripts/README.md)** - Cómo arrancar
- **[archive/README.md](archive/README.md)** - Archivos históricos

---

## 🐛 Problemas Comunes

### "No se encuentra server.py"
```powershell
# ✗ Incorrecto:
cd C:\Users\Bryan\Tejido
python server.py

# ✓ Correcto:
cd C:\Users\Bryan\Tejido\tejido
python server.py
```

### "Puerto 8765 ya está en uso"
```powershell
# Cambiar puerto en backend/config.py
Get-Process -Name python | Stop-Process -Force
```

### "Base de datos corrupta"
```bash
# NO BORRAR. Hacer backup primero:
cp data/tejido.db data/tejido.db.backup
# Luego revisar backend/database/init_db.py
```

---

## 🔒 Seguridad

- Contraseñas con PBKDF2-SHA256 (120,000 iteraciones)
- Token Bearer con expiración de 8 horas
- Validación de entrada en todos los endpoints
- CORS no habilitado por defecto (solo localhost)
- SQL injection prevenido con parametrización

---

## 📊 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| Backend Lines | ~500 LOC |
| Frontend Lines | ~2000 LOC |
| BD Tablas | 15 |
| Endpoints API | 25+ |
| Componentes | 10+ |
| Módulos JS | 8 |

---

## 👨‍💻 Contribución

Para contribuir al proyecto:

1. Leer [AGENTS.md](AGENTS.md)
2. Seguir la estructura de carpetas
3. Documentar cambios en README.md
4. Probar antes de hacer commit
5. Actualizar [CONTINUACION_PROYECTO.md](CONTINUACION_PROYECTO.md)

---

## 📞 Soporte

- **Problemas técnicos:** Ver sección "Problemas Comunes"
- **Preguntas del proyecto:** Ver [CONTINUACION_PROYECTO.md](CONTINUACION_PROYECTO.md)
- **Reglas del código:** Ver [AGENTS.md](AGENTS.md)

---

## 📄 Licencia

TEJIDO - Proyecto académico | ADSO 2026

Hecho con orgullo en Caucasia, Antioquia.

---

**Última actualización:** 30/08/2026  
**Versión:** 2.0 (Modularizado y Reorganizado)  
**Estado:** ✅ Funcional y Listo para Continuar
