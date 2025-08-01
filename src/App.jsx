/* This is the main component of the application. It is responsible for routing between pages. */

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { LoadScript } from '@react-google-maps/api';
import Streamer from "./pages/streamer/streamer.jsx";
import HomePage from "./pages/HomePage/HomePage.jsx";
import InfoPage from "./pages/info/infoPage.jsx";
import YoutubeStreamer from "./pages/youtubeStreamer/youtubeStreamer.jsx";
import Timer from './components/Timer/Timer.jsx';
import './App.css';


// For now, streamer will go to YoutubeStreamer
const App = () => {
  return (
    <div className="App">
      <LoadScript 
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY_VERCEL}
        libraries={['places']}
        loadingElement={
          <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '18px'
          }}>
            Loading...
          </div>
        }
        style={{
          width: '100%',
          height: '100%',
          display: 'contents'
        }}
      >
        <Routes>
          <Route path="/*" element={<HomePage />} />
          <Route path="/event/:URLEventID" element={<HomePage />} />
          <Route path="/streamer" element={<Streamer />} />
          <Route path="/YoutubeStreamer" element={<YoutubeStreamer />} />
          <Route path="/about" element={<InfoPage />} />
          <Route path="/timer" element={<Timer />} />
        </Routes>
        <Analytics />
      </LoadScript>
    </div>
  );
};

export default App;
