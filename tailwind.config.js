/** Paleta inspirada en Mosby's Files: tinta, papel y cinco colores de carpeta. */
export default {
  // En táctil, :hover se queda «pegado» tras tocar: solo se aplica con ratón.
  future: { hoverOnlyWhenSupported: true },
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#191919", 2: "#232323", 3: "#2e2e2e", 4: "#3a3a3a" },
        paper: { DEFAULT: "#fdfaf7", 2: "#f1ece5", 3: "#e2dbd2" },
        mute: { DEFAULT: "#a3a5aa", paper: "#5f6166" },
        folder: {
          blue: "#1e4bd7",
          red: "#d71e1e",
          green: "#0c7866",
          purple: "#581e70",
          yellow: "#ffe927",
        },
      },
      fontFamily: {
        display: ['"Archivo Variable"', "Archivo", "Arial Narrow", "sans-serif"],
        serif: ['"Source Serif 4 Variable"', "Georgia", "serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "-apple-system", "Roboto", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "Menlo", "monospace"],
      },
      borderRadius: { folder: "6px" },
      transitionTimingFunction: {
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
    },
  },
  plugins: [],
};
