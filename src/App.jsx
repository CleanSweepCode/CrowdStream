/* This is the main component of the application. It is responsible for routing between pages. */

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Streamer from "./pages/streamer/streamer.jsx";
import HomePage from "./pages/HomePage/HomePage.jsx";
import InfoPage from "./pages/info/infoPage.jsx";
import youtubeStreamer from "./pages/youtubeStreamer/youtubeStreamer.jsx";
import Timer from './components/Timer/Timer.jsx';
import './App.css';


// For now, streamer will go to youtubeStreamer
const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/*" element={<HomePage />} />
        <Route path="/event/:URLEventID" element={<HomePage />} />
        <Route path="/streamer" element={<Streamer />} />
        <Route path="/youtubeStreamer" element={<youtubeStreamer />} />
        <Route path="/about" element={<InfoPage />} />
        <Route path="/timer" element={<Timer />} />
      </Routes>
      <Analytics />
    </div>
  );
};

export default App;
