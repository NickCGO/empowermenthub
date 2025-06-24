// src/components/NoticeBanner.jsx

import React from 'react';

const NoticeBanner = () => {
  return (
    <div className="p-4 text-orange-800 bg-orange-100 border-l-4 border-orange-500" role="alert">
      <p className="font-bold">Important Payment Information</p>
      <p className="text-sm">
        Always use our banking details for payments when you register:
      </p>
      <div className="p-3 mt-2 text-sm rounded-md bg-orange-50">
        <p><strong>Bank:</strong> FNB</p>
        <p><strong>Account Name:</strong> ERUDITE PROJECTS</p>
        <p><strong>Account Number:</strong> 62826532980</p>
        <p><strong>Branch Code:</strong> 250655</p>
        <p><strong>Reference:</strong> Your Name & Surname</p>
      </div>
    </div>
  );
};

export default NoticeBanner;