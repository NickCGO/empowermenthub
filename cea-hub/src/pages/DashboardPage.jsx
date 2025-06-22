import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

// --- FINAL AND COMPLETE DashboardPage.jsx ---
function DashboardPage({ session, userRole, agentInfo, handleLogout }) {
  const [topPerformers, setTopPerformers] = useState([]);
  const [mySalesSummary, setMySalesSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New state specifically for the payout button
  const [payoutLoading, setPayoutLoading] = useState(false);
  const navigate = useNavigate();

  const rewardTiers = [
    { level: 'Bronze', sales: '0-10', rewardPer: 'R200', benefits: ['Welcome certificate', 'Recognition in group'] },
    { level: 'Silver', sales: '11-20', rewardPer: 'R400', benefits: ['All Bronze rewards', 'Priority support'] },
    { level: 'Gold', sales: '21+', rewardPer: 'R400', benefits: ['All Silver rewards', 'Free Erudite Projects course', 'Featured profile on website/socials', 'Eligible for special contests'] },
  ];

  const getUserLevel = (confirmedSales) => {
    if (confirmedSales === null || confirmedSales === undefined) return 'N/A';
    if (confirmedSales >= 21) return 'Gold';
    if (confirmedSales >= 11) return 'Silver';
    return 'Bronze';
  };

  const getLevelProgress = (confirmedSales) => {
    if (confirmedSales === null || confirmedSales === undefined) return 0;
    if (confirmedSales >= 21) return 100;
    if (confirmedSales >= 11) return ((confirmedSales - 10) / 10) * 100;
    return (confirmedSales / 10) * 100;
  };

  const fetchDashboardData = async () => {
    const userId = session?.user?.id;
    if (!userId) { setLoading(false); setError("User session not found."); return; }
    
    setLoading(true);
    setError(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    
    try {
      const [salesRes, topPerformersRes] = await Promise.all([
        fetch(`${backendUrl}/api/get-agent-sales/${userId}`),
        fetch(`${backendUrl}/api/get-top-performers`)
      ]);
      if (!salesRes.ok) throw new Error(`HTTP error fetching sales! Status: ${salesRes.status}`);
      if (!topPerformersRes.ok) throw new Error(`HTTP error fetching top performers! Status: ${topPerformersRes.status}`);
      const salesData = await salesRes.json();
      const topPerformersData = await topPerformersRes.json();
      setMySalesSummary(salesData);
      setTopPerformers(topPerformersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Script handling for JotForm
    const loadJotform = () => {
        if (window.jotformEmbedHandler) {
            window.jotformEmbedHandler("iframe[id='JotFormIFrame-01978f8998ca727aba09a21b2913cba2c884']", "https://eu.jotform.com");
            return;
        }
        if (!document.getElementById('jotform-embed-handler')) {
            const script1 = document.createElement('script');
            script1.id = 'jotform-embed-handler';
            script1.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
            script1.async = true;
            script1.onload = () => {
                if (window.jotformEmbedHandler) {
                    window.jotformEmbedHandler("iframe[id='JotFormIFrame-01978f8998ca727aba09a21b2913cba2c884']", "https://eu.jotform.com");
                }
            };
            document.body.appendChild(script1);
        }
    };
    loadJotform();
  }, [session?.user?.id]);

  const handleRequestPayout = async () => {
    if (!mySalesSummary || mySalesSummary.confirmed_sales === 0) {
      alert("You have no confirmed sales to request a payout for.");
      return;
    }
    if (!window.confirm(`Request payout for ${mySalesSummary.amount_earned}? This will submit all your currently confirmed sales for review.`)) {
      return;
    }

    setPayoutLoading(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    try {
      const response = await fetch(`${backendUrl}/api/request-payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}), // Body is empty as backend calculates everything
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit payout request.');
      }
      
      alert("Payout request submitted successfully! Your confirmed sales are now pending review.");
      fetchDashboardData(); // Re-fetch the data to update the dashboard
      
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setPayoutLoading(false);
    }
  };

  return (
    
    <div className="flex flex-col h-screen bg-gray-100">
      <Header session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} />
      <main className="flex-1 p-8 overflow-y-auto">
        {loading && <div className="flex items-center justify-center h-full"><p className="text-xl text-gray-500">Loading dashboard data...</p></div>}
        {error && <div className="flex items-center justify-center h-full"><p className="text-xl text-red-500">{error}</p></div>}
        {!loading && !error && (
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-grow space-y-8 lg:w-2/3">
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Top 10 Performers</h2>
                {topPerformers.length > 0 ? (
                  <table className="min-w-full bg-white">
                    <thead><tr><th className="px-4 py-2 text-left text-gray-600 border-b">Rank</th><th className="px-4 py-2 text-left text-gray-600 border-b">Name</th><th className="px-4 py-2 text-left text-gray-600 border-b">Agent ID</th><th className="px-4 py-2 text-left text-gray-600 border-b">Confirmed Sales</th></tr></thead>
                    <tbody>{topPerformers.map((p) => (<tr key={p.id}><td className="px-4 py-2 font-semibold border-b">{p.rank}</td><td className="px-4 py-2 border-b">{p.name}</td><td className="px-4 py-2 border-b">{p.agent_internal_id}</td><td className="px-4 py-2 border-b">{p.confirmed_sales}</td></tr>))}</tbody>
                  </table>
                ) : (<p className="text-center text-gray-500">No top performers yet.</p>)}
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">My Sales Summary</h2>
                {mySalesSummary ? (
                  <>
                    <table className="min-w-full bg-white">
                      <thead><tr><th className="px-4 py-2 text-left text-gray-600 border-b">Period</th><th className="px-4 py-2 text-left text-gray-600 border-b">Pending</th><th className="px-4 py-2 text-left text-gray-600 border-b">Confirmed</th><th className="px-4 py-2 text-left text-gray-600 border-b">Amount Earned</th><th className="px-4 py-2 text-left text-gray-600 border-b">Action</th></tr></thead>
                      <tbody><tr><td className="px-4 py-2 border-b">{mySalesSummary.period}</td><td className="px-4 py-2 border-b">{mySalesSummary.pending_sales}</td><td className="px-4 py-2 border-b">{mySalesSummary.confirmed_sales}</td><td className="px-4 py-2 border-b">{mySalesSummary.amount_earned}</td>
                        <td className="px-4 py-2 border-b">
                          <button onClick={handleRequestPayout} disabled={payoutLoading || mySalesSummary.confirmed_sales === 0} className="px-3 py-1 text-sm text-white rounded-md bg-navy hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {payoutLoading ? 'Submitting...' : 'Request Payout'}
                          </button>
                        </td>
                      </tr></tbody>
                    </table>
                    <div className="overflow-x-auto">
  {/* Your table or wide content */}
</div>
                    <div className="mt-6">
                      <h3 className="mb-2 font-semibold text-gray-800 text-md">Your Level: {getUserLevel(mySalesSummary.confirmed_sales)}</h3>
                      <div className="w-full h-2 bg-gray-200 rounded-full"><div className="h-2 rounded-full bg-navy" style={{ width: `${getLevelProgress(mySalesSummary.confirmed_sales)}%` }}></div></div>
                      <p className="mt-1 text-sm text-right text-gray-600">Progress towards next level</p>
                    </div>
                  </>
                ) : (<p className="text-center text-gray-500">No sales summary data available.</p>)}
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Actions</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Link to="/log-sale" className="block w-full px-4 py-3 text-center text-white rounded-lg shadow-md bg-navy hover:bg-opacity-90">Log a New Sale</Link>
                    <a href="YOUR_WHATSAPP_GROUP_LINK" target="_blank" rel="noopener noreferrer" className="block w-full px-4 py-3 text-center text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600">Join WhatsApp</a>
                    <a href="YOUR_GOOGLE_DRIVE_LINK" target="_blank" rel="noopener noreferrer" className="block w-full px-4 py-3 text-center text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600">Get Resources</a>
                </div>
              </div>

              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-800">Reward Levels</h2>
                <table className="min-w-full bg-white border border-gray-200">
                  <thead><tr><th className="px-4 py-2 text-left text-gray-600 border-b">Level</th><th className="px-4 py-2 text-left text-gray-600 border-b">Sales Referred</th><th className="px-4 py-2 text-left text-gray-600 border-b">Reward per Reg.</th><th className="px-4 py-2 text-left text-gray-600 border-b">Extra Benefits</th></tr></thead>
                  <tbody>{rewardTiers.map((tier) => (<tr key={tier.level}><td className="px-4 py-2 font-semibold border-b">{tier.level}</td><td className="px-4 py-2 border-b">{tier.sales}</td><td className="px-4 py-2 border-b">{tier.rewardPer}</td><td className="px-4 py-2 text-sm border-b"><ul className="list-disc list-inside space-y-0.5">{tier.benefits.map((benefit, index) => <li key={index}>{benefit}</li>)}</ul></td></tr>))}</tbody>
                </table>
              </div>
            </div>

            <div className="lg:w-1/3">
              <div className="p-6 bg-white rounded-lg shadow h-[680px] flex flex-col">
                <h2 className="mb-4 text-lg font-semibold text-gray-800 shrink-0">Empowerment Emile: Coach</h2>
                <div className="flex-grow w-full h-full">
                  <iframe key={session.user.id} id="JotFormIFrame-01978f8998ca727aba09a21b2913cba2c884" title="Empowerment Emile: Marketing Coach" allow="geolocation; microphone; camera; fullscreen" src="https://eu.jotform.com/agent/01978f8998ca727aba09a21b2913cba2c884?embedMode=iframe&background=1&shadow=0&headerColor=1A237E" frameBorder="0" style={{ width: '100%', height: '100%', border: 'none' }} scrolling="no"></iframe>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;