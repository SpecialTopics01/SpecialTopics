import type { EmergencyTeamType } from '../lib/supabase';
export function getMarkerIcon(type: EmergencyTeamType): string {
  const icons = {
    police: '🚓',
    fire: '🚒',
    rescue: '🚑'
  };
  return icons[type] || '📍';
}
export function getTeamColor(type: EmergencyTeamType): string {
  const colors = {
    police: '#1e40af',
    // blue-800
    fire: '#dc2626',
    // red-600
    rescue: '#16a34a' // green-600
  };
  return colors[type] || '#6b7280';
}
export function getTeamLabel(type: EmergencyTeamType): string {
  const labels = {
    police: 'Police',
    fire: 'Fire Department',
    rescue: 'Rescue Team'
  };
  return labels[type] || type;
}
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m away`;
  }
  return `${km.toFixed(1)}km away`;
}