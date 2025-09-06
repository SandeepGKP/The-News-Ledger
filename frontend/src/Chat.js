import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion'; // Import motion
import { FaPaperPlane } from 'react-icons/fa';

// Helper function to create a consistent chat ID
const getChatId = (user1, user2) => {
  return [user1, user2].sort().join('-');
};

export default function Chat({ recipient, socket }) {
  const [allMessages, setAllMessages] = useState({}); // Stores messages for all chats
  const [messageInput, setMessageInput] = useState('');
  const username = localStorage.getItem('username'); // Get username from localStorage
  const messagesEndRef = useRef(null); // Ref for scrolling to the bottom of messages

  useEffect(() => {
    if (!socket) return;

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
  }, [username, socket]); // Depend on username to re-emit userLoggedIn if it changes

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
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 p-10">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Chat {recipient ? `with ${recipient}` : 'Select a user'}
        </h2>
      </div>
      <div className="flex-1 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800  p-6 space-y-4">
        {currentMessages.map((msg, index) => {
          const isMyMessage = msg.sender === username;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-end gap-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md p-3 rounded-2xl shadow ${
                  isMyMessage
                    ? 'bg-blue-500 text-white rounded-br-lg'
                    : 'bg-gray-200 text-gray-800 rounded-bl-lg dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {!isMyMessage && <div className="font-bold text-sm mb-1 text-blue-600 dark:text-blue-400">{msg.sender}</div>}
                <p className="text-base">{msg.text}</p>
                <div className={`text-xs mt-2 ${isMyMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'} text-right`}>
                  {msg.timestamp}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t dark:border-gray-700">
        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 bg-gray-100 text-white dark:bg-gray-800 border-transparent rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
            placeholder={recipient ? `Message ${recipient}...` : 'Select a user to chat with...'}
            disabled={!recipient}
          />
          <button
            type="submit"
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-transform transform hover:scale-110"
            disabled={!recipient}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
}
