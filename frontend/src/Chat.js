import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('https://the-news-ledger.onrender.com'); // Connect to your backend Socket.IO server

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const username = localStorage.getItem('username') || 'Guest'; // Get username from localStorage

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      const fullMessage = `${username}: ${messageInput}`; // Prepend username to message
      socket.emit('sendMessage', fullMessage);
      setMessageInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Chat</h2>
      <div className="flex-1 overflow-y-auto mb-4 p-2 border rounded-md bg-white dark:bg-gray-800">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2 text-gray-700 dark:text-gray-300">
            {msg}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}
