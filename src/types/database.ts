export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_type: 'citizen' | 'admin';
          full_name: string;
          email: string;
          team?: string;
          location?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_type: 'citizen' | 'admin';
          full_name: string;
          email: string;
          team?: string;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_type?: 'citizen' | 'admin';
          full_name?: string;
          email?: string;
          team?: string;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      emergency_teams: {
        Row: {
          id: string;
          name: string;
          type: 'police' | 'fire' | 'rescue';
          location: string;
          lat: number;
          lng: number;
          hotline: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'police' | 'fire' | 'rescue';
          location: string;
          lat: number;
          lng: number;
          hotline: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'police' | 'fire' | 'rescue';
          location?: string;
          lat?: number;
          lng?: number;
          hotline?: string;
          created_at?: string;
        };
      };
      call_logs: {
        Row: {
          id: string;
          caller_id: string;
          receiver_id: string;
          team_id: string;
          start_time: string;
          end_time?: string;
          duration?: number;
          status: 'initiated' | 'connected' | 'ended' | 'missed';
          created_at: string;
        };
        Insert: {
          id?: string;
          caller_id: string;
          receiver_id: string;
          team_id: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          status?: 'initiated' | 'connected' | 'ended' | 'missed';
          created_at?: string;
        };
        Update: {
          id?: string;
          caller_id?: string;
          receiver_id?: string;
          team_id?: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          status?: 'initiated' | 'connected' | 'ended' | 'missed';
          created_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          team_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_id?: string;
          created_at?: string;
        };
      };
    };
  };
}
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type EmergencyTeam = Database['public']['Tables']['emergency_teams']['Row'];
export type CallLog = Database['public']['Tables']['call_logs']['Row'];
export type Bookmark = Database['public']['Tables']['bookmarks']['Row'];