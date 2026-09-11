import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createRoom, savePlayerToken } from '@/lib/rouletteRoomManager';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));

    // Host user details from NextAuth session or provided payload
    const spotifyId = session?.user?.id || body.spotifyId || `guest_${Math.random().toString(36).slice(2, 8)}`;
    const name = session?.user?.name || body.name || 'Game Host';
    const avatarUrl = session?.user?.image || body.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

    const room = createRoom(spotifyId, {
      id: spotifyId,
      spotifyId,
      name,
      avatarUrl,
    });

    // If session has access token, store it
    if (session?.accessToken) {
      savePlayerToken(room.code, spotifyId, {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: Date.now() + 3600 * 1000,
      });
    }

    return NextResponse.json({
      success: true,
      room,
      roomCode: room.code,
    });
  } catch (error: any) {
    console.error('Error creating room:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
