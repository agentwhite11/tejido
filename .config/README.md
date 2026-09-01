# Configuración del Proyecto - TEJIDO

Esta carpeta contiene la configuración y personalización del proyecto, incluyendo agentes personalizados y workflows.

## 📁 Contenido

### `.opencode/` (Agentes Personalizados)
**Descripción:** Configuración de agentes personalizados para VS Code  
**Archivos:**
- `agents/` - Definiciones de agentes especializados
- `tejido-workflow.md` - Workflow y procesos del proyecto

**Propósito:** 
- Definir comportamientos específicos de agentes IA
- Documentar procesos y workflows
- Personalizar instrucciones por rol

## 🤖 Agentes Personalizados

Los agentes se pueden configurar en `.opencode/agents/`:

### Roles Disponibles
- **ARQUITECTO** - Planificación y análisis
- **BACKEND BUILDER** - Construcción del backend
- **FRONTEND BUILDER** - Construcción del frontend
- **QA / DOCUMENTADOR** - Testing y documentación

Ver `tejido-workflow.md` para más detalles.

## ⚙️ Cómo Usar

### En VS Code con Copilot
Si tienes la extensión de GitHub Copilot:
1. Las instrucciones personalizadas se cargan automáticamente
2. Los agentes responden según su rol definido
3. Los workflows guían el proceso

### Editar Configuración
1. Edita archivos en `.opencode/agents/`
2. Actualiza instrucciones en `tejido-workflow.md`
3. Reinicia VS Code para aplicar cambios

## 📝 Estructura

```
.config/
├── .opencode/
│   ├── agents/
│   │   ├── arquitecto.md
│   │   ├── backend.md
│   │   ├── frontend.md
│   │   └── qa.md
│   └── tejido-workflow.md
```

## 🔗 Referencias

- Ver `tejido-workflow.md` para procesos detallados
- Ver `AGENTS.md` en raíz para reglas generales
- Ver `CONTINUACION_PROYECTO.md` para el estado actual

---

**Última actualización:** 30/08/2026  
**Estado:** ✅ Funcional
