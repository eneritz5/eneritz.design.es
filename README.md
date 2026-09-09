# Portfolio — Eneritz Burgoa

Sitio estático.

## Estructura

```
publicar/
├── index.html          Marcado semántico
├── css/styles.css      Estilos (custom properties + clases)
├── js/main.js          Interacciones (JS vanilla, sin librerías)
├── img/logo-mark.png   Logotipo / favicon
```

## Arquitectura del CSS

`styles.css` está numerado por secciones (ver índice al inicio del archivo).

Todos los valores repetidos viven como **custom properties** en `:root`:

| Grupo | Ejemplos |
|---|---|
| Color de marca | `--color-blue`, `--color-red`, `--color-yellow`, `--color-white`, `--color-black` |
| Color de apoyo | `--color-lavender`, `--color-blush`, `--color-mute` |
| Formas flúor | `--shape-green`, `--shape-pink`, `--shape-orange`, `--shape-cyan`, `--shape-purple` |
| Tipografía | `--font-mono`, `--font-serif`, `--text-hero`, `--text-display`, … |
| Retícula | `--grid-columns`, `--grid-gap`, `--gutter`, `--header-height` |
| Movimiento | `--ease-out-soft`, `--ease-morph`, `--duration-*` |
| Capas | `--z-shape`, `--z-nav`, `--z-header`, `--z-cursor` |

Cambiar la paleta o la escala tipográfica es editar `:root`, nada más.

### Retícula

`.section` es una rejilla de 12 columnas. `.section__inner` ocupa de la 3 a la 10,
dejando dos columnas vacías a cada lado. Por debajo de 640px pasa a ancho completo
con 16px de margen lateral.

### Nomenclatura

Clases tipo BEM: `.bloque`, `.bloque__elemento`, `.bloque--modificador`.
Los `data-*` son ganchos exclusivos de JavaScript, nunca de estilo.

## Arquitectura del JS

`main.js` es un IIFE con las constantes de configuración arriba
(`CYCLE_WORDS`, `SHAPE_STATES`, duraciones, umbrales) y una función `init*`
por comportamiento:

`initPreloader`, `initClock`, `initCycle`, `initScrollProgress`, `initReveal`,
`initCounters`, `initNavigation`, `initCursor`, `initMagnetic`,
`initProjectLabels`, `initImageFallbacks`.

Todos respetan `prefers-reduced-motion` y los efectos de puntero solo se activan
en dispositivos con `pointer: fine`.

## Accesibilidad

- Enlace de salto al contenido.
- Landmarks (`header`, `nav`, `main`, `footer`) y `aria-label` en la navegación.
- `aria-expanded` en el botón de menú; se cierra con `Escape`.
- Foco visible en todos los elementos interactivos.
- Elementos decorativos con `aria-hidden`; texto alternativo real en las imágenes.


## Nota sobre las imágenes

Las imágenes de proyecto se cargan desde el CDN de Behance. Para que el sitio no
dependa de terceros, descargarlas a `img/` y actualizar los `src`. Si alguna falla,
`initImageFallbacks` muestra la inicial del proyecto sobre el degradado de marca.
