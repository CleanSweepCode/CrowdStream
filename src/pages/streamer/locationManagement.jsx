export function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        // Add options for better location accuracy and timeout handling
        const options = {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 60000 // 1 minute cache
        };
        
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      } else {
        reject(new Error('Geolocation is not supported'));
      }
    });
  }

export async function requestLocationPermission() {
  // Check if we can request permissions (modern browsers)
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch (error) {
      console.warn('Could not check geolocation permission:', error);
      return 'unknown';
    }
  }
  return 'unknown';
}

export async function fetchGeolocationData() {
    try {
      // First check if we have permission
      const permissionState = await requestLocationPermission();
      
      if (permissionState === 'denied') {
        console.warn('Geolocation permission denied by user');
        return null;
      }
      
      const position = await getCurrentPosition();
      return position;
  
    } catch (error) {
      console.error('Error retrieving geolocation:', error);
      
      // Handle specific error codes
      if (error.code === 1) {
        console.error('Geolocation permission denied');
        // Could show a UI prompt here to ask user to enable location
      } else if (error.code === 2) {
        console.error('Geolocation position unavailable - this could be due to poor GPS signal or location services being disabled');
        // Could show a UI prompt here to ask user to check location services
      } else if (error.code === 3) {
        console.error('Geolocation request timed out');
      }
      
      return null;
    }
  }

// Fallback function to get approximate location from IP (less accurate but works when GPS fails)
export async function getApproximateLocation() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.latitude && data.longitude) {
      return {
        coords: {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: 50000 // IP-based location is much less accurate
        }
      };
    }
  } catch (error) {
    console.warn('Could not get approximate location from IP:', error);
  }
  return null;
}

// Enhanced function that tries GPS first, then falls back to IP-based location
export async function fetchGeolocationDataWithFallback() {
  // Try GPS first
  const gpsPosition = await fetchGeolocationData();
  if (gpsPosition) {
    return gpsPosition;
  }
  
  // Fall back to IP-based location
  console.log('GPS location failed, trying IP-based location...');
  const ipPosition = await getApproximateLocation();
  if (ipPosition) {
    console.log('Using IP-based location as fallback');
    return ipPosition;
  }
  
  return null;
}