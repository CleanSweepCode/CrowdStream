import React, { useState, useRef } from 'react';
import MiniPlayer from '../../components/mini-player';
import { CONTROLS, POSITION } from '../../components/mini-player';
import { useParams } from 'react-router-dom';
import Button from 'react';
import useStream from '../../components/Stream';
import { getConfigFromResolution } from '../../components/Helpers';
import IVSBroadcastClient, {
  Errors,
  BASIC_LANDSCAPE
} from 'amazon-ivs-web-broadcast';
import '../../App.css';
import { listChannels, createChannel, channelHeartbeat } from '../utils.jsx'

const HEARTBEAT_FREQUENCY = 40000; // 40 seconds

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    } else {
      reject(new Error('Geolocation is not supported'));
    }
  });
}

async function fetchGeolocationData() {
  //  check permissions
  // let permission = await navigator.permissions.query({name: 'geolocation'});
  // if (permission.state === 'denied') {
  //   window.alert('You have denied location access. Please enable: go to your browser settings, find this website, and allow geolocation.');
  //   return;
  // }

  try {
    const position = await getCurrentPosition();

    // Use latitude and longitude to perform further operations
    return position

  } catch (error) {
    console.error('Error retrieving geolocation:', error);
  }
}


const Streamer = () => {
  const ref = useRef();
  const [useFrontCamera, setUseFrontCamera] = useState(true);  // Add this line
  const [streamConfig, setStreamConfig] = useState(IVSBroadcastClient.BASIC_LANDSCAPE); // Add this line
  const [isClientReady, setIsClientReady] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false); // Add this state

  var client = null
  var stream_info = null;

  // Function to toggle the camera
  async function toggleCamera() {
    if (!isClientReady){
      console.log("Client not ready")
      return;
    }

    setUseFrontCamera(!useFrontCamera);  // Switch the camera mode
    window.cameraStream.getTracks().forEach((track) => track.stop());  // Stop the current stream
    client.removeVideoInputDevice('camera1');
    window.cameraStream = await getCameraStream(useFrontCamera);  // Fetch the new stream
    client.addVideoInputDevice(window.cameraStream, 'camera1', { index: 0 });  // Add the new stream to the client
    console.log("Camera switched to " + (useFrontCamera ? "front" : "back") + " camera successfully")
  }

    // Fetch camera stream according to the current value of useFrontCamera
    async function getCameraStream(useFrontCamera = true) {
      const facingMode = useFrontCamera ? 'user' : 'environment';
      return navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: {
            ideal: streamConfig.maxResolution.width,
            max: streamConfig.maxResolution.width,
          },
          height: {
            ideal: streamConfig.maxResolution.height,
            max: streamConfig.maxResolution.height,
          },
        },
      });
    }

  async function handlePermissions() {
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

  async function Initialize() {

    const position = await fetchGeolocationData();

    // if we don't have a position, end page here
    if (!position) {
      return;
    }

    const tags = {
      "latitude": position.coords.latitude.toString(),
      "longitude": position.coords.longitude.toString(),
      "active": "true",
    };

    const stream_api_call = await createChannel(tags);
    stream_info = stream_api_call.data;

    console.log(stream_info);
    ref.current.setURL(stream_info.channel.playbackUrl);

    client = IVSBroadcastClient.create({
      // Enter the desired stream configuration
      streamConfig: streamConfig,
      ingestEndpoint: stream_info.channel.ingestEndpoint,
      streamKey: stream_info.streamKey.value,
    });

    setIsClientReady(true);

    // set channel heartbeat every X seconds while active
    async function sendHeartbeat() {
      const heartbeat = await channelHeartbeat(stream_info.channel.name);
    }

    sendHeartbeat(); // send initial heartbeat
    setInterval(sendHeartbeat, HEARTBEAT_FREQUENCY); // send heartbeat every X seconds

    function handleBeforeUnload() {
      client.stopBroadcast();
    }

    window.addEventListener('beforeunload', handleBeforeUnload);

    const devices = await navigator.mediaDevices.enumerateDevices();
    window.videoDevices = devices.filter((d) => d.kind === 'videoinput');
    window.audioDevices = devices.filter((d) => d.kind === 'audioinput');

    setHasMultipleCameras(window.videoDevices.length > 1);
    console.log("Has multiple cameras: " + hasMultipleCameras);
    console.log("Cameras", window.videoDevices);

    try {
      window.cameraStream = await getCameraStream(useFrontCamera);
      console.log(window.cameraStream);
      client.addVideoInputDevice(window.cameraStream, 'camera1', { index: 0 });
    } catch (error) {
      console.warn('Unable to access camera:', error);
    }

    try {
      window.microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: window.audioDevices[0].deviceId },
      });
      console.log(window.microphoneStream);
      client.addAudioInputDevice(window.microphoneStream, 'mic1');
    } catch (error) {
      console.warn('Unable to access microphone:', error);
    }

  }


  const handleStream = async () => {
    handlePermissions()
    listChannels()
    client.startBroadcast(stream_info.streamKey.value)
      .then((result) => {
        console.log('I am successfully broadcasting!');
        ref.current.log();
      })
      .catch((error) => {
        console.error('Something drastically failed while broadcasting!', error);
      });
  };

  const handleNoStream = async () => {
    client.stopBroadcast()
    console.log("Ended stream");
  }

  const refreshStream = async () => {
    ref.current.log();
  }

  return (
    <div className="App">

      <h1>Crowd-Sourced Livestreaming</h1>
      <p>A project by Clean-Sweep Code</p>

      <MiniPlayer
        ref={ref}
        // streamUrl={STREAM_PLAYBACK_URL}
        onPlayerReady={() => {
          Initialize();
        }}
        controls={[CONTROLS.resize, CONTROLS.close, CONTROLS.mute]}
        position={POSITION.topLeft}
        transition
      />

      <div className="row">
        <button className="button" onClick={refreshStream}>
          Refresh Stream
        </button>

        <button className="button red" onClick={handleNoStream}>
          End Stream
        </button>

        <button className="button" onClick={handleStream} disabled={!isClientReady}>
          Stream
        </button>

        <button className="button" onClick={toggleCamera} disabled={!hasMultipleCameras}>
          Toggle Camera
        </button>

      </div>
    </div>
  );


}

export default Streamer;