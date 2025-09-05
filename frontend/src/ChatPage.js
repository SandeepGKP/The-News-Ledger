import React from 'react';
import Chat from './Chat';

export default function ChatPage() {
  return (
    <div className="flex-grow p-4">
      <h2 className="text-2xl font-bold mb-4">Chat</h2>
      <Chat />
    </div>
  );
}
