import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';
interface AdminUser extends Profile {
  is_online?: boolean;
  last_seen?: string;
}
export function useAdminUsers(teamType?: string) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchAdmins();
  }, [teamType]);
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      let query = supabase.from('profiles').select('*').eq('user_type', 'admin');

      // Filter by team type if provided
      if (teamType) {
        query = query.eq('team', teamType);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      setAdmins(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };
  const getAvailableAdmin = (teamType: string): AdminUser | null => {
    // Find online admins with matching team type
    const matchingOnlineAdmins = admins.filter(admin => admin.team === teamType && admin.is_online);
    if (matchingOnlineAdmins.length > 0) {
      return matchingOnlineAdmins[0];
    }

    // Fallback: find any admin with matching team type (even offline)
    const matchingAdmins = admins.filter(admin => admin.team === teamType);
    if (matchingAdmins.length > 0) {
      return matchingAdmins[0];
    }

    // Last fallback: return any online admin
    const onlineAdmins = admins.filter(admin => admin.is_online);
    if (onlineAdmins.length > 0) {
      return onlineAdmins[0];
    }

    // Final fallback: return any admin
    return admins.length > 0 ? admins[0] : null;
  };
  return {
    admins,
    loading,
    error,
    getAvailableAdmin,
    refetch: fetchAdmins
  };
}