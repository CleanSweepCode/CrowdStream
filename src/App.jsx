/* This is the main component of the application. It is responsible for routing between pages. */

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Viewer from "./pages/viewer/viewer.jsx";
import Streamer from "./pages/streamer/streamer.jsx";
import HomePage from "./pages/HomePage/HomePage.jsx";
import './App.css';

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/*" element={<HomePage />} />
        <Route path="/streamer" element={<Streamer />} />
        <Route path="/viewer" element={<Viewer />} />
        <Route path="/viewer/:channel_name" element={<Viewer />} />
      </Routes>
      <Analytics />
    </div>
  );
};

export default App;
