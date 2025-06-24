// src/components/AgentMap.jsx

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { getAgentCoordinates, provinceData } from '../utils/geodata';
import L from 'leaflet';

// This function for creating the red pin markers is perfect, so we keep it.
const createCustomMarkerIcon = (agent) => {
  const photoUrl = agent.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=4338ca&color=fff&size=64`;
  const clipId = `clip-${agent.id}`;

  const iconHtml = `
    <svg width="48" height="58" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="${clipId}"><circle cx="16" cy="16" r="12"/></clipPath></defs>
      <path d="M16 42C16 42 32 26 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 26 16 42 16 42Z" fill="#EF4444"/>
      <circle cx="16" cy="16" r="14" fill="white"/>
      <image href="${photoUrl}" width="24" height="24" x="4" y="4" clip-path="url(#${clipId})" />
    </svg>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-svg-marker',
    iconSize: [48, 58],
    iconAnchor: [24, 58], 
    popupAnchor: [0, -60] 
  });
};

const AgentMap = ({ agents, center, zoom }) => {
  // This intelligent scattering logic is also perfect, so we keep it.
  const getAgentPosition = (agent) => {
    let position = getAgentCoordinates(agent);
    if (position) return position;

    if (agent.province) {
      const provinceName = agent.province.toLowerCase().trim();
      const pData = provinceData[provinceName];
      if (pData && pData.bounds) {
        const { minLat, maxLat, minLng, maxLng } = pData.bounds;
        const lat = minLat + Math.random() * (maxLat - minLat);
        const lng = minLng + Math.random() * (maxLng - minLng);
        return [lat, lng];
      }
    }
    return null;
  };

  const locatedAgents = agents
    .map(agent => ({
      ...agent,
      position: getAgentPosition(agent),
    }))
    .filter(agent => agent.position !== null);
  
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={false} 
      style={{ height: '450px', width: '100%', borderRadius: '8px' }}
    >
      {/* --- THIS IS THE CHANGE --- */}
      {/* We are removing the GeoJSON layer and bringing back the standard TileLayer. */}
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* We keep the clustering and the markers, as they work perfectly. */}
      <MarkerClusterGroup>
        {locatedAgents.map(agent => (
          <Marker 
            key={agent.id} 
            position={agent.position}
            icon={createCustomMarkerIcon(agent)}
          >
            <Popup>
              <strong>{agent.name}</strong><br />
              {agent.town || agent.province}
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default AgentMap;