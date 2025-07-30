import React, { useEffect, useCallback, useRef } from 'react';
import videojs from 'video.js';
import { registerIVSTech } from 'amazon-ivs-player';
import 'video.js/dist/video-js.css';
import { getStreamLinkFromName } from '../Helpers/APIUtils.jsx';
import './videojs.css';
import {FullscreenManager} from './fullscreenManager.jsx';

const fullScreenManager = new FullscreenManager();

// Track if IVS tech has been registered to avoid multiple registrations
let ivsRegistered = false;

const VideoJSPlayer = ({ channel_name, onFullscreenToggle}) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const isPlayerInitialized = useRef(false);
  const isPlayerReady = useRef(false);

  // Memoize the updateSize function
  const updateSize = useCallback(() => {
    const screenWidth = window.innerWidth;
    const calculatedWidth = screenWidth < 550 ? screenWidth : 550;
    document.documentElement.style.setProperty('--calculated-width', `${calculatedWidth}px`);
  }, []);

  // Initialize player once when component mounts
  useEffect(() => {
    // Small delay to ensure video element is properly in DOM for React 18
    const timeoutId = setTimeout(() => {
      if (!isPlayerInitialized.current && videoRef.current) {
      // Register IVS tech only once
      if (!ivsRegistered) {
        try {
          const options = {
            wasmWorker: '/amazon-ivs-wasmworker.min.js',
            wasmBinary: '/amazon-ivs-wasmworker.min.wasm'
          };
          registerIVSTech(videojs, options);
          ivsRegistered = true;
        } catch (error) {
          console.error('Error registering IVS tech:', error);
          return;
        }
      }
      
      // Create player once
      try {
        playerRef.current = videojs(videoRef.current, {
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
        });

        isPlayerInitialized.current = true;

        // Set up resize handling
        window.addEventListener('resize', updateSize);
        updateSize();

        // Handle fullscreen button after player is ready
        playerRef.current.ready(() => {
          isPlayerReady.current = true;
          
          // Load initial source if channel_name is already set
          if (channel_name) {
            (async () => {
              try {
                const STREAM_PLAYBACK_URL = await getStreamLinkFromName(channel_name);
                if (playerRef.current && STREAM_PLAYBACK_URL) {
                  playerRef.current.src(STREAM_PLAYBACK_URL);
                }
              } catch (error) {
                console.error('Error loading initial stream URL:', error);
              }
            })();
          }

          setTimeout(() => {
            const fullscreenBtn = document.querySelector('.vjs-fullscreen-control');
            const videoContainer = document.querySelector('.video-player-container');
            
            if (onFullscreenToggle) {
              onFullscreenToggle(fullScreenManager.status);
            }

            if (fullscreenBtn && videoContainer) {
              // Remove existing event listeners to prevent duplicates
              const clonedBtn = fullscreenBtn.cloneNode(true);
              fullscreenBtn.parentNode.replaceChild(clonedBtn, fullscreenBtn);
          
              clonedBtn.addEventListener('click', function() {
                fullScreenManager.toggleFullscreen(videoContainer);
                if (onFullscreenToggle) {
                  onFullscreenToggle(fullScreenManager.status);
                }
              });
            }
          }, 100);
        });

      } catch (error) {
        console.error('Error creating video.js player:', error);
        return;
      }
        }
    }, 100); // 100ms delay for React 18

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateSize);
      if (playerRef.current && isPlayerInitialized.current) {
        try {
          playerRef.current.dispose();
          playerRef.current = null;
          isPlayerInitialized.current = false;
          isPlayerReady.current = false;
        } catch (error) {
          console.error('Error disposing player:', error);
        }
      }
    };
  }, []); // Empty dependency array - only run once

  // Handle channel changes by updating the source
  useEffect(() => {
    if (playerRef.current && channel_name && isPlayerInitialized.current && isPlayerReady.current) {
      (async () => {
        try {
          const STREAM_PLAYBACK_URL = await getStreamLinkFromName(channel_name);
          if (playerRef.current && STREAM_PLAYBACK_URL) {
            playerRef.current.src(STREAM_PLAYBACK_URL);
          }
        } catch (error) {
          console.error('Error loading stream URL:', error);
        }
      })();
    }
  }, [channel_name]); // Only depend on channel_name

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