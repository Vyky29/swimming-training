# clubSENsational — Visual system for Atlas (M1–M4)

Regenerar las infografías de Training I (módulos 1–4) con **la misma idea** que la imagen actual, pero usando **un único template** coherente en todas.

**Fuera de alcance:** M5 b2c2 / b2c3 / flashcards (producto PixtoLearn — no tocar).

---

## 1. Anatomía fija del template (todas las imágenes)

Usa **exactamente** esta estructura en cada infografía:

```
???????????????????????????????????????????????????????????
?  clubSENsational          Training I · Module X         ?  ? barra superior (8% altura)
???????????????????????????????????????????????????????????
?                                                         ?
?              TÍTULO PRINCIPAL (1 línea)                 ?  ? mismo tamaño siempre
?         ??????? línea azul 40px ???????                 ?
?           Subtítulo opcional (1 línea, gris)            ?
?                                                         ?
?   ???????????   ???????????   ???????????              ?
?   ?  icono  ?   ?  icono  ?   ?  icono  ?              ?  ? 3 columnas (plantilla A)
?   ?  Label  ?   ?  Label  ?   ?  Label  ?              ?     o 2 columnas (plantilla B)
?   ?  texto  ?   ?  texto  ?   ?  texto  ?              ?     o pasos 1-2-3-4 (plantilla C)
?   ???????????   ???????????   ???????????              ?
?                                                         ?
?  ??????????????? pool / agua (franja inferior) ???????  ?  ? misma franja en todas
???????????????????????????????????????????????????????????
```

### Colores (fijos)

| Uso | Hex |
|-----|-----|
| Fondo | `#F8FBFD` |
| Título | `#163247` |
| Acento / iconos / línea | `#2D84B3` |
| Texto secundario | `#5A6B7A` |
| Tarjetas bloque | `#FFFFFF` borde `#E2ECF2` |
| Agua (franja inferior) | `#89B5C1` ? `#2D84B3` gradiente suave |

### Tipografía (misma en todas)

- **Título principal:** sans-serif bold (tipo Inter / Helvetica), ~28–32 pt equivalente, MAYÚSCULAS o Title Case según el concepto original
- **Labels de bloque:** bold 14–16 pt, `#163247`
- **Texto de bloque:** regular 12–14 pt, `#5A6B7A`, máximo 2 líneas por bloque

### Ilustración (misma en todas)

- Estilo **flat vector**, sin fotorrealismo, sin 3D
- **Mismos personajes:** instructora con camiseta azul + niño/a en bañador (mismo diseño en todas las piezas)
- Iconos simples en círculo azul claro `#E8F4FB` con trazo `#2D84B3`
- Proporción recomendada: **16:9**, mínimo **1400×788 px**, PNG

### Tres variantes de cuerpo (elige una por imagen)

| ID | Cuándo | Layout |
|----|--------|--------|
| **A — 3 bloques** | Conceptos con 3 ideas (fuerzas, sentidos, engagement…) | 3 columnas iguales |
| **B — 2 columnas** | Comparativas (land vs water, calm vs overloaded, hypo vs hyper) | 2 columnas + divisor central |
| **C — Secuencia** | Procesos (pasos, framework, prevención) | 3–4 pasos numerados en fila |

El **header, título, línea azul y franja pool** son idénticos en A, B y C.

---

## 2. Flujo en ChatGPT Atlas (paso a paso)

### Fase 0 — Imagen “golden master” (solo una vez)

1. Abre **ChatGPT** con generación de imagen (Atlas o chat con GPT-4o / imagen).
2. Sube la imagen actual de **M1 · b1c1** (Water as an Active Environment) o genera desde cero con el **Master prompt** de abajo.
3. Ajusta hasta que el **marco** (barra, título, línea, tarjetas, pool) sea perfecto.
4. Guarda esa PNG como **`golden-master-clubsensational.png`** — la adjuntarás en **todas** las siguientes generaciones.

### Fase 1 — Por cada imagen del inventario

Para cada fila de `clubsensational-image-inventory.json`:

1. **Adjunta 2 imágenes:**
   - `golden-master-clubsensational.png` (template de referencia)
   - La imagen **actual** de clubSENsational (URL del inventario o captura)
2. Pega el **Prompt por imagen** (sección 3) rellenando título, variant y bloques.
3. Pide: *“Keep the exact same template layout as the golden master. Only change the title text and the content blocks to match the old image’s ideas.”*
4. Revisa: mismo header, mismos márgenes, mismos tamaños de título.
5. Exporta PNG ? nombre del inventario ? carpeta `common/assets/images/training-i/{m1|m2|m3|m4}/`.
6. Marca `"status": "done"` en el JSON cuando esté aprobada.

### Fase 2 — Conectar en el portal

Cuando tengas un módulo completo, sustituir en el HTML:

```html
<!-- Antes -->
<img src="https://www.clubsensational.org/wp-content/uploads/2026/05/ChatGPT-Image-....png" ... />

<!-- Después -->
<img src="/assets/images/training-i/m1/m1-b1c1-water-active-environment.png" alt="..." />
```

*(El equipo de desarrollo puede hacer el swap en lote cuando entregues la carpeta de PNGs.)*

---

## 3. Master prompt (copiar en Atlas)

```
Create a professional flat-vector infographic for clubSENsational swimming instructor training.

STRICT TEMPLATE — match the attached golden master reference exactly:
- Top bar: "clubSENsational" left, "Training I · Module [N]" right, light blue-grey background
- Main title: [TITLE] — bold dark navy #163247, centered, same font size as reference
- Blue divider line centered under title (#2D84B3)
- Body layout: [VARIANT A / B / C — see spec]
- Bottom: same pool water wave strip as reference (#89B5C1 to #2D84B3)
- Background #F8FBFD, white rounded cards with soft shadow for content blocks
- Same instructor + child flat characters as reference (consistent design)
- No photorealism, no 3D, no stock photo look

CONTENT (from original image — preserve the ideas, rewrite labels clearly):
[BULLET LIST OF BLOCKS]

Output: 16:9 landscape, 1400px wide minimum, clean educational infographic.
```

---

## 4. Prompt por imagen (plantilla)

```
Attached:
1) golden-master-clubsensational.png — TEMPLATE (layout must stay identical)
2) [old-image.png] — CONTENT REFERENCE (keep the same ideas/topics)

Module: M1
Concept ID: b1c1
Variant: A (3 blocks)

TITLE: Water as an Active Environment

BLOCKS:
1. Moves — Water changes direction, speed, and effort
2. Balances — The body must constantly adjust to remain controlled
3. Responds — Even when still, the body is actively reacting to the environment

Regenerate using the golden master template. Same header, title style, card shapes, and pool footer. Only update title text and the three block labels/text to match the content above.
```

---

## 5. Orden de producción recomendado

1. Generar **golden master** con M1 b1c1  
2. **M1** completo (12) — validar coherencia  
3. **M3** (16)  
4. **M2** (14) — muchas comparten variant B (estados emocionales)  
5. **M4** (~10 con imagen real; el resto son placeholders CSS)

---

## 6. Checklist de calidad (antes de dar por buena)

- [ ] Barra superior idéntica a golden master  
- [ ] Título mismo tamaño y peso que otras del mismo módulo  
- [ ] Línea azul bajo título presente  
- [ ] Máximo 2 líneas de texto por bloque  
- [ ] Personajes reconocibles como los de la golden master  
- [ ] Franja pool inferior presente  
- [ ] Sin texto ilegible ni demasiado pequeño  
- [ ] PNG ? 1400 px ancho  

---

## 7. Inventario

Lista completa de URLs actuales, títulos, variant sugerida y nombre de archivo destino:

? Ver **`clubsensational-image-inventory.json`** en esta misma carpeta.

---

## 8. Nota M5 bloque 1

Las 3 imágenes de M5 bloque 1 (*Why Visual Learning Works*, etc.) también son ChatGPT/clubSENsational. Si más adelante quieres unificarlas, usa el **mismo golden master** pero cambia la etiqueta de barra a `Training I · Module 5`.
