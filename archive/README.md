# Archivo - TEJIDO

Esta carpeta contiene archivos históricos y anteriores del proyecto que se mantienen como referencia y respaldo.

## 📁 Contenido

### `database.sql`
**Descripción:** Esquema SQL original para SQLite  
**Propósito:** Referencia histórica (el esquema actual está en `backend/database/schema.sql`)  
**Cuándo usar:** Solo como referencia, no para producción

### `database_mysql.sql`
**Descripción:** Esquema SQL para MySQL (versión antigua)  
**Propósito:** Si se requiere migración a MySQL en el futuro  
**Cuándo usar:** Solo como referencia para migración a MySQL

## ⚠️ Importante

- **No editar estos archivos** - Son históricos
- **No usar en producción** - Usar `backend/database/schema.sql`
- **Mantener como respaldo** - Por si se necesita reconstruir la BD antigua

## 📊 Comparación

| Aspecto | Archivo Viejo | Actual |
|---------|---------------|--------|
| Ubicación | `archive/database.sql` | `backend/database/schema.sql` |
| Mantenimiento | No | Sí |
| Uso | Referencia | Producción |
| Cambios | Congelado | Activo |

## 🔄 Migración a MySQL

Si necesitas migrar a MySQL en el futuro:

1. Revisar `archive/database_mysql.sql`
2. Actualizar `backend/config.py` con credenciales MySQL
3. Usar migraciones de `backend/database/`
4. Mantener SQLite como fallback

---

**Última actualización:** 30/08/2026  
**Estado:** 📦 Archivo histórico
