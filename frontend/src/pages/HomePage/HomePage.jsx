import React, { useRef, useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import { useNavigate } from "react-router-dom";
import '../../App.css';
import { listChannels } from '../utils.jsx'
import StartStreaming from '../../components/StartStreaming';  // adjust path based on your project structure
import { Switch } from '@material-ui/core';  // Importing Material UI Slider for this example

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
  const navigate = useNavigate();
  const [activeOnly, setActiveOnly] = useState(true);  // This is the new piece of state
  const [channelInfo, setChannelInfo] = useState([]);
  const [center, setCenter] = useState(defaultCenter);

  
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

    <label>
        Show Active Channels Only
        <Switch 
          checked={activeOnly} 
          onChange={e => setActiveOnly(e.target.checked)}
          color="primary" 
        />
      </label>

    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={8}
    >

      {displayedChannels.map((channel, index) => (
        <Marker
          key={index}
          position={{
            lat: parseFloat(channel.tags.latitude),
            lng: parseFloat(channel.tags.longitude)
          }}
          onClick={() => navigate(`/viewer/${channel.name}`)}
        />
      ))}


    </GoogleMap>
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

      <StartStreaming />

    </div>
  );
}

export default HomePage;