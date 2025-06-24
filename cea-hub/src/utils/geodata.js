// src/utils/geodata.js

// Enhanced province data with center, zoom, and a bounding box for scattering.
export const provinceData = {
  "gauteng": { 
    center: [-26.2708, 28.1123], zoom: 9, 
    bounds: { minLat: -26.75, maxLat: -25.7, minLng: 27.7, maxLng: 28.7 },
    color: "#E11D48" // Rose
  },
  "western cape": { 
    center: [-33.2278, 21.8569], zoom: 7,
    bounds: { minLat: -34.8, maxLat: -32.5, minLng: 18.0, maxLng: 24.0 },
    color: "#2563EB" // Blue
  },
  "kwazulu-natal": { 
    center: [-28.5306, 30.8958], zoom: 7,
    bounds: { minLat: -31.0, maxLat: -27.0, minLng: 29.0, maxLng: 32.5 },
    color: "#16A34A" // Green
  },
  "eastern cape": { 
    center: [-32.2968, 26.4194], zoom: 7,
    bounds: { minLat: -34.0, maxLat: -30.5, minLng: 24.5, maxLng: 29.5 },
    color: "#F97316" // Orange
  },
  "free state": { 
    center: [-28.4542, 26.7954], zoom: 7,
    bounds: { minLat: -30.7, maxLat: -27.0, minLng: 24.5, maxLng: 29.5 },
    color: "#CA8A04" // Yellow
  },
  "limpopo": { 
    center: [-23.4014, 29.4179], zoom: 7,
    bounds: { minLat: -25.0, maxLat: -22.3, minLng: 27.0, maxLng: 31.8 },
    color: "#0D9488" // Teal
  },
  "mpumalanga": { 
    center: [-25.5653, 30.5288], zoom: 7,
    bounds: { minLat: -27.5, maxLat: -24.5, minLng: 29.0, maxLng: 32.0 },
    color: "#6D28D9" // Violet
  },
  "north west": { 
    center: [-26.6639, 25.2939], zoom: 7,
    bounds: { minLat: -28.0, maxLat: -25.0, minLng: 22.8, maxLng: 27.8 },
    color: "#DB2777" // Pink
  },
  "northern cape": { 
    center: [-29.0463, 21.8569], zoom: 7,
    bounds: { minLat: -32.5, maxLat: -25.0, minLng: 16.5, maxLng: 25.0 },
    color: "#64748B" // Slate
  }
};

// We still keep the precise town data for agents who have it.
const townCoordinates = {
  "johannesburg": [-26.2041, 28.0473],
  "pretoria": [-25.7479, 28.2293],
  "soweto": [-26.2678, 27.8584],
  "cape town": [-33.9249, 18.4241],
  "durban": [-29.8587, 31.0218],
  "polokwane": [-23.9045, 29.4689],
  "bloemfontein": [-29.1171, 26.2249],
  "nelspruit": [-25.4745, 30.9837],
};

// This function remains our first choice for precise location.
export const getAgentCoordinates = (agent) => {
  if (!agent.town) return null;
  const town = agent.town.toLowerCase();
  return townCoordinates[town] || null;
};