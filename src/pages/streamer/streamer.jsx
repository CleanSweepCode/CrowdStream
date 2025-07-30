import React, { useState, useRef, useEffect } from 'react';
import StreamerPlayer from './streamerPlayer.jsx';
import IVSBroadcastClient from 'amazon-ivs-web-broadcast';
import '../../App.css';
import './streamerPlayer.css';
import { StreamClient, StreamClientDummy } from './streamClient.jsx'
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchGeolocationDataWithFallback } from './locationManagement.jsx'
import { getCameraDevices, handlePermissions, getMicrophoneStream } from './deviceManagement.jsx'
import { getEvents } from '../../components/Helpers/APIUtils.jsx'

const REFRESH_INTERVAL = 10000; // 10 seconds

var client = null;
var cameraDevices = null;
var cameraStream = null;
var microphoneStream = null;

var AWS_ENABLED = true; // set to false to avoid channel creation

const Streamer = () => {
  const ref = useRef();
  const navigate = useNavigate();

  const streamConfig = IVSBroadcastClient.BASIC_FULL_HD_LANDSCAPE;
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [readyToStream, setReadyToStream] = useState(false);
  const [startStreamErrors, setStartStreamErrors] = useState([]);
  const [intervalId, setIntervalId] = useState(null); // Add state for interval ID
  const [eventId, setEventId] = useState(''); // State variable for selected event ID
  const [eventOptions, setEventOptions] = useState([]);


  const getEventsData = async () => {
    try {
      const data = await getEvents(); // Call your getEvents function
      // Extract event keys and labels from the JSON data
      const options = Object.keys(data.events).map((key) => ({
        value: key,
        label: data.events[key].name,
      }));
      setEventOptions(options);
    } catch (error) {
      console.error('Error fetching events data', error);
    }
  };

  const handleRemoveError = (errorName) => {
    const newStartStreamErrors = startStreamErrors.filter(item => item !== errorName);
    setStartStreamErrors(newStartStreamErrors);
  };

  const handleAddError = (errorName) => {
    const newStartStreamErrors = [...startStreamErrors, errorName];
    setStartStreamErrors(newStartStreamErrors);
  };

  const handleRefreshLocation = async () => {
    const position = await fetchGeolocationDataWithFallback();
    if (position) {
      const tags = {
        "latitude": position.coords.latitude.toString(),
        "longitude": position.coords.longitude.toString(),
      };

      client.updateTags(tags);
      console.log('Updated location to: ', position.coords.latitude, position.coords.longitude);
    } else {
      console.warn('Could not refresh location - no position available');
    }
  }  

  // async function enforceLandscapeOrientation() {
  //   // Check if the screen orientation API is available
  //   if (screen.orientation && screen.orientation.lock) {
  //     try {
  //       await screen.orientation.lock('landscape');
  //       console.log('Orientation locked to landscape.');
  //     } catch (error) {
  //       console.warn('Could not lock the orientation: ', error);
  //       // Optionally, show a UI element asking users to switch to landscape mode manually
  //     }
  //   } else {
  //     // Screen Orientation API not available
  //     // Optionally, show a UI element asking users to switch to landscape mode manually
  //   }
  // }

  // Initialize the streamer
  useEffect(async () => {
    Initialize();
  }, []);

  async function Initialize() {
    const position = await fetchGeolocationDataWithFallback();
    getEventsData();

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


    cameraStream = await getCameraStream();

    const tags = {
      "latitude": position.coords.latitude.toString(),
      "longitude": position.coords.longitude.toString(),
      "active": "preparing",
      "record": "true", // Uncomment this to enable recording
    };

    if (AWS_ENABLED) {
      client = await StreamClient.create(tags, streamConfig);
    }
    else {
      console.log("AWS is disabled - using dummy stream client")
      client = new StreamClientDummy(tags, streamConfig);
    }

    await setupMicrophoneStream();

    if (!intervalId) {
      const id = setInterval(handleRefreshLocation, REFRESH_INTERVAL);
      setIntervalId(id);
    };

    setReadyToStream(true);
    
    // Clean up the interval when the component unmounts or when the effect is run again
    return () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
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
  
    // // Attempt to enforce landscape orientation
    // await enforceLandscapeOrientation();

    if (!client.has_stream) {
      await client.setStream(cameraStream);
    }
    client.start()
      .then((result) => {
        ref.current.setIsBroadcasting(true);
        client.has_stream = true;
        console.log("Started Streaming")
        setReadyToStream(false);
      })
      .catch((error) => {
        console.error('Something drastically failed while broadcasting!', error);
      });
  }

  const delay = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  const handleSetEventId = (eventId) => {
    setEventId(eventId);
    const tags = {
      "eventId": eventId,
    };

    client.updateTags(tags);
    console.log('event ID tag updated to:', eventId);
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
    if (readyToStream || client) {
      client.stop(); // Stop the stream
      if (ref.current) {
        ref.current.setIsBroadcasting(false);
      }
      setReadyToStream(true);
    }
  }

  const onExit = async () => {
    // Current behaviour on 'back', 'refresh' or 'quit' is to close the stream and channel,
    // So creating a new channel each time
    clearCameraStreams();
    closeStream();
    clearInterval(intervalId);
    client = null;
  }

  window.addEventListener('popstate', function (event) {
    onExit()
  });


  return (
    <div className="streamerplayer-container">

      <div className="streamerplayer-rows">
        <div className="streamerplayer-backButton">
          <IconButton edge="start" color="inherit" aria-label="back" onClick={async () => {
            await onExit();
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
          <strong>Location Access Required</strong><br/>
          Unable to get your location. This could be due to:<br/>
          • Location permissions being denied<br/>
          • Location services being disabled on your device<br/>
          • Poor GPS signal or being indoors<br/>
          <br/>
          <button 
            className="button" 
            onClick={async () => {
              const position = await fetchGeolocationDataWithFallback();
              if (position) {
                handleRemoveError('noGeoLocation');
                // Re-initialize if we now have location
                if (!readyToStream) {
                  Initialize();
                }
              }
            }}
            style={{ marginTop: '10px' }}
          >
            Retry Location
          </button>
        </div>
      )}



      <div className="streamerplayer-rows-bottom">
        <button className="button" onClick={startStream} disabled={!readyToStream}>
          Start Stream
        </button>

        <button className="button red" onClick={async () => {
            await onExit();
            navigate('/');
          }}>
          End Stream 
        </button>

        <button className="button" onClick={toggleCamera} disabled={!hasMultipleCameras}>
          Toggle Camera
        </button>

        {/* Add a dropdown menu for selecting the event ID */}
        <div className="event-id-input">
          {/* <label htmlFor="eventIdSelect">Select Event:</label> */
          }
          <select
            id="eventIdSelect"
            value={eventId}
            onChange={(e) => handleSetEventId(e.target.value)}
          >
            {eventOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );

}

export default Streamer;