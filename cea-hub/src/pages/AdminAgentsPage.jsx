import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

// --- FINAL AND COMPLETE AdminAgentsPage.jsx ---
function AdminAgentsPage({ session, userRole, agentInfo, handleLogout }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // This single, robust function handles both fetching all agents and searching
  const fetchAgents = async (query = '') => {
    // This check is the key to preventing the error.
    if (!session?.access_token) {
      setLoading(false);
      setError("Authentication token is missing.");
      return;
    }

    setLoading(true);
    setError(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    const endpoint = query
      ? `${backendUrl}/api/admin/search-agents?query=${encodeURIComponent(query)}`
      : `${backendUrl}/api/admin/all-agents`;
      
    try {
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch agent data.');
      }
      
      const data = await response.json();
      setAgents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      // This is guaranteed to run, fixing the stuck loading screen
      setLoading(false);
    }
  };

  // Initial fetch when the component mounts
  useEffect(() => {
    fetchAgents();
  }, [session]); // Dependency on session ensures it re-runs if the user logs in/out

  // Handler for the search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAgents(searchTerm);
  };

  // Placeholder handler for the delete button
  const handleDeleteAgent = (agentId, agentName) => {
    if (window.confirm(`Are you sure you want to delete the agent "${agentName}"? This action cannot be undone.`)) {
      alert(`DELETE functionality for agent ID ${agentId} is not yet implemented.`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-navy">Manage Agents</h1>
            <div className="flex items-center gap-4">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-navy focus:border-navy"
                />
                <button type="submit" className="px-4 py-2 text-white rounded-md bg-navy hover:bg-opacity-90">Search</button>
              </form>
              <Link to="/admin" className="px-4 py-2 text-sm text-white rounded-md bg-navy hover:bg-opacity-90">
                ← Back to Admin Dashboard
              </Link>
            </div>
          </div>

          <div className="overflow-hidden bg-white rounded-lg shadow-md">
            {loading && <p className="p-6 text-center text-gray-500">Loading agent data...</p>}
            {error && <p className="p-6 text-center text-red-500">{error}</p>}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Contact / WhatsApp</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date Joined</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {agents.map(agent => (
                      <tr key={agent.id}>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">{agent.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{agent.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{agent.contact_details || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                agent.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                                {agent.role}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(agent.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                            <Link to={`/admin/agents/edit/${agent.id}`} className="text-blue-600 hover:text-blue-900">
                                Edit
                            </Link>
                            <button onClick={() => handleDeleteAgent(agent.id, agent.name)} className="text-red-600 hover:text-red-900">
                                Delete
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && agents.length === 0 && (
                <p className="p-6 text-center text-gray-500">
                    {searchTerm ? `No agents found for "${searchTerm}".` : "No agents found."}
                </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminAgentsPage;