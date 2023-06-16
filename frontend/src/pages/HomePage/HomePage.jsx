import React, { useRef } from 'react';
import { GoogleMap, LoadScript, Marker} from '@react-google-maps/api'
import { useNavigate } from "react-router-dom";
import '../../App.css';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDpcl7prQQADOD4o_jRuWSsnD79kGvPBMw';

const containerStyle = {
  width: '100%',
  height: '400px'
};
const center = {
  lat: 51.46931506612955,
  lng: -0.21997342925326427
};

const markerPosition = {
  lat: 51.46931506612955,
  lng: -0.21997342925326427
};

<Marker position={markerPosition} />

// Custom Map Component
function MapWithMarker() {
  const navigate = useNavigate();

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
    >
      <Marker 
        position={center} 
        onClick={() => navigate('/NewPage')} 
      />

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