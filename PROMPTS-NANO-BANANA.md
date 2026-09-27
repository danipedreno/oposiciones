# Prompts para Nano Banana (Gemini)

## Cómo usarlos

1. Abre un chat nuevo en Gemini con Nano Banana y **adjunta tu imagen de referencia** en el primer mensaje.
2. Pega primero el **prompt de personaje base** (abajo). Así fijas el estilo.
3. En el **mismo chat**, pide cada ilustración pegando `ESTILO + escena`. Si abres un chat nuevo, vuelve a adjuntar la referencia.
4. Formato: **1:1** para todas, salvo las marcadas **16:9**.
5. Descarga en PNG y guárdalo como `public/illustrations/<nombre>.png`.

El fondo pedido es el crema de la app (`#FDFAF7`), así que no hace falta quitarlo.

---

## Bloque de ESTILO (pegar delante de cada escena)

```
Hand-drawn black ink illustration in the same style as the attached reference: quirky, playful characters with simple geometric bodies (tubes, cylinders, blocky heads), tiny dot or line eyes, minimal facial features, long thin limbs, some areas filled with flat solid black, striped and dotted patterns on clothing, slightly irregular brush-pen lines with a subtle grainy texture. Strictly black ink only, no gray shading, no gradients, no color. Plain flat off-white background #FDFAF7, no frame, no text, no letters, no logos. Single centered composition with generous empty margin around the subject.
```

## Personaje base (primer mensaje, opcional pero recomendado)

```
[ESTILO] Create a character sheet of one recurring character: a Spanish civil-service exam candidate studying to become a prison officer. Show the same character in 3 poses side by side (standing, walking with a folder, sitting reading). Keep proportions simple and memorable so it can be reused in later images.
```

---

## Inicio

**bienvenida** · 16:9
```
[ESTILO] A row of four different quirky exam candidates walking left to right like a parade, carrying folders, thick law books and a backpack; one of them waves hello. Wide horizontal composition.
```

**racha-activa** · 1:1
```
[ESTILO] One proud character standing tall, holding up a big lit candle with a bold flame above their head, chest out, triumphant.
```

**racha-pendiente** · 1:1
```
[ESTILO] One sleepy character yawning next to a candle with a tiny weak flame, glancing at a wall clock.
```

**racha-apagada** · 1:1
```
[ESTILO] One character looking down at a blown-out candle with a curl of smoke rising from the wick, slightly disappointed but calm.
```

**instalar** · 1:1
```
[ESTILO] One character hugging and carrying a giant smartphone almost as tall as themselves.
```

## Rangos

**rango-1-novato** · 1:1
```
[ESTILO] A beginner candidate with an oversized backpack, balancing a tower of books taller than themselves, a bit wobbly but determined.
```

**rango-2-practicas** · 1:1
```
[ESTILO] A trainee prison officer wearing a uniform that is too big for them (long sleeves, loose cap), proudly holding up a huge key ring with many keys.
```

**rango-3-jefe-servicio** · 1:1
```
[ESTILO] A confident shift supervisor holding a clipboard in one hand and a walkie-talkie in the other, commanding pose.
```

**rango-4-jefe-centro** · 1:1
```
[ESTILO] A head of prison center sitting behind a desk with a rubber stamp, an old telephone and tall stacks of case folders, looking busy and in control.
```

**rango-5-director** · 1:1
```
[ESTILO] A prison director standing firm and tall, holding a flag on a pole, calm and proud, like a monument.
```

**ascenso** · 1:1
```
[ESTILO] A character receiving a rank insignia chevron pinned onto their shoulder by a hand coming from the side, small sparkle marks around, happy expression.
```

## Test y resultado

**simulacro** · 16:9
```
[ESTILO] A candidate sitting at a school exam desk holding a pencil over an answer sheet, a big round clock on the wall behind them, focused. Wide horizontal composition.
```

**entregar** · 1:1
```
[ESTILO] A character handing a folder over a counter, arm stretched, relieved expression.
```

**abandonar** · 1:1
```
[ESTILO] A character tiptoeing out through a half-open door, looking back over their shoulder sneakily.
```

**tiempo-agotado** · 1:1
```
[ESTILO] A character running away in panic from a giant ringing alarm clock with motion lines.
```

**resultado-alto** · 1:1
```
[ESTILO] A character jumping for joy with arms up, exam papers flying in the air around them.
```

**resultado-medio** · 1:1
```
[ESTILO] A character balancing a tall wobbly pile of papers on one hand, shrugging with the other, "almost there" expression.
```

**resultado-bajo** · 1:1
```
[ESTILO] A character sitting slumped on the floor next to a pile of papers, a small rain cloud above their head, sad but gentle.
```

## Apuntes

**apuntes-vacio** · 16:9
```
[ESTILO] A character walking carefully while balancing a tall tower of notes, documents and books on their head (like the character with objects stacked on the head in the reference). Wide horizontal composition.
```

**bloque-penitenciario** · 1:1
```
[ESTILO] A character holding a big ring of old keys next to a heavy cell door with a small peephole window.
```

**bloque-penal** · 1:1
```
[ESTILO] A character holding up a large scale of justice in one hand and a thick penal code book under the other arm.
```

**bloque-funcion-publica** · 1:1
```
[ESTILO] A civil servant behind a service window counter, raising a big rubber stamp about to stamp a document.
```

**procesando** · 1:1
```
[ESTILO] A thoughtful character with a hand on their chin and a thought bubble above their head containing small documents and question marks shapes (no letters).
```

**test-listo** · 1:1
```
[ESTILO] A character proudly holding up an exam sheet with a big check mark drawn on it.
```

## Logros

**medalla-primer-turno** · 1:1
```
[ESTILO] A character turning a giant key in a huge lock on a door, first day on the job, excited.
```

**medalla-celda-castigo** · 1:1
```
[ESTILO] A character peeking out between prison cell bars with an embarrassed "oops" face, hands holding the bars.
```

**medalla-imbatible** · 1:1
```
[ESTILO] A character in a superhero pose with a cape flowing and a round shield on one arm, invincible and proud.
```

**medalla-estudioso-nocturno** · 1:1
```
[ESTILO] A character reading a book under a desk lamp at night, a crescent moon and a small owl visible through the window behind.
```

**reiniciar** · 1:1
```
[ESTILO] A character sweeping a messy pile of papers with a broom, clearing the floor.
```

---

## Si algo sale mal

- **Aparece texto o letras**: añade `Absolutely no text or letters anywhere.`
- **Mete grises o color**: añade `Pure black and off-white only, 2 colors total.`
- **Cambia de estilo entre imágenes**: repite `Match exactly the line style and character design of the reference image.` y vuelve a adjuntar la referencia.
- **Personaje pegado al borde**: añade `Leave at least 10% empty margin on all sides.`
