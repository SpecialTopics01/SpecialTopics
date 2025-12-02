import React, { useCallback, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY, BUKIDNON_CENTER } from '../lib/supabase';
import { useEmergencyTeams } from '../hooks/useEmergencyTeams';
import { getTeamColor, getTeamLabel, calculateDistance, formatDistance } from '../utils/mapHelpers';
import { Button } from './Button';
import { PhoneIcon, MapPinIcon, PhoneCallIcon } from 'lucide-react';
import type { EmergencyTeam } from '../types/database';
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px'
};
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true
};
interface MapViewProps {
  userLocation?: {
    lat: number;
    lng: number;
  };
  onCallTeam?: (team: EmergencyTeam) => void;
}
export function MapView({
  userLocation = BUKIDNON_CENTER,
  onCallTeam
}: MapViewProps) {
  const {
    teams,
    loading,
    error
  } = useEmergencyTeams();
  const [selectedTeam, setSelectedTeam] = useState<EmergencyTeam | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const handleMarkerClick = useCallback((team: EmergencyTeam) => {
    setSelectedTeam(team);
  }, []);
  const handleCloseInfo = useCallback(() => {
    setSelectedTeam(null);
  }, []);
  const handleCallTeam = useCallback(() => {
    if (selectedTeam && onCallTeam) {
      onCallTeam(selectedTeam);
    }
  }, [selectedTeam, onCallTeam]);
  if (error) {
    return <div className="w-full h-full min-h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Load Map
          </h3>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>;
  }
  return <div className="w-full h-full relative">
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} onLoad={() => setMapLoaded(true)}>
        <GoogleMap mapContainerStyle={mapContainerStyle} center={BUKIDNON_CENTER} zoom={11} options={mapOptions}>
          {/* User Location Marker */}
          <Marker position={userLocation} icon={{
          path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
          scale: 8,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }} title="Your Location" />

          {/* Emergency Team Markers */}
          {teams.map(team => {
          const teamColor = getTeamColor(team.type);
          return <Marker key={team.id} position={{
            lat: team.lat,
            lng: team.lng
          }} onClick={() => handleMarkerClick(team)} icon={{
            path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
            scale: 12,
            fillColor: teamColor,
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 3
          }} title={team.name} />;
        })}

          {/* Info Window */}
          {selectedTeam && <InfoWindow position={{
          lat: selectedTeam.lat,
          lng: selectedTeam.lng
        }} onCloseClick={handleCloseInfo}>
              <div className="p-2 max-w-xs">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{
                backgroundColor: getTeamColor(selectedTeam.type)
              }}>
                    {selectedTeam.type === 'police' ? '🚓' : selectedTeam.type === 'fire' ? '🚒' : '🚑'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base mb-1 leading-tight">
                      {selectedTeam.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {getTeamLabel(selectedTeam.type)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPinIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{selectedTeam.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <PhoneCallIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span>{selectedTeam.hotline}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                    <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {formatDistance(calculateDistance(userLocation.lat, userLocation.lng, selectedTeam.lat, selectedTeam.lng))}
                    </span>
                  </div>
                </div>

                <Button variant="danger" fullWidth size="sm" onClick={handleCallTeam} className="flex items-center justify-center gap-2">
                  <PhoneIcon className="w-4 h-4" />
                  Start Video Call
                </Button>
              </div>
            </InfoWindow>}
        </GoogleMap>
      </LoadScript>

      {/* Loading Overlay */}
      {(loading || !mapLoaded) && <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 font-medium">
              Loading emergency map...
            </p>
          </div>
        </div>}
    </div>;
}