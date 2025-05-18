import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import { db } from './db';

let io: SocketIOServer | null = null;

export const config = {
  api: {
    bodyParser: false,
  },
};

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const initSocket = (res: NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
}) => {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    
    io = new SocketIOServer(res.socket.server, {
      path: '/api/chat/socketio',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    io.on('connection', async (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-room', async (roomId: string) => {
        socket.join(roomId);
        console.log(`Client ${socket.id} joined room: ${roomId}`);
      });

      socket.on('send-message', async (data: { roomId: string; message: string; senderId: string }) => {
        try {
          const { roomId, message, senderId } = data;
          console.log('Received message:', { roomId, message, senderId });

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

          console.log('Message saved:', savedMessage);

          // Broadcast message to room
          io?.to(roomId).emit('receive-message', {
            id: savedMessage.id,
            content: savedMessage.content,
            sender: savedMessage.sender.name,
            senderImage: savedMessage.sender.image,
            timestamp: savedMessage.createdAt,
          });
        } catch (error) {
          console.error('Error saving message:', error);
          socket.emit('error', { error: 'Failed to save message' });
        }
      });

      socket.on('typing', (data: { roomId: string; userId: string; isTyping: boolean }) => {
        socket.to(data.roomId).emit('user-typing', {
          userId: data.userId,
          isTyping: data.isTyping,
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });

    res.socket.server.io = io;
  }

  return res.socket.server.io;
}; 