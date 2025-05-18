import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Store active connections
const clients = new Map<string, ReadableStreamDefaultController>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  const userId = searchParams.get('userId');

  if (!roomId || !userId) {
    return new NextResponse('Missing roomId or userId', { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Store the controller for this connection
      clients.set(`${roomId}-${userId}`, controller);

      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

      // Clean up when the connection is closed
      req.signal.addEventListener('abort', () => {
        clients.delete(`${roomId}-${userId}`);
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(req: Request) {
  try {
    const { roomId, message, senderId } = await req.json();

    // Save message to database
    const savedMessage = await db.message.create({
      data: {
        content: message,
        senderId,
        roomId,
      },
      include: {
        sender: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Broadcast message to all clients in the room
    const messageData = {
      type: 'message',
      data: {
        id: savedMessage.id,
        content: savedMessage.content,
        sender: savedMessage.sender.name,
        senderImage: savedMessage.sender.image,
        timestamp: savedMessage.createdAt,
      },
    };

    // Send to all clients in the room
    for (const [key, controller] of clients.entries()) {
      if (key.startsWith(`${roomId}-`)) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(messageData)}\n\n`));
      }
    }

    return new NextResponse('Message sent', { status: 200 });
  } catch (error) {
    console.error('Error sending message:', error);
    return new NextResponse('Error sending message', { status: 500 });
  }
} 