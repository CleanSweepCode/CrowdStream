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
import { GoogleMap, LoadScript, Marker} from '@react-google-maps/api';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import NewPage from "./pages/NewPage";
import HomePage from "./pages/HomePage"; 
import './App.css';


// https://codepen.io/amazon-ivs/pen/poLRoPp
// Set initial config for our broadcast
/*const config = {
  ingestEndpoint: "rtmps://c6d0b5e2ec90.global-contribute.live-video.net:443",
  streamConfig: window.IVSBroadcastClient.BASIC_LANDSCAPE,
  logLevel: window.IVSBroadcastClient.LOG_LEVEL.DEBUG
};*/

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

    // Continue with your code here
    // ...
  } catch (error) {
    console.error('Error retrieving geolocation:', error);
  }
}


const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/*" element={<HomePage/>} />
        <Route path="/NewPage" element={<NewPage/>} />
      </Routes>

      {/* <MiniPlayer
        ref={ref}
        streamUrl={STREAM_PLAYBACK_URL}
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
      </div>*/}
    </div>
  );
};

export default App;
