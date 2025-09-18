import React from 'react';
import { FaVideo, FaCommentDots } from 'react-icons/fa';

export default function Sidebar({ onlineUsers, handleStartVideoCall, handleStartChat, receivingCall, caller, acceptCall, declineCall }) {
  return (
    <div className="w-full md:w-1/4 bg-gray-50 dark:bg-gray-800 flex flex-col h-full border-r dark:border-gray-700">
      <div className="p-6 border-b dark:border-gray-700">
        {receivingCall && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg shadow-lg text-center border border-blue-200 dark:border-blue-700 mb-4">
            <h4 className="text-lg font-bold mb-2 text-blue-800 dark:text-blue-200">{caller} is calling!</h4>
            <div className="flex justify-center gap-4 mt-2">
              <button
                onClick={acceptCall}
                className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-transform transform hover:scale-105"
              >
                Accept
              </button>
              <button
                onClick={declineCall}
                className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-transform transform hover:scale-105"
              >
                Decline
              </button>
            </div>
          </div>
        )}
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
          Online Users ({onlineUsers.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {onlineUsers.length > 0 ? (
            onlineUsers.map((user, idx) => (
              <div key={idx} className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex justify-between items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{user}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartChat(user)}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                    title="Start Chat"
                  >
                    <FaCommentDots />
                  </button>
                  <button
                    onClick={() => handleStartVideoCall(user)}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                    title="Start Video Call"
                  >
                    <FaVideo />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">No other users online.</p>
          )}
        </div>
      </div>
    </div>
  );
}
