import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { addPlayerToRoom, getRoom, savePlayerToken } from '@/lib/rouletteRoomManager';
import { sanitizeRoomCode } from '@/lib/roomCode';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));

    const code = sanitizeRoomCode(body.code || '');
    if (!code) {
      return NextResponse.json({ success: false, error: 'Room code is required' }, { status: 400 });
    }

    const room = getRoom(code);
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    const spotifyId = session?.user?.id || body.spotifyId || `player_${Math.random().toString(36).slice(2, 8)}`;
    const name = session?.user?.name || body.name || `Player ${room.players.length + 1}`;
    const avatarUrl = session?.user?.image || body.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${spotifyId}`;

    const player = addPlayerToRoom(code, {
      id: spotifyId,
      spotifyId,
      name,
      avatarUrl,
    });

    if (session?.accessToken) {
      savePlayerToken(code, spotifyId, {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: Date.now() + 3600 * 1000,
      });
    }

    return NextResponse.json({
      success: true,
      room,
      player,
    });
  } catch (error: any) {
    console.error('Error joining room:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
