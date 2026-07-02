import { ChaosModifier } from './types';

export const TRIVIA_CATEGORIES = [
  { id: 'historia', name: 'Historia', icon: '📜', color: 'from-amber-500 to-amber-700' },
  { id: 'memes', name: 'Memes y Pop', icon: '😂', color: 'from-pink-500 to-rose-700' },
  { id: 'ciencia', name: 'Ciencia y Tech', icon: '🧪', color: 'from-cyan-500 to-blue-700' }
];

export const CHAOS_MODIFIERS: ChaosModifier[] = [
  {
    id: 'time_halved',
    name: '⚡ ¡Tiempo a la Mitad!',
    description: 'El reloj corre el doble de rápido. ¡Solo tienes 5 segundos para responder!',
    effectType: 'time_halved',
    active: true
  },
  {
    id: 'points_doubled',
    name: '🔥 ¡Puntos Dobles!',
    description: 'La recompensa se duplica en esta ronda. ¡Acierta y gana +20 puntos!',
    effectType: 'points_doubled',
    active: true
  },
  {
    id: 'blind_mode',
    name: '👁️ ¡Modo Ciego!',
    description: 'Las opciones están cubiertas de misterio. ¡Pasa el cursor sobre ellas para revelarlas!',
    effectType: 'blind_mode',
    active: true
  }
];
