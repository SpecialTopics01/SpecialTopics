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

// WebRTC Configuration for cross-platform video calling
export const WEBRTC_CONFIG = {
  iceServers: [
    // Free STUN servers (good for development/testing)
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.stunprotocol.org:3478' },
    { urls: 'stun:stun.voipstunt.com:3478' },

    // TURN servers for production (when peers are behind strict NATs)
    // IMPORTANT: Replace with your own TURN server credentials
    // You can get free TURN servers from services like:
    // - OpenRelay (https://openrelay.metered.ca/)
    // - Twilio TURN (paid)
    // - Your own Coturn server
    {
      urls: [
        'turn:turn.example.com:3478',
        'turn:turn.example.com:3478?transport=tcp'
      ],
      username: process.env.REACT_APP_TURN_USERNAME || 'your-turn-username',
      credential: process.env.REACT_APP_TURN_PASSWORD || 'your-turn-password'
    }
  ],

  // Media constraints optimized for cross-platform
  mediaConstraints: {
    video: {
      width: { ideal: 640, max: 1280 },
      height: { ideal: 480, max: 720 },
      frameRate: { ideal: 24, max: 30 },
      facingMode: 'user' // Use front camera on mobile
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 44100,
      channelCount: 1 // Mono for better mobile performance
    }
  },

  // Connection parameters
  connection: {
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle' as RTCBundlePolicy,
    rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy,
    iceTransportPolicy: 'all' as RTCIceTransportPolicy
  }
};

// Helper function to detect if running on mobile
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

// Helper function to get optimized media constraints for current device
export const getOptimizedMediaConstraints = (): MediaStreamConstraints => {
  const baseConstraints = WEBRTC_CONFIG.mediaConstraints;

  if (isMobileDevice()) {
    // Optimize for mobile devices
    return {
      video: {
        ...baseConstraints.video,
        width: { ideal: 480, max: 640 },
        height: { ideal: 640, max: 480 },
        frameRate: { ideal: 20, max: 24 }
      },
      audio: baseConstraints.audio
    };
  }

  return baseConstraints;
};