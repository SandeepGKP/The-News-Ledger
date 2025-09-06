import React from 'react';
import { FaVideo, FaCommentDots } from 'react-icons/fa'; // Import FaCommentDots icon

export default function Sidebar({ onlineUsers, handleStartVideoCall, handleStartChat, receivingCall, caller, acceptCall, declineCall }) {
  return (
    <div className="w-full lg:h-full md:w-1/4 p-6 bg-gray-50 dark:bg-gray-800 mt-4 flex flex-col md:h-full border-r dark:border-gray-700">
      {receivingCall && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg shadow-lg text-center border border-blue-200 dark:border-blue-700">
          <h4 className="text-lg font-bold mb-2 text-blue-800 dark:text-blue-200">{caller} is calling!</h4>
          <div className="flex justify-center gap-4">
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

      <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white flex items-center">
        <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
        Online Users ({onlineUsers.length})
      </h3>
      <div class="border-t border-gray-700 my-2"></div>

      <div className="flex-grow overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-600">
        {onlineUsers.length > 0 ? (
          onlineUsers.map((user, idx) => (
            <div key={idx} className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex justify-between items-center">
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
          <p className="text-gray-500 dark:text-gray-400 text-center mt-4">No other users online.</p>
        )}
      </div>
      <div class="border-t border-gray-700 my-2"></div>

    </div>
  );
}
