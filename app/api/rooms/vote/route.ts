import { NextRequest, NextResponse } from 'next/server';
import { sanitizeRoomCode } from '@/lib/roomCode';
import { submitVote, revealRoundResults } from '@/lib/rouletteRoomManager';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = sanitizeRoomCode(body.code || '');
    const { voterId, guessedPlayerId } = body;

    if (!code || !voterId || !guessedPlayerId) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const { success, allVoted, room } = submitVote(code, voterId, guessedPlayerId);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Could not cast vote' }, { status: 400 });
    }

    // If all players have voted, trigger immediate reveal!
    if (allVoted) {
      const revealedRoom = revealRoundResults(code);
      return NextResponse.json({
        success: true,
        allVoted: true,
        room: revealedRoom || room,
      });
    }

    return NextResponse.json({
      success: true,
      allVoted: false,
      room,
    });
  } catch (error: any) {
    console.error('Error submitting vote:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
