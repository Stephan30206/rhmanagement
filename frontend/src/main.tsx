import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './constants/App.tsx';
import reportWebVitals from './constants/reportWebVitals.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
    const root = createRoot(rootElement);

    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error('Failed to find the root element');
}

// Mesure des performances (optionnel)
reportWebVitals();