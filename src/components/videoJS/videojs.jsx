import React, { useEffect } from 'react';
import videojs from 'video.js';
import { registerIVSTech } from 'amazon-ivs-player';
import 'video.js/dist/video-js.css';
import { getStreamLinkFromName } from '../Helpers/APIUtils.jsx';
import './videojs.css';


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
      }
    }, async () => {
      const STREAM_PLAYBACK_URL = await getStreamLinkFromName(channel_name);
      console.log("Set URL to: " + STREAM_PLAYBACK_URL);
      player.src(STREAM_PLAYBACK_URL);

    });

    const fullscreenBtn = document.querySelector('.vjs-fullscreen-control');
    const videoContainer = document.querySelector('.video-player-container');

    const goFullScreen = () => {
      const elem = document.querySelector(".video-player-container");

          if (elem.requestFullscreen) {
            elem.requestFullscreen();
          } else if (elem.mozRequestFullScreen) { // Firefox
            elem.mozRequestFullScreen();
          } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
            elem.webkitRequestFullscreen();
          } else if (elem.msRequestFullscreen) { // IE/Edge
            elem.msRequestFullscreen();
          }
      }

    const endFullscreen = () => {
      const elem = document.querySelector(".video-player-container");

      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
      }
    }

    const checkIfFullscreen = () => {
      return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    }

    // set fullscreen status on reload
    onFullscreenToggle(videoContainer.classList.contains('fullscreen'));

    if (fullscreenBtn) {
      
      // clone the fullcreen button
      const clonedBtn = fullscreenBtn.cloneNode(true);
      fullscreenBtn.parentNode.replaceChild(clonedBtn, fullscreenBtn);
  
      clonedBtn.addEventListener('click', function() {
        const isFullscreen = checkIfFullscreen();
        if (!isFullscreen) {
          goFullScreen();
        } else {
          endFullscreen();
        }

        onFullscreenToggle(!isFullscreen);
      });
    }
    

    return () => {};
  }, [channel_name]);

  return (
    <video 
      playsinline
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