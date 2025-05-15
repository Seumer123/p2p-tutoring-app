'use client';

import { useState } from 'react';
import Chat from '../components/Chat';

export default function ChatPage() {
  const [roomId, setRoomId] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId && currentUser) {
      setIsJoined(true);
    }
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Join Chat</h1>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                Room ID
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Your Name
              </label>
              <input
                type="text"
                id="username"
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Chat roomId={roomId} currentUser={currentUser} />
    </div>
  );
} 