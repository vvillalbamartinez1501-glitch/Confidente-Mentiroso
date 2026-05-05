import { Category, GameImage } from './imageLoader';

export type GameMode = 'WORDS' | 'IMAGES';

export type GameState = 'home' | 'mode_select' | 'setup' | 'assignment' | 'playing' | 'result';

export type Role = 'Confidente' | 'Mentiroso';

export interface PlayerRole {
  player: string;
  role: Role;
}

export type GameSecret = {
  type: 'text';
  content: string;
  category: string;
} | {
  type: 'image';
  content: GameImage;
};
