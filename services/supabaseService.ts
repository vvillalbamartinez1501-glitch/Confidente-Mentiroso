import { supabase } from '../lib/supabase';

const ROOMS_TABLE = 'ROOMS';
const PLAYERS_TABLE = 'PLAYERS';

export const supabaseService = {
  async updateGameState(roomId: string, gameState: any) {
    const { error } = await supabase
      .from(ROOMS_TABLE)
      .update({ game_state: gameState })
      .eq('id', roomId);
    
    if (error) throw error;
  },

  async updatePlayerScore(playerId: string, score: number, hp: number) {
    const { error } = await supabase
      .from(PLAYERS_TABLE)
      .update({ score, hp })
      .eq('id', playerId);
    
    if (error) throw error;
  },

  async kickPlayer(playerId: string) {
    const { error } = await supabase
      .from(PLAYERS_TABLE)
      .delete()
      .eq('id', playerId);
    
    if (error) throw error;
  },

  async leaveRoom(roomId: string, playerId: string) {
    const { error } = await supabase
      .from(PLAYERS_TABLE)
      .delete()
      .eq('id', playerId)
      .eq('room_id', roomId);
    
    if (error) throw error;
  }
};
