import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../store/useAppStore';
import { Post, CategoryNames, CategoryColors, StatusNames, StatusColors } from '../types';
import { MapPin, Plus, Navigation, AlertTriangle, Lightbulb, Trash2, Shield, Eye, Leaf } from 'lucide-react';

interface CityMapProps {
  posts: Post[];
  onMarkerClick?: (postId: string) => void;
}

// Custom markers using Lealet's L.divIcon
const getCustomMarkerIcon = (category: string, status: string) => {
  let color = '#64748b'; // slate
  let glow = 'rgba(100, 116, 139, 0.2)';
  
  if (category === 'roads') {
    color = '#f97316'; // orange
    glow = 'rgba(249, 115, 22, 0.2)';
  } else if (category === 'garbage') {
    color = '#d97706'; // amber
    glow = 'rgba(217, 119, 6, 0.2)';
  } else if (category === 'lighting') {
    color = '#eab308'; // yellow
    glow = 'rgba(234, 179, 8, 0.2)';
  } else if (category === 'safety') {
    color = '#ef4444'; // red
    glow = 'rgba(239, 68, 68, 0.2)';
  } else if (category === 'ecology') {
    color = '#10b981'; // emerald
    glow = 'rgba(16, 185, 129, 0.2)';
  }

  // Draw concentric borders based on verification status
  let ringStyle = 'border: 2px solid #ffffff;';
  let pulseAnimation = '';

  if (status === 'confirmed') {
    ringStyle = 'border: 3px solid #22c55e; box-shadow: 0 0 12px #22c55e;';
    pulseAnimation = 'animate-ping';
  } else if (status === 'partially_confirmed') {
    ringStyle = 'border: 3.5px dashed #f59e0b; box-shadow: 0 0 8px #f59e0b;';
  }

  const html = `
    <div class="relative flex items-center justify-center w-8 h-8 rounded-full" style="background-color: ${color}; ${ringStyle}">
      ${status === 'confirmed' ? `
        <span class="absolute inline-flex w-full h-full rounded-full opacity-50 bg-emerald-500 ${pulseAnimation}" style="left: 0; top: 0; animation-duration: 2s;"></span>
      ` : ''}
      <span class="relative z-10 w-2 h-2 rounded-full bg-white"></span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Component to handle map center changes
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Component to catch map click coordinates
function MapClickEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function CityMap({ posts, onMarkerClick }: CityMapProps) {
  const { userLocation, setCreatePostOpen, user, theme } = useAppStore();
  const [center, setCenter] = useState<[number, number]>([55.7558, 37.6173]);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (userLocation) {
      setCenter([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  const handleMapClick = (lat: number, lng: number) => {
    setClickedCoords({ lat, lng });
  };

  const handleCreatePostAtClick = () => {
    if (!user) {
      // Prompt sign in
      useAppStore.getState().setAuthModalOpen(true);
      return;
    }
    if (clickedCoords) {
      setCreatePostOpen(true, clickedCoords);
      setClickedCoords(null);
    }
  };

  // Helper to get matching category icon
  const getCategoryIcon = (category: string) => {
    const props = { className: "w-4 h-4 mr-1.5 inline-block" };
    switch (category) {
      case 'roads': return <AlertTriangle {...props} className="w-4 h-4 mr-1.5 inline-block text-orange-500" />;
      case 'lighting': return <Lightbulb {...props} className="w-4 h-4 mr-1.5 inline-block text-yellow-500" />;
      case 'garbage': return <Trash2 {...props} className="w-4 h-4 mr-1.5 inline-block text-amber-500" />;
      case 'safety': return <Shield {...props} className="w-4 h-4 mr-1.5 inline-block text-red-500" />;
      case 'ecology': return <Leaf {...props} className="w-4 h-4 mr-1.5 inline-block text-emerald-500" />;
      default: return <MapPin {...props} className="w-4 h-4 mr-1.5 inline-block text-slate-500" />;
    }
  };

  // Customize Leaflet Tile Servers based on active theme
  // Standard highly readable Light cartodb map or Dark theme Map
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const tileAttribution = theme === 'dark'
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px]">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true}
        className="w-full h-full hMR-override"
      >
        <ChangeView center={center} />
        <TileLayer
          attribution={tileAttribution}
          url={tileUrl}
        />

        <MapClickEvents onMapClick={handleMapClick} />

        {/* Display incident markers */}
        {posts.map((post) => (
          <Marker
            key={post.id}
            position={[post.latitude, post.longitude]}
            icon={getCustomMarkerIcon(post.category, post.status)}
          >
            <Popup minWidth={260} maxWidth={280}>
              <div className="p-2 select-none">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase border ${CategoryColors[post.category]}`}>
                    {CategoryNames[post.category]}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${StatusColors[post.status]}`}>
                    {StatusNames[post.status]}
                  </span>
                </div>
                
                {post.image_url && (
                  <img 
                    src={post.image_url} 
                    alt={post.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-24 object-cover rounded-lg mb-2 shadow-sm"
                  />
                )}

                <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100 mb-1 leading-snug line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                  {post.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    {new Date(post.created_at).toLocaleDateString('ru-RU')}
                  </span>
                  
                  <button
                    onClick={() => onMarkerClick?.(post.id)}
                    className="flex items-center text-[11px] font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Подробнее
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Instructions Banner */}
      <div className="absolute top-4 right-4 z-[999] max-w-xs bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-md">
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed flex items-start">
          <MapPin className="w-4 h-4 text-emerald-500 mr-2 shrink-0 mt-0.5" />
          <span>Нажмите на любую точку карты, чтобы сообщить о новой городской проблеме.</span>
        </p>
      </div>

      {/* Geolocate Center Button */}
      {userLocation && (
        <button
          onClick={() => setCenter([userLocation.lat, userLocation.lng])}
          className="absolute bottom-4 right-4 z-[999] p-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-800 shadow-md transition-all active:scale-95 duration-150 group"
          title="Найти меня"
        >
          <Navigation className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
        </button>
      )}

      {/* Floating Coordinates Click Action Prompt */}
      {clickedCoords && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[999] flex items-center space-x-2 bg-slate-900 text-white dark:bg-white dark:text-slate-950 p-2 pl-4 pr-3 rounded-full shadow-xl">
          <span className="text-xs font-mono">
            {clickedCoords.lat.toFixed(4)}, {clickedCoords.lng.toFixed(4)}
          </span>
          <button
            onClick={handleCreatePostAtClick}
            className="flex items-center space-x-1 bg-emerald-500 text-white hover:bg-emerald-600 text-xs py-1.5 px-3 rounded-full font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Сообщить</span>
          </button>
          <button
            onClick={() => setClickedCoords(null)}
            className="text-xs text-slate-400 hover:text-slate-200 px-1 py-1 rounded-full"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
