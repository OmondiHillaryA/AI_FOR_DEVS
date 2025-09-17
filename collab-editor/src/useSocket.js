import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useSocket(handlers) {
  const socketRef = useRef();

  useEffect(() => {
    // Socket.IO 4.7+ with connection state recovery
    socketRef.current = io('http://localhost:3001', {
      autoConnect: true,
      // Latest feature: automatic reconnection with state recovery
      forceNew: false
    });

    const socket = socketRef.current;

    socket.on('text-change', handlers.onTextChange);
    socket.on('cursor-move', handlers.onCursorMove);
    socket.on('cursor-remove', handlers.onCursorRemove);
    socket.on('document-state', handlers.onDocumentState);
    socket.on('cursors-state', handlers.onCursorsState);

    return () => socket.disconnect();
  }, []);

  return {
    sendTextChange: (data) => socketRef.current?.emit('text-change', data),
    sendCursorMove: (data) => socketRef.current?.emit('cursor-move', data)
  };
}