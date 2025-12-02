import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { CallLog } from '../types/database';
interface CallHistoryWithTeam extends CallLog {
  team_name?: string;
  team_type?: string;
}
export function useCallHistory() {
  const {
    user
  } = useAuth();
  const [calls, setCalls] = useState<CallHistoryWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (user) {
      fetchCallHistory();
    }
  }, [user]);
  const fetchCallHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('call_logs').select(`
          *,
          emergency_teams (
            name,
            type
          )
        `).or(`caller_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', {
        ascending: false
      }).limit(20);
      if (error) throw error;
      const callsWithTeam = data?.map(call => ({
        ...call,
        team_name: call.emergency_teams?.name,
        team_type: call.emergency_teams?.type
      })) || [];
      setCalls(callsWithTeam);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching call history:', err);
    } finally {
      setLoading(false);
    }
  };
  return {
    calls,
    loading,
    error,
    refetch: fetchCallHistory
  };
}