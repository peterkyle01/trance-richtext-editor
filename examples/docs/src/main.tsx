import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'trance-richtext-editor/styles.css';
import { Analytics } from "@vercel/analytics/next"
import './App.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);
