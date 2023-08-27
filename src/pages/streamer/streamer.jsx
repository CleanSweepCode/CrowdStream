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
import { requestCameraPermissions, getCameraDevices, getStreamFromCamera, handlePermissions, DeviceList, getMicrophoneStream } from './deviceManagement.jsx'



var client = null;
var cameraDevices = null;
var cameraStream = null;
var microphoneStream = null;

const Streamer = () => {
  const ref = useRef();
  const navigate = useNavigate();

  const streamConfig = IVSBroadcastClient.BASIC_LANDSCAPE;
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [readyToStream, setReadyToStream] = useState(false);
  const [noCamerasFound, setNoCamerasFound] = useState(false); // Add this state

  // Initialize the streamer
  useEffect(async () => {
    Initialize();
  }, []);

  async function Initialize() {
    const position = await fetchGeolocationData();

    if (!position) {
      throw "No Geolocation data received."
    }

    const tags = {
      "latitude": position.coords.latitude.toString(),
      "longitude": position.coords.longitude.toString(),
      "active": "preparing",
    };

    client = await StreamClient.create(tags, streamConfig);

    await handlePermissions(); // request camera permissions on page load
    cameraDevices = await getCameraDevices();

    // if we don't have a camera, end page here
    if (cameraDevices.size === 0) {
      setNoCamerasFound(true)
      return;
    } else {
      setNoCamerasFound(false)
    }

    setHasMultipleCameras(cameraDevices.size > 1);
    setReadyToStream(true);

    cameraDevices.next(); // [BUG 01] We have a bug on Chrome iOS - if this line isn't here, initial stream is black. Currently UNSOLVED!

    cameraStream = await getCameraStream();
    await setupMicrophoneStream();
  }

  async function setupMicrophoneStream() {
    try {
      microphoneStream = await getMicrophoneStream()
      client.addAudioInputDevice(microphoneStream);
    } catch (error) {
      console.warn('Error adding microphone stream to AWS:', error);
    }
  }

  async function getCameraStream() {
    var stream = await cameraDevices.activeStream(cameraStream);
    ref.current.setStream(stream);
    return stream
  }

  const startStream = async () => {

    // If there isn't a camera and microphone stream (which occurs after clicking 'End Stream'), start one
    if (!cameraStream) {
      cameraStream = await getCameraStream();
    }
    if (!microphoneStream) {
      await setupMicrophoneStream();
    }

    await client.setStream(cameraStream);

    client.start()
      .then((result) => {
        console.log('I am successfully broadcasting!');
        ref.current.setIsBroadcasting(true);
        client.has_stream = true;
      })
      .catch((error) => {
        console.error('Something drastically failed while broadcasting!', error);
      });

  }

  async function toggleCamera() {
    cameraDevices.next()
    cameraStream = await getCameraStream();  // Setup the new camera stream
    if (client.has_stream) {
      client.setStream(cameraStream);
    }
  }

  const clearCameraStreams = async () => {
    if (microphoneStream) {
      microphoneStream.getTracks().forEach((track) => track.stop());
      microphoneStream = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      cameraStream = null;
    }
  }

  const closeStream = async () => {
    if (client) {
      client.stop(); // Stop the stream
      if (ref.current) {
        ref.current.setIsBroadcasting(false);
      }
    }
  }

  const onExit = async () => {
    // Current behaviour on 'back', 'refresh' or 'quit' is to close the stream and channel,
    // So creating a new channel each time
    clearCameraStreams();
    closeStream();
    client = null;
  }

  window.addEventListener('popstate', function (event) {
    onExit()
  });


  return (
    <div className="streamerplayer-container">

      <div className="streamerplayer-rows">
        <div className="streamerplayer-backButton">
          <IconButton edge="start" color="inherit" aria-label="back" onClick={() => {
            onExit();
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

      {noCamerasFound && (
        <div className="no-cameras-message">
          No cameras are found. Please connect a camera to start streaming.
        </div>
      )}

      <div className="streamerplayer-rows-bottom">
        <button className="button" onClick={startStream} disabled={!readyToStream}>
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