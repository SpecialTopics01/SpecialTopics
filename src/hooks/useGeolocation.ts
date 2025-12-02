import { useState, useEffect } from 'react';
interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
}
export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: true,
    error: null
  });
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser'
      }));
      return;
    }
    const handleSuccess = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        loading: false,
        error: null
      });
    };
    const handleError = (error: GeolocationPositionError) => {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError);

    // Watch position for updates
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
  const refreshLocation = () => {
    setLocation(prev => ({
      ...prev,
      loading: true
    }));
    navigator.geolocation.getCurrentPosition(position => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        loading: false,
        error: null
      });
    }, error => {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    });
  };
  return {
    ...location,
    refreshLocation
  };
}