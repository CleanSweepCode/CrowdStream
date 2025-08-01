import React, { useRef } from 'react';
import { useNavigate } from "react-router-dom";
import '../../App.css';
import MapWithMarker from '../../components/customMapComponent/MapWithMarker';

function HomePage() {
  const ref = useRef();
  const history = useNavigate();
  console.log(process.env)
  
  return (
    <div>
      <MapWithMarker />
    </div>
  );
}

export default HomePage;