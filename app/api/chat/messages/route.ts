import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return new NextResponse('Room ID is required', { status: 400 });
    }

    // Verify user has access to this chat room
    const chatRoom = await db.chatRoom.findFirst({
      where: {
        id: roomId,
        booking: {
          OR: [
            { userId: session.user.id },
            { lecture: { tutorId: session.user.id } }
          ]
        }
      }
    });

    if (!chatRoom) {
      return new NextResponse('Chat room not found or access denied', { status: 404 });
    }

    // Get messages for the room
    const messages = await db.message.findMany({
      where: {
        roomId: roomId
      },
      include: {
        sender: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 