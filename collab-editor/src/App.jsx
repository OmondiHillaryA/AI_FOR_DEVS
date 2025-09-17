import { useState, useTransition, useDeferredValue, startTransition } from 'react';
import { useSocket } from './useSocket';

export default function App() {
  const [content, setContent] = useState('');
  const [cursors, setCursors] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  // React 18: Defer expensive cursor updates
  const deferredCursors = useDeferredValue(cursors);
  
  const { sendTextChange, sendCursorMove } = useSocket({
    onTextChange: (data) => {
      startTransition(() => setContent(data.content));
    },
    onCursorMove: (data) => {
      setCursors(prev => [...prev.filter(c => c.id !== data.id), data]);
    },
    onCursorRemove: (id) => {
      setCursors(prev => prev.filter(c => c.id !== id));
    },
    onDocumentState: setContent,
    onCursorsState: setCursors
  });

  const handleTextChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    sendTextChange({ content: newContent });
  };

  const handleCursorMove = (e) => {
    const position = e.target.selectionStart;
    sendCursorMove({ position, color: '#3b82f6' });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Collaborative Editor {isPending && '⏳'}</h2>
      <textarea
        value={content}
        onChange={handleTextChange}
        onSelect={handleCursorMove}
        style={{
          width: '100%',
          height: '400px',
          fontSize: '14px',
          fontFamily: 'monospace',
          position: 'relative'
        }}
        placeholder="Start typing..."
      />
      <div>
        Active cursors: {deferredCursors.length}
        {deferredCursors.map(cursor => (
          <span key={cursor.id} style={{ color: cursor.color, marginLeft: '10px' }}>
            ●
          </span>
        ))}
      </div>
    </div>
  );
}