import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  // @ts-ignore
  if (!res.socket.server.io) {
    // @ts-ignore
    const httpServer: NetServer = res.socket.server;
    const io = new SocketIOServer(httpServer, {
      path: '/api/chat/socketio',
    });

    io.on('connection', (socket) => {
      console.log('Client connected');

      socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
      });

      socket.on('send-message', (data: { roomId: string; message: string; sender: string }) => {
        io.to(data.roomId).emit('receive-message', {
          message: data.message,
          sender: data.sender,
          timestamp: new Date().toISOString(),
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    // @ts-ignore
    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;