import React, { useRef } from 'react';
import { LoadScript } from '@react-google-maps/api'
import { useNavigate } from "react-router-dom";
import '../../App.css';
import MapWithMarker, { GOOGLE_MAPS_API_KEY } from '../../components/customMapComponent/MapWithMarker';


function HomePage() {
  const ref = useRef();
  const history = useNavigate();

  return (
    <div>
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <MapWithMarker />
      </LoadScript>
    </div>
  );
}

export default HomePage;