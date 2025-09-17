# Real-time Collaborative Code Editor

## Latest Library Features Used

### React 18 Concurrent Features
- **useTransition**: Non-blocking state updates for text changes
- **useDeferredValue**: Defers expensive cursor position updates
- **startTransition**: Marks updates as non-urgent
- **createRoot**: Concurrent rendering engine

### Socket.IO 4.7+ Features
- **Connection State Recovery**: Automatic reconnection with state preservation
- **Enhanced CORS**: Improved cross-origin handling
- **Performance Optimizations**: Reduced memory usage

## Key Benefits

1. **Smooth UI**: Concurrent features prevent blocking during heavy updates
2. **Resilient Connections**: Auto-recovery maintains session state
3. **Real-time Sync**: Instant collaboration across multiple users
4. **Performance**: Deferred updates optimize rendering

## Usage

```bash
# Terminal 1: Start server
npm run server

# Terminal 2: Start client
npm run dev
```

Open multiple browser tabs to test real-time collaboration.