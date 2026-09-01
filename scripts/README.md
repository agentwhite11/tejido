# Scripts de Arranque - TEJIDO

Esta carpeta contiene los scripts necesarios para iniciar la aplicación TEJIDO en diferentes plataformas y configuraciones.

## 📁 Contenido

### `INICIAR_TEJIDO.ps1` (Recomendado)
**Plataforma:** Windows (PowerShell)  
**Uso:**
```powershell
cd C:\Users\Bryan\Tejido\tejido
.\scripts\INICIAR_TEJIDO.ps1
```

### `INICIAR_TEJIDO.bat`
**Plataforma:** Windows (Cmd)  
**Uso:**
```cmd
cd C:\Users\Bryan\Tejido\tejido
scripts\INICIAR_TEJIDO.bat
```

### `INICIAR_TEJIDO_MYSQL.bat`
**Plataforma:** Windows (Cmd con MySQL)  
**Uso:**
```cmd
cd C:\Users\Bryan\Tejido\tejido
scripts\INICIAR_TEJIDO_MYSQL.bat
```

## 🚀 Ejecución Rápida

**Opción 1:** PowerShell (Recomendado)
```powershell
cd C:\Users\Bryan\Tejido\tejido
./scripts/INICIAR_TEJIDO.ps1
```

**Opción 2:** Python directo
```bash
cd C:\Users\Bryan\Tejido\tejido
python server.py
```

**Opción 3:** Python con módulo
```bash
cd C:\Users\Bryan\Tejido\tejido
python -m backend.app
```

## ✅ Verificación

Cuando la app arranque, deberías ver:
```
TEJIDO está disponible en http://127.0.0.1:8765
Presiona Ctrl+C para detener.
```

Prueba la conexión:
```bash
curl http://127.0.0.1:8765/api/health
```

Respuesta esperada:
```json
{"status": "ok", "database": "sqlite", "time": "2026-08-30T..."}
```

## 🔧 Configuración

Para cambiar host, puerto u otras opciones, edita `backend/config.py`:

```python
HOST = "127.0.0.1"  # Cambiar aquí
PORT = 8765          # O aquí
```

---

**Última actualización:** 30/08/2026  
**Estado:** ✅ Funcional
