import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { PhoneIncomingIcon, UsersIcon, FileTextIcon, ActivityIcon } from 'lucide-react';
export function AdminDashboard() {
  const {
    profile,
    signOut
  } = useAuth();
  return <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">👮 Admin Portal</h1>
            <p className="text-blue-100 text-sm">
              {profile?.full_name} •{' '}
              {profile?.team && profile.team.charAt(0).toUpperCase() + profile.team.slice(1)}{' '}
              Team
            </p>
          </div>
          <Button variant="ghost" onClick={signOut} className="text-white hover:bg-blue-700">
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Status Banner */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="bg-green-500 w-3 h-3 rounded-full mr-3 animate-pulse"></div>
            <div>
              <h2 className="text-green-800 text-xl font-bold">
                Online & Ready
              </h2>
              <p className="text-green-700">
                You are available to receive emergency calls
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <PhoneIncomingIcon className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">0</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Incoming Calls</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <ActivityIcon className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">0</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Active Calls</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <FileTextIcon className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">0</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Today's Reports</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <UsersIcon className="w-8 h-8 text-orange-600" />
              <span className="text-3xl font-bold text-gray-900">0</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Total Citizens</p>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Calls */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Recent Calls
            </h3>
            <div className="text-center py-12">
              <PhoneIncomingIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent calls</p>
              <p className="text-gray-400 text-sm mt-2">
                Emergency calls will appear here
              </p>
            </div>
          </div>

          {/* Call Logs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Call Logs</h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <div className="text-center py-12">
              <FileTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No call logs yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Call history will be recorded here
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Reports Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Monthly Reports</h3>
            <Button variant="primary" size="sm">
              Generate Report
            </Button>
          </div>
          <p className="text-gray-600 mb-4">
            View aggregated incident data and statistics
          </p>
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No reports generated yet</p>
          </div>
        </div>
      </main>
    </div>;
}