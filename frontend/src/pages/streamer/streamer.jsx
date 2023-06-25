import React, { forwardRef, useImperativeHandle, useRef } from 'react';
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
import { listChannels, getStreamLinkFromName, createChannel, channelHeartbeat } from '../utils.jsx'

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
    const { latitude, longitude } = position.coords;

    // Use latitude and longitude to perform further operations
    return position

  } catch (error) {
    console.error('Error retrieving geolocation:', error);
  }
}

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -3.745,
  lng: -38.523
};



const Streamer = () => {
  const ref = useRef();

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

  var client = null
  let { channel_name } = useParams();
  var stream_info = null;

  async function Initialize() {

    const position = await fetchGeolocationData();
    const tags = {
      "latitude": position.coords.latitude.toString(),
      "longitude": position.coords.longitude.toString(),
      "active": "true",
    };

    const stream_api_call = await createChannel(tags);
    stream_info = stream_api_call.data;

    console.log(stream_info);
    ref.current.setURL(stream_info.channel.playbackUrl);

    const streamConfig = IVSBroadcastClient.BASIC_LANDSCAPE;

    client = IVSBroadcastClient.create({
      // Enter the desired stream configuration
      streamConfig: streamConfig,
      ingestEndpoint: stream_info.channel.ingestEndpoint,
      streamKey: stream_info.streamKey.value,
    });

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

    try {
      window.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: window.videoDevices[0].deviceId,
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

        <button className="button" onClick={handleStream}>
          Stream
        </button>

      </div>
    </div>
  );


}

export default Streamer;