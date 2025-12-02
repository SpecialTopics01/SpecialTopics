import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';
interface AdminUser extends Profile {
  is_online?: boolean;
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
    // Find an admin with matching team type
    const matchingAdmins = admins.filter(admin => admin.team === teamType);
    if (matchingAdmins.length > 0) {
      // Return first available admin (in production, check online status)
      return matchingAdmins[0];
    }

    // Fallback: return any admin
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