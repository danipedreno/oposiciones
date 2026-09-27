# Prompts para Nano Banana (Gemini)

Estilo elegido: line art editorial en tinta negra, el de la hoja que generó Nano Banana.
Guarda esa hoja como **referencia** (por ejemplo `hoja-referencia.webp`) y adjúntala siempre.

## Reglas para que salgan utilizables

1. **Una ilustración por mensaje.** Si pegas varias escenas juntas, devuelve otra hoja.
2. Adjunta la hoja de referencia en el primer mensaje de cada chat.
3. Elige el formato **antes** de generar: **1:1** para todas, salvo las marcadas **16:9**.
4. Cada prompt = **bloque ESTILO + escena**.
5. Descarga en PNG y guárdala como `illustrations-src/<nombre>.png`.
6. Ejecuta `npm run trace`: la vectoriza a `public/illustrations/<nombre>.svg` (tinta `#191919`, fondo transparente) y la app la muestra sola.
   Para una sola: `npm run trace <nombre>`.

---

## Bloque ESTILO (pegar delante de cada escena)

```
Clean black ink line illustration in the same style as the attached reference sheet: modern editorial line art, simplified but realistic human proportions, people in office clothes or prison-officer uniforms, confident even line weight, solid flat black fills on hair, ties, trousers and shoes, minimal facial features with expressive poses. Strictly black ink only, no gray, no color, no hatching-heavy shading. Plain flat off-white background #FDFAF7. Absolutely no text, letters or numbers anywhere, including on books, signs and papers. One single scene only, centered, with at least 10% empty margin on all sides.
```

---

## A · Redibujar desde la hoja (15)

Estas ya existen en la hoja; así salen a alta resolución con el mismo dibujo.
Prompt: `ESTILO` + `Redraw only the [figura] from the attached reference sheet as a single high-resolution image. Keep the same pose and design.`

| Archivo | Formato | [figura] |
|---|---|---|
| `bienvenida` | 16:9 | group of five people walking left to right carrying folders (second row, left). Wide horizontal composition |
| `racha-activa` | 1:1 | smiling man in a tie raising a burning torch with one fist up |
| `racha-pendiente` | 1:1 | man yawning next to a small candle with a tiny flame |
| `racha-apagada` | 1:1 | sad man sitting next to a blown-out candle with a curl of smoke |
| `instalar` | 1:1 | man pushing a giant smartphone on a hand truck |
| `apuntes-vacio` | 16:9 | woman in a school uniform carrying a tall stack of books on her head. Wide horizontal composition, figure centered |
| `rango-2-practicas` | 1:1 | person holding a giant ring of keys |
| `entregar` | 1:1 | man handing a folder over a counter to a woman behind it |
| `tiempo-agotado` | 1:1 | man running away in panic from a ringing alarm clock |
| `resultado-alto` | 1:1 | man jumping for joy with papers flying around him |
| `resultado-bajo` | 1:1 | boy sitting cross-legged among scattered papers under a small rain cloud |
| `medalla-celda-castigo` | 1:1 | man peeking out from behind prison cell bars |
| `bloque-penitenciario` | 1:1 | heavy cell door with a barred peephole window, with a prison officer holding keys standing next to it |
| `bloque-funcion-publica` | 1:1 | hand holding a rubber stamp, redrawn as a full civil servant behind a service window about to stamp a document |
| `simulacro` | 16:9 | older man at a desk with a large wall clock behind him, redrawn as a candidate writing an exam at the desk. Wide horizontal composition |

---

## B · Nuevas (14)

Prompt: `ESTILO` + la escena.

### Rangos

**rango-1-novato** · 1:1
```
A young beginner candidate with an oversized backpack, hugging a pile of thick law books, determined but a bit overwhelmed.
```

**rango-3-jefe-servicio** · 1:1
```
A prison shift supervisor in uniform holding a clipboard in one hand and a walkie-talkie in the other, confident commanding pose.
```

**rango-4-jefe-centro** · 1:1
```
A head of prison center in a suit sitting behind a desk with a rubber stamp, a desk telephone and tall stacks of case folders, busy but in control.
```

**rango-5-director** · 1:1
```
A prison director in a suit standing firm and tall, holding a flag on a pole, calm and proud like a monument.
```

**ascenso** · 1:1
```
An officer in uniform smiling while a hand from the side pins a rank insignia onto their shoulder, a few small sparkle marks around.
```

### Test y resultado

**abandonar** · 1:1
```
A person tiptoeing out through a half-open door, looking back over their shoulder sneakily.
```

**resultado-medio** · 1:1
```
A person balancing a tall wobbly pile of papers on one hand and shrugging with the other, "almost there" expression.
```

### Apuntes

**bloque-penal** · 1:1
```
A person holding up a large scale of justice in one hand and a thick closed book under the other arm.
```

**procesando** · 1:1
```
A thoughtful woman with her hand on her chin, a thought bubble above her head containing small blank documents and a light bulb.
```

**test-listo** · 1:1
```
A person proudly holding up an exam sheet with one big check mark drawn on it.
```

### Logros

**medalla-primer-turno** · 1:1
```
A new prison officer in uniform turning a giant key in the lock of a heavy door, first day on the job, excited.
```

**medalla-imbatible** · 1:1
```
A person in office clothes striking a superhero pose with a cape flowing behind them and a round shield on one arm.
```

**medalla-estudioso-nocturno** · 1:1
```
A person reading a book at a desk under a desk lamp at night, a crescent moon and a small owl visible through the window behind.
```

**reiniciar** · 1:1
```
A person sweeping a messy pile of papers with a broom, clearing the floor.
```

---

## Si algo sale mal

- **Aparece texto** (títulos en libros, carteles): añade `Books and papers must be completely blank.`
- **Devuelve varias escenas**: añade `Only one scene, one image, no grid, no sheet.`
- **Mete grises o color**: añade `Pure black and off-white only, 2 colors total.`
- **Se aparta del estilo**: vuelve a adjuntar la hoja y añade `Match exactly the line style of the attached reference sheet.`
- **Figura pegada al borde**: añade `Leave at least 10% empty margin on all sides.`
