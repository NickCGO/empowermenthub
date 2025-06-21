// src/components/ChatbotWidget.jsx

import React, { useState, useEffect } from 'react';

function ChatbotWidget() {
  // State to control whether the chat window is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // This useEffect hook safely loads the JotForm scripts after the component mounts
  useEffect(() => {
    // Create the first script element for the JotForm library
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
    script1.async = true;
    document.body.appendChild(script1);

    // Create the second script element for initializing the handler
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.jotformEmbedHandler("iframe[id='JotFormIFrame-01978f8998ca727aba09a21b2913cba2c884']", "https://eu.jotform.com");
    `;
    document.body.appendChild(script2);

    // Cleanup function: remove the scripts when the component unmounts
    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []); // The empty array ensures this effect runs only once

  return (
    // This main div is the fixed container for the entire widget
    <div className="fixed z-50 bottom-5 right-5">
      {/* The Chat Window: only shown if 'isOpen' is true */}
      {isOpen && (
        <div className="w-[350px] h-[600px] bg-white rounded-lg shadow-2xl flex flex-col">
          {/* Header with a close button */}
          <div className="flex items-center justify-between p-2 rounded-t-lg bg-navy">
            <h3 className="text-sm font-semibold text-white">Empowerment Emile</h3>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white hover:text-gray-300"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* The JotForm IFrame */}
          <iframe
            id="JotFormIFrame-01978f8998ca727aba09a21b2913cba2c884"
            title="Empowerment Emile: Marketing Coach"
            allow="geolocation; microphone; camera; fullscreen"
            src="https://eu.jotform.com/agent/01978f8998ca727aba09a21b2913cba2c884?embedMode=iframe&background=1&shadow=1"
            frameBorder="0"
            style={{ width: '100%', height: '100%', border: 'none' }}
            scrolling="no"
          ></iframe>
        </div>
      )}

      {/* The Chat Bubble Button: always visible unless the chat is open */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-16 h-16 text-white transition-transform transform rounded-full shadow-xl cursor-pointer bg-navy hover:bg-opacity-90 hover:scale-110"
          aria-label="Open chat"
        >
          {/* Chat Icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default ChatbotWidget;