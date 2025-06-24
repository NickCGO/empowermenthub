// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Your main App component
import './index.css'; // Your Tailwind CSS file

// Map-related CSS imports (these are correct)
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Find the root HTML element and render the app inside it
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* We render the App component directly. */}
    {/* The Router is now correctly located inside App.jsx */}
    <App />
  </React.StrictMode>,
);