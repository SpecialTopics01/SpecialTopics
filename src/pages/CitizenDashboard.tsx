import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { MapView } from '../components/MapView';
import { MapPinIcon, ClockIcon, BookmarkIcon, LogOutIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import type { EmergencyTeam } from '../types/database';
export function CitizenDashboard() {
  const {
    profile,
    signOut
  } = useAuth();
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const handleCallTeam = (team: EmergencyTeam) => {
    // TODO: Implement video call functionality
    console.log('Initiating call to:', team);
    alert(`Video call to ${team.name} will be implemented in the next phase`);
  };
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
        <MapView onCallTeam={handleCallTeam} />

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
            <button className="w-full p-4 rounded-lg hover:bg-red-50 transition-colors group">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-red-200 transition-colors">
                <MapPinIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Your Location
              </h3>
              <p className="text-xs text-gray-600">Bukidnon, Philippines</p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                Update location
              </p>
            </button>
          </div>

          {/* Call History */}
          <div className="text-center">
            <button className="w-full p-4 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-gray-200 transition-colors">
                <ClockIcon className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Call History
              </h3>
              <p className="text-xs text-gray-600">No recent calls</p>
              <p className="text-xs text-gray-400 mt-1">View all</p>
            </button>
          </div>

          {/* Bookmarks */}
          <div className="text-center">
            <button className="w-full p-4 rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-gray-200 transition-colors">
                <BookmarkIcon className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                Bookmarks
              </h3>
              <p className="text-xs text-gray-600">0 saved teams</p>
              <p className="text-xs text-gray-400 mt-1">Quick access</p>
            </button>
          </div>
        </div>

        {/* Desktop: Always show quick stats */}
        <div className="hidden md:grid grid-cols-3 gap-4 px-4 pb-4 text-center text-xs text-gray-500">
          <div>Lat: 8.0542° N</div>
          <div>Last call: Never</div>
          <div>Saved: 0 teams</div>
        </div>
      </div>
    </div>;
}