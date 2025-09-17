import { Server } from 'socket.io';
import { createServer } from 'http';

const server = createServer();
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
  // Socket.IO 4.7+ feature: connection state recovery
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  }
});

let documentState = '';
const cursors = new Map();

io.on('connection', (socket) => {
  // Send current state to new user
  socket.emit('document-state', documentState);
  socket.emit('cursors-state', Array.from(cursors.values()));

  socket.on('text-change', (data) => {
    documentState = data.content;
    socket.broadcast.emit('text-change', data);
  });

  socket.on('cursor-move', (data) => {
    cursors.set(socket.id, { ...data, id: socket.id });
    socket.broadcast.emit('cursor-move', { ...data, id: socket.id });
  });

  socket.on('disconnect', () => {
    cursors.delete(socket.id);
    socket.broadcast.emit('cursor-remove', socket.id);
  });
});

server.listen(3001, () => console.log('Server running on :3001'));