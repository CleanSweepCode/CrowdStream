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

  // styling for the overlaid title/logo
  textOverlayContainer: {
    position: 'absolute',
    top: theme.spacing(2),
    left: '50%', // positioned at the center of the parent
    transform: 'translateX(-50%)', // to center the text itself
    zIndex: 2,
    color: '#000',
    fontSize: '32px',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.5)', // white with 50% opacity
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
  },

  // styling for the refresh button
  startStreamingContainer: {
    position: 'absolute',
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    zIndex: 2,
    // centre
    left: '50%',
    transform: 'translate(-50%, 0%)',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    textDecoration: 'none',
    textTransform: 'uppercase',
    border: 'none',
    backgroundColor: '#3498db',
    color: '#ffffff',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#2980b9',
    },
    '&:focus': {
      outline: 'none',
    },
    '&:active': {
      backgroundColor: '#1f618d',
    },
  },

  // container representing the full screen, for overlay purposes
  mapContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },

  playerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100vw',
    height: '100vh',
  },

  backButton: {
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
    backgroundColor: 'rgba(255,255,255,0.5)', // white with 50% opacity
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    
    zIndex: 100, // Make sure the back button is above other components
  },

}));


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
      <div className={classes.mapContainer}>

        <div className={classes.backButton}>
          <IconButton edge="start" color="inherit" aria-label="back" onClick={() => navigate('/')}>
            <ArrowBackIcon />
          </IconButton>
        </div>

        <div className={classes.textOverlayContainer}>
          CrowdStream
        </div>

        <div className={classes.playerContainer}>
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

          <div className={classes.startStreamingContainer}>
            <button className="button" onClick={refreshStream}>
              Refresh Stream
            </button>

          </div>
      </div>
    </div>
  );


}

export default Viewer;