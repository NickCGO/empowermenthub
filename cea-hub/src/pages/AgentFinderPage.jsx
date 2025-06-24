// src/pages/AgentFinderPage.jsx

import React, { useState, useEffect } from 'react';
import PublicHeader from '../components/PublicHeader';
import AgentMap from '../components/AgentMap';
import { provinceData } from '../utils/geodata';
import NoticeBanner from '../components/NoticeBanner';

const AgentFinderPage = () => {
  const [provinceQuery, setProvinceQuery] = useState('');
  const [agents, setAgents] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [mapView, setMapView] = useState({
    key: 'default',
    center: [-29.0, 24.0],
    zoom: 5,
  });
  
  // --- THIS IS THE FIX ---
  // We get the backend URL from our environment variables.
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchAllAgents = async () => {
      try {
        // Use the full backend URL for the fetch call
        const response = await fetch(`${backendUrl}/api/public/all-agents`);
        if (!response.ok) throw new Error('Failed to load initial agent data.');
        const data = await response.json();
        setAllAgents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllAgents();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!provinceQuery.trim()) {
      setHasSearched(false);
      setAgents([]);
      setMapView({ key: 'default-reset', center: [-29.0, 24.0], zoom: 5 });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAgents([]);
    setHasSearched(true);

    try {
      // Use the full backend URL for the fetch call here as well
      const response = await fetch(`${backendUrl}/api/public/agents?province=${encodeURIComponent(provinceQuery)}`);
      if (!response.ok) throw new Error('Something went wrong.');
      const data = await response.json();
      setAgents(data);

      const searchProvince = provinceQuery.trim().toLowerCase();
      if (data.length > 0 && provinceData[searchProvince]) {
        setMapView({ key: searchProvince, center: provinceData[searchProvince].center, zoom: provinceData[searchProvince].zoom });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // The entire return (...) JSX block is unchanged.
  return (
    <div className="min-h-screen bg-gray-100">
      <PublicHeader />
      <NoticeBanner />
      <main className="container p-6 mx-auto md:p-8">
        <div className="max-w-4xl p-8 mx-auto bg-white rounded-lg shadow-lg">
          <h2 className="mb-2 text-3xl font-bold text-navy-900">Find a Community Agent</h2>
          <p className="mb-6 text-gray-600">Enter a province to find an agent near you.</p>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                type="text"
                value={provinceQuery}
                onChange={(e) => setProvinceQuery(e.target.value)}
                placeholder="e.g., Gauteng, Western Cape"
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 font-bold text-white transition duration-300 rounded-md bg-navy-700 hover:bg-navy-800 disabled:bg-gray-400"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
               <h3 className="mb-4 text-2xl font-bold text-navy-900">Agent Locations</h3>
               <AgentMap 
                 key={mapView.key}
                 agents={hasSearched ? agents : allAgents}
                 center={mapView.center}
                 zoom={mapView.zoom}
               />
            </div>
            <div>
              <h3 className="mb-4 text-2xl font-bold text-navy-900">Search Results</h3>
              {error && <p className="text-red-500">{error}</p>}
              
              {!isLoading && hasSearched && agents.length === 0 && !error && (
                <div className="p-4 text-gray-500 rounded-md bg-gray-50">No agents found for this province.</div>
              )}
              
              {agents.length > 0 && (
                <ul className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
                  {agents.map((agent) => (
                    <li key={agent.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-start gap-4">
                      <img
                        src={agent.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=f97316&color=fff&size=80`}
                        alt={`${agent.name}'s profile picture`}
                        className="w-20 h-20 rounded-full object-cover border-2 border-orange-500"
                      />
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-navy-800">{agent.name}</h4>
                        <p className="text-sm text-gray-500 mb-2">{agent.town}, {agent.province}</p>
                        
                        {agent.about_me && (
                          <p className="text-gray-700 text-sm mb-3">{agent.about_me}</p>
                        )}

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                          {agent.contact_details && (
                            <a href={`https://wa.me/${agent.contact_details.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-600 hover:underline">WhatsApp</a>
                          )}
                          {agent.email && (
                            <a href={`mailto:${agent.email}`} className="font-semibold text-navy-700 hover:underline">Email</a>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentFinderPage;