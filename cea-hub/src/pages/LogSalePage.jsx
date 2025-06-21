import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

// --- FINAL AND COMPLETE LogSalePage.jsx ---
function LogSalePage({ session, userRole, agentInfo, handleLogout }) {
  const [saleCount, setSaleCount] = useState('');
  const [saleNames, setSaleNames] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Frontend Validation
    const count = parseInt(saleCount, 10);
    if (isNaN(count) || count <= 0) {
      setError("Please enter a valid number of sales (must be 1 or more).");
      return;
    }
    if (!saleNames.trim()) {
      setError("Please provide the names or details of the sales.");
      return;
    }

    setSubmitting(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

    try {
      const response = await fetch(`${backendUrl}/api/log-sale`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          saleCount: count,
          saleNames: saleNames.trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }
      
      // Success!
      alert('Sale logged successfully!');
      navigate('/'); // Navigate back to the dashboard on success

    } catch (err) {
      console.error("Error submitting sale:", err);
      setError(`Failed to log sale: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} />
      <main className="flex items-center justify-center flex-1 p-4">
        <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-navy">Log a New Sale</h1>

          {error && (
            <div className="p-4 text-center text-red-700 bg-red-100 border border-red-400 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="saleCount" className="block text-sm font-medium text-gray-700">
                How Many Sales:
              </label>
              <input
                id="saleCount"
                name="saleCount"
                type="number"
                min="1"
                value={saleCount}
                onChange={(e) => setSaleCount(e.target.value)}
                required
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-navy focus:border-navy"
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <label htmlFor="saleNames" className="block text-sm font-medium text-gray-700">
                Names of Sales (Customers/Deals):
              </label>
              <textarea
                id="saleNames"
                name="saleNames"
                rows="4"
                value={saleNames}
                onChange={(e) => setSaleNames(e.target.value)}
                required
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-navy focus:border-navy"
                placeholder="e.g., John Doe, Jane Smith..."
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-navy hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Sale'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default LogSalePage;