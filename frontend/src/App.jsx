import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import NewPage from "./pages/NewPage";
import HomePage from "./pages/HomePage";
import './App.css';

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/*" element={<HomePage />} />
        <Route path="/NewPage" element={<NewPage />} />
      </Routes>

    </div>
  );
};

export default App;
