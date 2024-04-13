const VIDEO_INPUT = 'videoinput';
const AUDIO_INPUT = 'audioinput';
const REAR_KEYS = ['rear', 'back', 'environment'];

class DeviceList {
  constructor(arr) {
    this.array = arr;
    this.index = 0;
    this.size = arr.length;
  }

  active() {
    return this.array[this.index];
  }

  activeName() {
    return this.array[this.index].label;
  }

  next() {
    this.index = (this.index + 1) % this.array.length;
  }

  async activeStream(previousStream = null) {
    // if (previousStream) {
    //   stopTracks(previousStream);
    // }

    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: this.active().deviceId } },
        audio: false,
      });
    } catch (err) {
      console.error('Error accessing camera:', err);
      throw err;
    }
  }
}

function stopTracks(stream) {
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop());
}

export async function getCameraDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((device) => device.kind === VIDEO_INPUT);

  videoDevices.sort((a, b) => {
    const aContainsKey = REAR_KEYS.some((key) => a.label.toLowerCase().includes(key));
    const bContainsKey = REAR_KEYS.some((key) => b.label.toLowerCase().includes(key));

    if (aContainsKey && bContainsKey) return 0;
    if (aContainsKey) return -1;
    if (bContainsKey) return 1;
    return 0;
  });

//   // Function to detect if the current device is a mobile device
//   const isMobileDevice = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

//   if (isMobileDevice()) {
//     // If it's a mobile device, filter the video devices to only include those with labels indicating they are rear-facing
//     videoDevices = videoDevices.filter((device) => REAR_KEYS.some((key) => device.label.toLowerCase().includes(key)));
//   }

//   const deviceList = new DeviceList(videoDevices);
//   return deviceList;
}


export async function getMicrophoneStream() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  var audioDevices = devices.filter((d) => d.kind === 'audioinput');

  try {
    var microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: audioDevices[0].deviceId },
    });
    return microphoneStream;
  } catch (error) {
    console.warn('Unable to access microphone:', error);
  }
}

// export async function handlePermissions() {
//   let permissions = {
//     audio: false,
//     video: false,
//   };
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     for (const track of stream.getTracks()) {
//       track.stop();
//     }
//     permissions = { video: true, audio: true };
//     return true;
//   } catch (err) {
//     permissions = { video: false, audio: false };
//     console.error(err.message);
//   }
//   // If we still don't have permissions after requesting them display the error message
//   if (!permissions.video) {
//     console.error('Failed to get video permissions.');
//     return false;
//   } else if (!permissions.audio) {
//     console.error('Failed to get audio permissions.');
//     return false;
//   }
// }

export async function handlePermissions() {
  let permissions = {
    audio: false,
    video: false,
  };
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    permissions = { video: true, audio: true };

    // Stop tracks immediately only if checking permissions, but don't return this stream.
    stream.getTracks().forEach(track => track.stop());

    return true;
  } catch (err) {
    console.error('Failed to obtain permissions:', err);
    permissions = { video: false, audio: false };
    return false;
  }
}

