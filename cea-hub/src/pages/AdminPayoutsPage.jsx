import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

function AdminPayoutsPage({ session, userRole, agentInfo, handleLogout }) {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchPayouts = async () => {
    if (!session?.access_token) { setLoading(false); setError("Authentication token missing."); return; }
    setLoading(true);
    setError(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    try {
      const response = await fetch(`${backendUrl}/api/admin/all-payouts`, { headers: { 'Authorization': `Bearer ${session.access_token}` } });
      if (!response.ok) throw new Error('Failed to fetch payout requests.');
      const data = await response.json();
      setPayouts(data);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { fetchPayouts(); }, [session]);

  const updatePayoutStatus = async (payoutId, newStatus) => {
    const action = newStatus === 'approved' ? 'approve' : 'complete';
    if (!window.confirm(`Are you sure you want to ${action} this payout request?`)) return;
    const endpoint = `${action}-payout`;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    try {
      const response = await fetch(`${backendUrl}/api/admin/${endpoint}/${payoutId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error(`Failed to update status.`);
      setPayouts(payouts.map(p => p.id === payoutId ? { ...p, status: newStatus } : p));
    } catch (err) { setError(`Error updating payout: ${err.message}`); }
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'approved') return 'bg-blue-100 text-blue-800';
    if (status === 'requested') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const filteredPayouts = payouts.filter(p => filter === 'all' || p.status === filter);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-navy">Manage Payouts</h1>
            {/* Filter buttons can go here */}
          </div>
          <div className="overflow-hidden bg-white rounded-lg shadow-md">
            {loading && <p className="p-6 text-center">Loading payout requests...</p>}
            {error && <p className="p-6 text-center text-red-500">{error}</p>}
            {!loading && !error && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Agent</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Included Sales</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayouts.map(p => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{p.agent?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{p.agent?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 font-bold whitespace-nowrap">R{p.amount_requested.toFixed(2)}</td>
                      <td className="max-w-xs px-6 py-4 text-sm text-gray-500 truncate" title={p.sales_data}>{p.sales_data}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs font-semibold rounded-full ${getStatusColor(p.status)}`}>{p.status}</span></td>
                      <td className="px-6 py-4 space-y-1 whitespace-nowrap">
                        {p.status === 'requested' && <button onClick={() => updatePayoutStatus(p.id, 'approved')} className="w-full px-3 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700">Approve</button>}
                        {p.status === 'approved' && <button onClick={() => updatePayoutStatus(p.id, 'completed')} className="w-full px-3 py-1 text-xs text-white bg-green-600 rounded-md hover:bg-green-700">Mark as Paid</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && filteredPayouts.length === 0 && <p className="p-6 text-center text-gray-500">No payout requests found.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
export default AdminPayoutsPage;