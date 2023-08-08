export function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject(new Error('Geolocation is not supported'));
      }
    });
  }
  
export async function fetchGeolocationData() {
    try {
      const position = await getCurrentPosition();
  
      // Use latitude and longitude to perform further operations
      return position
  
    } catch (error) {
      console.error('Error retrieving geolocation:', error);
    }
  }