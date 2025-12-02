import React from 'react';
import { XIcon, PhoneIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useCallHistory } from '../hooks/useCallHistory';
import { Button } from './Button';
interface CallHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function CallHistoryModal({
  isOpen,
  onClose
}: CallHistoryModalProps) {
  const {
    calls,
    loading
  } = useCallHistory();
  if (!isOpen) return null;
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'ended':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'missed':
        return <XCircleIcon className="w-4 h-4 text-red-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Call History</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading call history...</p>
            </div> : calls.length === 0 ? <div className="text-center py-12">
              <PhoneIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">
                No call history yet
              </p>
              <p className="text-gray-500 text-sm">
                Your emergency calls will appear here
              </p>
            </div> : <div className="space-y-3">
              {calls.map(call => <div key={call.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(call.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {call.team_name || 'Unknown Team'}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {call.team_type || 'Emergency'} Team
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(call.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>Duration: {formatDuration(call.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${call.status === 'ended' ? 'bg-green-100 text-green-700' : call.status === 'missed' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'}`}>
                        {call.status}
                      </span>
                    </div>
                  </div>
                </div>)}
            </div>}
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>;
}