// This code snippet is an in-progress feature to allow live-streaming from Youtube. 
// This would allow for live chat and no backend charges.
// The next step to develop this feature is to call createChannel() with tag 'youtube',
// and then open an embedded Youtube player instead of the StreamerPlayer component.

import React, { useState } from 'react';
import './youtubeStreamer.css'; // Importing your CSS
import { useNavigate } from "react-router-dom";
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const YoutubeStreamer = () => {
  const navigate = useNavigate();
  const [youtubeLink, setYoutubeLink] = useState('');
  const [location, setLocation] = useState('');

  const validateForm = () => {
    const youtubeRegex = /^https:\/\/www\.youtube\.com\/live\/[A-Za-z0-9?=_-]+$/;
    const locationRegex = /^-?\d{1,2}\.\d{6,},\s?-?\d{1,3}\.\d{6,}$/;
    if (!youtubeRegex.test(youtubeLink)) {
      alert('Please enter a valid YouTube Live link.');
      return false;
    }
    if (!locationRegex.test(location)) {
      alert('Please enter a valid location in the format of latitude, longitude.');
      return false;
    }
    // Form is valid
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Form submission logic here
      alert('Form submitted successfully!');
      // navigate to another route or perform further actions
    }
  };

  return (
    <div className="YoutubeStreamer">
      <div className="streamerplayer-backButton">
        <IconButton edge="start" color="inherit" aria-label="back" onClick={() => navigate('/')}>
          <ArrowBackIcon />
        </IconButton>
      </div>

      <section id="intro">
        <p>
          Currently, only streaming via YouTube is supported:
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="youtubeLink">Please paste the link to your YouTube livestream:</label>
            <input
              type="text"
              id="youtubeLink"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">What is your location (latitude, longitude)? </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <button type="submit">Submit</button>
        </form>
      </section>
    </div>
  );
};

export default YoutubeStreamer;
