import React from 'react';

import MiniPlayer from './components/mini-player';
import { CONTROLS, POSITION } from './components/mini-player';

import './App.css';

const STREAM_PLAYBACK_URL = 'https://6547df1ee2a7.eu-west-1.playback.live-video.net/api/video/v1/eu-west-1.832590881550.channel.zuXw8aqr1sZO.m3u8'

const STREAM_PLAYBACK_URL_2 = 'https://6547df1ee2a7.eu-west-1.playback.live-video.net/api/video/v1/eu-west-1.832590881550.channel.tKR5llXiZtd1.m3u8'


const App = () => {
  return (
    <div className="App">

      <h1>Crowd-Sourced Livestreaming</h1>
      <p>A project by Clean-Sweep Code</p>


      <MiniPlayer
        streamUrl={STREAM_PLAYBACK_URL}
        controls={[CONTROLS.resize, CONTROLS.close, CONTROLS.mute]}
        position={POSITION.bottomRight}
        transition
      />

    <MiniPlayer
        streamUrl={STREAM_PLAYBACK_URL_2}
        controls={[CONTROLS.resize, CONTROLS.close, CONTROLS.mute]}
        position={POSITION.bottomRight}
        transition
      />

      <MiniPlayer
        streamUrl={STREAM_PLAYBACK_URL_2}
        controls={[CONTROLS.resize, CONTROLS.close, CONTROLS.mute]}
        position={POSITION.bottomRight}
        transition
      />
     
    </div>
  );
};

export default App;
