import React, { useRef, useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { useNavigate } from "react-router-dom";
import '../../App.css';
import { listChannels } from '../utils.jsx'
import { Switch, FormControlLabel } from '@material-ui/core';  // Importing Material UI Slider for this example
import { makeStyles } from '@material-ui/core/styles';

// Styling to position the switch as an overlay
const useStyles = makeStyles((theme) => ({
  switchContainer: {
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
    backgroundColor: 'rgba(255,255,255,0.95)', // white with 80% opacity
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    zIndex: 2,
  },
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

    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    textDecoration: 'none',
    textTransform: 'uppercase',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#3498db',
    color: '#ffffff',
    transition: 'background-color 0.3s ease',
    margin: '8px auto',
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

  mapContainer: {
    position: 'relative',
  },
}));


const GOOGLE_MAPS_API_KEY = 'AIzaSyDpcl7prQQADOD4o_jRuWSsnD79kGvPBMw';

const containerStyle = {
  width: '100%',
  height: '400px'
};

var defaultCenter = {
  lat: 51.46931506612955,
  lng: -0.21997342925326427
}; // if marker loading fails, default to London for map centre


// Custom Map Component
function MapWithMarker() {
  const classes = useStyles();
  const navigate = useNavigate();
  const [activeOnly, setActiveOnly] = useState(true);  // This is the new piece of state
  const [channelInfo, setChannelInfo] = useState([]);
  const [center, setCenter] = useState(defaultCenter);
  const [selectedChannel, setSelectedChannel] = useState(null);

  
  useEffect(() => {
    const fetchChannelInfo = async () => {
      const fetchedChannelInfo = await listChannels();
      setChannelInfo(fetchedChannelInfo);

      if(fetchedChannelInfo.length > 0) {
        setCenter({ 
          lat: parseFloat(fetchedChannelInfo[0].tags.latitude), 
          lng: parseFloat(fetchedChannelInfo[0].tags.longitude) 
        });
      }

    };
    fetchChannelInfo();
  }, []);

  const displayedChannels = activeOnly ? channelInfo.filter(channel => channel.tags.active === "true") : channelInfo;

  return (
    <div>
      <div className={classes.mapContainer}>
        <FormControlLabel
          control={
            <Switch 
              checked={activeOnly} 
              onChange={e => setActiveOnly(e.target.checked)}
              color="primary" 
            />
          }
          // Label should be 'Active channels' if activeOnly else 'All channels'
          label= {activeOnly ? 'Only active channels' : 'All channels'}
          className={classes.switchContainer}
        />

    <button className={classes.startStreamingContainer}
       onClick={() => navigate(`/streamer`)}>
      Start Streaming
    </button>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={8}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >

        {displayedChannels.map((channel, index) => (
          <Marker
            key={index}
            position={{
              lat: parseFloat(channel.tags.latitude),
              lng: parseFloat(channel.tags.longitude)
            }}
            onClick={() => navigate(`/viewer/${channel.name}`)}
            onMouseOver={() => setSelectedChannel(channel)}
            onMouseOut={() => setSelectedChannel(null)}
          />
        ))}

        {/* {selectedChannel && (
            <InfoWindow
              position={{
                lat: parseFloat(selectedChannel.tags.latitude),
                lng: parseFloat(selectedChannel.tags.longitude)
              }}
              onCloseClick={() => setSelectedChannel(null)}
            >
              <div className={classes.infoWindow}>
                <h2>{selectedChannel.name}</h2>
                <p>Current viewers: {selectedChannel.viewerCount}</p>
              </div>
            </InfoWindow>
        )} */}


      </GoogleMap>

      </div>
    </div>
  )
}


function HomePage() {
  const ref = useRef();
  const history = useNavigate();

  return (
    <div>
      <h1>Crowd-Sourced Livestreaming</h1>
      <p>A project by Clean-Sweep Code</p>

      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <MapWithMarker />
      </LoadScript>

    </div>
  );
}

export default HomePage;