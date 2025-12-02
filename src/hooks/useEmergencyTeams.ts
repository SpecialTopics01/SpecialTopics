import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { EmergencyTeam } from '../types/database';
export function useEmergencyTeams() {
  const [teams, setTeams] = useState<EmergencyTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchTeams();
  }, []);
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('emergency_teams').select('*').order('name');
      if (error) throw error;
      setTeams(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching emergency teams:', err);
    } finally {
      setLoading(false);
    }
  };
  return {
    teams,
    loading,
    error,
    refetch: fetchTeams
  };
}