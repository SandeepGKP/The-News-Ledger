import React, { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

const socket = io('https://the-news-ledger.onrender.com'); // Connect to your backend Socket.IO server

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default function VideoCall({ roomName }) {
  const localVideoRef = useRef();
  const peerConnections = useRef({}); // Store multiple peer connections
  const localStream = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // Store multiple remote streams
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);

  const createPeerConnection = useCallback(async (peerId) => {
    const pc = new RTCPeerConnection(servers);
    peerConnections.current[peerId] = pc;

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.current);
      });
    }

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => ({
        ...prev,
        [peerId]: event.streams[0],
      }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate, roomName, peerId);
      }
    };

    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', offer, roomName, peerId);
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    };

    return pc;
  }, [roomName, localStream]);

  const startCall = useCallback(async () => {
    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = localStream.current;
      setIsCallActive(true);

      socket.emit('joinRoom', roomName);

    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  }, [roomName]);

  const endCall = useCallback(() => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    for (const peerId in peerConnections.current) {
      if (peerConnections.current[peerId]) {
        peerConnections.current[peerId].close();
      }
    }
    peerConnections.current = {};
    setRemoteStreams({});
    socket.emit('leaveRoom', roomName);
    setIsCallActive(false);
    localVideoRef.current.srcObject = null;
  }, [roomName]);

  useEffect(() => {
    socket.on('userJoined', async (peerId) => {
      console.log('User joined:', peerId);
      await createPeerConnection(peerId);
      // The createPeerConnection function already handles adding the peer to peerConnections.current
      // No need to create offer here, onnegotiationneeded will handle it
    });

    socket.on('offer', async (offer, senderId) => {
      console.log('Offer received from:', senderId);
      const pc = await createPeerConnection(senderId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', answer, roomName, senderId);
    });

    socket.on('answer', async (answer, senderId) => {
      console.log('Answer received from:', senderId);
      const pc = peerConnections.current[senderId];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('ice-candidate', async (candidate, senderId) => {
      console.log('ICE Candidate received from:', senderId);
      const pc = peerConnections.current[senderId];
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on('userLeft', (peerId) => {
      console.log('User left:', peerId);
      if (peerConnections.current[peerId]) {
        peerConnections.current[peerId].close();
        delete peerConnections.current[peerId];
      }
      setRemoteStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[peerId];
        return newStreams;
      });
    });

    return () => {
      socket.off('userJoined');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('userLeft');
      endCall();
    };
  }, [roomName, createPeerConnection, endCall]);

  const toggleMute = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
      setIsMuted(prev => !prev);
    }
  };

  const toggleCamera = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
      setIsCameraOff(prev => !prev);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Video Call: {roomName}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 w-full">
        <div className="relative bg-black rounded-md overflow-hidden">
          <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover"></video>
          <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">You</div>
        </div>
        {Object.entries(remoteStreams).map(([peerId, stream]) => (
          <div key={peerId} className="relative bg-black rounded-md overflow-hidden">
            <video autoPlay className="w-full h-full object-cover" ref={(videoElement) => {
              if (videoElement) videoElement.srcObject = stream;
            }}></video>
            <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">{peerId}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        {!isCallActive ? (
          <button onClick={startCall} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Start Call
          </button>
        ) : (
          <>
            <button onClick={toggleMute} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button onClick={toggleCamera} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              {isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
            </button>
            <button onClick={endCall} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              End Call
            </button>
          </>
        )}
      </div>
    </div>
  );
}
