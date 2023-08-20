import React, { useRef } from 'react';
import { LoadScript } from '@react-google-maps/api'
import { useNavigate } from "react-router-dom";
import '../../App.css';
import MapWithMarker from '../../components/customMapComponent/MapWithMarker';


function HomePage() {
  const ref = useRef();
  const history = useNavigate();
  console.log(process.env)
  return (
    <div>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY_VERCEL}>
        <MapWithMarker />
      </LoadScript>
    </div>
  );
}

export default HomePage;