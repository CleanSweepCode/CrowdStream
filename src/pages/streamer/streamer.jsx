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
import { listChannels } from '../../components/Helpers/APIUtils.jsx'
import { StreamClient } from './streamClient.jsx'
import IconButton from '@material-ui/core/IconButton';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import { fetchGeolocationData } from './locationManagement.jsx'
import { requestCameraPermissions, getCameraDevices, getStreamFromCamera, handlePermissions, DeviceList } from './deviceManagement.jsx'

const HEARTBEAT_FREQUENCY = 40000; // 40 seconds

var client = null;
var cameraDevices = null; // will be a DeviceList
var isClientReady = false; // TODO: move this to be a property of streamer instead

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

    window.cameraStream = await getCameraStream();  // Fetch the new stream
    console.log("Camera switched to " + cameraDevices.activeName() + " successfully")
    console.log("Setting stream to: ", window.cameraStream);
    client.setStream(window.cameraStream);
  }

  // Function to toggle the camera
  async function toggleCamera() {
    cameraDevices.next()
    await setupCameraStream();  // Setup the new camera stream
  }

  // Fetch camera stream according to the current value of useFrontCamera
  async function getCameraStream() {
    // Get the deviceId based on the useFrontCamera flag
    let camera;
    let stream;

    camera = cameraDevices.active(); // get active camera

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
      client.addAudioInputDevice(window.microphoneStream);
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

    client = await StreamClient.create(tags, streamConfig);

    console.log("Client created");
    console.log(client);

    client.sendHeartbeat(); // send initial heartbeat
    const intervalId = setInterval(client.sendHeartbeat, HEARTBEAT_FREQUENCY); // send heartbeat every X seconds
    window.intervalId = intervalId; // save intervalId to the window object
    function handleBeforeUnload() {
      client.stop();
      clearInterval(window.intervalId);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);

    await requestCameraPermissions(); // request camera permissions on page load

    cameraDevices = await getCameraDevices();


    // setup cameras and microphones
    isClientReady = true;
    setHasMultipleCameras(cameraDevices.size > 1);
    setReadyToStream(true);
    console.log("Initialize nearly completed")
    cameraDevices.next()
    await setupCameraStream();
    await setupMicrophoneStream();
  }


  const handleStream = async () => {
    console.log("Client initialized");
    console.log(client);
    console.log("Starting stream");
    handlePermissions()
    listChannels()
    console.log("Client Log HandleStream 172 streamer.jsx: ", client)

    // If there isn't a camera and microphone stream (which occurs after clicking 'End Stream'), start one
    if (!window.cameraStream) {
      console.log("No camera stream");
      await setupCameraStream();
    }
    if (!window.microphoneStream) {
      console.log("No camera stream");
      await setupMicrophoneStream();
    }

    client.start()
      .then((result) => {
        console.log('I am successfully broadcasting!');
        ref.current.setIsBroadcasting(true);
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
      client.stop(); // Stop the stream

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