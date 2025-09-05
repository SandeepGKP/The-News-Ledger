import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion'; // Import motion
import io from 'socket.io-client';
import { FaPaperPlane } from 'react-icons/fa';

const socket = io('https://the-news-ledger.onrender.com'); // Connect to your backend Socket.IO server

// Helper function to create a consistent chat ID
const getChatId = (user1, user2) => {
  return [user1, user2].sort().join('-');
};

export default function Chat({ recipient }) {
  const [allMessages, setAllMessages] = useState({}); // Stores messages for all chats
  const [messageInput, setMessageInput] = useState('');
  const username = localStorage.getItem('username') || 'Guest'; // Get username from localStorage
  const messagesEndRef = useRef(null); // Ref for scrolling to the bottom of messages

  useEffect(() => {
    // Emit userLoggedIn when component mounts
    socket.emit('userLoggedIn', username);

    socket.on('receiveMessage', (message) => {
      setAllMessages((prevAllMessages) => {
        const chatId = getChatId(message.sender, message.recipient);
        return {
          ...prevAllMessages,
          [chatId]: [...(prevAllMessages[chatId] || []), message],
        };
      });
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [username]); // Depend on username to re-emit userLoggedIn if it changes

  // Scroll to the bottom of messages whenever messages for the current recipient change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, recipient]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && recipient) {
      const messageData = {
        sender: username,
        recipient: recipient,
        text: messageInput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Add message to local state immediately
      setAllMessages((prevAllMessages) => {
        const chatId = getChatId(username, recipient);
        return {
          ...prevAllMessages,
          [chatId]: [...(prevAllMessages[chatId] || []), messageData],
        };
      });

      socket.emit('sendMessage', messageData);
      setMessageInput('');
    }
  };

  const currentChatId = recipient ? getChatId(username, recipient) : null;
  const currentMessages = currentChatId ? (allMessages[currentChatId] || []) : [];

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        Chat {recipient ? `with ${recipient}` : ''}
      </h2>
      <div className="flex-1 overflow-y-scroll mb-4 p-2 border rounded-md bg-white dark:bg-gray-800">
        {currentMessages.map((msg, index) => {
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
        <div ref={messagesEndRef} /> {/* Scroll to this element */}
      </div>
      <form onSubmit={sendMessage} className="flex">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-200"
          placeholder={recipient ? `Message ${recipient}...` : 'Select a user to chat with...'}
          disabled={!recipient}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          disabled={!recipient}
        >
          <FaPaperPlane className="mr-2" />
        </button>
      </form>
    </div>
  );
}
