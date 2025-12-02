import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { MapView } from '../components/MapView';
import { PhoneIcon, MapPinIcon, BookmarkIcon, ClockIcon, MapIcon } from 'lucide-react';
import type { EmergencyTeam } from '../types/database';
export function CitizenDashboard() {
  const {
    profile,
    signOut
  } = useAuth();
  const [showMap, setShowMap] = useState(false);
  const handleCallTeam = (team: EmergencyTeam) => {
    // TODO: Implement video call functionality
    console.log('Initiating call to:', team);
    alert(`Video call to ${team.name} will be implemented in the next phase`);
  };
  return <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white py-4 px-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🚨 Emergency Connect</h1>
            <p className="text-red-100 text-sm">
              Welcome, {profile?.full_name}
            </p>
          </div>
          <Button variant="ghost" onClick={signOut} className="text-white hover:bg-red-700">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Emergency Alert */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-red-800 text-xl font-bold mb-2">
            Emergency Services Available 24/7
          </h2>
          <p className="text-red-700">
            Tap on any emergency team marker on the map to start a video call
          </p>
        </div>

        {/* Map Section */}
        {showMap ? <div className="bg-white rounded-lg shadow-lg p-4 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Emergency Teams in Bukidnon
              </h2>
              <Button variant="secondary" size="sm" onClick={() => setShowMap(false)}>
                Hide Map
              </Button>
            </div>
            <div className="rounded-lg overflow-hidden border-2 border-gray-200" style={{
          height: '600px'
        }}>
              <MapView onCallTeam={handleCallTeam} />
            </div>
            <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <MapIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">How to use the map:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Red dot shows your current location</li>
                  <li>
                    • Colored markers show emergency teams (Blue = Police, Red =
                    Fire, Green = Rescue)
                  </li>
                  <li>
                    • Click any marker to see team details and start a video
                    call
                  </li>
                </ul>
              </div>
            </div>
          </div> : <button onClick={() => setShowMap(true)} className="w-full bg-white rounded-lg shadow-md p-8 text-left hover:shadow-lg transition-all border-2 border-transparent hover:border-red-500 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-4 rounded-full">
                  <MapIcon className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    View Emergency Map
                  </h3>
                  <p className="text-gray-600">
                    See all emergency teams in Bukidnon and their locations
                  </p>
                </div>
              </div>
              <div className="text-red-600 text-4xl">→</div>
            </div>
          </button>}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow border-2 border-transparent hover:border-red-500">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <PhoneIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Quick Emergency Call
                </h3>
                <p className="text-gray-600 text-sm">Fastest response time</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Connect with the nearest available emergency team instantly
            </p>
          </button>

          <button className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow border-2 border-transparent hover:border-red-500">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <MapPinIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Share Location
                </h3>
                <p className="text-gray-600 text-sm">Help teams find you</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Send your exact location to emergency responders
            </p>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <BookmarkIcon className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Saved Locations
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Quick access to your bookmarked emergency teams
            </p>
            <p className="text-gray-400 text-sm italic">
              No saved locations yet
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <ClockIcon className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Call History
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              View your past emergency calls
            </p>
            <p className="text-gray-400 text-sm italic">No call history yet</p>
          </div>
        </div>
      </main>
    </div>;
}