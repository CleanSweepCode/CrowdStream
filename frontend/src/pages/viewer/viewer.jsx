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
import IconButton from '@material-ui/core/IconButton';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  backButton: {
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
    zIndex: 100, // Make sure the back button is above other components
  },
  // ... rest of your styles
}));


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
  const navigate = useNavigate();
  const classes = useStyles();


  
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

    <div className={classes.backButton}>
      <IconButton edge="start" color="inherit" aria-label="back" onClick={() => navigate('/')}>
        <ArrowBackIcon />
      </IconButton>
    </div>

    <h1>CrowdStream</h1>

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