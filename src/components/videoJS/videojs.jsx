import React, { useEffect } from 'react';
import videojs from 'video.js';
import { registerIVSTech } from 'amazon-ivs-player';
import 'video.js/dist/video-js.css';
import { getStreamLinkFromName } from '../Helpers/APIUtils.jsx';


const VideoJSPlayer = ({ channel_name }) => {
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
      preload: 'auto'
    }, async () => {
      const STREAM_PLAYBACK_URL = await getStreamLinkFromName(channel_name);
      console.log("Set URL to: " + STREAM_PLAYBACK_URL);
      player.src(STREAM_PLAYBACK_URL);

    });
    

    return () => {};
  }, [channel_name]);

  return (
    <video
      ref={videoRef}
      className="video-js vjs-default-skin"
      controls
      preload="auto"
      data-setup='{"techOrder": ["AmazonIVS"]}'
      muted
    >
    </video>
  );
}
export default VideoJSPlayer;