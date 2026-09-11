import { NextRequest, NextResponse } from 'next/server';
import { sanitizeRoomCode } from '@/lib/roomCode';
import { revealRoundResults, getRoom } from '@/lib/rouletteRoomManager';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const code = sanitizeRoomCode(body.code || '');

    if (!code) {
      return NextResponse.json({ success: false, error: 'Room code required' }, { status: 400 });
    }

    const room = getRoom(code);
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    const revealedRoom = revealRoundResults(code);

    return NextResponse.json({
      success: true,
      room: revealedRoom,
    });
  } catch (error: any) {
    console.error('Error in reveal route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
