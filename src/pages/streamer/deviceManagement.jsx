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
    const value = this.array[this.index];
    this.index = (this.index + 1) % this.array.length;
  }

  async activeStream(previousStream=null) {

    // Have to close previous stream before calling getUserMedia on iOS Safari.
    if (previousStream){
      const tracks = previousStream.getTracks();
      tracks.forEach(track => track.stop());
    }
  
    // Given a camera device, return a stream
    try {
      return await navigator.mediaDevices.getUserMedia({
          video: {
              deviceId: { exact: this.active().deviceId },
          },
          audio: false
      });
    } catch (err) {
        console.error('Error accessing camera:', err);
        throw err;
    }
  }

}

export async function getCameraDevices() {
  // Return a DeviceList of all active cameras

  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');

  // sort device list, preferring ones that contain rearKeys
  let rearKeys = ['rear', 'back', 'environment']

  videoDevices.sort((a, b) => {
    const aContainsKey = rearKeys.some(key => a.label.toLowerCase().includes(key));
    const bContainsKey = rearKeys.some(key => b.label.toLowerCase().includes(key));

    if (aContainsKey && bContainsKey) return 0; // Both have rearKeys, so retain their order
    if (aContainsKey) return -1;                // a should come before b
    if (bContainsKey) return 1;                 // b should come before a
    return 0;                                  // Neither have rearKeys, so retain their order
  });

  var deviceList = new DeviceList(videoDevices);

  console.log("Device List: ", deviceList)
  return deviceList;
}



export async function getMicrophoneStream(){
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

