import React, { useState } from 'react';
import Home from '../src/Home';
import Chat from '../src/Chat'; // Import the Chat component
import VideoCall from '../src/VideoCall'; // Import the VideoCall component

function App() {
  const [dark, setDark] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [videoRoomName, setVideoRoomName] = useState('');

  const handleStartVideoCall = () => {
    const room = prompt("Enter a room name for the video call:");
    if (room) {
      setVideoRoomName(room);
      setShowVideoCall(true);
    }
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
        <button
          onClick={handleStartVideoCall}
          className="ml-4 px-3 py-1 bg-purple-600 text-white rounded"
        >
          Start Video Call
        </button>

      </header>
      <div className="flex">
        <div className="w-3/4"> {/* Adjust width as needed */}
          <Home />
        </div>
        <div className="w-1/4 p-4"> {/* Adjust width and padding as needed */}
          <Chat />
          {showVideoCall && <VideoCall roomName={videoRoomName} />}
        </div>
      </div>
    </div>
  );
}

export default App;
