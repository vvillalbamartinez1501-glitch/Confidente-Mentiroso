export const WORD_CATEGORIES = {
  OBJETOS: {
    name: 'Objetos',
    icon: '📦',
    items: ['Lápiz', 'Tijeras', 'Grapadora', 'Cafetera', 'Reloj de arena', 'Silla de oficina', 'Teclado mechanical', 'Paraguas', 'Mochila', 'Lámpara de lava']
  },
  PELICULAS: {
    name: 'Películas',
    icon: '🎬',
    items: ['Titanic', 'Star Wars', 'El Padrino', 'Toy Story', 'Inception', 'Avatar', 'Jurassic Park', 'The Matrix', 'Shrek', 'Harry Potter']
  },
  ACCIONES: {
    name: 'Acciones',
    icon: '🏃',
    items: ['Bailar Flamenco', 'Lavar el coche', 'Escalar una montaña', 'Tocar la guitarra', 'Hacer yoga', 'Cocinar una paella', 'Pintar un cuadro', 'Jugar al ajedrez']
  },
  ANIMALES: {
    name: 'Animales',
    icon: '🦁',
    items: ['León', 'Elefante', 'Pingüino', 'Canguro', 'Ornitorrinco', 'Delfín', 'Águila', 'Panda', 'Camaleón', 'Tiburón']
  }
};

export type WordCategory = keyof typeof WORD_CATEGORIES;
