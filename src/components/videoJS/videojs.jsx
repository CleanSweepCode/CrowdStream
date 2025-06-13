import React, { useEffect } from 'react';
import videojs from 'video.js';
import { registerIVSTech } from 'amazon-ivs-player';
import 'video.js/dist/video-js.css';
import { getStreamLinkFromName } from '../Helpers/APIUtils.jsx';
import './videojs.css';
import {FullscreenManager} from './fullscreenManager.jsx';

const fullScreenManager = new FullscreenManager();

const VideoJSPlayer = ({ channel_name, onFullscreenToggle}) => {
  const videoRef = React.useRef(null);

  useEffect(() => {
    const options = {
      wasmWorker: '/amazon-ivs-wasmworker.min.js',
      wasmBinary: '/amazon-ivs-wasmworker.min.wasm'
    };

    registerIVSTech(videojs, options);
    
    const player = videojs(videoRef.current, {
      techOrder: ["AmazonIVS"],
      controls: true,
      autoplay: true,
      draggable: true,
      preload: 'auto',
      controlBar: {
        pictureInPictureToggle: false // Hide PiP button
      },
      userActions: {
        doubleClick: function(eventdbl) {
          // Prevent default action and stop the event propagation
          eventdbl.preventDefault();
          eventdbl.stopPropagation();
        }
      }
    }, async () => {
      const STREAM_PLAYBACK_URL = await getStreamLinkFromName(channel_name);
      console.log("Set URL to: " + STREAM_PLAYBACK_URL);
      player.src(STREAM_PLAYBACK_URL);

    });

    // This part is new - it handles resizing
    function updateSize() {
      const screenWidth = window.innerWidth;
      const calculatedWidth = screenWidth < 550 ? screenWidth : 550; // Adjust as necessary
      document.documentElement.style.setProperty('--calculated-width', `${calculatedWidth}px`);
  }

  window.addEventListener('resize', updateSize);
  updateSize(); // Call immediately to set initial size


    const fullscreenBtn = document.querySelector('.vjs-fullscreen-control');
    const videoContainer = document.querySelector('.video-player-container');
    onFullscreenToggle(fullScreenManager.status);

    if (fullscreenBtn) {
      
      // clone the fullscreen button
      const clonedBtn = fullscreenBtn.cloneNode(true);
      fullscreenBtn.parentNode.replaceChild(clonedBtn, fullscreenBtn);
  
      clonedBtn.addEventListener('click', function() {
        fullScreenManager.toggleFullscreen(videoContainer);
        onFullscreenToggle(fullScreenManager.status);
      });
    }
    


    return () => {};
}, [channel_name]);

  return (
    <video 
      playsInline
      ref={videoRef}
      className="video-js vjs-default-skin"
      controls
      preload="auto"
      data-setup='{"techOrder": ["AmazonIVS"], "fluid": true}'
      muted
    >
    </video>
  );
}
export default VideoJSPlayer;