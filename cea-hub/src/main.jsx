import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Your main App component
import './index.css'; // Your Tailwind CSS file
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter

// Find the root HTML element and render the app inside it
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the main App component with Router */}
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
);