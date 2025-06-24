// src/components/PublicHeader.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const PublicHeader = () => {
  return (
    // --- The only change is here ---
    // Changed from bg-navy-900 to bg-blue-700
    <header className="bg-blue-700 shadow-md"> 
    {/* --------------------------- */}
      <div className="container flex items-center justify-between px-6 py-4 mx-auto">
        <h1 className="text-2xl font-bold text-white">
          Erudite Agent <span className="text-orange-500">Hub</span>
        </h1>
        <nav>
          <Link 
            to="/login" 
            className="px-4 py-2 font-bold text-white transition duration-300 bg-orange-500 rounded hover:bg-orange-600"
          >
            Agent Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default PublicHeader;