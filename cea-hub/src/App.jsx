// src/App.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

// Import all page components
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import LogSalePage from './pages/LogSalePage';
import SearchPage from './pages/SearchPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminAgentsPage from './pages/AdminAgentsPage';
import AdminSalesPage from './pages/AdminSalesPage';
import AdminPayoutsPage from './pages/AdminPayoutsPage';
import AdminEditAgentPage from './pages/AdminEditAgentPage';
import AgentFinderPage from './pages/AgentFinderPage';

function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [agentInfo, setAgentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserAndAgentInfo = useCallback(async (user) => {
    if (!user) {
      setUserRole(null);
      setAgentInfo(null);
      return;
    }
    try {
      const { data, error } = await supabase.from('agents').select('role, name, agent_id, photo_url').eq('id', user.id).single();
      if (error && error.code !== 'PGRST116') throw error;
      setUserRole(data?.role || null);
      setAgentInfo(data || null);
    } catch (error) {
      console.error('Error fetching agent info:', error);
      setUserRole(null);
      setAgentInfo(null);
    }
  }, []);

  useEffect(() => {
    const checkInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        if (initialSession) {
          await fetchUserAndAgentInfo(initialSession.user);
        }
      } catch (e) {
        console.error("Error during initial session check:", e);
      } finally {
        setLoading(false);
      }
    };
    checkInitialSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      fetchUserAndAgentInfo(newSession?.user);
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUserAndAgentInfo]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-xl font-bold bg-gray-100">Loading Application...</div>;
  }

  const ProtectedRoute = ({ children }) => {
    if (!session) return <Navigate to="/login" replace />;
    return children;
  };
  
  const AdminRoute = ({ children }) => {
    if (!session) return <Navigate to="/login" replace />;
    if (userRole !== 'admin') return <Navigate to="/" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!session ? <RegisterPage /> : <Navigate to="/" replace />} />
          <Route path="/find-agent" element={<AgentFinderPage />} />

          {/* Protected Agent Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardPage session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="/log-sale" element={<ProtectedRoute><LogSalePage session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} /></ProtectedRoute>} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} /></AdminRoute>} />
          
          {/* THIS IS THE LINE I FIXED */}
          <Route path="/admin/agents" element={<AdminRoute><AdminAgentsPage session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} /></AdminRoute>} />

          <Route path="/admin/sales" element={<AdminRoute><AdminSalesPage session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} /></AdminRoute>} />
          <Route path="/admin/payouts" element={<AdminRoute><AdminPayoutsPage session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} /></AdminRoute>} />
          <Route path="/admin/agents/edit/:agentId" element={<AdminRoute><AdminEditAgentPage session={session} userRole={userRole} agentInfo={agentInfo} handleLogout={handleLogout} /></AdminRoute>} />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;