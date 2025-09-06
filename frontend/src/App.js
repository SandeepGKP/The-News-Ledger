import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './Home';
import ChatPage from './ChatPage';
import VideoCallPage from './VideoCallPage';
import Sidebar from './Sidebar';
import io from 'socket.io-client';

import { FaVideo,FaCommentDots, FaHome } from 'react-icons/fa'; // Import icons for navigation
import { FaNewspaper } from "react-icons/fa";

const socket = io('https://the-news-ledger.onrender.com');

function App() {
  const [dark, setDark] = useState(false);
  const [videoRoomName, setVideoRoomName] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState();
  const [callRoomName, setCallRoomName] = useState('');
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const handleStorageChange = () => {
      setUsername(localStorage.getItem('username'));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login'); // Use navigate instead of window.location.href
  };

  useEffect(() => {
    if (username) {
      socket.emit('userLoggedIn', username);
    }

    socket.on('updateUserList', (users) => {
      const currentUser = localStorage.getItem('username');
      // Filter out the current user, but keep all instances of other users
      setOnlineUsers(users.filter(user => user !== currentUser));
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
    const room = prompt("Enter a room name for the video call:");
    if (room) {
      setVideoRoomName(room);
      // Navigate to video call page
      navigate(`/video-call?room=${room}&userToCall=${userToCall}`); // Use navigate
      // For now, we'll pass a dummy signal, actual signal will be generated in VideoCall component
      socket.emit('callUser', { userToCall, roomName: room, signalData: null });
    }
  };

  const handleStartChat = (recipient) => {
    navigate(`/chat?recipient=${recipient}`); // Use navigate to change URL without full refresh
  };

  const acceptCall = () => {
    setReceivingCall(false);
    navigate(`/video-call?room=${callRoomName}&caller=${caller}&signal=${JSON.stringify(callerSignal)}`); // Use navigate
  };

  const declineCall = () => {
    setReceivingCall(false);
    setCaller('');
    setCallerSignal(null);
    setCallRoomName('');
    // Optionally, emit an event to the caller that the call was declined
  };

  return (
    <div className={`${dark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'} h-screen flex flex-col font-sans`}>
      <header className="shadow-md p-4 flex justify-between items-center bg-white dark:bg-gray-800 z-50 border-b dark:border-gray-700">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          News Ledger
        </h1>
        <nav className="flex items-center space-x-6">
          <Link to="/home" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
            <FaNewspaper className="mr-2" />
            News
          </Link>
          <Link to="/chat" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
            <FaCommentDots className="mr-2" /> Chat
          </Link>
          <Link to="/video-call" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
            <FaVideo className="mr-2" /> Video
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 shadow-inner hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
            aria-label="Toggle Dark Mode"
          >
            {dark ? (
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
          {username && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-auto px-4 py-2 rounded-full bg-red-400 text-white shadow-md hover:bg-red-600 transition-colors duration-300"
              aria-label="Logout"
            >
              Logout
            </button>
          )}
        </div>
      </header>
      <div className="flex flex-row flex-1 overflow-hidden">
        <Sidebar
          onlineUsers={onlineUsers}
          handleStartVideoCall={handleStartVideoCall}
          handleStartChat={handleStartChat} // Pass handleStartChat to Sidebar
          receivingCall={receivingCall}
          caller={caller}
          acceptCall={acceptCall}
          declineCall={declineCall}
        />
        <main className="flex-grow overflow-y-auto">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/chat" element={<ChatPage socket={socket} />} /> {/* No need to pass selectedChatRecipient, ChatPage reads from URL */}
            <Route
              path="/video-call"
              element={
                <VideoCallPage
                  roomName={videoRoomName}
                  callerSignal={callerSignal}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
