/* This is the main component of the application. It is responsible for routing between pages. */

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Viewer from "./pages/viewer";
import Streamer from "./pages/streamer";
import HomePage from "./pages/HomePage";
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

    </div>
  );
};

export default App;
