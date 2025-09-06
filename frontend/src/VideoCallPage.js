import React from 'react';
import { useLocation } from 'react-router-dom';
import VideoCall from './VideoCall';

export default function VideoCallPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const roomName = queryParams.get('room');
  const callerSignalString = queryParams.get('signal');
  const callerSignal = callerSignalString ? JSON.parse(callerSignalString) : null;

  return (
    <div className="h-full">
      {roomName ? (
        <VideoCall roomName={roomName} callerSignal={callerSignal} />
      ) : (
        <p className="text-gray-600 dark:text-gray-400">Please join a video call from the sidebar.</p>
      )}
    </div>
  );
}
