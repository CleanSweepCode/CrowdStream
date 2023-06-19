import React, { useRef } from 'react';
import { GoogleMap, LoadScript, Marker} from '@react-google-maps/api'
import { useNavigate } from "react-router-dom";
import '../../App.css';
import { listChannels } from '../utils.jsx'

const GOOGLE_MAPS_API_KEY = 'AIzaSyDpcl7prQQADOD4o_jRuWSsnD79kGvPBMw';

const containerStyle = {
  width: '100%',
  height: '400px'
};

var center = {
  lat: 51.46931506612955,
  lng: -0.21997342925326427
};

var markerPosition = {
  lat: 51.46931506612955,
  lng: -0.21997342925326427
};

// initialize marker position as channel 0 
let channel_info = await listChannels();
console.log(channel_info);

const channel0 = {
  lat: parseFloat(channel_info[0].tags.latitude),
  lng: parseFloat(channel_info[0].tags.longitude)
};

center = channel0;
markerPosition = channel0;

// Custom Map Component
function MapWithMarker() {
  const navigate = useNavigate();


  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={8}
    >

    {channel_info.map((channel, index) => (
            <Marker 
              key={index}
              position={{
                lat: parseFloat(channel.tags.latitude),
                lng: parseFloat(channel.tags.longitude)
              }} 
              onClick={() => navigate(`/viewer/${channel.name}`)} 
            />
          ))}

      {/* <Marker 
        position={center} 
        onClick={() => navigate('/NewPage')} 
      /> */}

    </GoogleMap>
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