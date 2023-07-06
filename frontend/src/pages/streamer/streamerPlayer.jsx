// In this script we define a component, which is a video player from the streamer
// It returns a local video stream (from a webcam) and plays it on the player


import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle  } from 'react';
import { useParams } from 'react-router-dom';
import Button from 'react';
import { getConfigFromResolution } from '../../components/Helpers';

import './streamerPlayer.css';

const StreamerPlayer = forwardRef((props, ref) => {
    const { height = 400} = props;
    var width = 0

    // Reference to the video element on the page
    const videoRef = useRef(null);
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    // Expose a method to allow setting the stream from the parent component
    useImperativeHandle(ref, () => ({
        setStream: async (stream) => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                // set height and width of player based on input properties
                videoRef.current.height = height;
                width = videoRef.current.width;
            }
        },
        setIsBroadcasting: (isBroadcasting) => {
            setIsBroadcasting(isBroadcasting);
        }

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
        <div className="player-wrapper">
            {isBroadcasting && 
                <div className="broadcasting-dot"></div>
            }
                <div className='video-container'>
                    <video ref={videoRef} autoPlay playsInline />
                </div>
            </div>
        </div>
    );
});

export default StreamerPlayer;

