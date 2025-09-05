import React from 'react';
import { FaVideo, FaCommentDots } from 'react-icons/fa'; // Import FaCommentDots icon

export default function Sidebar({ onlineUsers, handleStartVideoCall, handleStartChat, receivingCall, caller, acceptCall, declineCall }) {
  return (
    <div className="w-1/4 p-4 bg-gray-200 dark:bg-gray-800 flex flex-col h-auto">
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Online Users ({onlineUsers.length})</h3>
      <div className="flex-grow overflow-y-scroll">
        {onlineUsers.length > 0 ? (
          onlineUsers.map((user, idx) => (
            <div key={idx} className="p-2 border-b border-gray-300 dark:border-gray-700 last:border-b-0 flex justify-between items-center">
              <span className="text-gray-800 dark:text-gray-200">{user}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStartChat(user)}
                  className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 flex items-center"
                >
                  <FaCommentDots className="mr-1" /> Chat
                </button>
                <button
                  onClick={() => handleStartVideoCall(user)}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 flex items-center"
                >
                  <FaVideo className="mr-1" /> Call
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No other users online.</p>
        )}
      </div>

      {receivingCall && (
        <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow-md text-center">
          <h4 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">{caller} is calling!</h4>
          <div className="flex justify-center gap-2">
            <button
              onClick={acceptCall}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Accept
            </button>
            <button
              onClick={declineCall}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
