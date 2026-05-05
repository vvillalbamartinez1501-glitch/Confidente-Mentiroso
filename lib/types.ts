import { GameImage } from './imageLoader';

export type GameMode = 'WORDS' | 'IMAGES';

export type ScoringMode = 'ORIGINAL' | 'MANSALVA' | 'MUERTE';

export type GameState = 'home' | 'mode_select' | 'scoring_select' | 'setup' | 'assignment' | 'playing' | 'voting' | 'result' | 'game_over';

export type Role = 'Confidente' | 'Mentiroso' | 'Adivino';

export interface Player {
  id: string;
  name: string;
  score: number;
  hp: number;
  isEliminated: boolean;
}

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
