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
import { listChannels, getStreamLinkFromName, tagGeoLocationFromUtil } from '../utils.jsx'


const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -3.745,
  lng: -38.523
};



const Viewer = () => {
  const ref = useRef();

  let { channel_name } = useParams();

  const refreshStream = async () => {
    ref.current.log();
  }

  async function Initialize() {
    const STREAM_PLAYBACK_URL = await getStreamLinkFromName(channel_name);
    ref.current.setURL(STREAM_PLAYBACK_URL);
    refreshStream();
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

      </div>
    </div>
  );


}

export default Viewer;