import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import { FaVideo, FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';

const socket = io('https://the-news-ledger.onrender.com');

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default function VideoCall({ roomName, callerSignal }) {
  const localVideoRef = useRef();
  const peerConnections = useRef({});
  const localStream = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [usernames, setUsernames] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const createPeerConnection = useCallback(async (peerId, username) => {
    const pc = new RTCPeerConnection(servers);
    peerConnections.current[peerId] = pc;

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.current);
      });
    }

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => ({ ...prev, [peerId]: event.streams[0] }));
      setUsernames((prev) => ({ ...prev, [peerId]: username }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate, roomName, peerId);
      }
    };

    pc.onnegotiationneeded = async () => {
      if (pc.signalingState === 'stable') {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', offer, roomName, peerId);
        } catch (err) {
          console.error('Error creating offer:', err);
        }
      }
    };

    return pc;
  }, [roomName]);

  const startCall = useCallback(async () => {
    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }
      socket.emit('joinRoom', roomName);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  }, [roomName]);

  const endCall = useCallback(() => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    setRemoteStreams({});
    setUsernames({});
    socket.emit('leaveRoom', roomName);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, [roomName]);

  useEffect(() => {
    startCall();

    socket.on('userJoined', async ({ peerId, username }) => {
      await createPeerConnection(peerId, username);
    });

    socket.on('offer', async (offer, { peerId, username }) => {
      const pc = await createPeerConnection(peerId, username);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', answer, roomName, peerId);
    });

    socket.on('answer', async (answer, { peerId }) => {
      const pc = peerConnections.current[peerId];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('ice-candidate', async (candidate, { peerId }) => {
      const pc = peerConnections.current[peerId];
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on('userLeft', (peerId) => {
      if (peerConnections.current[peerId]) {
        peerConnections.current[peerId].close();
        delete peerConnections.current[peerId];
      }
      setRemoteStreams((prev) => {
        const { [peerId]: _, ...rest } = prev;
        return rest;
      });
      setUsernames((prev) => {
        const { [peerId]: _, ...rest } = prev;
        return rest;
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
  }, [roomName, createPeerConnection, endCall, startCall]);

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
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex-grow relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full p-4">
          <AnimatePresence>
            <motion.div
              key="local-video"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
            >
              <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover"></video>
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm font-semibold">You</div>
            </motion.div>
            {Object.entries(remoteStreams).map(([peerId, stream]) => (
              <motion.div
                key={peerId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
              >
                <video
                  autoPlay
                  className="w-full h-full object-cover"
                  ref={(videoElement) => {
                    if (videoElement) videoElement.srcObject = stream;
                  }}
                ></video>
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm font-semibold">
                  {usernames[peerId] || 'Guest'}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div className="bg-gray-800 p-4 flex justify-center items-center">
        <div className="flex items-center gap-4">
          <button onClick={toggleMute} className={`p-3 rounded-full transition-all duration-300 ${isMuted ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
            {isMuted ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
          </button>
          <button onClick={toggleCamera} className={`p-3 rounded-full transition-all duration-300 ${isCameraOff ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
            {isCameraOff ? <FaVideoSlash size={20} /> : <FaVideo size={20} />}
          </button>
          <button onClick={endCall} className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-transform transform hover:scale-105">
            <FaPhoneSlash size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
