import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle } from 'react';

import './streamerPlayer.css';

const StreamerPlayer = forwardRef((props, ref) => {

    // Reference to the video element on the page
    const videoRef = useRef(null);
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    // Expose a method to allow setting the stream from the parent component
    useImperativeHandle(ref, () => ({
        setStream: async (stream) => {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
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

    }, [props.initialStream, props.onPlayerReady]);

    return (
        <div className="StreamerPlayer">
            <div className="player-wrapper">
                {isBroadcasting &&
                    <div className="broadcasting-dot"></div>
                }
                <div className='video-container'>
                    <video ref={videoRef} autoPlay playsInline style={{maxWidth: '100%', maxHeight: '100%'}}/>
                </div>
            </div>
        </div>
    );
});

export default StreamerPlayer;
