import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Chat from './Chat';

export default function ChatPage({ socket }) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const recipient = queryParams.get('recipient');
  const [chatRecipient, setChatRecipient] = useState(recipient);

  useEffect(() => {
    setChatRecipient(recipient);
  }, [recipient]);

  return (
    <div className="flex-grow p-4 h-full mt-4">
      {/* <h2 className="text-2xl font-bold mb-4">Chat {chatRecipient ? `with ${chatRecipient}` : ''}</h2> */}
      <Chat recipient={chatRecipient} socket={socket} />
    </div>
  );
}
