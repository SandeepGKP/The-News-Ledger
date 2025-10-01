import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion'; // Import motion
import { FaPaperPlane, FaReply } from 'react-icons/fa';
import { X } from 'lucide-react';

// Helper function to create a consistent chat ID
const getChatId = (user1, user2) => {
  return [user1, user2].sort().join('-');
};

export default function Chat({ recipient, socket }) {
  // IndexedDB setup for chat messages
  const DB_NAME = 'ChatDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'chatMessages';

  // Initialize IndexedDB
  const initDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  };

  // Load messages from IndexedDB
  const loadMessagesFromStorage = async () => {
    try {
      const db = await initDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('chatMessages');

      return new Promise((resolve) => {
        request.onsuccess = () => {
          resolve(request.result ? request.result.data : {});
        };
        request.onerror = () => resolve({});
      });
    } catch (error) {
      console.error('Error loading from IndexedDB:', error);
      return {};
    }
  };

  // Save messages to IndexedDB
  const saveMessagesToStorage = async (messages) => {
    try {
      const db = await initDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      await store.put({ id: 'chatMessages', data: messages });
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
    }
  };

  const [allMessages, setAllMessages] = useState({}); // Stores messages for all chats
  const [messageInput, setMessageInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // Store message being replied to
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Control delete confirmation modal
  const [messageToDelete, setMessageToDelete] = useState(null); // Store message to be deleted
  const username = localStorage.getItem('username'); // Get username from localStorage
  const messagesEndRef = useRef(null); // Ref for scrolling to the bottom of messages

  // Load messages from IndexedDB on component mount
  useEffect(() => {
    loadMessagesFromStorage().then((messages) => {
      setAllMessages(messages);
    });
  }, []);

  // Save messages to IndexedDB whenever allMessages changes
  useEffect(() => {
    saveMessagesToStorage(allMessages);
  }, [allMessages]);

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

    socket.on('messageDeleted', ({ messageId, chatId }) => {
      setAllMessages((prevAllMessages) => {
        if (prevAllMessages[chatId]) {
          return {
            ...prevAllMessages,
            [chatId]: prevAllMessages[chatId].filter(msg => msg.id !== messageId),
          };
        }
        return prevAllMessages;
      });
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('messageDeleted');
    };
  }, [username, socket]); // Depend on username to re-emit userLoggedIn if it changes

  // Scroll to the bottom of messages whenever messages for the current recipient change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, recipient]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && recipient) {
      const messageId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const messageData = {
        id: messageId,
        sender: username,
        recipient: recipient,
        text: messageInput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        replyTo: replyingTo ? {
          id: replyingTo.id,
          sender: replyingTo.sender,
          text: replyingTo.text
        } : null,
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
      setReplyingTo(null);
    }
  };

  const deleteMessage = (message) => {
    setMessageToDelete(message);
    setShowDeleteModal(true);
  };

  const deleteForEveryone = () => {
    if (messageToDelete) {
      setAllMessages((prevAllMessages) => {
        const chatId = getChatId(username, recipient);
        return {
          ...prevAllMessages,
          [chatId]: prevAllMessages[chatId].filter(msg => msg.id !== messageToDelete.id),
        };
      });
      socket.emit('deleteMessage', { messageId: messageToDelete.id, chatId: getChatId(username, recipient) });
    }
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  const deleteForMe = () => {
    if (messageToDelete) {
      setAllMessages((prevAllMessages) => {
        const chatId = getChatId(username, recipient);
        return {
          ...prevAllMessages,
          [chatId]: prevAllMessages[chatId].filter(msg => msg.id !== messageToDelete.id),
        };
      });
      // No socket emission, so other users still see the message
    }
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  const replyToMessage = (message) => {
    setReplyingTo(message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const currentChatId = recipient ? getChatId(username, recipient) : null;
  const currentMessages = currentChatId ? (allMessages[currentChatId] || []) : [];

  return (
    <div className="flex flex-col h-full ">
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
              key={msg.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-end gap-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md p-3 rounded-2xl shadow relative ${
                  isMyMessage
                    ? 'bg-blue-500 text-white rounded-br-lg '
                    : 'bg-gray-200 text-gray-800 rounded-bl-lg dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={() => replyToMessage(msg)}
                    className={`p-1 rounded-full hover:bg-opacity-20 ${isMyMessage ? 'hover:bg-white' : 'hover:bg-gray-400'} transition-colors`}
                    title="Reply"
                  >
                    <FaReply size={10} />
                  </button>
                  <button
                    onClick={() => deleteMessage(msg)}
                    className="p-1 rounded-full hover:bg-red-500 hover:bg-opacity-20 transition-colors"
                    title="Delete"
                  >
                    <X size={10} />
                  </button>
                </div>
                <div className="pr-16">
                  {msg.replyTo && (
                    <div className={`mb-2 p-2 rounded border-l-4 ${isMyMessage ? 'border-blue-300 bg-blue-600 text-blue-100' : 'border-gray-300 bg-gray-100 dark:bg-gray-600 dark:text-gray-300'} text-sm`}>
                      <div className="font-semibold">{msg.replyTo.sender}</div>
                      <div className="truncate">{msg.replyTo.text}</div>
                    </div>
                  )}
                  {!isMyMessage && <div className="font-bold text-sm mb-1 text-blue-600 dark:text-blue-400">{msg.sender}</div>}
                  <p className="text-base break-words">{msg.text}</p>
                  <div className={`text-xs mt-2 ${isMyMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t dark:border-gray-700">
        {replyingTo && (
          <div className="mb-2 p-2 bg-blue-100 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-semibold">Replying to {replyingTo.sender}: </span>
                <span className="truncate block max-w-md">{replyingTo.text}</span>
              </div>
              <button
                onClick={cancelReply}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                title="Cancel reply"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 bg-gray-100 text-black dark:bg-gray-800 dark:text-white border-transparent rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
            placeholder={replyingTo ? `Reply to ${replyingTo.sender}...` : recipient ? `Message ${recipient}...` : 'Select a user to chat with...'}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
            {/* Message Preview */}
            {messageToDelete && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Delete message?</div>
                <div className="bg-white dark:bg-gray-600 p-3 rounded-lg border dark:border-gray-500 max-w-xs">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {messageToDelete.sender === username ? 'You' : messageToDelete.sender}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">
                    {messageToDelete.text}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col">
              <button
                onClick={deleteForEveryone}
                className="w-full px-4 py-4 text-left text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-600 text-sm font-medium flex items-center"
              >
                <X size={16} className="mr-3" />
                Delete for everyone
              </button>
              <button
                onClick={deleteForMe}
                className="w-full px-4 py-4 text-left text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-600 text-sm font-medium flex items-center"
              >
                <X size={16} className="mr-3" />
                Delete for me
              </button>
              <button
                onClick={cancelDelete}
                className="w-full px-4 py-4 text-left text-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
