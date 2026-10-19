import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './i18n/config';
import './styles/index.css';
import { registerServiceWorker } from './registerServiceWorker';

// Register service worker for offline support
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
