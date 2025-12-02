import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
const supabaseUrl = 'https://pdzttgkijnmhavckqpos.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkenR0Z2tpam5taGF2Y2txcG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2Njg1NzIsImV4cCI6MjA4MDI0NDU3Mn0.MIFss_2tanT54IoQf-e5vTNHnZnzmTR6EFoYRtJNyx4';
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