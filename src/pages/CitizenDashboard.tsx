import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useCallHistory } from '../hooks/useCallHistory';
import { useBookmarks } from '../hooks/useBookmarks';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { Button } from '../components/Button';
import { MapView } from '../components/MapView';
import { VideoCallModal } from '../components/VideoCallModal';
import { CallHistoryModal } from '../components/CallHistoryModal';
import { BookmarksModal } from '../components/BookmarksModal';
import { MapPinIcon, ClockIcon, BookmarkIcon, LogOutIcon, ChevronUpIcon, ChevronDownIcon, RefreshCwIcon, AlertCircleIcon } from 'lucide-react';
import type { EmergencyTeam } from '../types/database';
export function CitizenDashboard() {
  const {
    profile,
    signOut
  } = useAuth();
  const {
    latitude,
    longitude,
    loading: locationLoading,
    refreshLocation
  } = useGeolocation();
  const {
    calls
  } = useCallHistory();
  const {
    bookmarks
  } = useBookmarks();
  const {
    callState,
    initiateCall,
    endCall
  } = useWebRTC();
  const {
    admins,
    loading: adminsLoading
  } = useAdminUsers();
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const handleCallTeam = async (team: EmergencyTeam) => {
    setCallError(null);
    try {
      console.log('Attempting to call team:', team);
      console.log('Available admins:', admins);
      console.log('Looking for team type:', team.type);

      // Find an admin user with matching team type
      const matchingAdmins = admins.filter(admin => admin.team === team.type);
      console.log('Matching admins found:', matchingAdmins);

      const matchingAdmin = matchingAdmins.find(admin => admin.is_online) || matchingAdmins[0];

      if (!matchingAdmin) {
        console.error('No admin found for team type:', team.type);
        console.log('Available admin teams:', admins.map(a => a.team));
        console.log('All available admins:', admins);
        // Show helpful error if no admin is available
        setCallError(`No ${team.type} team admin is currently registered. ` + `Please try again later or contact: ${team.hotline}`);
        return;
      }

      console.log('Found admin for call:', matchingAdmin);
      console.log('Admin online status:', matchingAdmin.is_online);
      console.log('Initiating call to admin ID:', matchingAdmin.id);
      await initiateCall(team, matchingAdmin.id);
    } catch (error: any) {
      console.error('Error initiating call:', error);
      // Show specific error messages
      if (error.message.includes('camera') || error.message.includes('microphone')) {
        setCallError('Camera or microphone access denied. Please allow permissions in your browser settings and try again.');
      } else if (error.message.includes('constraint')) {
        setCallError('Database error. Please make sure you are registered and logged in correctly.');
      } else {
        setCallError(error.message || 'Failed to initiate call. Please try again or contact support.');
      }
    }
  };
  // Auto-hide error after 10 seconds
  useEffect(() => {
    if (callError) {
      const timer = setTimeout(() => setCallError(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [callError]);
  const userLocation = latitude && longitude ? {
    lat: latitude,
    lng: longitude
  } : undefined;
  return <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Compact Header */}
      <header className="bg-red-600 text-white py-3 px-4 shadow-lg z-20 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h1 className="text-lg font-bold leading-tight">
                Emergency Connect
              </h1>
              <p className="text-red-100 text-xs">{profile?.full_name}</p>
            </div>
          </div>
          <button onClick={signOut} className="p-2 hover:bg-red-700 rounded-lg transition-colors" aria-label="Logout">
            <LogOutIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Full Map Area */}
      <div className="flex-1 relative">
        <MapView onCallTeam={handleCallTeam} userLocation={userLocation} />

        {/* Emergency Alert Overlay */}
        <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-10">
          <div className="bg-red-600 text-white rounded-lg shadow-2xl p-4 border-2 border-red-700">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div>
                <h2 className="font-bold text-sm mb-1">
                  Emergency Services 24/7
                </h2>
                <p className="text-red-100 text-xs">
                  Tap any marker to call emergency teams
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {callError && <div className="absolute top-24 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-10">
            <div className="bg-white rounded-lg shadow-2xl p-4 border-2 border-red-500">
              <div className="flex items-start gap-3">
                <AlertCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 text-sm mb-1">
                    Call Failed
                  </h3>
                  <p className="text-red-700 text-xs">{callError}</p>
                  <button onClick={() => setCallError(null)} className="text-red-600 text-xs font-medium mt-2 hover:underline">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>}

        {/* Loading Admins Indicator */}
        {adminsLoading && <div className="absolute bottom-24 left-4 bg-white rounded-lg shadow-lg p-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <RefreshCwIcon className="w-4 h-4 animate-spin" />
              <span>Connecting to emergency teams...</span>
            </div>
          </div>}
      </div>

      {/* Bottom Feature Panel */}
      <div className="bg-white border-t-4 border-red-600 shadow-2xl z-20 flex-shrink-0">
        {/* Mobile Expand/Collapse Button */}
        <button onClick={() => setIsPanelExpanded(!isPanelExpanded)} className="w-full py-2 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 transition-colors md:hidden">
          <span className="text-sm font-medium">
            {isPanelExpanded ? 'Hide Details' : 'Show Details'}
          </span>
          {isPanelExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
        </button>

        {/* Feature Grid */}
        <div className={`
          grid grid-cols-3 gap-4 p-4
          ${isPanelExpanded ? 'block' : 'hidden md:grid'}
        `}>
          {/* Your Location */}
          <div className="text-center">
            <button onClick={refreshLocation} className="w-full p-4 rounded-lg hover:bg-red-50 transition-colors group">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-red-200 transition-colors relative">
                {locationLoading ? <RefreshCwIcon className="w-6 h-6 text-red-600 animate-spin" /> : <MapPinIcon className="w-6 h-6 text-red-600" />}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Your Location
              </h3>
              {latitude && longitude ? <>
                  <p className="text-xs text-gray-600 truncate">
                    {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    Tap to refresh
                  </p>
                </> : <p className="text-xs text-gray-500">Getting location...</p>}
            </button>
          </div>

          {/* Call History */}
          <div className="text-center">
            <button onClick={() => setShowCallHistory(true)} className="w-full p-4 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-gray-200 transition-colors">
                <ClockIcon className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Call History
              </h3>
              <p className="text-xs text-gray-600">
                {calls.length} {calls.length === 1 ? 'call' : 'calls'}
              </p>
              <p className="text-xs text-gray-400 mt-1">View all</p>
            </button>
          </div>

          {/* Bookmarks */}
          <div className="text-center">
            <button onClick={() => setShowBookmarks(true)} className="w-full p-4 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-gray-200 transition-colors">
                <BookmarkIcon className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Bookmarks
              </h3>
              <p className="text-xs text-gray-600">
                {bookmarks.length} saved{' '}
                {bookmarks.length === 1 ? 'team' : 'teams'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Quick access</p>
            </button>
          </div>
        </div>

        {/* Desktop: Always show quick stats */}
        <div className="hidden md:grid grid-cols-3 gap-4 px-4 pb-4 text-center text-xs text-gray-500">
          <div>
            {latitude && longitude ? `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E` : 'Location unavailable'}
          </div>
          <div>
            Last call:{' '}
            {calls.length > 0 ? new Date(calls[0].created_at).toLocaleDateString() : 'Never'}
          </div>
          <div>
            {admins.length} admin{admins.length !== 1 ? 's' : ''} available
          </div>
        </div>
      </div>

      {/* Video Call Modal */}
      <VideoCallModal callState={callState} onEndCall={endCall} />

      {/* Call History Modal */}
      <CallHistoryModal isOpen={showCallHistory} onClose={() => setShowCallHistory(false)} />

      {/* Bookmarks Modal */}
      <BookmarksModal isOpen={showBookmarks} onClose={() => setShowBookmarks(false)} onCallTeam={handleCallTeam} />
    </div>;
}