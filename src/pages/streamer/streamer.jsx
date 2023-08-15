import React, { useState, useRef, useEffect } from 'react';
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

import { fetchGeolocationData } from './locationManagement.jsx'
import { requestCameraPermissions, getCameraDevices, getStreamFromCamera, handlePermissions, getCameraByType, canToggleCameras } from './deviceManagement.jsx'

const HEARTBEAT_FREQUENCY = 40000; // 40 seconds

var client = null;
var stream_info = null;
var cameraDevices = {};
var isClientReady = false; // TODO: move this to be a property of streamer instead
var useFrontCamera = true;

const Streamer = () => {
  const ref = useRef();
  const navigate = useNavigate();

  const [streamConfig, setStreamConfig] = useState(IVSBroadcastClient.BASIC_LANDSCAPE); // Add this line
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false); // Add this state
  const [readyToStream, setReadyToStream] = useState(false); // Add this state

  // Initialize the streamer
  useEffect(() => {
    Initialize();
  }, []);

  // Function to toggle the camera
  async function setupCameraStream() {
    if (window.cameraStream) {
      window.cameraStream.getTracks().forEach((track) => track.stop());  // Stop the current stream
    }

    window.cameraStream = await getCameraStream(useFrontCamera);  // Fetch the new stream    
    console.log("Camera switched to " + (useFrontCamera ? "front" : "back") + " camera successfully")
  }

  async function setupCameraStreamForClient() {
    if (!window.cameraStream) {
      console.error("No camera stream available to add to client");
    }
    client.addVideoInputDevice(window.cameraStream, 'camera1', { index: 0 });  // Add the new stream to the client
  }

  // Function to toggle the camera
  async function toggleCamera() {
    client.removeVideoInputDevice('camera1');  // Remove the old stream from the client
    useFrontCamera = !useFrontCamera;  // Switch the camera mode
    await setupCameraStream();  // Setup the new camera stream
    await setupCameraStreamForClient();  // Setup the new camera stream for the client

  }

  // Fetch camera stream according to the current value of useFrontCamera
  async function getCameraStream(useFrontCamera = true) {
    // Get the deviceId based on the useFrontCamera flag
    let camera;
    let stream;

    camera = getCameraByType(cameraDevices, (useFrontCamera ? "front" : "rear"))

    try {
      stream = await getStreamFromCamera(camera)
      ref.current.setStream(stream);
      return stream;
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  }


  async function setupMicrophoneStream() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    window.audioDevices = devices.filter((d) => d.kind === 'audioinput');

    try {
      window.microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: window.audioDevices[0].deviceId },
      });
      client.addAudioInputDevice(window.microphoneStream, 'mic1');
    } catch (error) {
      console.warn('Unable to access microphone:', error);
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


    // setup cameras and microphones
    setHasMultipleCameras(canToggleCameras(cameraDevices));
    await setupCameraStream();
    await setupMicrophoneStream();
    isClientReady = true;
    setReadyToStream(true);
    await setupCameraStreamForClient();

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
      await setupCameraStream();
      await setupCameraStreamForClient();
    }
    if (!window.microphoneStream) {
      await setupMicrophoneStream();
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


    clearInterval(window.intervalId);
  }

  const closeStreamAndChannel = async () => {
    // Current behaviour on 'back', 'refresh' or 'quit' is to close the stream and channel,
    // So creating a new channel each time
    clearCameraStreams();
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
    <div className="streamerplayer-container">

      <div className="streamerplayer-rows">
        <div className="streamerplayer-backButton">
          <IconButton edge="start" color="inherit" aria-label="back" onClick={() => {
            closeStreamAndChannel();
            navigate('/');
          }}>
            <ArrowBackIcon />
          </IconButton>
        </div>
        <h1 className="streamerPlayer-title">
          <span className="CSFont">
            <span className="CSBlack">Crowd</span>
            <span className="CSRed">Stream</span>
          </span>
        </h1>
        <div />
      </div>



      <StreamerPlayer
        ref={ref}
      />


      <div className="streamerplayer-rows-bottom">
        <button className="button" onClick={handleStream} disabled={!readyToStream}>
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