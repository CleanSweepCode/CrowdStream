
import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useNavigate } from "react-router-dom";
import './MapWithMarker.css';
import '../videoJS/videojs.css';
// import { listChannels } from '../Helpers/APIUtils.jsx'
import { getChannelList } from '../Helpers/ChannelList.jsx';
import { Switch, FormControlLabel } from '@material-ui/core';  // Importing Material UI Slider for this example

import liveStreamMarker from '../../assets/markers/cameralive.svg';
import pastStreamMarker from '../../assets/markers/paststreamlive.svg';
import liveStreamWatchingMarker from '../../assets/markers/cameralivewatching.svg';
import pastStreamWatchingMarker from '../../assets/markers/pastStreamWatching.svg';


import VideoJSPlayer from '../videoJS/videojs.jsx';
import { XSquare, ArrowLeft, ArrowRight } from 'lucide-react';



const REFRESH_INTERVAL = 10000; // 10 seconds

// Google Map Styling
const containerStyle = {
    width: '100vw',
    height: '100svh'
};

var defaultCenter = {
    lat: 51.46931506612955,
    lng: -0.21997342925326427
}; // if marker loading fails, default to London for map centre

const channelList = await getChannelList(); // ChannelList object
var isFullScreen = false;


function MapWithMarker() {
    const navigate = useNavigate();
    const [includePastStreams, setIncludePastStreams] = useState(true);  // This is the new piece of state
    // const [channelInfo, setChannelInfo] = useState([]);
    const [center, setCenter] = useState(defaultCenter);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [intervalId, setIntervalId] = useState(null); // Add state for interval ID
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);
    const [dragData, setDragData] = React.useState({ startX: 0, startY: 0, offsetX: 0, offsetY: 0 });

    const [map, setMap]= useState( /** @type google.maps.GoogleMap */ (null))
    const videoPlayerRef = useRef(null);

    // set a toggle function for when video is set to fullscreen
    const handleFullscreenToggle = (fullscreenStatus) => {
        isFullScreen = fullscreenStatus;
    }

    useEffect(() => {
        const fetchChannelInfo = async () => {
            await channelList.loadChannels();

            const mapCentre = channelList.averagePosition(includePastStreams);
            setCenter(mapCentre || defaultCenter);

            // Set up the interval for refreshing streams
            if (!intervalId) {
                const id = setInterval(handleRefreshStreams, REFRESH_INTERVAL);
                setIntervalId(id);
            };

            // Clean up the interval when the component unmounts or when the effect is run again
            return () => {
                if (intervalId) {
                    clearInterval(intervalId);
                }
            };

        };
        fetchChannelInfo();
    }, [intervalId]);

    const handleRefreshStreams = async () => {
        try {
            await channelList.loadChannels(); // Call your API to get new channel data
            console.log('Streams refreshed');

        } catch (error) {
            console.error('Error refreshing streams:', error);
        }
    };

    const navigateAndClearInterval = (url) => {
        console.log('clearing interval');
        clearInterval(intervalId); // Clear the interval when navigating
        navigate(url);
    }

    const handleDragStart = (e) => {
        setDragData({
            ...dragData,
            startX: e.clientX,
            startY: e.clientY
        });
    }

    const handleDrag = (e) => {
        if (e.clientX === 0 && e.clientY === 0) return; // This prevents the drag event firing when the mouse isn't moving
        if (isFullScreen) return; // This prevents the drag event firing when the video is fullscreen

        const dx = e.clientX - dragData.startX + dragData.offsetX;
        const dy = e.clientY - dragData.startY + dragData.offsetY;

        e.target.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    const handleDragEnd = (e) => {
        const dx = e.clientX - dragData.startX + dragData.offsetX;
        const dy = e.clientY - dragData.startY + dragData.offsetY;

        setDragData({
            ...dragData,
            offsetX: dx,
            offsetY: dy
        });
    }

    const handleDrop = (e) => {
        e.preventDefault();
    };


    const displayedChannels = channelList.filterActive(includePastStreams);

    const handleDragOver = (e) => {
        e.preventDefault(); // Prevent default to allow drop
    };

    const onVideoClose = () => {
        setShowVideoPlayer(false)
        setSelectedChannel(null)

        // recenter current channel
        if (selectedChannel) {
            map.panTo({
                lat: parseFloat(selectedChannel.tags.latitude),
                lng: parseFloat(selectedChannel.tags.longitude)
            })
        }
    }

    const backChannel = () => {
        var newChannel = channelList.getPreviousByLongitude(selectedChannel, includePastStreams);
        setSelectedChannel(newChannel);
    }
    const forwardChannel = () => {
        var newChannel = channelList.getNextByLongitude(selectedChannel, includePastStreams);
        setSelectedChannel(newChannel);
    }

    const getVideoPlayerBoundingBox = () => {
        if (videoPlayerRef.current) {
            return videoPlayerRef.current.getBoundingClientRect();
          }
          return null;
    };

    const moveCentreOutsideVideoBox = () => {
        const bbox = getVideoPlayerBoundingBox();

        // look for the most space in left/right/up/down
        // centre between edge and video in that direction
        // centre to video in other direction

        var leftSpace = bbox.left;
        var rightSpace = map.getDiv().offsetWidth - bbox.right;
        var upSpace = bbox.top;
        var downSpace = map.getDiv().offsetHeight - bbox.bottom;

        var maxSpace = Math.max(leftSpace, rightSpace, upSpace, downSpace);

        var posX, posY
        console.log(maxSpace, leftSpace, rightSpace, upSpace, downSpace)
        switch (maxSpace) {
            case leftSpace:
                posX = bbox.left / 2.0;
                posY = bbox.top + bbox.height/2;
                break;
            
            case rightSpace:
                posX = (map.getDiv().offsetWidth + bbox.right) / 2.0;
                posY = bbox.top + bbox.height/2;
                break;

            case upSpace:
                posX = bbox.left + bbox.width/2;
                posY = bbox.top / 2.0;
                break;
            
            case downSpace:
                posX = bbox.left + bbox.width/2;
                posY = (map.getDiv().offsetHeight + bbox.bottom) / 2.0;
                break;

            default:
                console.log("!!!")
                posX = 100
                posY = 100
        
        }

        moveCentre({x: posX, y: posY});
    }

    const moveCentre = (position) => {
        const offsetX = map.getDiv().offsetWidth / 2 - position.x;
        const offsetY = map.getDiv().offsetHeight / 2 - position.y;
        map.panBy(offsetX, offsetY);
    }

    return (
        <div>
            <div className="map-container">
                <FormControlLabel
                    control={
                        <Switch
                            checked={includePastStreams}
                            onChange={e => setIncludePastStreams(e.target.checked)}
                            color="primary"
                        />
                    }
                    label={'Include past streams'}
                    className="map-switchcontainer"
                />

                <button className="map-refresh button"
                    onClick={() => navigateAndClearInterval(`/streamer`)}>
                    Start Broadcasting
                </button>

                <div className="map-titlecontainer">
                    <span className="CSFont">
                        <span className="CSBlack">Crowd</span>
                        <span className="CSRed">Stream</span>
                    </span>
                </div>

                <div className="map-helpText">
                    Click a marker to view event
                </div>

                <div className="map-refreshStreamButtonDiv">
                    <button className="map-refreshStreamButton"
                        onClick={handleRefreshStreams}>
                        &#8635;
                    </button>
                </div>


                <div className='map-refreshStreamButtonDiv'>
                    <button className="map-refreshStreamButton" style={{ top: '4em' }}
                        onClick={() => navigateAndClearInterval(`/about`)}>
                        ?
                    </button>
                </div>


                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={8}
                    onLoad={map=>setMap(map)}
                    options={{
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                        styles: [
                            {
                                featureType: 'administrative',
                                elementType: 'labels',
                                stylers: [{ visibility: 'off' }]
                            },
                            {
                                featureType: 'poi',
                                elementType: 'labels',
                                stylers: [{ visibility: 'off' }]
                            },
                            {
                                featureType: 'road',
                                elementType: 'labels',
                                stylers: [{ visibility: 'off' }]
                            },
                            {
                                featureType: 'transit',
                                elementType: 'labels',
                                stylers: [{ visibility: 'off' }]
                            },
                            {
                                featureType: 'landscape',
                                elementType: 'labels',
                                stylers: [{ visibility: 'off' }]
                            }
                        ],

                    }}
                >

                    {displayedChannels.map((channel, index) => (
                        <Marker
                            key={index}
                            icon={{
                                url: channel.tags.active === "true"
                                    ? (channel === selectedChannel ? liveStreamWatchingMarker : liveStreamMarker)
                                    : (channel === selectedChannel ? pastStreamWatchingMarker : pastStreamMarker),
                                scaledSize: new window.google.maps.Size(64, 64)
                            }}
                            position={{
                                lat: parseFloat(channel.tags.latitude),
                                lng: parseFloat(channel.tags.longitude)
                            }}
                            onClick={() => {
                                map.setCenter({
                                    lat: parseFloat(channel.tags.latitude),
                                    lng: parseFloat(channel.tags.longitude)
                                })
                                setSelectedChannel(channel);
                                setShowVideoPlayer(true);
                                moveCentreOutsideVideoBox();
                            }}

                        />
                    ))}

                </GoogleMap>

            </div>
            {
                showVideoPlayer && selectedChannel &&
                <div className="video-player-container" ref={videoPlayerRef} draggable="true" onDragStart={handleDragStart} onDrag={handleDrag} onDragEnd={handleDragEnd} onDrop={handleDrop} onDragOver={handleDragOver} >
                    {/* <div className="drag-handle">Drag Me</div> */}
                    <XSquare onClick={onVideoClose} className="map-closebutton" />
                    <ArrowLeft onClick={backChannel} className="map-leftbutton" />
                    <ArrowRight onClick={forwardChannel} className="map-rightbutton" />
                    <VideoJSPlayer
                        channel_name={selectedChannel.name}
                        onFullscreenToggle={handleFullscreenToggle}
                        className="map-videojsplayer"
                    />
                </div>
            }

        </div>
    )
}

export default MapWithMarker;