import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// React 18: Concurrent rendering with createRoot
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);