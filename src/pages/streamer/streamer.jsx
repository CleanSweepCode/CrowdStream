import React, { useState, useRef } from 'react';
import StreamerPlayer from './streamerPlayer.jsx';
import { useParams } from 'react-router-dom';
import Button from 'react';
import useStream from '../../components/Stream/useStream.js';
import { getConfigFromResolution } from '../../components/Helpers/helpers.js';
import IVSBroadcastClient, {
  Errors,
  BASIC_LANDSCAPE
} from 'amazon-ivs-web-broadcast';
import '../../App.css';
import { listChannels, createChannel, channelHeartbeat } from '../../components/Helpers/APIUtils.jsx'
import IconButton from '@material-ui/core/IconButton';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

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
  const navigate = useNavigate();

  const [useFrontCamera, setUseFrontCamera] = useState(true);  // Add this line
  const [streamConfig, setStreamConfig] = useState(IVSBroadcastClient.BASIC_LANDSCAPE); // Add this line
  const [isClientReady, setIsClientReady] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false); // Add this state

  var client = null
  var stream_info = null;

  async function requestCameraPermissions() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("Camera permissions granted");
    } catch (err) {
      console.error("No cameras available, so no camera permissions granted: ", err);
    }
  }

  // Function to toggle the camera
  async function toggleCamera() {
    if (!isClientReady) {
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
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

      ref.current.setStream(stream);
      return stream;
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
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
    console.log("INITIALIZING")
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

    // console.log(stream_info);

    client = IVSBroadcastClient.create({
      // Enter the desired stream configuration
      streamConfig: streamConfig,
      ingestEndpoint: stream_info.channel.ingestEndpoint,
      streamKey: stream_info.streamKey.value,
    });
    console.log("Client created");
    console.log(client);
    //setIsClientReady(true);

    // set channel heartbeat every X seconds while active
    async function sendHeartbeat() {
      const heartbeat = await channelHeartbeat(stream_info.channel.name);
    }

    sendHeartbeat(); // send initial heartbeat
    const intervalId = setInterval(sendHeartbeat, HEARTBEAT_FREQUENCY); // send heartbeat every X seconds
    window.intervalId = intervalId; // save intervalId to the window object
    function handleBeforeUnload() {
      client.stopBroadcast();
      clearInterval(window.intervalId);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);

    await requestCameraPermissions(); // request camera permissions on page load

    const devices = await navigator.mediaDevices.enumerateDevices();
    window.videoDevices = devices.filter((d) => d.kind === 'videoinput');
    window.audioDevices = devices.filter((d) => d.kind === 'audioinput');

    setHasMultipleCameras(window.videoDevices.length > 1);

    try {
      window.cameraStream = await getCameraStream(useFrontCamera);
      ref.current.setStream(window.cameraStream);
      client.addVideoInputDevice(window.cameraStream, 'camera1', { index: 0 });
    } catch (error) {
      console.warn('Unable to access camera:', error);
    }

    try {
      window.microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: window.audioDevices[0].deviceId },
      });
      client.addAudioInputDevice(window.microphoneStream, 'mic1');
    } catch (error) {
      console.warn('Unable to access microphone:', error);
    }
    setIsClientReady(true);
  }


  const handleStream = async () => {
    console.log("Client initialized");
    console.log(client);
    console.log("Starting stream");
    handlePermissions()
    listChannels()
    console.log(client)
    console.log(stream_info);
    client.startBroadcast(stream_info.streamKey.value)
      .then((result) => {
        console.log('I am successfully broadcasting!');
        ref.current.setIsBroadcasting(true);
      })
      .catch((error) => {
        console.error('Something drastically failed while broadcasting!', error);
      });
  };

  const handleNoStream = async () => {
    if (client) {
      client.stopBroadcast(); // Stop the stream
      ref.current.setIsBroadcasting(false);
    }
    console.log(window.microphoneStream);
    if (window.microphoneStream) {
      window.microphoneStream.getTracks().forEach((track) => track.stop());
      window.microphoneStream = null;
    }
    if (window.cameraStream) {
      window.cameraStream.getTracks().forEach((track) => track.stop());
      window.cameraStream = null;
    }
    console.log(window.cameraStream);
    clearInterval(window.intervalId);
    console.log("Ended stream");
  }

  return (
    <div className="App">


      <div className="backButton">
        <IconButton edge="start" color="inherit" aria-label="back" onClick={() => {
          handleNoStream();
          navigate('/');
        }}>
          <ArrowBackIcon />
        </IconButton>
      </div>

      <h1>CrowdStream</h1>

      <StreamerPlayer
        ref={ref}
        onPlayerReady={() => {
          if (!isClientReady) {
            Initialize();
          }
          console.log('Player is ready!');
        }}
      />


      <div className="row">
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