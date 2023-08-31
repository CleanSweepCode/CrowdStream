import React, { useState, useRef, useEffect } from 'react';
import StreamerPlayer from './streamerPlayer.jsx';
import IVSBroadcastClient from 'amazon-ivs-web-broadcast';
import '../../App.css';
import './streamerPlayer.css';
import { StreamClient } from './streamClient.jsx'
import IconButton from '@material-ui/core/IconButton';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { fetchGeolocationData } from './locationManagement.jsx'
import { getCameraDevices, handlePermissions, getMicrophoneStream } from './deviceManagement.jsx'

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
  const [startStreamErrors, setStartStreamErrors] = useState([]);

  const handleRemoveError = (errorName) => {
    const newStartStreamErrors = startStreamErrors.filter(item => item !== errorName);
    setStartStreamErrors(newStartStreamErrors);
  };

  const handleAddError = (errorName) => {
    const newStartStreamErrors = [...startStreamErrors, errorName];
    setStartStreamErrors(newStartStreamErrors);
  };

  // Initialize the streamer
  useEffect(async () => {
    Initialize();
  }, []);

  async function Initialize() {
    const position = await fetchGeolocationData();

    if (position) {
      handleRemoveError('noGeoLocation');
    } else {
      handleAddError('noGeoLocation');
      return;
    }


    // try this and if it throws an error then add this to the error list

    const gotPermissions = await handlePermissions(); // request camera permissions on page load
    if (gotPermissions) {
      handleRemoveError('noPermissions');
    } else {
      handleAddError('noPermissions');
      return;
    }

    cameraDevices = await getCameraDevices();

    // if we don't have a camera, end page here
    if (cameraDevices.size === 0) {
      handleAddError('noCamera');
      return;
    } else {
      handleRemoveError('noCamera');
    }

    setHasMultipleCameras(cameraDevices.size > 1);
    setReadyToStream(true);

    cameraStream = await getCameraStream();

    const tags = {
      "latitude": position.coords.latitude.toString(),
      "longitude": position.coords.longitude.toString(),
      "active": "preparing",
    };

    client = await StreamClient.create(tags, streamConfig);
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
        ref.current.setIsBroadcasting(true);
        client.has_stream = true;
      })
      .catch((error) => {
        console.error('Something drastically failed while broadcasting!', error);
      });

  }

  const delay = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  async function toggleCamera() {
    setHasMultipleCameras(false)
    cameraDevices.next()
    cameraStream = await getCameraStream();  // Setup the new camera stream
    if (client.has_stream) {
      client.setStream(cameraStream);
    }
    await delay(1000); // Wait 5 seconds before allowing the user to toggle again
    console.log('camera toggled')
    setHasMultipleCameras(true)
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


      {startStreamErrors.includes('noPermissions') && (
        <div className="error-message">
          Camera/Microphone permissions error. Make sure you have Camera/Microphone permissions enabled.
        </div>
      )}

      {startStreamErrors.includes('noCamera') && (
        <div className="error-message">
          No cameras are found. Please connect a camera to start streaming.
        </div>
      )}

      {startStreamErrors.includes('noGeoLocation') && (
        <div className="error-message">
          Geo-location permissions error. Make sure you have location permissions enabled to start streaming.
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