import { NextRequest, NextResponse } from 'next/server';
import { sanitizeRoomCode } from '@/lib/roomCode';
import { startRound, getRoom } from '@/lib/rouletteRoomManager';

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

    const updatedRoom = await startRound(code);
    if (!updatedRoom) {
      return NextResponse.json({ success: false, error: 'Failed to start round' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      room: updatedRoom,
    });
  } catch (error: any) {
    console.error('Error starting round:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
