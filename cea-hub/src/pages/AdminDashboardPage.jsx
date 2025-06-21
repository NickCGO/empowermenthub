import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

// --- FINAL AND CORRECTED AdminDashboardPage.jsx ---
function AdminDashboardPage({ session, userRole, agentInfo, handleLogout }) {

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 text-center text-gray-800 bg-white rounded-lg shadow">
            <h1 className="mb-4 text-3xl font-bold text-navy">Admin Dashboard</h1>
            <p className="mb-8 text-lg">
              Welcome, {agentInfo?.name || 'Admin'}. Use the links below to manage the application.
            </p>

            {/* --- QUICK LINKS (Corrected & Improved) --- */}
            {/* We use a grid to display the links as large, clickable cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {/* Card Link to All Agents */}
              <Link
                to="/admin/agents"
                className="p-6 text-white transition-transform transform rounded-lg shadow-lg bg-navy hover:-translate-y-1"
              >
                <h3 className="text-xl font-bold">Manage Agents</h3>
                <p className="mt-2 text-sm opacity-90">View, search, and edit all agent profiles.</p>
              </Link>

              {/* Card Link to All Sales */}
              <Link
                to="/admin/sales"
                className="p-6 text-white transition-transform transform bg-blue-600 rounded-lg shadow-lg hover:-translate-y-1"
              >
                <h3 className="text-xl font-bold">Review Sales</h3>
                <p className="mt-2 text-sm opacity-90">Approve or reject pending sales submissions.</p>
              </Link>

              {/* Card Link to Payouts */}
              <Link
                to="/admin/payouts"
                className="p-6 text-white transition-transform transform bg-green-600 rounded-lg shadow-lg hover:-translate-y-1"
              >
                <h3 className="text-xl font-bold">Process Payouts</h3>
                <p className="mt-2 text-sm opacity-90">View and complete pending payout requests.</p>
              </Link>

            </div>
            {/* --- End Quick Links --- */}

            {/* Optional: Display user info for verification */}
            {session?.user && (
                <div className="mt-10 text-xs text-gray-500">
                    <p>Session active for: {session.user.email}</p>
                    <p>Current Role: {userRole}</p>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboardPage;