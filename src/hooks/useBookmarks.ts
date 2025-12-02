import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { EmergencyTeam } from '../types/database';
interface BookmarkWithTeam {
  id: string;
  team: EmergencyTeam;
}
export function useBookmarks() {
  const {
    user
  } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);
  const fetchBookmarks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('bookmarks').select(`
          id,
          emergency_teams (*)
        `).eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      const bookmarksWithTeam = data?.map(bookmark => ({
        id: bookmark.id,
        team: bookmark.emergency_teams as unknown as EmergencyTeam
      })) || [];
      setBookmarks(bookmarksWithTeam);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };
  const addBookmark = async (teamId: string) => {
    if (!user) return;
    try {
      const {
        error
      } = await supabase.from('bookmarks').insert({
        user_id: user.id,
        team_id: teamId
      });
      if (error) throw error;
      await fetchBookmarks();
    } catch (err: any) {
      console.error('Error adding bookmark:', err);
      throw err;
    }
  };
  const removeBookmark = async (bookmarkId: string) => {
    try {
      const {
        error
      } = await supabase.from('bookmarks').delete().eq('id', bookmarkId);
      if (error) throw error;
      await fetchBookmarks();
    } catch (err: any) {
      console.error('Error removing bookmark:', err);
      throw err;
    }
  };
  const isBookmarked = (teamId: string) => {
    return bookmarks.some(b => b.team.id === teamId);
  };
  return {
    bookmarks,
    loading,
    error,
    addBookmark,
    removeBookmark,
    isBookmarked,
    refetch: fetchBookmarks
  };
}