import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
const supabaseUrl = 'https://mvcrwauciujkdabhdhrg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12Y3J3YXVjaXVqa2RhYmhkaHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODM3MjMsImV4cCI6MjA4MDI1OTcyM30.ixO00Cam1w4rZ-AM7iQLWIgE0LKlosw9jGApqgxdgPA';
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
export type UserType = 'citizen' | 'admin';
export type EmergencyTeamType = 'police' | 'fire' | 'rescue';

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY = 'AIzaSyBUV8Ag1aOioVL3SErpMIItjsGAbnE9sR4';

// Bukidnon, Philippines coordinates
export const BUKIDNON_CENTER = {
  lat: 8.0542,
  lng: 125.1289
};