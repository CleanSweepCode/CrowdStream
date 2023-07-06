// In this script we define a component, which is a video player from the streamer
// It returns a local video stream (from a webcam) and plays it on the player


import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle  } from 'react';
import { useParams } from 'react-router-dom';
import Button from 'react';
import { getConfigFromResolution } from '../../components/Helpers';

import './streamerPlayer.css';

const StreamerPlayer = forwardRef((props, ref) => {
    const { height = 154, width = 274 } = props;

    // Reference to the video element on the page
    const videoRef = useRef(null);

    // Expose a method to allow setting the stream from the parent component
    useImperativeHandle(ref, () => ({
        setStream: async (stream) => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        },
    }));

    // Once the component is mounted, check if there is an initial stream to be set
    useEffect(() => {
        if (props.initialStream && videoRef.current) {
            videoRef.current.srcObject = props.initialStream;
        }

        // Call onPlayerReady when video player is ready
        props.onPlayerReady();

    }, [props.initialStream, props.onPlayerReady]);

    return (
        <div className="StreamerPlayer" style={{ width: `${width}px`, height: `${height}px` }}>
             <video ref={videoRef} autoPlay playsInline />
        </div>
    );
});

export default StreamerPlayer;

