
export async function requestCameraPermissions() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("Camera permissions granted");
    } catch (err) {
      console.error("No cameras available, so no camera permissions granted: ", err);
    }
  }

export async function getCameraDevices() {
    // Return a list of camera devices
    // First will be rear camera OR only camera
    // Second will be front camera (if available)

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    var cameras = videoDevices;

    // sort so that rear is first if possible. Rear will contain 'rear' or 'back', case insensitive
    cameras.sort((a, b) => { return a.label.toLowerCase().includes('rear') || a.label.toLowerCase().includes('back') ? -1 : 1 }); // Rear camera first

    return cameras;
  }

export async function getStreamFromCamera(cameraDevice) {
    // Given a camera device, return a stream
    return await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: { exact: cameraDevice.deviceId },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audio: false
    });
  }

export async function handlePermissions() {
    let permissions = {
      audio: false,
      video: false,
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      for (const track of stream.getTracks()) {
        track.stop();

      }
      permissions = { video: true, audio: true };
    } catch (err) {
      permissions = { video: false, audio: false };
      console.error(err.message);
    }
    // If we still don't have permissions after requesting them display the error message
    if (!permissions.video) {
      console.error('Failed to get video permissions.');
    } else if (!permissions.audio) {
      console.error('Failed to get audio permissions.');
    }
  }