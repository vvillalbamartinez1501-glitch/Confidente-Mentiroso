import { NextRequest, NextResponse } from 'next/server';
import { sanitizeRoomCode } from '@/lib/roomCode';
import { getRoom, sanitizeRoomForClient } from '@/lib/rouletteRoomManager';
import { auth } from '@/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const resolvedParams = await params;
    const code = sanitizeRoomCode(resolvedParams.code || '');
    if (!code) {
      return NextResponse.json({ success: false, error: 'Invalid room code' }, { status: 400 });
    }

    const room = getRoom(code);
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
    }

    const session = await auth();
    const isHost = session?.user?.id === room.hostId || req.nextUrl.searchParams.get('isHost') === 'true';

    return NextResponse.json({
      success: true,
      room: sanitizeRoomForClient(room, isHost),
    });
  } catch (error: any) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
