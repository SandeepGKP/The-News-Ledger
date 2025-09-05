import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence
import Home from '../src/Home';
import Chat from '../src/Chat'; // Import the Chat component
import VideoCall from '../src/VideoCall'; // Import the VideoCall component
import io from 'socket.io-client';

const socket = io('https://the-news-ledger.onrender.com'); // Connect to your backend Socket.IO server

function App() {
  const [dark, setDark] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoRoomName, setVideoRoomName] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState();
  const [callRoomName, setCallRoomName] = useState('');
  const username = localStorage.getItem('username'); // Get current user's username

  useEffect(() => {
    if (username) {
      socket.emit('userLoggedIn', username);
    }

    socket.on('updateUserList', (users) => {
      setOnlineUsers(users.filter(user => user !== username)); // Exclude current user
    });

    socket.on('hey', (data) => {
      setReceivingCall(true);
      setCaller(data.fromUsername);
      setCallerSignal(data.signal);
      setCallRoomName(data.roomName);
    });

    return () => {
      socket.off('updateUserList');
      socket.off('hey');
    };
  }, [username]);

  const handleStartVideoCall = (userToCall) => {
    if (showVideoCall) {
      alert("You are already in a video call. Please end the current call before starting a new one.");
      return;
    }
    const room = prompt("Enter a room name for the video call:");
    if (room) {
      setVideoRoomName(room);
      setShowVideoCall(true);
      // For now, we'll pass a dummy signal, actual signal will be generated in VideoCall component
      socket.emit('callUser', { userToCall, roomName: room, signalData: null });
    }
  };

  const acceptCall = () => {
    setShowVideoCall(true);
    setVideoRoomName(callRoomName);
    setReceivingCall(false);
    // The VideoCall component will handle sending the answer
  };

  const declineCall = () => {
    setReceivingCall(false);
    setCaller('');
    setCallerSignal(null);
    setCallRoomName('');
    // Optionally, emit an event to the caller that the call was declined
  };

  return (
    <div className={`${dark ? 'bg-black text-white' : 'bg-gray-100 text-black'} min-h-screen`}>
      <header className="shadow p-1 flex justify-between items-center bg-blue-600 sticky top-0 z-50">
        <h1
          className="text-xl font-bold cursor-pointer text-black text-center w-full"
        >
          The News Ledger
        </h1>
        <button
          onClick={() => setDark(!dark)}
          className="flex mr-5 items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 shadow-md hover:scale-110 transition-transform duration-200"
          aria-label="Toggle Dark Mode"
          >
          {dark ? (
            // Sun Icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            // Moon Icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
            </svg>
          )}
        </button>
        {/* Online Users for Video Call */}
        <div className="relative ml-4">
          <button className="px-3 py-1 bg-green-600 text-white rounded">
            Online Users ({onlineUsers.length})
          </button>
          {onlineUsers.length > 0 && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {onlineUsers.map((user, idx) => (
                <div key={idx} className="p-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0 flex justify-between items-center">
                  <span className="text-gray-800 dark:text-gray-200">{user}</span>
                  <button
                    onClick={() => handleStartVideoCall(user)}
                    className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Call
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>
      <div className="flex">
        <div className="w-3/4"> {/* Adjust width as needed */}
          <Home />
        </div>
        <div className="w-1/4 p-4 flex flex-col space-y-4"> {/* Combined into a single div, adjust width and padding as needed */}
          {showVideoCall && (
            <VideoCall roomName={videoRoomName} callerSignal={callerSignal} />
          )}
          <Chat />
        </div>
      </div>

      {/* Incoming Call Notification with Framer Motion */}
      <AnimatePresence>
        {receivingCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{caller} is calling you!</h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={acceptCall}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={declineCall}
                  className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Decline
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
