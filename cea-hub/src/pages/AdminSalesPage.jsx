import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

// --- FINAL AND COMPLETE AdminSalesPage.jsx ---
function AdminSalesPage({ session, userRole, agentInfo, handleLogout }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // State for filtering: 'all', 'pending', 'confirmed', 'rejected'

  const fetchAllSales = async () => {
    if (!session?.access_token) {
      setError("Authentication token not found. Please log in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    
    try {
      const response = await fetch(`${backendUrl}/api/admin/all-sales`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch sales data.');
      }
      const data = await response.json();
      setSales(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSales();
  }, [session]);

  // Generic function to handle both approving and rejecting sales
  const updateSaleStatus = async (saleId, newStatus) => {
    const action = newStatus === 'confirmed' ? 'approve' : 'reject';
    const endpoint = `${action}-sale`;
    
    if (!window.confirm(`Are you sure you want to ${action} this sale?`)) return;

    setError(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    try {
      const response = await fetch(`${backendUrl}/api/admin/${endpoint}/${saleId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error(`Failed to ${action} sale.`);
      
      // Update state locally for instant UI feedback
      setSales(currentSales => 
        currentSales.map(s => s.id === saleId ? { ...s, status: newStatus } : s)
      );
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  // Filtered sales based on the selected filter state
  const filteredSales = sales.filter(sale => {
    if (filter === 'all') return true;
    return sale.status === filter;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-navy">All Sales Data</h1>
            <div className="flex items-center gap-4">
              {/* Filter Buttons */}
              <div className="flex p-1 space-x-1 bg-gray-200 rounded-md">
                <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-white shadow' : 'hover:bg-gray-100'}`}>All</button>
                <button onClick={() => setFilter('pending')} className={`px-3 py-1 text-sm rounded-md ${filter === 'pending' ? 'bg-white shadow' : 'hover:bg-gray-100'}`}>Pending</button>
                <button onClick={() => setFilter('confirmed')} className={`px-3 py-1 text-sm rounded-md ${filter === 'confirmed' ? 'bg-white shadow' : 'hover:bg-gray-100'}`}>Confirmed</button>
                <button onClick={() => setFilter('rejected')} className={`px-3 py-1 text-sm rounded-md ${filter === 'rejected' ? 'bg-white shadow' : 'hover:bg-gray-100'}`}>Rejected</button>
              </div>
              <Link to="/admin" className="px-4 py-2 text-sm text-white rounded-md bg-navy hover:bg-opacity-90">
                ← Back to Admin Dashboard
              </Link>
            </div>
          </div>

          <div className="overflow-hidden bg-white rounded-lg shadow-md">
            {loading && <p className="p-6 text-center text-gray-500">Loading sales data...</p>}
            {error && <p className="p-6 text-center text-red-500">{`Failed to load sales data: ${error}`}</p>}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Agent Name</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Agent ID</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Sale Count</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Customer/Deal Info</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSales.map(sale => (
                      <tr key={sale.id}>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{new Date(sale.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">{sale.agent?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{sale.agent?.agent_id || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{sale.sale_count}</td>
                        <td className="max-w-xs px-6 py-4 text-sm text-gray-600 truncate" title={sale.sale_names}>{sale.sale_names}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            sale.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            sale.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {sale.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                          {sale.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => updateSaleStatus(sale.id, 'confirmed')} 
                                className="px-3 py-1 text-xs text-white bg-green-600 rounded-md hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => updateSaleStatus(sale.id, 'rejected')} 
                                className="px-3 py-1 text-xs text-white bg-red-600 rounded-md hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && filteredSales.length === 0 && (
                <p className="p-6 text-center text-gray-500">
                    {filter === 'all' ? 'No sales have been logged yet.' : `No ${filter} sales found.`}
                </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminSalesPage;