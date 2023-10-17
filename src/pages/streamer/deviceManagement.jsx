import {zoomStream} from './zoom.jsx';

const VIDEO_INPUT = 'videoinput';
const AUDIO_INPUT = 'audioinput';
const REAR_KEYS = ['rear', 'back', 'environment'];

class DeviceList {
  constructor(arr, canvasElement) {
    this.array = arr;
    this.index = 0;
    this.size = arr.length;
    this.canvasElement = canvasElement;
    this.canvasContext = this.canvasElement.getContext('2d');
    this.zoomFactor = 1.0;
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

  setZoom(newZoomFactor) {
    this.zoomFactor = newZoomFactor;
  }

  draw(videoElement) {
    this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    let cropWidth = this.canvasElement.width / this.zoomFactor;
    let cropHeight = this.canvasElement.height / this.zoomFactor;
    let cropX = (this.canvasElement.width - cropWidth) / 2;
    let cropY = (this.canvasElement.height - cropHeight) / 2;

    this.canvasContext.drawImage(
      videoElement,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, this.canvasElement.width, this.canvasElement.height
    );

    requestAnimationFrame(() => this.draw(videoElement));

    
  }

  async activeStream(previousStream = null) {
    if (previousStream) {
      // Assuming stopTracks is a function that stops all tracks in a MediaStream
      stopTracks(previousStream);
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: this.active().deviceId } },
        audio: false,
      });
    } catch (err) {
      console.error('Error accessing camera:', err);
      throw err;
    }

    let videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.play();

    await new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        this.canvasElement.width = videoElement.videoWidth;
        this.canvasElement.height = videoElement.videoHeight;
        resolve();
      };
    });

    this.draw(videoElement);
    

    return this.canvasElement.captureStream();
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

  const canvasElement = document.createElement('canvas');
  canvasElement.width = 1920;  
  canvasElement.height = 1080;
  document.body.appendChild(canvasElement);

  const deviceList = new DeviceList(videoDevices, canvasElement);
  return deviceList;
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
    return true;
  } catch (err) {
    permissions = { video: false, audio: false };
    console.error(err.message);
  }
  // If we still don't have permissions after requesting them display the error message
  if (!permissions.video) {
    console.error('Failed to get video permissions.');
    return false;
  } else if (!permissions.audio) {
    console.error('Failed to get audio permissions.');
    return false;
  }
}

