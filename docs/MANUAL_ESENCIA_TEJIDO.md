# EL MANUAL VIVO DE LA ESENCIA DE TEJIDO

> *"Aunque cambien el desarrollador, el diseñador, la tecnología, la inteligencia artificial y la plataforma — TEJIDO nunca pierde su esencia."*

---

# PARTE 1 — ESENCIA VISUAL

---

## 1. PALETA DE COLORES

La paleta de TEJIDO no es decorativa. Cada color existe porque representa algo vivo del Bajo Cauca Antioqueño. No fue elegido en un generador de colores: fue extraído del territorio.

### COLORES PRIMARIOS

| Nombre | Código | Uso principal | Uso secundario | Emoción |
|--------|--------|---------------|----------------|---------|
| **Ink** | `#173f36` | Textos, header, botones principales, fondo del footer | Bordes, acentos fuertes | Profundidad del bosque, raíces, tierra húmeda |
| **Paper** | `#fff9ec` | Fondo general de la plataforma | Superficies de secciones | Calidez del papel antiguo, el calor de una conversación |
| **Cream** | `#f3e4c8` | Fondos de tarjetas, badges secundarios, chips | Hover states, acentos suaves | Arena del río, tierra mojada, calidez humana |
| **Yellow** | `#f4b942` | Acentos de energía, badges de monedas, sellos | Hover de elementos interactivos | El sol del Bajo Cauca, el oro ancestral, la alegría |
| **Mint** | `#75b79b` | Acentos de crecimiento, badged de progreso | Fondos de tarjetas de territorio | La vegetación viva, el río Nechí, lo que siempre está creciendo |
| **Purple** | `#8a4f7d` | Elementos de misterio, textos decorativos, sello de Zaragoza | Acentos de la serpiente | La memoria ancestral, la tradición, lo que guarda el río |
| **Orange** | `#d85b36` | Urgencia, eventos próximos, CTAs de acción | Badges de eventos, acentos de fuego | El calor humano, el fuego de la cocina, la pasión |

### COLORES CULTURALES DEL BAJO CAUCA

| Nombre | Código | Representación |
|--------|--------|----------------|
| **River** | `#1d8fa3` | El río Cauca y el Nechí. El agua que conecta todo. El movimiento perpetuo del territorio. |
| **Gold** | `#d4a843` | El oro que fluye en la sangre del Bajo Cauca. No es un metal: es la herencia, el trabajo, la identidad. |
| **Earth** | `#a0522d` | La tierra fértil de Caucasia. El barro de los caminos, la arcilla de la artesanía. |
| **Forest** | `#2d5a3d` | El bosque que respira. La selva que rodea cada municipio, el oxígeno del territorio. |
| **Sunset** | `#e85d3a` | El atardecer sobre el río Cauca. El momento en que el día se convierte en historia. |
| **Cream Warm** | `#faf3e6` | El calor de la tarde, la luz que entra por la ventana, la cercanía. |
| **Ink Deep** | `#0c241e` | La noche del Bajo Cauca. El silencio del bosque, la profundidad del río. |

### COLORES FUNCIONALES

| Nombre | Código | Uso |
|--------|--------|-----|
| **Muted** | `#66746f` | Textos secundarios, metadata, fechas, ubicaciones |
| **Line** | `#ddd5c7` | Bordes sutiles, separadores, líneas de progreso vacías |

### COLORES POR TIPO DE PUBLICACIÓN

| Tipo | Código | Significado |
|------|--------|-------------|
| **EVENTO** | `#d85b36` | Fuego, celebración, algo que está por ocurrir |
| **HISTORIA** | `#f4b942` | Oro, memoria, lo que ilumina el pasado |
| **TALENTO** | `#173f36` | Raíz, profundidad, lo que nace de la tierra |
| **OPORTUNIDAD** | `#8a4f7d` | Misterio, posibilidad, lo que está por descubrir |
| **INICIATIVA** | `#3b82f6` | Cielo, amplitud, lo que se construye juntos |

### REGLAS DE USO DE COLORES

1. **Nunca usar naranja y morado juntos** en un mismo elemento — generan conflicto emocional.
2. **El dorado (`#d4a843`) es el color del orgullo territorial** — reservarlo para logros, sellos, y elementos que celebran el Bajo Cauca.
3. **El río (`#1d8fa3`) es el color de la conexión** — usarlo para elementos que unen, enlazan o conectan.
4. **El verde oscuro (`#173f36`) es la voz de TEJIDO** — usarlo para la voz principal de la plataforma.
5. **El paper (`#fff9ec`) nunca debe sentirse frío** — siempre debe transmitir calidez.

---

## 2. TIPOGRAFÍA

### FUENTE PRINCIPAL — DM Sans

**Carga:** `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,700&display=swap');`

**Pesos utilizados:**
- 400 — Texto general, descripciones
- 500 — Texto secundario con peso
- 600 — Nombres, etiquetas, metadata
- 700 — Subtítulos, botones, elementos de acento
- 800 — Títulos principales, h1, h2

**Por qué DM Sans:**
DM Sans no es una fuente corporativa fría. Es una fuente geometric sans-serif que tiene alma humana. Sus formas son redondeadas pero precisas, modernas pero no distantes. Transmite:

- **Cercanía** — No intimida. Invita a leer.
- **Claridad** — En tamaños pequeños sigue siendo legible.
- **Modernidad** — Sin ser tendencia pasajera.
- **Humanidad** — Sin ser infantil ni cursiva innecesariamente.

**Cuándo usarla:** Para TODO el texto de la plataforma. Títulos, descripciones, botones, metadata, navegación.

**Cuándo NO usarla:** Nunca. DM Sans es la voz de TEJIDO.

### FUENTE DE ACENTO — Playfair Display

**Pesos utilizados:**
- Italic 700 — Exclusivamente para énfasis dentro de títulos

**Por qué Playfair Display:**
Playfair Display aparece solo en el contexto de *cursiva dentro de títulos*. No es una fuente de cuerpo. Es una herramienta de énfasis narrativo. Sus formas de transición entre serif y sans-serif transmiten:

- **Poesía** — Cuando TEJIDO quiere subrayar una palabra con emoción.
- **Elegancia territorial** — No es elegancia de oficina: es elegancia de río.
- **Contraste** — Rompe la monotone de DM Sans justo cuando necesitas que una palabra resalte.

**Ejemplo de uso correcto:**
```html
<h1>Donde el río <em>cuenta</em> historias</h1>
```
```css
.hero-cultural-title em {
  color: var(--sunset);
  font-family: 'Playfair Display', serif;
  font-style: italic;
  text-decoration: underline;
  text-decoration-color: var(--gold);
  text-underline-offset: 8px;
  text-decoration-thickness: 3px;
}
```

**Cuándo usarla:** Solo en `<em>` dentro de títulos principales (h1, h2) para resaltar una palabra con carga emocional.

**Cuándo NO usarla:** Para cuerpo de texto, descripciones, botones, metadata, navegación. Nunca como fuente de párrafos.

### ESCALA TIPOGRÁFICA

| Elemento | Tamaño | Peso | Fuente |
|----------|--------|------|--------|
| **h1 Hero** | `clamp(52px, 6.5vw, 96px)` | 800 | DM Sans |
| **h1 General** | `clamp(46px, 5.6vw, 84px)` | 800 | DM Sans |
| **h2** | `clamp(40px, 5vw, 64px)` | 800 | DM Sans |
| **h3** | `24px` | 700 | DM Sans |
| **Subtítulo** | `18-19px` | 400-500 | DM Sans |
| **Cuerpo** | `14-16px` | 400 | DM Sans |
| **Metadata** | `11-13px` | 600-700 | DM Sans |
| **Eyebrow** | `11px` | 800 | DM Sans |
| **Sellos** | `32px` (emoji) | — | Emoji |

### SENSACIÓN DE LA TIPOGRAFÍA

La tipografía de TEJIDO debe sentirse como:

- **Una conversación con alguien que conoce bien su territorio** — No es un manual de instrucciones.
- **Un poema que se lee fácil** — No es literatura académica.
- **Una carta de un amigo** — No es un comunicado de prensa.

Nunca debe sentirse como:
- Un documento gubernamental
- Un reporte financiero
- Una notificación de app
- Un sitio de noticias corporativo

---

## 3. MOTIVOS VISUALES Y SÍMBOLOS

### LA SERPIENTE / EL RÍO

**Qué representa visualmente:** Una serpentina que atraviesa el hero de TEJIDO, generada algoritmicamente con curvas Bézier. Su cuerpo es una línea gruesa semitransparente con un degradado del color `--river`. Tiene una cabeza circular con ojos diminutos y una cola que se desvanece.

**Qué representa culturalmente:** El río Cauca y el río Nechí. Las dos arterias vitales del Bajo Cauca. El río no es solo agua: es camino, es historia, es identidad. Los municipios nacen a su orilla. Las personas viven de él.

**Qué representa emocionalmente:** Movimiento perpetuo. El territorio nunca se detiene. Hay algo fluyendo siempre.

**Cómo se conecta con la metáfora de TEJIDO:** TEJIDO es el río que conecta las historias. Así como el río une los municipios, TEJIDO une las iniciativas, las personas, las oportunidades.

**Cómo debe utilizarse:** La serpiente/río nunca debe ser estática. Debe tener animación `snakeFlow` que simule el flujo del agua. Debe aparecer en el hero y en el mapa SVG. No debe usarse como decoración de fondo en cualquier sección: su lugar es el espacio de exploración territorial.

### LAS MONTAÑAS

**Qué representa visualmente:** Un triángulo semitransparente (`border` CSS) que aparece en el hero cultural, posicionado a la derecha.

**Qué representa culturalmente:** Las montañas del Bajo Cauca que enmarcan el valle del río. El relieve del territorio que da forma a los caminos.

**Qué representa emocionalmente:** Protección, permanencia, lo que siempre está ahí.

**Cómo se conecta con la metáfora de TEJIDO:** Las montañas son el lienzo. El río es la pintura. TEJIDO es quien los conecta.

**Cómo debe utilizarse:** Solo en el hero cultural. No multiplicar montañas en otras secciones.

### EL SOL

**Qué representa visualmente:** Un círculo con degradado radial de `--gold` a `--sunset`, con un `box-shadow` brillante que pulsa con la animación `sunGlow`.

**Qué representa culturalmente:** El sol del Bajo Cauca. El calor que da vida, que seca la ropa, que ilumina los caminos de tierra.

**Qué representa emocionalmente:** Energía, vitalidad, optimismo.

**Cómo se conecta con la metáfora de TEJIDO:** TEJIDO ilumina lo que pasa desapercibido. Así como el sol ilumina todo, TEJIDO hace visible lo invisible.

**Cómo debe utilizarse:** Solo en el hero cultural. La animación `sunGlow` (6s ease-in-out infinite) debe mantenerse siempre.

### LOS SELLOS (PASAPORTE)

**Qué representa visualmente:** Tarjetas redondeadas con emoji, nombre de municipio, tema y estado (bloqueado/desbloqueado). Cada sello tiene un color único asignado al municipio.

**Qué representa culturalmente:** Los 6 municipios del Bajo Cauca como destinos que se pueden recorrer. Cada sello es una pieza del rompecabezas territorial.

**Qué representa emocionalmente:** Logro, progreso, orgullo de pertenencia.

**Cómo se conecta con la metáfora de TEJIDO:** Cada sello es un hilo del tejido territorial. Cuando completas los 6, has tejido tu conocimiento del Bajo Cauca.

**Cómo debe utilizarse:** Los sellos se desbloquean al interactuar con contenido de cada municipio. La animación `stampAppear` (scale + rotate) debe activarse solo una vez por sello. Cuando se completan los 6, aparece el badge "Ciudadano del Bajo Cauca" con animación `badgeGlow`.

### LOS PUNTOS CONCENTRÍCICOS (BRAND MARK)

**Qué representa visualmente:** Tres círculos superpuestos con borde de 3px, radio 18px, formando un patrón asimétrico.

**Qué representa culturalmente:** La confluencia de los ríos Cauca y Nechí. Los puntos se encuentran, se superponen, crean algo nuevo.

**Qué representa emocionalmente:** Conexión, encuentro, creación colectiva.

**Cómo se conecta con la metáfora de TEJIDO:** Cada círculo es un elemento del territorio. Juntos forman la marca. Solos son solo círculos.

### LAS RUTAS DE CONEXIÓN

**Qué representa visualmente:** Líneas punteadas SVG que conectan los municipios en el mapa. Tienen animación `geoRouteDash` (20s lineal infinite).

**Qué representa culturalmente:** Los caminos, las vías, los ríos que conectan los municipios del Bajo Cauca.

**Qué representa emocionalmente:** Posibilidad, movimiento, la idea de que siempre hay un camino.

**Cómo se conecta con la metáfora de TEJIDO:** TEJIDO es la ruta digital que conecta lo que物理icamente está separado.

### LOS HILOS (TIMELINE)

**Qué representa visualmente:** Una línea horizontal con puntos de color que representan publicaciones en orden cronológico. Cada punto tiene un conector vertical hacia una tarjeta.

**Qué representa culturalmente:** El tiempo del Bajo Cauca. No es una línea recta: es un río de eventos que fluye.

**Qué representa emocionalmente:** Continuidad, progreso, la sensación de que el territorio tiene una historia que sigue escribiéndose.

**Cómo se conecta con la metáfora de TEJIDO:** Cada punto es un hilo en la línea del tiempo. TEJIDO teje el tiempo del territorio.

---

## 4. ANIMACIONES Y MOVIMIENTO

### `snakeFlow` — El río fluye

```css
@keyframes snakeFlow {
  0%, 100% { stroke-dashoffset: 0; }
  50% { stroke-dashoffset: -52; }
}
```

**Cómo debe sentirse:** Como agua moviéndose por un cauce. Suave, constante, hipnótico.

**Qué emoción provoca:** Calma. La sensación de que el territorio respira.

**Velocidad:** 12s ease-in-out infinite. Lenta. Contemplativa.

**Cuándo utilizarse:** En el hero cultural, en el mapa SVG, en la serpiente/río.

**Cuándo NO utilizarse:** Nunca en elementos interactivos, botones, o tarjetas. El río fluye, los botones responden.

### `hilo-float` — Hilo flota

```css
@keyframes hilo-float {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-7px) rotate(1deg); }
}
```

**Cómo debe sentirse:** Como un personaje que está vivo, que respira, que te observa con curiosidad.

**Qué emoción provoca:** Cercanía, calidez, la sensación de que alguien está ahí para ayudarte.

**Velocidad:** 3.4s ease-in-out infinite. Moderada. Ni muy rápida ni muy lenta.

**Cuándo utilizarse:** Cuando el panel de Hilo está cerrado. En el botón flotante de Hilo.

**Cuándo NO utilizarse:** Cuando el panel está abierto. Hilo deja de flotar y se convierte en conversación.

### `sunGlow` — El sol pulsa

```css
@keyframes sunGlow {
  0%, 100% { box-shadow: 0 0 80px rgba(212, 168, 67, 0.3); transform: scale(1); }
  50% { box-shadow: 0 0 120px rgba(212, 168, 67, 0.4); transform: scale(1.05); }
}
```

**Cómo debe sentirse:** Como el sol real: brillando, cambiando, viviendo.

**Qué emoción provoca:** Vitalidad, energía, optimismo.

**Velocidad:** 6s ease-in-out infinite. Lenta. El sol no se apura.

**Cuándo utilizarse:** En el sol del hero cultural.

**Cuándo NO utilizarse:** Nunca en otros elementos. El sol es único.

### `geoMuniIn` — Los municipios aparecen

```css
@keyframes geoMuniIn {
  from { opacity: 0; transform: scale(0); }
  to { opacity: 1; transform: scale(1); }
}
```

**Cómo debe sentirse:** Como puntos de luz que se encienden uno a uno en un mapa.

**Qué emoción provoca:** Descubrimiento. La sensación de que el territorio se revela.

**Velocidad:** 0.6s cubic-bezier(.34,1.56,.64,1). Rápida pero con rebote. Cada municipio aparece con 0.1s de retraso.

**Cuándo utilizarse:** Cuando el mapa SVG carga por primera vez.

**Cuándo NO utilizarse:** En recargas o actualizaciones parciales.

### `stampAppear` — El sello se desbloquea

```css
@keyframes stampAppear {
  0% { transform: scale(0.7) rotate(-10deg); opacity: 0; }
  60% { transform: scale(1.1) rotate(2deg); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
```

**Cómo debe sentirse:** Como un sello real golpeando un pasaporte. Un momento de celebración.

**Qué emoción provoca:** Logro, satisfacción, ganas de seguir coleccionando.

**Velocidad:** 0.5s ease. Rápida. El sello cae con decisión.

**Cuándo utilizarse:** Solo cuando un sello se desbloquea por primera vez.

**Cuándo NO utilizarse:** En recargas de página. Los sellos desbloqueados se muestran estáticos.

### `hiloConfettiFall` — Confeti de celebración

```css
@keyframes hiloConfettiFall {
  0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg) scale(0.3); opacity: 0; }
}
```

**Cómo debe sentirse:** Como confeti real cayendo. Alegría, celebración, algo especial acaba de pasar.

**Qué emoción provoca:** Sorpresa positiva, ganas de sonreír.

**Velocidad:** 1.5-2.5s ease-out. Caída natural con variación aleatoria.

**Cuándo utilizarse:** Cuando Hilo encuentra algo, cuando el usuario comparte contenido, cuando se completa el pasaporte.

**Cuándo NO utilizarse:** En errores, mensajes informativos, o elementos no celebratorios.

### `badgeGlow` — El badge de ciudadano brilla

```css
@keyframes badgeGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(212, 168, 67, 0.15); }
  50% { box-shadow: 0 0 40px rgba(212, 168, 67, 0.3); }
}
```

**Cómo debe sentirse:** Como un trofeo brillante. Orgullo, logro completo.

**Qué emoción provoca:** Satisfacción profunda, ganas de compartir.

**Velocidad:** 2s ease-in-out infinite. El brillo nunca se apaga.

**Cuándo utilizarse:** Solo cuando se completan los 6 sellos del pasaporte.

**Cuándo NO utilizarse:** Nunca en otros elementos.

### REGLAS GENERALES DE ANIMACIÓN

1. **Nada debe sentirse mecánico.** Todas las animaciones usan `ease`, `ease-in-out`, o `cubic-bezier`. Nunca `linear` excepto en flujos de río.
2. **La velocidad importa.** Las animaciones de celebración son rápidas (0.3-0.6s). Las de contemplación son lentas (6-12s).
3. **Las animaciones existen para hacer sentir que el territorio está vivo.** No para demostrar tecnología.
4. **Si una animación no provoca una emoción, eliminarla.**
5. **Nunca animar más de 3 elementos simultáneamente** en una misma sección.

---

## 5. ESTILO DE COMPONENTES

### TARJETAS (PublicationCard)

**Cómo se sienten:** No son rígidas ni completamente orgánicas. Son fragmentos de historias que flotan sobre el papel.

**Profundidad:** Sombra sutil (`box-shadow: 0 12px 40px rgba(18, 60, 52, 0.14)`). No flotan demasiado: están cerca del suelo.

**Invitación a explorar:** El hover levanta la tarjeta 4px con `transform: translateY(-4px)` y aumenta la sombra. Es como levantar una piedra del río para ver qué hay debajo.

**Estructura:**
```
┌─────────────────────┐
│  [Imagen/Gradient]  │  ← 190px de altura
├─────────────────────┤
│  publication-kind   │  ← 11px, naranja, bold
│  h3 (título)        │  ← 22px, bold
│  p (resumen)        │  ← 14px, muted
│  small (ubicación)  │  ← 11px, muted
│  ─────────────────  │  ← borde superior
│  [Compartir]        │  ← botón sutil
└─────────────────────┘
```

**Fondo:** `#fffaf2` con borde `1px solid #e2d9ca`. No es blanco puro: es paper cálido.

### BOTONES

**Primary Button:**
```css
background: linear-gradient(135deg, var(--forest) 0%, var(--river) 100%);
border-radius: 999px;
color: white;
font-weight: 700;
padding: 16px 32px;
```
**Sensación:** Invitación, no orden. Es como alguien que te dice "ven, hay algo bonito aquí". El gradiente de verde a azul representa el bosque encontrándose con el río.

**Secondary Button:**
```css
background: transparent;
border: 2px solid var(--ink);
border-radius: 999px;
color: var(--ink);
```
**Sensación:** Opción alternativa, respeto por la decisión del usuario. No insiste.

**Donate Button:**
```css
background: linear-gradient(135deg, #e85d3a 0%, #d4a843 100%);
border-radius: 999px;
color: white;
```
**Sensación:** Calor, generosidad, pasión. El degradado de naranja a dorado representa el fuego del corazón dando algo valioso.

**Lenguaje de botones:**
- "Explorar Territorio" (no "Ver más")
- "Próximos Eventos" (no "Agenda")
- "Quiero Participar" (no "Registrarse")
- "Comenzar Ahora" (no "Empezar")
- "Donar a Tejido" (no "Donar")
- "Colaborar" (no "Ser colaborador")

### BADGES

**Símbolos territoriales:** El badge "Bajo Cauca Antioqueño" aparece en el hero con un ícono `~` que representa el río.

**Sellos coleccionables:** Cada municipio del pasaporte tiene un badge con emoji, nombre y tema. Son coleccionables emocionales.

**Badges de tipo:** `publication-kind` muestra el tipo de publicación en 11px bold naranja con letter-spacing.

**Badges de progreso:** El badge "Ciudadano del Bajo Cauca" aparece al completar los 6 sellos con una animación de brillo dorado.

### HERO

**Qué debe sentir una persona durante los primeros segundos:**
1. **Curiosidad** — "¿Qué es esto del río que cuenta historias?"
2. **Orgullo** — "Esto es de mi territorio."
3. **Movimiento** — "Hay algo vivo aquí."
4. **Pertenencia** — "Esto me representa."

**Estructura del hero cultural:**
```
┌──────────────────────────────────────────┐
│  [Badge: Bajo Cauca Antioqueño]         │
│  [h1: Donde el río *cuenta* historias]  │
│  [p: Descripción poética]               │
│  [Testimonio rotativo]                  │
│  [Botones: Explorar + Eventos]          │
│  [Botones: Donar + Colaborar]           │
├──────────────────────────────────────────┤
│  [Serpiente/Río SVG animado]            │
│  [Montaña] [Sol]                         │
│  [Tarjetas flotantes: Caucasia, Oro,    │
│   Música Viva]                          │
└──────────────────────────────────────────┘
```

**El testimonio rota cada 5 segundos** con frases de personas reales del Bajo Cauca:
- "El río Cauca no solo lleva agua, lleva nuestra historia." — María, Caucasia
- "Aquí nacen los cantos que hacen latir al Bajo Cauca." — Carlos, El Bagre

### SECCIONES

**Cómo se conectan:** Las secciones no tienen bordes duros entre ellas. Fluyen como el río. Cada sección tiene su propio ritmo pero comparte la misma paleta y tipografía.

**Cómo se evita la colección genérica:** Cada sección tiene un `section-badge` que la identifica ("Geografía", "Pasaporte", "Cronología", "Artista Destacado"). Los badges crean jerarquía visual sin necesidad de líneas divisorias.

**Patrón de sección:**
```
[Section Badge: 11px, uppercase, river color, pill shape]
[Section Title: clamp(40px, 5vw, 64px), bold, con em en Playfair]
[Section Description: 18px, muted, max-width 500px]
[Content: grid, flex, o scroll horizontal]
```

### HEADER

**Nivel de protagonismo:** Bajo. El header es un amigo que te acompaña pero no te grita.

**Comportamiento:** `position: sticky; top: 0; z-index: 5;` con `background: rgba(255,253,248,.94)` y `backdrop-filter` implícito. Siempre visible, nunca intrusivo.

**Navegación:** Inicio, Explorar, Mapa vivo, Agenda, Oportunidades, Talento, Colaborar, Moneystack. En mobile se oculta y se accede por menú.

**Logo:** Brand mark (3 círculos) + "TEJIDO" + "CAUCASIA" en 8px. El brand mark tiene los círculos con borde de 3px en ink.

### FOOTER

**Cómo termina el recorrido:** El footer es un cierre pero también una invitación a seguir. Fondo `#0c241e` (ink-deep) con texto blanco.

**Estructura:**
```
┌──────────────────────────────────────────────────┐
│  [Logo + "Descubre lo que mueve a Caucasia."]   │
│  [Explora: Historias, Eventos, Oportunidades,    │
│   Talento]                                       │
│  [Proyecto: Acerca de, Mapa vivo, Guardadas]     │
│  [Hecho con orgullo en Caucasia, Antioquia.      │
│   © 2026 TEJIDO]                                 │
└──────────────────────────────────────────────────┘
```

**Sensación:** Como llegar al final de un camino y ver que hay más caminos por recorrer. No es un muro: es una puerta.

---

## 6. ICONOGRAFÍA Y SÍMBOLOS

### EMOJIS QUE FORMAN PARTE DE LA EXPERIENCIA

| Emoji | Uso | Contexto |
|-------|-----|----------|
| 🎭 | EVENTO | Publicaciones de eventos |
| 📖 | HISTORIA | Publicaciones de historias |
| 🎤 | TALENTO | Publicaciones de talento |
| 🌟 | OPORTUNIDAD | Publicaciones de oportunidades |
| 📑 | INICIATIVA | Publicaciones de iniciativas |
| 🏰 | Caucasia | Sello del pasaporte |
| 🏛 | Cáceres | Sello del pasaporte |
| ☕ | Tarazá | Sello del pasaporte |
| 🌊 | Nechí | Sello del pasaporte |
| ⭐ | El Bagre | Sello del pasaporte |
| ⚓ | Zaragoza | Sello del pasaporte |
| 🏆 | Completar pasaporte | Badge "Ciudadano del Bajo Cauca" |
| ♡ | Guardar contenido | Empty state de guardados |
| ~ | Badge del río | Badge "Bajo Cauca Antioqueño" |
| ➜ | Enviar mensaje | Botón de envío de Hilo |
| ♥ | Donar | Botón de donación |
| ★ | Colaborar | Botón de colaboración |

### ICONOS FUNCIONALES (SVG inline)

- **Compartir:** 3 círculos conectados por líneas (share network)
- **Play:** Triángulo (reproducción de audio/video)
- **Instagram:** Rectángulo redondeado con círculo
- **YouTube:** Rectángulo con triángulo
- **Spotify:** Círculo con líneas de onda
- **Cerrar:** × (cruz)
- **Flecha:** → (dirección)
- **Filtros:** Chips con texto

### CUÁNDO UN EMOJI AYUDA A HUMANIZAR

- **En sellos del pasaporte:** Siempre. Cada emoji representa la esencia de un municipio.
- **En tipo de publicación:** Siempre. El emoji es la primera señal visual del tipo de contenido.
- **En empty states:** Sí, pero con moderación. Un solo emoji grande (50px) que represente la situación.
- **En botones:** Solo si el emoji es funcional (♥ para donar, ★ para colaborar).

### CUÁNDO DEBE EVITARSE

- **En títulos principales** — Los títulos de TEJIDO son texto, no emoji.
- **En navegación** — La navegación es limpia y textual.
- **En mensajes de error** — Los errores son serios, no festivos.
- **En metadata** — Fechas, ubicaciones, contadores no llevan emoji.

---

## 7. EXPERIENCIA RESPONSIVE

### ESCRITORIO (>1024px)

**Sensación:** Un espacio de exploración. Un mapa amplio. Un recorrido. Un universo territorial.

**Características:**
- Grid de 3 columnas para tarjetas de publicación
- Mapa SVG completo con los 6 municipios
- Hero con serpiente, montaña, sol y tarjetas flotantes
- Sidebar del mapa a la derecha del mapa
- Footer de 4 columnas
- Navegación horizontal completa

**Navegación:** Horizontal en el header. 8 enlaces visibles.

**Jerarquía:** Hero → Artista Destacado → Mapa → Pasaporte → Timeline → Invitación → Footer.

### TABLET (768px-1024px)

**Sensación:** Se mantiene la exploración pero con más concentración.

**Cambios:**
- Hero pasa a 1 columna (oculta tarjetas flotantes)
- Grid de territorio: 2 columnas
- Artista destacado: 1 columna (visual arriba)
- Mapa: sidebar debajo del mapa
- Footer: 2 columnas
- Navegación: se ocultan algunos enlaces

### MÓVIL (<768px)

**Sensación:** Una herramienta que acompaña a la persona. Algo que puede descubrir mientras camina por el territorio. Un compañero de exploración.

**Cambios:**
- Hero: 1 columna, padding reducido
- Tarjetas: 1 columna
- Navegación: oculta (se accede por otro medio)
- Mapa: sidebar debajo, max-height reducido
- Footer: 1 columna
- Hilo: panel flotante con border-radius reducido
- Sellos del pasaporte: 2 columnas

### MÓVIL PEQUEÑO (<600px)

**Cambios adicionales:**
- Login: 1 columna (oculta arte lateral)
- Hilo: inset reducido, avatares más pequeños
- Mapa: filtros en scroll horizontal
- Timeline: items más compactos

### MUY PEQUEÑO (<400px)

**Cambios:**
- Grid de Hilo: 2 columnas en vez de 3
- Todo se comprime pero mantiene legibilidad

### REGLAS RESPONSIVE

1. **Nunca ocultar contenido importante** — Si algo es vital, siempre debe ser accesible.
2. **Las animaciones se mantienen** — El territorio sigue vivo en mobile.
3. **El header se simplifica pero no desaparece** — Siempre hay navegación.
4. **Los sellos se adaptan** — De 3 a 2 columnas, pero nunca a 1.
5. **El mapa se apila** — Mapa arriba, sidebar debajo. Nunca al revés.

---

# PARTE 2 — ESENCIA DOCUMENTAL Y CONCEPTUAL

---

## 1. METÁFORA CENTRAL — TEJER

**TEJIDO** no es solo un nombre. Es una declaración de intención.

### QUÉ SIGNIFICA TEJER

Tejer es el acto de transformar hilos sueltos en algo con estructura, propósito y belleza. Cada hilo por sí solo es débil. Juntos, forman algo que puede cubrir, proteger, abrigar, contar historias.

### CÓMO SE RELACIONA CON CAUCASIA

Caucasia y el Bajo Cauca son un tejido de:

- **Personas** que comparten ríos, caminos y tradiciones
- **Municipios** que parecen separados pero están conectados por el río Cauca
- **Historias** que se transmiten de generación en generación
- **Iniciativas** que nacen en un pueblo y llegan a otro
- **Oportunidades** que fluyen como el agua

### CÓMO CADA USUARIO SE CONVIERTE EN PARTE DEL TEJIDO

Cada vez que un usuario:
- **Explora** un contenido → Agrega un hilo al tejido
- **Guarda** una publicación → Ancla un hilo
- **Comparte** algo → Teje un hilo con otros
- **Desbloquea un sello** → Completa una zona del tejido
- **Envía una sugerencia** → Proporciona un hilo nuevo
- **Se registra** → Se convierte en un punto del tejido

El usuario no es un espectador del tejido: es parte de él.

---

## 2. TONO DE VOZ

### CÓMO HABLA TEJIDO

TEJIDO habla como **alguien que acaba de descubrir algo bonito en su territorio y quiere contártelo**. No es un periodista. No es un funcionario. No es un vendedor. Es un vecino curioso que conoce los secretos del barrio.

### CARACTERÍSTICAS DEL TONO

| Cualidad | Significado |
|----------|-------------|
| **Cercano** | Habla como alguien que te conoce, no como una institución |
| **Humano** | Tiene emociones, no solo información |
| **Curioso** | Quiere descubrir cosas nuevas, no solo reportar |
| **Optimista** | Cree en el territorio, no en los problemas |
| **Orgulloso** | Ama su Bajo Cauca, no lo disculpa |
| **Joven** | Tiene energía, pero no fuerza artificialmente |

### PALABRAS QUE UTILIZA

- Descubrir
- Explorar
- Tejer
- Conectar
- Territorio
- Comunidad
- Iniciativa
- Oportunidad
- Historia
- Talento
- Río
- Camino
- Encontrar
- Participar
- Construir
- Sentir

### PALABRAS QUE EVITA

- "Usuarios" → Dice "personas" o "comunidad"
- "Contenido" → Dice "historias", "eventos", "iniciativas"
- "Plataforma" → Dice "TEJIDO" o "este espacio"
- " Engagement" → Dice "participación"
- "Growth" → Dice "crecimiento" o "movimiento"
- "Data" → Dice "información" o "conocimiento"
- "Feature" → Dice "herramienta" o "posibilidad"
- "Actually" → Nunca. TEJIDO no corrige: invita.

### FRASES MODELO

**Botones:**
- "Explorar Territorio"
- "Descubrir más"
- "Quiero Participar"
- "Comenzar Ahora"
- "Donar a Tejido"
- "Colaborar"
- "Ver Mapa"

**Títulos:**
- "Donde el río *cuenta* historias"
- "Tus *sellos* del Bajo Cauca"
- "El hilo del tiempo"
- "Voces que llevan el río dentro."
- "Abre una puerta"
- "¿Listo para *tejer* historia?"

**Mensajes de bienvenida:**
- "¡Buenos días! Soy Hilo. ¿Te ayudo a descubrir Caucasia?"
- "Bienvenido a TEJIDO. Tu territorio te espera."
- "Vuelve a *conectar.*"

**Mensajes de éxito:**
- "¡Genial! Compartir es tejer comunidad. +10 puntos para ti."
- "¡Buena elección! Lo guardo en tu hilo personal."
- "Has explorado los 6 municipios. Tu conocimiento del territorio es completo."

**Mensajes de error:**
- "No encontré nada con eso. Prueba con otro nombre, evento o lugar del Bajo Cauca."
- "No fue posible iniciar sesión" (no "Error de autenticación")

**Estados vacíos:**
- "Pronto encontrarás nuevos eventos."
- "Pronto conocerás nuevos talentos."
- "Pronto encontrarás nuevas oportunidades."
- "Aún no has guardado contenido. Explora las publicaciones y guarda las que quieras consultar después."

**Invitaciones:**
- "Planes para encontrarnos, aprender y celebrar lo nuestro."
- "Convocatorias, proyectos y espacios para participar en el territorio."
- "Conoce a artistas, portadores de tradición, líderes y creadores de Caucasia."

### FRASES PROHIBIDAS

- "Error 404" → Dice: "Esta pantalla todavía se está tejiendo."
- "No hay datos" → Dice: "Pronto encontrarás..."
- "Regístrate aquí" → Dice: "Quiero Participar"
- "Política de privacidad" → Dice: "Cómo cuidamos tu información"
- "Términos y condiciones" → Dice: "Nuestras reglas del juego"
- "Contáctanos" → Dice: "Escríbenos"
- "Footer" → Dice: "El final del recorrido"

---

## 3. PERSONALIDAD DE HILO

### QUIÉN ES HILO

Hilo es el guía virtual de TEJIDO. No es un botón. No es un chatbot genérico. Es un personaje que representa el espíritu de conexión de TEJIDO.

**Edad emocional:** Como un joven de 20-25 años que conoce bien su territorio pero sigue explorándolo. Tiene la energía de quien descubre y la sabiduría de quien ya ha recorrido caminos.

**Qué representa:** La curiosidad territorial. Esa persona que siempre te dice "¿Sabías que en el Bagre hay un artista increíble?" Hilo es el hype-man del Bajo Cauca.

### CÓMO HABLA

- **Saluda según la hora:** "¡Buenos días! Soy Hilo." / "¡Buenas tardes! Soy Hilo." / "¡Buenas noches! Soy Hilo."
- **Celebra cuando el usuario hace algo bien:** "¡Genial! Compartir es tejer comunidad."
- **Se sorprende al descubrir:** "¡Encontré algo! [título] — [ubicación]"
- **Se pone a pensar cuando no encuentra:** "No encontré nada con eso. Prueba con otro nombre."
- **Acompaña en la inactividad:** "¿Sigues ahí? Puedo contarte algo del Bajo Cauca."
- **Se despide con calidez:** "Aquí estaré cuando me necesites."

### NIVEL DE HUMOR

Moderado. Hilo no es un comediante. Tiene picardía territorial: hace comentarios sobre el Bajo Cauca que son ingeniosos pero no insultantes. Nunca usa humor para cubrir errores.

### QUÉ TAN PROTAGONISTA ES

**Moderadamente protagonista.** Hilo aparece en la esquina inferior derecha, flotando. No invade el contenido. No cubre el header. No bloquea la lectura. Aparece cuando se le necesita y se calla cuando no.

**Regla de oro:** Hilo acompaña. No dirige.

### POSES DE HILO

| Pose | Emoji | Cuándo se usa |
|------|-------|---------------|
| saluda | 👥 | Saludo inicial, navegación a talento |
| senala | 📍 | Señalando algo, navegación a mapa |
| lee | 📖 | Leyendo contenido, navegación a guardados |
| piensa | ⚙️ | Pensando, ajustes, búsqueda sin resultados |
| explica | 📚 | Explicando, buzón de sugerencias |
| celebra | 📢 | Celebrando, feedback, oportunidades |
| sorprendido | — | Al encontrar algo (búsqueda exitosa) |
| descubre | 🔍 | Descubriendo algo nuevo |
| teje | 🌐 | Tejiendo/construyendo, red social |

### FRASES DE HILO

**Reactivas (compartir):**
- "¡Genial! Compartir es tejer comunidad. +10 puntos para ti."
- "¡Eso! Cada share une más al Bajo Cauca."
- "Compartido. La gente se entera gracias a ti."

**Reactivas (guardar):**
- "¡Buena elección! Lo guardo en tu hilo personal."
- "Guardado. Ese contenido es especial."
- "Added a tu colección. No se te va a olvidar."

**Reactivas (explorar):**
- "Descubriendo el territorio... me encanta."
- "Cada rincón de Caucasia tiene algo que contar."
- "Sigues el río de las historias."

**Reactivas (idle):**
- "¿Sigues ahí? Puedo contarte algo del Bajo Cauca."
- "Hey, no te vayas sin explorar todo."
- "Hay mucho por descubrir aún."

**Acciones:**
- "Te traje hasta aquí. Sigue explorando." (al navegar)
- "Este es el buzón de atención de TEJIDO. Escribe una sugerencia." (feedback)
- "Escribe lo que buscas en el campo de abajo y lo encontraré entre los hilos de Caucasia." (búsqueda)
- "Los ajustes de usuario estarán disponibles en tu perfil." (ajustes)
- "La red social de TEJIDO está en construcción. Pronto podrás conectar con la comunidad." (red)

---

## 4. NARRATIVA DEL TERRITORIO

### CÓMO TEJIDO PRESENTA CAUCASIA

TEJIDO no hace fichas geográficas. No dice "Población: X. Fundación: X. Extensión: X." TEJIDO cuenta **qué se siente estar allí**.

### CADA MUNICIPIO COMO CAPÍTULO

| Municipio | Título | Esencia | Descripción narrativa |
|-----------|--------|---------|----------------------|
| **Caucasia** | Capital del Bajo Cauca | Confluencia, comercio, centro | Centro comercial y administrativo de la región, ubicada en la confluencia de los ríos Cauca y Nechí. |
| **Cáceres** | Historia y Tradición | Colonial, minería, historia | Fundado en 1576. Uno de los pueblos más antiguos de Antioquia con rica historia minera y tradición colonial. |
| **Tarazá** | Tierra de Café | Café, agricultura, campesinos | Tierra de cafetaleros y tradición campesina. Conocida por su calidez humana y los paisajes verdes. |
| **Nechí** | Río y Tradición Minera | Minería, afrocolombiano, río | Fundado en 1636 como campamento minero. Hogar de comunidades afrocolombianas con tradiciones ancestrales. |
| **El Bagre** | Cuna de Artistas | Oro, folklore, música | Primer productor de oro de Antioquia. Tierra de artistas y músicos que enamoran con su folklore. |
| **Zaragoza** | Municipio Fundado | Fundación, naturaleza, minería | Fundado en 1581. Pueblo con historia minera milenaria y paisajes naturales impresionantes. |

### TESTIMONIOS DEL TERRITORIO

Estas frases rotan en el hero y representan la voz del Bajo Cauca:

- "El río Cauca no solo lleva agua, lleva nuestra historia." — María, Caucasia
- "Aquí nacen los cantos que hacen latir al Bajo Cauca." — Carlos, El Bagre
- "Cada piedra del río guarda un secreto por contar." — Ana, Zaragoza
- "Nuestra tierra es fértil en talento y en esperanza." — Luis, Tarazá

---

## 5. FLUJO EMOCIONAL DEL USUARIO

### CUANDO ENTRA

**Emoción:** Curiosidad.

El hero le dice: "Donde el río *cuenta* historias." No le dice qué hacer. Le dice qué puede descubrir. El testimonio rotativo le muestra una voz real del territorio. La serpiente/río se mueve. El sol brilla. Hay algo vivo aquí.

### CUANDO EXPLORA

**Emoción:** Sensación de que hay más de lo que imaginaba.

Las tarjetas de publicación muestran historias, eventos, oportunidades. Cada una tiene un color que representa su tipo. El usuario siente que el territorio es más grande de lo que pensaba.

### CUANDO DESCUBRE ALGO

**Emoción:** Sorpresa.

Hilo aparece con confeti: "¡Encontré algo!" El pasaporte se ilumina con un nuevo sello. El usuario siente que acaba de encontrar un tesoro escondido.

### CUANDO ENCUUENTRA UNA INICIATIVA

**Emoción:** Conexión.

El usuario lee una historia de alguien de su territorio. Siente que no está solo. Que hay personas haciendo cosas interesantes cerca de él.

### CUANDO PARTICIPA

**Emoción:** Pertenencia.

Cuando el usuario comparte, guarda, o envía una sugerencia, Hilo le dice: "¡Genial! Compartir es tejer comunidad." El usuario siente que está contribuyendo a algo mayor.

### CUANDO COMPLETA UN SELLO O PASAPORTE

**Emoción:** Orgullo de haber recorrido el territorio.

El badge "Ciudadano del Bajo Cauca" brilla con animación dorada. El usuario ha completado un viaje. Siente que conoce su territorio mejor que antes.

---

## 6. PRINCIPIOS DE DISEÑO

### 1. NADA DEBE SENTIRSE INSTITUCIONAL SIN NECESIDAD

TEJIDO no es una entidad gubernamental. No es una ONG. No es una empresa. Es una comunidad digital. Si algo se siente como un trámite, hay que reescribirlo.

### 2. NADA DEBE EXISTIR ÚNICAMENTE COMO DECORACIÓN

Cada elemento visual tiene un propósito. Si un círculo no conecta nada, eliminarlo. Si una animación no provoca una emoción, eliminarla.

### 3. LO HUMANO ESTÁ POR ENCIMA DE LO TÉCNICO

Si una animación se ve genial pero confunde al usuario, eliminar la animación. Si un diseño es perfecto pero no se siente cercano, romper el diseño.

### 4. LA CURIOSIDAD ES MÁS IMPORTANTE QUE LA SATURACIÓN

TEJIDO nunca muestra todo de una vez. Muestra suficiente para generar curiosidad y deja que el usuario descubra más.

### 5. EL TERRITORIO DEBE SENTIRSE VIVO

El río se mueve. El sol brilla. Los municipios aparecen uno a uno. Hilo flota. El pasaporte se llena. Todo respira.

### 6. CADA ELEMENTO DEBE CONECTAR CON ALGO

La serpiente conecta con el río. Los sellos conectan con los municipios. Los colores conectan con el territorio. Los testimonios conectan con las personas. Nada existe en el vacío.

### 7. LA TECNOLOGÍA DEBE DESAPARECER DETRÁS DE LA EXPERIENCIA

El usuario no debe pensar "qué bonito framework". Debe pensar "qué bonito territorio".

### 8. TEJIDO NO INFORMA ÚNICAMENTE: INVITA A DESCUBRIR

La diferencia entre TEJIDO y un periódico es que TEJIDO no te dice qué pasó. Te invita a descubrir qué está pasando y qué te estás perdiendo.

---

## 7. CONVENCIONES DE ESCRITURA

### TÍTULOS

**Son cortos, poéticos y directos.** Usan la cursiva de Playfair Display para resaltar una palabra con carga emocional.

- "Donde el río *cuenta* historias"
- "Tus *sellos* del Bajo Cauca"
- "El hilo del *tiempo*"
- "¿Listo para *tejer* historia?"
- "Voces que llevan el río *dentro*."

**Nunca son:**
- "Bienvenido al sistema de gestión de eventos del Bajo Cauca"
- "Panel de control de publicaciones"
- "Registro de usuarios"

### DESCRIPCIONES

**Son breves (1-2 líneas), poéticas y conmovedoras.** No informan: invitan.

- "Descubre el alma del Bajo Cauca: historias que nacen del río, encuentros que tejen comunidad."
- "Planes para encontrarnos, aprender y celebrar lo nuestro."
- "Conoce a artistas, portadores de tradición, líderes y creadores de Caucasia."

### BOTONES

**Invitan, no ordenan.** Usan verbos en infinitivo o primera persona.

- "Explorar Territorio" (no "Ver eventos")
- "Quiero Participar" (no "Registrarse")
- "Comenzar Ahora" (no "Empezar")
- "Donar a Tejido" (no "Hacer donación")

### ERRORES

**No culpabilizan. Ayudan.** El error es una oportunidad de empatía.

- "Esta pantalla todavía se está tejiendo." (404)
- "No encontré nada con eso. Prueba con otro nombre." (búsqueda)
- "No fue posible iniciar sesión" (auth)

### ÉXITOS

**Celebran.** No son fríos.

- "¡Genial! Compartir es tejer comunidad. +10 puntos para ti."
- "Guardado. Ese contenido es especial."
- "Has explorado los 6 municipios. Tu conocimiento del territorio es completo."

### ESTADOS VACÍOS

**Son oportunidades de descubrimiento, no errores.**

- "Pronto encontrarás nuevos eventos." (no "No hay eventos")
- "Pronto conocerás nuevos talentos." (no "No hay talentos")
- "Aún no has guardado contenido. Explora las publicaciones y guarda las que quieras consultar después." (no "No hay guardados")

---

## 8. PROMESA AL USUARIO

### QUÉ LE PROMETE TEJIDO

**TEJIDO te promete que vas a descubrir cosas de tu territorio que no sabías que existían.**

No te promete eventos. No te promete noticias. No te promete entretenimiento.

Te promete **descubrimiento territorial**. La sensación de que tu Bajo Cauca es más grande, más rico, más vivo de lo que imaginabas.

### QUÉ TEJIDO ES

- Un espejo del Bajo Cauca que te muestra lo que normalmente pasa desapercibido.
- Un mapa de historias, eventos, talentos y oportunidades que existen cerca de ti.
- Un compañero de descubrimiento que te acompañó mientras recorres el territorio.
- Un tejido de conexiones entre personas, iniciativas y lugares.

### QUÉ TEJIDO NO ES

- **No es una cartelera** — No solo lista eventos: cuenta historias.
- **No es Facebook** — No busca likes: busca pertenencia.
- **No es Instagram** — No busca estética vacía: busca profundidad territorial.
- **No es un periódico** — No solo informa: invita a descubrir.
- **No es una app genérica** — Tiene alma del Bajo Cauca.

### LA DIFERENCIA

| Otros medios | TEJIDO |
|--------------|--------|
| ¿Qué pasó? | ¿Qué está pasando? |
| Noticias del día | Historias del territorio |
| Eventos programados | Oportunidades de participación |
| Contenido para consumir | Experiencias para vivir |
| Seguidores | Comunidad |
| Algoritmo | Hilo (guía humano) |
| Viralidad | Pertenencia |

---

# REGLA FINAL

> Todo lo que exista en TEJIDO debe poder pasarse por este filtro:
>
> **"¿Esto hace que alguien sienta que su Bajo Cauca es más vivo, más conectado, más digno de ser descubierto?"**
>
> Si la respuesta es sí, adelante.
> Si la respuesta es no, cuestionarlo antes de implementarlo.

---

*Manual creado como referencia permanente para futuros diseñadores, desarrolladores, creadores de contenido y sistemas de inteligencia artificial que trabajen en TEJIDO.*

*TEJIDO nunca pierde su esencia.*
