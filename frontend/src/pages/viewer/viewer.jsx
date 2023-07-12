import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import MiniPlayer from '../../components/mini-player/MiniPlayer.jsx';
import { useParams } from 'react-router-dom';
import '../../App.css';
import './viewer.css';
import { listChannels, getStreamLinkFromName, tagGeoLocationFromUtil } from '../../components/Helpers/APIUtils.jsx'
import IconButton from '@material-ui/core/IconButton';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { CONTROLS, POSITION } from '../../components/Helpers/config.js';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: -3.745,
  lng: -38.523
};



const Viewer = () => {
  const ref = useRef();
  const navigate = useNavigate();

  let { channel_name } = useParams();

  const refreshStream = async () => {
    ref.current.reloadRef();
  }

  async function Initialize() {
    const STREAM_PLAYBACK_URL = await getStreamLinkFromName(channel_name);
    ref.current.setURL(STREAM_PLAYBACK_URL);
    refreshStream();
  }

  return (
    <div className="App">
      <div className="mapContainer">

        <div className="backButton">
          <IconButton edge="start" color="inherit" aria-label="back" onClick={() => navigate('/')}>
            <ArrowBackIcon />
          </IconButton>
        </div>

        <div className="textOverlayContainer">
          CrowdStream
        </div>

        <div className="playerContainer">
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
        </div>

        <div className="startStreamingContainer">
          <button className="button" onClick={refreshStream}>
            Refresh Stream
          </button>

        </div>
      </div>
    </div>
  );


}

export default Viewer;