export type GameMode = 'WORDS' | 'IMAGES';

export type ScoringMode = 'ORIGINAL' | 'MANSALVA' | 'MUERTE';

export type GameState = 
  | 'home' 
  | 'session_select'
  | 'group_manage'
  | 'mode_select' 
  | 'scoring_select' 
  | 'setup' 
  | 'assignment' 
  | 'playing' 
  | 'voting' 
  | 'result' 
  | 'game_over';

export type Role = 'Adivino' | 'Confidente' | 'Mentiroso' | 'Espectador';

export interface Player {
  id: string;
  name: string;
  score: number;
  hp: number;
  isEliminated: boolean;
  isManualSpectator?: boolean; // New property
}

export interface PlayerRole {
  player: string;
  playerId: string;
  role: Role;
  isManualSpectator?: boolean;
}

export interface Session {
  id: string;
  name: string;
  createdAt: string;
  lastPlayed: string;
  players: Player[];
  scoringMode: ScoringMode;
}

export interface GameSecret {
  type: 'text' | 'image';
  content: string | any;
  category?: string;
}

export interface GameInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  isNew?: boolean;
  isBeta?: boolean;
}

export interface GameModule {
  onScoreReport: (results: { playerId: string; scoreDelta: number; hpDelta: number }[]) => void;
}
