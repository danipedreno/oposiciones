# Recuento · Oposiciones IIPP

App móvil (PWA) para preparar la oposición al Cuerpo de Ayudantes de Instituciones Penitenciarias.

- **Simulacro oficial**: cuenta atrás (54 s por pregunta por defecto), 4 alternativas y corrección IIPP: `Nota = Aciertos − Errores ÷ 3`.
- **Test desde tus apuntes**: clasifica el texto por bloque (Penitenciario, Penal, Función Pública) y genera preguntas.
- **Gamificación**: racha diaria, XP con 5 rangos (de Opositor Novato a Director de Centro) y 4 medallas.
- Funciona sin conexión y guarda el progreso en el propio móvil.

## Instalar en Android

1. Abre la web publicada en **Chrome**.
2. Pulsa **Instalar** en el aviso de la pantalla de inicio, o menú ⋮ → **Instalar aplicación**.

## Desarrollo

```bash
npm install
npm run dev          # servidor local
npm run build        # compila en dist/
npm run icons        # regenera los iconos de la app
npm run illustrations  # genera con Gemini las ilustraciones que falten y las vectoriza (necesita .env)
npm run trace        # vectoriza illustrations-src/*.png → public/illustrations/*.svg
npm run illustrations-doc   # regenera ILUSTRACIONES.md
```

Cada push a `main` compila la app y la publica en la rama `gh-pages` (`.github/workflows/deploy.yml`): https://danipedreno.github.io/oposiciones/

## Estructura

- `src/lib/logic.js`: reglas (corrección, racha, rangos, medallas, generador de preguntas).
- `src/data/questions.js`: banco de preguntas semilla y apuntes de ejemplo.
- `src/lib/illustrations.js`: los huecos de ilustración. Ver [ILUSTRACIONES.md](ILUSTRACIONES.md).
- `src/screens/`: Inicio, Test, Apuntes y Logros.

Diseño: paleta y carpetas inspiradas en Mosby's Files · Iconos: Phosphor · Tipografías: Archivo, Source Serif 4, IBM Plex.
