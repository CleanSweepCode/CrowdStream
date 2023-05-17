import React, { forwardRef, useImperativeHandle, useRef } from 'react';

import MiniPlayer from './components/mini-player';
import { CONTROLS, POSITION } from './components/mini-player';
import Button from 'react';
import useStream from './components/Stream';
import { getConfigFromResolution } from './components/Helpers';
import IVSBroadcastClient, {
  Errors,
  BASIC_LANDSCAPE
} from 'amazon-ivs-web-broadcast';

import './App.css';

const STREAM_PLAYBACK_URL = 'https://c6d0b5e2ec90.eu-west-1.playback.live-video.net/api/video/v1/eu-west-1.449365895007.channel.YMQwDQyyYa0W.m3u8'//'https://6547df1ee2a7.eu-west-1.playback.live-video.net/api/video/v1/eu-west-1.832590881550.channel.zuXw8aqr1sZO.m3u8'

const STREAM_PLAYBACK_URL_2 = 'https://c6d0b5e2ec90.eu-west-1.playback.live-video.net/api/video/v1/eu-west-1.449365895007.channel.YMQwDQyyYa0W.m3u8'//https://6547df1ee2a7.eu-west-1.playback.live-video.net/api/video/v1/eu-west-1.832590881550.channel.tKR5llXiZtd1.m3u8'

// https://codepen.io/amazon-ivs/pen/poLRoPp
// Set initial config for our broadcast
/*const config = {
  ingestEndpoint: "rtmps://c6d0b5e2ec90.global-contribute.live-video.net:443",
  streamConfig: window.IVSBroadcastClient.BASIC_LANDSCAPE,
  logLevel: window.IVSBroadcastClient.LOG_LEVEL.DEBUG
};*/



const App = () => {
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
 handlePermissions()
  
var client = null

 async function Initialize(){

  const streamConfig = IVSBroadcastClient.BASIC_LANDSCAPE;

  client = IVSBroadcastClient.create({
    // Enter the desired stream configuration
    streamConfig: streamConfig,
    // Enter the ingest endpoint from the AWS console or CreateChannel API
    ingestEndpoint: "rtmps://c6d0b5e2ec90.global-contribute.live-video.net:443/app/",
    streamKey: "sk_eu-west-1_Ooyab7a0i7Z3_BuUAqkJoyeQsdi6lOEf4gfdRtGDYDL",
 });
  const devices = await navigator.mediaDevices.enumerateDevices();
  window.videoDevices = devices.filter((d) => d.kind === 'videoinput');
  window.audioDevices = devices.filter((d) => d.kind === 'audioinput');
  
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
    
    window.microphoneStream = navigator.mediaDevices.getUserMedia({
      audio: { deviceId: window.audioDevices[0].deviceId },
    });
    console.log(window.microphoneStream)
    console.log(window.cameraStream)
    client.addVideoInputDevice(window.cameraStream, 'camera1', { index: 0 }); // only 'index' is required for the position parameter
    client.addAudioInputDevice(window.microphoneStream, 'mic1');
 }
 
 Initialize()

  
  const handleStream = async () => {
      // toggleStream(
      //   client.ingestEndpoint,//TODO TO ingest Serbver
      //   "", //TODO To streamKey 
      //   'BASIC', // `channel.type`
      //   client.current, // `client.current`
      //   handleError
      // );
      client
      .startBroadcast("sk_eu-west-1_Ooyab7a0i7Z3_BuUAqkJoyeQsdi6lOEf4gfdRtGDYDL")
      .then((result) => {
          console.log('I am successfully broadcasting!');
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
        streamUrl={STREAM_PLAYBACK_URL}
        controls={[CONTROLS.resize, CONTROLS.close, CONTROLS.mute]}
        position={POSITION.topLeft}
        transition
      />

    <MiniPlayer
        ref={ref}
        streamUrl={STREAM_PLAYBACK_URL}
        controls={[CONTROLS.resize, CONTROLS.close, CONTROLS.mute]}
        position={POSITION.topLeft}
        transition
      />
    <button onClick={refreshStream}>
      RefreshStream
    </button>

    <button onClick={handleStream}>
      Stream Button 
    </button>
    <button onClick={handleNoStream}>
      UnStream Button 
    </button>
    </div>
  );
};

export default App;
