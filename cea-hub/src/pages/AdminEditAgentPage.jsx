import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';

// --- FINAL AND CORRECTED AdminEditAgentPage.jsx ---
function AdminEditAgentPage({ session, userRole, agentInfo, handleLogout }) {
  const { agentId } = useParams();
  
  const [agentProfile, setAgentProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // --- THIS useEffect IS NOW BULLETPROOF ---
  useEffect(() => {
    // This function will be called once we have the necessary data
    const fetchAgentDetails = async () => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      try {
        const response = await fetch(`${backendUrl}/api/admin/get-agent-details/${agentId}`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch agent details.');
        }

        const data = await response.json();
        setAgentProfile(data);
        setFormData(data); // Pre-fill the form with all fetched data
      } catch (err) {
        setError(err.message);
      } finally {
        // This finally block is now guaranteed to run
        setLoading(false);
      }
    };

    // We check for the required props here.
    if (agentId && session?.access_token) {
      fetchAgentDetails();
    } else {
      // If props are missing, we immediately stop loading and show an error.
      setLoading(false);
      setError("Agent ID or authentication token is missing.");
    }
  }, [agentId, session]); // Dependency array is correct

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage('');
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    try {
      const response = await fetch(`${backendUrl}/api/admin/update-agent-details/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save changes.');
      setSuccessMessage('Agent details updated successfully!');
      setAgentProfile(result.data);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };
  
  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) { setError("Password must be at least 6 characters long."); return; }
    if (!window.confirm("Are you sure you want to change this agent's password?")) return;
    setSaving(true);
    setError(null);
    setSuccessMessage('');
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    try {
        const response = await fetch(`${backendUrl}/api/admin/update-agent-auth/${agentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
            body: JSON.stringify({ new_password: newPassword }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to change password.');
        setSuccessMessage(result.message);
        setNewPassword('');
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><p className="text-xl">Loading agent details...</p></div>;
  if (error) return <div className="flex items-center justify-center h-screen"><p className="text-xl text-red-500">{error}</p></div>;
  if (!agentProfile) return <div className="flex items-center justify-center h-screen"><p className="text-xl">Agent not found.</p></div>;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link to="/admin/agents" className="text-sm text-blue-600 hover:underline">← Back to All Agents</Link>
          </div>
          <h1 className="mt-2 mb-6 text-3xl font-bold text-navy">Edit Agent: {agentProfile.name}</h1>
          
          {successMessage && <div className="p-3 mb-4 text-green-800 bg-green-100 border border-green-300 rounded-md">{successMessage}</div>}
          
          <form onSubmit={handleSaveChanges} className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="pb-2 mb-4 text-xl font-semibold border-b">Profile Information</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Object.keys(formData).map(key => {
                if (key === 'id' || key === 'created_at') return null;
                const isReadOnly = key === 'email' || key === 'agent_id';
                return (
                  <div key={key}>
                    <label htmlFor={key} className="block text-sm font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}</label>
                    <input
                      type={key === 'training_completed' ? 'checkbox' : 'text'}
                      id={key}
                      name={key}
                      checked={key === 'training_completed' ? formData[key] : undefined}
                      value={key !== 'training_completed' ? (formData[key] || '') : undefined}
                      onChange={handleInputChange}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-navy focus:border-navy ${isReadOnly ? 'bg-gray-100' : ''}`}
                    />
                  </div>
                )
              })}
            </div>
            <button type="submit" disabled={saving} className="px-5 py-2 mt-6 font-bold text-white rounded-md bg-navy hover:bg-opacity-90 disabled:bg-gray-400">
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>

          <div className="p-6 mt-8 bg-white border-t-4 border-red-500 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-red-700">Admin Actions</h2>
            <p className="mt-1 text-sm text-gray-600">These actions are immediate and cannot be undone.</p>
            <div className="mt-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Change Agent's Password</label>
              <div className="flex flex-col gap-2 mt-1 sm:flex-row sm:items-center">
                <input 
                    id="newPassword" type="text" placeholder="Enter new password (min. 6 characters)"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-navy focus:border-navy"
                />
                <button onClick={handleChangePassword} disabled={saving || !newPassword} className="px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400">
                  {saving ? 'Updating...' : 'Set New Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminEditAgentPage;