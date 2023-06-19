import React from 'react';
import './StartStreaming.css';
import { useNavigate } from 'react-router-dom';


const StartStreaming = () => {
  let navigate = useNavigate();

  function handleClick() {
    navigate("/streamer");
  }

  return (
    <button className="start-streaming-button" onClick={handleClick}>
      Start Streaming
    </button>
  );
};

export default StartStreaming;