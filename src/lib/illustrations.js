/* Registro de ilustraciones. Cada entrada es un hueco de la app.
   Coloca el archivo en public/illustrations/<name>.svg (o .png) y aparecerá solo;
   mientras falte, se muestra un marcador con el nombre del archivo.
   `npm run illustrations-doc` regenera ILUSTRACIONES.md a partir de esta lista. */
export const ILLUSTRATIONS = {
  // Inicio
  bienvenida: { ratio: "wide", screen: "Inicio", where: "Tarjeta de bienvenida mientras no hay ningún test hecho.", brief: "Grupo de 3–4 opositores caminando en fila con carpetas, códigos y una mochila; uno saluda." },
  "racha-activa": { ratio: "square", screen: "Inicio", where: "Tarjeta de racha cuando ya has estudiado hoy.", brief: "Personaje orgulloso sosteniendo en alto una vela o antorcha encendida." },
  "racha-pendiente": { ratio: "square", screen: "Inicio", where: "Tarjeta de racha cuando estudiaste ayer pero aún no hoy.", brief: "Personaje bostezando junto a una vela con la llama pequeña, mirando un reloj." },
  "racha-apagada": { ratio: "square", screen: "Inicio", where: "Tarjeta de racha sin racha o con la racha rota.", brief: "Personaje soplando o mirando una vela apagada con una voluta de humo." },
  instalar: { ratio: "square", screen: "Inicio", where: "Aviso para instalar la app en el móvil (Android).", brief: "Personaje abrazando o cargando un móvil gigante." },

  // Rangos (tarjeta de rango en Inicio, Resultado y escalafón en Logros)
  "rango-1-novato": { ratio: "square", screen: "Rangos", where: "Nivel 1 · Opositor Novato.", brief: "Personaje con mochila enorme y una pila de libros más alta que él." },
  "rango-2-practicas": { ratio: "square", screen: "Rangos", where: "Nivel 2 · Funcionario en Prácticas.", brief: "Personaje con uniforme que le queda grande, sujetando un llavero gigante." },
  "rango-3-jefe-servicio": { ratio: "square", screen: "Rangos", where: "Nivel 3 · Jefe de Servicio.", brief: "Personaje con portapapeles y walkie-talkie, pose de mando." },
  "rango-4-jefe-centro": { ratio: "square", screen: "Rangos", where: "Nivel 4 · Jefe de Centro.", brief: "Personaje tras un escritorio con sello, teléfono y montaña de expedientes." },
  "rango-5-director": { ratio: "square", screen: "Rangos", where: "Nivel 5 · Director de Centro.", brief: "Personaje de pie, firme, con una bandera (como el de la bandera de tu referencia)." },
  ascenso: { ratio: "square", screen: "Resultado", where: "Resultado del test cuando subes de rango.", brief: "Personaje recibiendo un galón o medalla en el hombro, con destellos." },

  // Test
  simulacro: { ratio: "wide", screen: "Test", where: "Cabecera de la configuración del simulacro.", brief: "Personaje sentado en un pupitre con lápiz, y un reloj grande en la pared." },
  entregar: { ratio: "square", screen: "Test", where: "Hoja de confirmación «¿Entregar el examen?».", brief: "Personaje entregando una carpeta por encima de un mostrador." },
  abandonar: { ratio: "square", screen: "Test", where: "Hoja de confirmación «¿Abandonar el examen?».", brief: "Personaje saliendo de puntillas por una puerta." },
  "tiempo-agotado": { ratio: "square", screen: "Resultado", where: "Resultado cuando se acabó el tiempo.", brief: "Personaje huyendo de un despertador o reloj de arena gigante." },
  "resultado-alto": { ratio: "square", screen: "Resultado", where: "Resultado con nota ≥ 7 sobre 10.", brief: "Personaje saltando de alegría, papeles volando." },
  "resultado-medio": { ratio: "square", screen: "Resultado", where: "Resultado con nota entre 4 y 7.", brief: "Personaje haciendo equilibrio con una pila de papeles, gesto de «casi»." },
  "resultado-bajo": { ratio: "square", screen: "Resultado", where: "Resultado con nota < 4.", brief: "Personaje sentado y hundido junto a una pila de papeles, con una nubecilla." },

  // Apuntes
  "apuntes-vacio": { ratio: "wide", screen: "Apuntes", where: "Cabecera de Apuntes antes de cargar texto.", brief: "Personaje con una torre de apuntes y PDFs en equilibrio sobre la cabeza." },
  "bloque-penitenciario": { ratio: "square", screen: "Apuntes", where: "Carpeta azul · Derecho Penitenciario.", brief: "Personaje con un manojo de llaves grande junto a una puerta con mirilla." },
  "bloque-penal": { ratio: "square", screen: "Apuntes", where: "Carpeta roja · Derecho Penal.", brief: "Personaje sosteniendo una balanza de la justicia o un Código Penal enorme." },
  "bloque-funcion-publica": { ratio: "square", screen: "Apuntes", where: "Carpeta verde · Función Pública.", brief: "Personaje en una ventanilla con un sello de caucho." },
  procesando: { ratio: "square", screen: "Apuntes", where: "Mientras la IA genera el test.", brief: "Personaje pensativo con un bocadillo de pensamiento (como el último de tu referencia)." },
  "test-listo": { ratio: "square", screen: "Apuntes", where: "Cuando el test generado está listo.", brief: "Personaje levantando una hoja de examen con un gran visto bueno." },

  // Logros
  "medalla-primer-turno": { ratio: "square", screen: "Logros", where: "Medalla Primer Turno.", brief: "Personaje girando una llave gigante en una cerradura: su primer día." },
  "medalla-celda-castigo": { ratio: "square", screen: "Logros", where: "Medalla Celda de Castigo.", brief: "Personaje asomado entre barrotes con cara de «ups»." },
  "medalla-imbatible": { ratio: "square", screen: "Logros", where: "Medalla Imbatible.", brief: "Personaje con escudo y capa en pose de superhéroe." },
  "medalla-estudioso-nocturno": { ratio: "square", screen: "Logros", where: "Medalla Estudioso Nocturno.", brief: "Personaje leyendo bajo un flexo, con luna y un búho en la ventana." },
  reiniciar: { ratio: "square", screen: "Logros", where: "Hoja de confirmación «¿Reiniciar progreso?».", brief: "Personaje barriendo un montón de papeles con una escoba." },
};
