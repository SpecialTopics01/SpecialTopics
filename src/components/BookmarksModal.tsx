import React from 'react';
import { XIcon, BookmarkIcon, TrashIcon, PhoneIcon, MapPinIcon } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { Button } from './Button';
import { getTeamLabel } from '../utils/mapHelpers';
import type { EmergencyTeam } from '../types/database';
interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallTeam?: (team: EmergencyTeam) => void;
}
export function BookmarksModal({
  isOpen,
  onClose,
  onCallTeam
}: BookmarksModalProps) {
  const {
    bookmarks,
    loading,
    removeBookmark
  } = useBookmarks();
  if (!isOpen) return null;
  const handleRemove = async (bookmarkId: string) => {
    try {
      await removeBookmark(bookmarkId);
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };
  const handleCall = (team: EmergencyTeam) => {
    if (onCallTeam) {
      onCallTeam(team);
      onClose();
    }
  };
  return <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <BookmarkIcon className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Saved Teams</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bookmarks...</p>
            </div> : bookmarks.length === 0 ? <div className="text-center py-12">
              <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">
                No saved teams yet
              </p>
              <p className="text-gray-500 text-sm">
                Bookmark emergency teams for quick access
              </p>
            </div> : <div className="space-y-3">
              {bookmarks.map(bookmark => <div key={bookmark.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {bookmark.team.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {getTeamLabel(bookmark.team.type)}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{bookmark.team.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <PhoneIcon className="w-4 h-4" />
                          <span>{bookmark.team.hotline}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="danger" size="sm" onClick={() => handleCall(bookmark.team)} className="flex-1 flex items-center justify-center gap-2">
                      <PhoneIcon className="w-4 h-4" />
                      Call Now
                    </Button>
                    <button onClick={() => handleRemove(bookmark.id)} className="px-3 py-2 bg-gray-200 hover:bg-red-100 text-gray-700 hover:text-red-700 rounded-lg transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
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