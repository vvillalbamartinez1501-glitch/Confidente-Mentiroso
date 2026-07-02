export type TriviaPhase = 
  | 'CATEGORY_SELECT' 
  | 'CHAOS_ROLL' 
  | 'READING_QUESTION' 
  | 'ANSWERING' 
  | 'REVEALING_ANSWER' 
  | 'SCORE_UPDATE';

export type QuestionType = 'multiple' | 'boolean' | 'input';

export interface TriviaQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correct_answer: string;
  mediaUrl?: string;
}

export type ChaosEffectType = 'time_halved' | 'points_doubled' | 'blind_mode';

export interface ChaosModifier {
  id: string;
  name: string;
  description: string;
  effectType: ChaosEffectType;
  active: boolean;
}

export interface PlayerAnswer {
  playerId: string;
  playerName: string;
  answer: string;
  isCorrect: boolean;
  timeTaken?: number;
}
