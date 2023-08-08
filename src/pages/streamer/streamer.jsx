import React, { useState, useRef } from 'react';
import StreamerPlayer from './streamerPlayer.jsx';
import useStream from '../../components/Stream/useStream.js';
import { getConfigFromResolution } from '../../components/Helpers/helpers.js';
import IVSBroadcastClient, {
  Errors,
  BASIC_LANDSCAPE
} from 'amazon-ivs-web-broadcast';
import '../../App.css';
import './streamerPlayer.css';
import { listChannels, createChannel, channelHeartbeat, tagChannelInactive, tagChannelActive } from '../../components/Helpers/APIUtils.jsx'
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

var client = null;
var stream_info = null;

const Streamer = () => {
  const ref = useRef();
  const navigate = useNavigate();

  const [useFrontCamera, setUseFrontCamera] = useState(true);  // Add this line
  const [streamConfig, setStreamConfig] = useState(IVSBroadcastClient.BASIC_LANDSCAPE); // Add this line
  const [isClientReady, setIsClientReady] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false); // Add this state

  var cameraDevices = [];

  async function getCameraDevices() {
    // Return a list of camera devices
    // First will be rear camera OR only camera
    // Second will be front camera (if available)

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    let camera1 = null;
    let camera2 = null;

    for (const device of videoDevices) {
        if (device.label.toLowerCase().includes('front')) {
            camera2 = device;
        } else if (device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear')) {
            camera1 = device;
        }
    }

    // If specific labels weren't found, just default to using the devices in the order they appear
    if (!camera1 && videoDevices.length > 0) {
        camera1 = videoDevices[0];
    }

    if (!camera2 && videoDevices.length > 1) {
        rearCamera = videoDevices[1];
    }

    // Return the camera devices, ignoring if null
    return [camera1, camera2].filter(camera => camera !== null);
  }

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
    // Get the deviceId based on the useFrontCamera flag
    let deviceId;
    if (cameraDevices.length === 0) {
      console.error("No cameras available.");
      return;
    } else if (useFrontCamera || cameraDevices.length === 1) {
      deviceId = cameraDevices[0].deviceId;
    } else if (!useFrontCamera && cameraDevices.length > 1) {
      deviceId = cameraDevices[1].deviceId;
    }
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId, // Use the deviceId
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
    if (client) {
      console.log("Client already exists")
      return;
    }

    const position = await fetchGeolocationData();

    // if we don't have a position, end page here
    if (!position) {
      return;
    }

    const tags = {
      "latitude": position.coords.latitude.toString(),
      "longitude": position.coords.longitude.toString(),
      "active": "preparing",
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

    cameraDevices = await getCameraDevices();
    const devices = await navigator.mediaDevices.enumerateDevices();
    window.videoDevices = devices.filter((d) => d.kind === 'videoinput');
    window.audioDevices = devices.filter((d) => d.kind === 'audioinput');

    setHasMultipleCameras(cameraDevices.length > 1);

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

    // If there isn't a camera and microphone stream (which occurs after clicking 'End Stream'), start one
    if (!window.cameraStream) {
      try {
        window.cameraStream = await getCameraStream(useFrontCamera);
        ref.current.setStream(window.cameraStream);
      } catch (error) {
        console.warn('Unable to access camera:', error);
      }
    }
    if (!window.microphoneStream) {
      try {
        window.microphoneStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: window.audioDevices[0].deviceId },
        });
      } catch (error) {
        console.warn('Unable to access microphone:', error);
      }
    }

    client.startBroadcast(stream_info.streamKey.value)
      .then((result) => {
        console.log('I am successfully broadcasting!');
        ref.current.setIsBroadcasting(true);
        tagChannelActive(stream_info.channel.name);
      })
      .catch((error) => {
        console.error('Something drastically failed while broadcasting!', error);
      });
  };

  const clearCameraStreams = async () => {
    if (window.microphoneStream) {
      window.microphoneStream.getTracks().forEach((track) => track.stop());
      window.microphoneStream = null;
    }
    if (window.cameraStream) {
      window.cameraStream.getTracks().forEach((track) => track.stop());
      window.cameraStream = null;
    }

  }

  const closeStream = async () => {
    if (client) {
      client.stopBroadcast(); // Stop the stream
      tagChannelInactive(stream_info.channel.name);
      if (ref.current) {
        ref.current.setIsBroadcasting(false);
      }
    }

    clearCameraStreams();
    clearInterval(window.intervalId);
  }

  const closeStreamAndChannel = async () => {
    // Current behaviour on 'back', 'refresh' or 'quit' is to close the stream and channel,
    // So creating a new channel each time
    closeStream();
    client = null;
  }

  // on back
  window.addEventListener('popstate', function (event) {
    closeStreamAndChannel()
  });

  // on refresh / quit
  window.onbeforeunload = function () {
    closeStreamAndChannel()
  };

  return (
    <div className="App">



      <div className="backButton">
        <IconButton edge="start" color="inherit" aria-label="back" onClick={() => {
          closeStreamAndChannel();
          navigate('/');
        }}>
          <ArrowBackIcon />
        </IconButton>
      </div>

      <h1 style={{ fontSize: "4rem" }}>
        <span className="CSFont">
          <span className="CSBlack">Crowd</span>
          <span className="CSRed">Stream</span>
        </span>
      </h1>

      <StreamerPlayer
        ref={ref}
        onPlayerReady={() => {
          if (!isClientReady) {
            Initialize();
          }
        }}
      />


      <div className="row">
        <button className="button" onClick={handleStream} disabled={!isClientReady}>
          Start Stream
        </button>

        <button className="button red" onClick={closeStream}>
          End Stream
        </button>

        <button className="button" onClick={toggleCamera} disabled={!hasMultipleCameras}>
          Toggle Camera
        </button>

      </div>
    </div>
  );


}

export default Streamer;