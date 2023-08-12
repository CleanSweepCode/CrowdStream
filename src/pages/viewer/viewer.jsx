import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import MiniPlayer from '../../components/mini-player/MiniPlayer.jsx';
import { useParams } from 'react-router-dom';
import '../../App.css';
import './viewer.css';
import { listChannels, getStreamLinkFromName, tagGeoLocationFromUtil } from '../../components/Helpers/APIUtils.jsx'
import IconButton from '@material-ui/core/IconButton';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { CONTROLS, POSITION } from '../../components/Helpers/config.js';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

const Viewer = () => {
  const ref = useRef();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);

  let { channel_name } = useParams();

  // fetch the list of channels. List should be sorted by geographical distance from 
  useEffect(() => {
    const fetchChannels = async () => {
      // get the list of channels and their tags, both active and inactive
      const allChannels = await listChannels();
      setChannels(allChannels);

      // Find the current channel
      const currentChannel = allChannels.find(channel => channel.name === channel_name);

      let channelsToSort;
      // If the current channel is active, filter for active channels only. If the current channel is inactive, filter for inactive channels only.
      if (currentChannel && currentChannel.tags.active) {
        channelsToSort = allChannels.filter(channel => channel.tags.active === "true");
      } else if (currentChannel && currentChannel.tags.active === "false") {
        channelsToSort = allChannels.filter(channel => channel.tags.active === "false");
      } else {
        channelsToSort = allChannels;
      }

      console.log('channelsToSort', channelsToSort);

      // Sort channels by longitude
      const sortedChannels = channelsToSort.sort((a, b) => parseFloat(a.tags.longitude) - parseFloat(b.tags.longitude));

      setChannels(sortedChannels);

      // Find the index of the current channel
      const channelIndex = sortedChannels.findIndex(channel => channel.name === channel_name);
      setCurrentIndex(channelIndex);
    };

    fetchChannels();
  }, [channel_name]);

  //Looping around for channels
  const goToNextChannel = () => {
    //console.log("channels", channels);
    if (currentIndex < channels.length - 1) {
      navigate(`/viewer/${channels[currentIndex + 1].name}`);
    } else if (currentIndex === channels.length - 1) {
      navigate(`/viewer/${channels[0].name}`);
    }
    window.location.reload();
  };

  const goToPreviousChannel = () => {
    //console.log("channels", channels);
    if (currentIndex > 0) {
      navigate(`/viewer/${channels[currentIndex - 1].name}`);
      console.log("Navigating to: " + `/viewer/${channels[currentIndex - 1].name}`);
    } else if (currentIndex === 0) {
      navigate(`/viewer/${channels[channels.length - 1].name}`);
    }
    window.location.reload();
  };

  const refreshStream = async () => {
    ref.current.reloadRef();
  }
  const refreshButtonPressed = () => {
    window.location.reload();
  }

  async function Initialize() {
    console.log("Initializing STREAM_PLAYBACK_URL", channel_name);
    const STREAM_PLAYBACK_URL = await getStreamLinkFromName(channel_name);
    ref.current.setURL(STREAM_PLAYBACK_URL);
    console.log("Set URL to: " + STREAM_PLAYBACK_URL);
    refreshStream();
  }

  return (
    <div className="viewer-container">
      <div className="viewer-rows">
        <div className="viewer-backButton">
          <IconButton edge="start" color="inherit" aria-label="back" onClick={() => navigate('/')}>
            <ArrowBackIcon />
          </IconButton>
        </div>
        <div className="viewer-title">
          <span class="CSFont">
            <span class="CSBlack">Crowd</span>
            <span class="CSRed">Stream</span>
          </span>
        </div>
        <div />
      </div>
      <div className="viewer-rows">
        <div className="viewer-channelButton">
          <IconButton edge="start" color="inherit" aria-label="previous" disabled={channels.length === 1} onClick={goToPreviousChannel}>
            <ArrowBackIosIcon />
          </IconButton>
        </div>
        <div className="viewer-playerContainer">
          <MiniPlayer
            ref={ref}
            //streamUrl={STREAM_PLAYBACK_URL}
            onPlayerReady={() => {
              Initialize();
            }}
            controls={[CONTROLS.resize, CONTROLS.close, CONTROLS.mute]}
            position={POSITION.center}
            transition
          />
        </div>
        <div className="viewer-channelButton">
            <IconButton edge="start" color="inherit" aria-label="next" disabled={channels.length === 1} onClick={goToNextChannel}>
              <ArrowForwardIosIcon />
            </IconButton>

        </div>


      </div>


      <div className="viewer-rows-bottom">
        <button className="button" onClick={refreshButtonPressed}>
          Refresh Stream
        </button>

      </div>
    </div >
  );


}

export default Viewer;