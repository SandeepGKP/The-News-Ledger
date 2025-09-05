import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Import motion
import io from 'socket.io-client';
import { FaPaperPlane } from 'react-icons/fa';

const socket = io('https://the-news-ledger.onrender.com'); // Connect to your backend Socket.IO server

export default function Chat({ recipient }) {
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
    if (messageInput.trim() && recipient) { // Only send if there's a recipient
      const messageData = {
        sender: username,
        recipient: recipient, // Add recipient to message data
        text: messageInput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      socket.emit('sendMessage', messageData);
      setMessageInput('');
    }
  };

  const filteredMessages = messages.filter(msg =>
    (msg.sender === username && msg.recipient === recipient) ||
    (msg.sender === recipient && msg.recipient === username)
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        Chat {recipient ? `with ${recipient}` : ''}
      </h2>
      <div className="flex-1 overflow-y-scroll mb-4 p-2 border rounded-md bg-white dark:bg-gray-800">
        {filteredMessages.map((msg, index) => {
          const isMyMessage = msg.sender === username;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex mb-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-2 rounded-lg shadow-md ${
                  isMyMessage
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-300 text-gray-800 rounded-bl-none dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {!isMyMessage && <div className="font-semibold text-sm mb-1">{msg.sender}</div>}
                <div>{msg.text}</div>
                <div className={`text-xs mt-1 ${isMyMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'} text-right`}>
                  {msg.timestamp}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-200"
          placeholder={recipient ? `Message ${recipient}...` : 'Select a user to chat with...'}
          disabled={!recipient} // Disable input if no recipient is selected
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          disabled={!recipient} // Disable button if no recipient is selected
        >
          <FaPaperPlane className="mr-2" />
        </button>
      </form>
    </div>
  );
}
