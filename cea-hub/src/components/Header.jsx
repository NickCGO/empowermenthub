import React from 'react';
import { Link, NavLink } from 'react-router-dom';

// --- FINAL AND CORRECTED Header.jsx ---
function Header({ session, userRole, agentInfo, handleLogout }) {
  // Determine if the user has an admin role
  const isAdmin = userRole === 'admin';

  return (
    <header className="flex items-center justify-between p-4 text-white shadow-md bg-navy">
      {/* Left side: Branding */}
      <div className="text-xl font-bold">
        <Link to="/">
          Erudite Agent <span className="text-orange-400">Hub</span>
        </Link>
      </div>

      {/* Right side: Navigation and User Info */}
      <nav className="flex items-center space-x-6">
        {/* Standard Links for all logged-in users */}
        <NavLink to="/" className={({ isActive }) => isActive ? "font-bold" : "hover:text-gray-300"}>
          Dashboard
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? "font-bold" : "hover:text-gray-300"}>
          Profile
        </NavLink>
        
        {/* --- THE FIX: Conditionally render the Search link --- */}
        {/* We will hide this for now as per the requirements */}
        {/* To re-enable it for admins later, change this to: {isAdmin && (...)} */}
        {false && (
             <NavLink to="/search" className={({ isActive }) => isActive ? "font-bold" : "hover:text-gray-300"}>
                Search
             </NavLink>
        )}

        {/* --- Admin-Only Links --- */}
        {isAdmin && (
          <>
            <div className="w-px h-6 bg-gray-500"></div> {/* Vertical separator */}
            <NavLink to="/admin" className={({ isActive }) => isActive ? "font-bold text-yellow-400" : "hover:text-gray-300"}>
              Admin Dashboard
            </NavLink>
            <NavLink to="/admin/agents" className={({ isActive }) => isActive ? "font-bold text-yellow-400" : "hover:text-gray-300"}>
              All Agents
            </NavLink>
            <NavLink to="/admin/sales" className={({ isActive }) => isActive ? "font-bold text-yellow-400" : "hover:text-gray-300"}>
              All Sales
            </NavLink>
          </>
        )}
        
        <div className="w-px h-6 bg-gray-500"></div> {/* Vertical separator */}

        {/* User Info and Logout */}
        <div className="flex items-center space-x-3">
          {/* Display user's profile picture or initials */}
          {agentInfo?.photo_url ? (
            <img src={agentInfo.photo_url} alt="Profile" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="flex items-center justify-center w-8 h-8 bg-gray-500 rounded-full">
              {agentInfo?.name ? agentInfo.name.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          {/* Display user's name */}
          <span>{agentInfo?.name || session?.user?.email}</span>
          {/* Logout Button */}
          <button onClick={handleLogout} className="px-3 py-1 text-sm bg-red-600 rounded-md hover:bg-red-700">
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;