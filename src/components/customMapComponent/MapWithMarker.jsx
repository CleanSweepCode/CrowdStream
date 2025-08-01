
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, Polygon, Polyline } from '@react-google-maps/api';

import './MapWithMarker.css';
import '../videoJS/videojs.css';
import { listChannels, getEvents } from '../Helpers/APIUtils.jsx' //interacts with backend via API
import { getChannelList} from '../Helpers/ChannelList.jsx'; // sorts available channels in variety of ways

//import { Tooltip, Switch, FormControlLabel } from '@mui/material';  // Importing Material UI Slider for this example

// Assets
import liveStreamMarker from '../../assets/markers/cameralive.svg';
import pastStreamMarker from '../../assets/markers/paststreamlive.svg';
import liveStreamWatchingMarker from '../../assets/markers/cameralivewatching.svg';
import pastStreamWatchingMarker from '../../assets/markers/pastStreamWatching.svg';
import finishMarker from '../../assets/finishMarker64.png';
import { XSquare, ArrowLeft, ArrowRight } from 'lucide-react';
import MenuIcon from '@mui/icons-material/Menu';

import Timer from '../Timer/Timer.jsx'

import VideoJSPlayer from '../videoJS/videojs.jsx';



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

var isFullScreen = false;


function MapWithMarker() {
    const navigate = useNavigate();
    const mapRef = useRef(null); // Create a ref for the map instance
    const [includePastStreams, setIncludePastStreams] = useState(true);
    includePastStreams == 1;
    // const [channelInfo, setChannelInfo] = useState([]);
    const [center, setCenter] = useState(defaultCenter);
    const [zoom, setZoom] = useState(13);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [intervalId, setIntervalId] = useState(null); // Add state for interval ID
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);
    const [eventIDs, setEventIDs] = useState([]);
    const [eventInfo, setEventInfo] = useState({});
    const [eventRouteInfo, setEventRouteInfo] = useState({});
    const [routeLines, setRouteLines] = useState([]);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipFade, setTooltipFade] = useState(false);
    const [channelList, setChannelList] = useState(null);
    const [displayedChannels, setDisplayedChannels] = useState([]);


    const [map, setMap]= useState( /** @type google.maps.GoogleMap */ (null))
    const videoPlayerRef = useRef(null);
    const [showMenu, setShowMenu] = useState(false);

    // setting the eventID from a URL
    const { URLEventID } = useParams();

    // set a toggle function for when video is set to fullscreen
    const handleFullscreenToggle = (fullscreenStatus) => {
        isFullScreen = fullscreenStatus;
    }
    
    const getZoomParams = (routePoints) => {
        let minLat = 1000.0;
        let maxLat = -1000.0;
        let minLng = 1000.0;
        let maxLng = -1000.0;
        let numPoints = routePoints.length;

        for (let i = 0; i < numPoints; i++) {
            minLat = Math.min(routePoints[i][0], minLat);
            maxLat = Math.max(routePoints[i][0], maxLat);
            minLng = Math.min(routePoints[i][1], minLng);
            maxLng = Math.max(routePoints[i][1], maxLng);
        }

        const latDiff = maxLat - minLat;
        const lngDiff = maxLng - minLng;

        let zoom_ = 0;
        if (latDiff > lngDiff) {
            zoom_ = Math.log2(360 / latDiff);
        } else {
            zoom_ = Math.log2(360 / lngDiff);
        }

        const centreLat = (minLat + maxLat) / 2;
        const centreLng = (minLng + maxLng) / 2;

        setCenter({
            lat: centreLat,
            lng: centreLng
        });

        map.setZoom(zoom_)
        
        return;
    };
    // Function to hide the tooltip with a fade
    const hideTooltip = () => {
        setTooltipFade(true); // Start fading out
        setTimeout(() => {
            setShowTooltip(false); // Completely hide after the fade
            setTooltipFade(false); // Reset fade state
        }, 600); // Match this delay with your CSS transition duration
    };

    const getPolygonByEventID = (eventID) => {
        let polygonCoords = eventInfo[eventID] || []; //["perimeterPoints"];

        polygonCoords = polygonCoords.map(point => ({ lat: point[0], lng: point[1] }));

        return polygonCoords;
    };

    const getRoutePointsByEventID = (eventID) => {
        let routePoints = eventRouteInfo[eventID] || []; // eventInfo[eventID]["routePoints"];

        const polylineCoords = routePoints.map(point => ({ lat: point[0], lng: point[1] }));

        return polylineCoords;
    };

    const calculateCenterEvent = async (eventID) => {
        try {
            const fetchedEvents = await getEvents();
            const perimPoints = fetchedEvents["events"][eventID]["perimPoints"];
            getZoomParams(perimPoints);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };


    useEffect(() => {
        const fetchChannelInfo = async () => {
            const newChannelList = await getChannelList();
            setChannelList(newChannelList);
            
            const mapCentre = newChannelList.averagePosition(includePastStreams);
            setCenter(mapCentre || defaultCenter);
        };

        const newRouteLines = eventIDs.map((eventID, index) => {
            const routePoints = getRoutePointsByEventID(eventID);
      
            return (
              <Polyline
                key={index}
                path={routePoints}
                options={{
                  strokeColor: '#FF0000',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                }}
              />
            );
          });

        setRouteLines(newRouteLines);
        getEventInfo();
        fetchChannelInfo();
    }, []);

    // Separate useEffect for interval management
    useEffect(() => {
        if (!intervalId) {
            const id = setInterval(handleRefreshStreams, REFRESH_INTERVAL);
            setIntervalId(id);
        }

        // Clean up the interval when the component unmounts
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [intervalId]);

    // Update displayedChannels when channelList or includePastStreams changes
    useEffect(() => {
        if (channelList) {
            const filtered = channelList.filterActive(includePastStreams);
            setDisplayedChannels(filtered);
        }
    }, [channelList, includePastStreams]);

    const getEventInfo = async () => {
        try {
            const fetchedEvents = await getEvents();
            const eventIDList = Object.keys(fetchedEvents["events"]);
            setEventIDs(eventIDList);

            const eventInfo_ = Object.entries(fetchedEvents["events"]).reduce((result, [eventID, eventData]) => {
                result[eventID] = eventData["perimPoints"];
                return result;
            }, {});

            const eventRouteInfo_ = Object.entries(fetchedEvents["events"]).reduce((result, [eventID, eventData]) => {
                result[eventID] = eventData["routePoints"];
                return result;
            }, {});


            setEventInfo((prevEventInfo) => {
                return { ...prevEventInfo, ...eventInfo_ };
            });

            setEventRouteInfo((prevEventRouteInfo) => {
                return { ...prevEventRouteInfo, ...eventRouteInfo_ };
            });

        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleRefreshStreams = async () => {
        try {
            const newChannelList = await getChannelList(); // Get fresh channel data
            setChannelList(newChannelList);
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

    const handlePolygonClick = (eventID) => {
        calculateCenterEvent(eventID);
        navigate('/event/' + eventID);
        console.log("polygon clicked")
      };

    const zoomOnEventUrl = () => {
        // Perhaps not the most robust, waits 0.1s after map has loaded, zooms in on event if given
        setTimeout(() => {
            if (URLEventID) {
                calculateCenterEvent(URLEventID);
            };
          }, 1000);
    };

    // TODO: This should work based on event tagging, NOT on proximity to route (to deal with overlapping events)
    const backChannel = () => {
        if (!channelList) return;
        
        // Gets the eventID of the route associated with the selected channel
        const nearbyEvent = channelList.whichEventNear(selectedChannel, 0.4, includePastStreams);

       // If the channel is near a route, go to the nearest point on the route
        if(nearbyEvent){
            var newChannel = channelList.getPreviousByRoute(selectedChannel, nearbyEvent, includePastStreams);
            setSelectedChannel(newChannel);
        }
        // Otherwise, go to the previous channel by longitude
        else{
            var newChannel = channelList.getPreviousByLongitude(selectedChannel, includePastStreams);
            setSelectedChannel(newChannel);
        }
    }
    const forwardChannel = () => {
        if (!channelList) return;
        
        // Gets the route associated with the selected channel
        const route = channelList.whichEventNear(selectedChannel, 0.4, includePastStreams);

        // If the channel is near a route, go to the nearest point on the route
        if(route){
            var newChannel = channelList.getNextByRoute(selectedChannel, route, includePastStreams);
            setSelectedChannel(newChannel);
        }
        // Otherwise, go to the next channel by longitude
        else{
            var newChannel = channelList.getNextByLongitude(selectedChannel, includePastStreams);
            setSelectedChannel(newChannel);
        }
    }

    const getVideoPlayerBoundingBox = () => {
        if (videoPlayerRef.current) {
            return videoPlayerRef.current.getBoundingClientRect();
          }
          return null;
    };

    const moveCentreOutsideVideoBox = () => {
        const bbox = getVideoPlayerBoundingBox();
        
        // If video player is not ready yet, skip repositioning
        if (!bbox) {
            return;
        }

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
    // Handler for keydown events
    const handleKeyDown = (event) => {
        if (showVideoPlayer && selectedChannel) {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();  // Prevent the default action to avoid scrolling or other interference
                console.log("left arrow pressed");
                backChannel();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();  // Prevent the default action
                console.log("right arrow pressed");
                forwardChannel();
            }
        }
    };

    useEffect(() => {
        // Add the event listener when the component mounts
        window.addEventListener('keydown', handleKeyDown);

        // Remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedChannel, showVideoPlayer]);  // Adding dependencies ensures the listener is updated with the current state

    useEffect(() => {
        // Focus the video player container when it's shown
        if (showVideoPlayer && videoPlayerRef.current) {
            videoPlayerRef.current.focus(); // Set focus when the video player is displayed
        }
    }, [showVideoPlayer]); // Depend on showVideoPlayer to re-run this effect when it changes

    useEffect(() => {
        let timer;
        if (showTooltip) {
            timer = setTimeout(() => setShowTooltip(false), 1500); // Dismiss tooltip after 5 seconds
        }
        return () => clearTimeout(timer); // Clean up the timer
    }, [showTooltip]);
    

    return (
        <div>
            <div className="map-container">
    
                <div className="map-top-bar"></div>

                <div className="map-StartStreamButtonDiv">
                    <button className="map-StartStreamButton" onClick={() => navigateAndClearInterval(`/Streamer`)}>
                        Start <br /> Broadcasting
                    </button>
                </div>
                {/* TIMER object */}
                {/* <div className="map-timercontainer">
                    <Timer />
                </div> */}

                <div className="map-titlecontainer">
                    <span className="CSFont">
                        <span className="CSBlack">Crowd</span>
                        <span className="CSRed">Stream</span>
                        <sup>v0.1</sup>
                    </span>
                </div>

                <div className="map-helpText">
                    Click on a marker to view an event
                </div>

                {/* <div className="map-refreshStreamButtonDiv">
                    <button className="map-refreshStreamButton"
                        onClick={handleRefreshStreams}>
                        &#8635;
                    </button>
                </div> */}


                <div className='map-MenuButtonDiv'>                
                    <button className="map-MenuButton" onClick={() => setShowMenu(!showMenu)}>
                        <MenuIcon style={{ fontSize: '37px', color: 'black' }} />
                    </button>
                </div>


                <GoogleMap
                    mapContainerStyle={containerStyle}
                    ref={mapRef}
                    center={center}
                    zoom={zoom}
                    onLoad={map => {
                        setMap(map);
                        zoomOnEventUrl();
                      }}
                    options={{
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                        keyboardShortcuts: false,  // Disable keyboard shortcuts
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
                            zIndex={2}
                            key={index}
                            icon={{
                                // If the channel is active, use the liveStreamMarker, otherwise use the pastStreamMarker
                                url: channel.tags.active === "true"
                                    ? (channel === selectedChannel ? liveStreamWatchingMarker : liveStreamMarker) // If the channel is selected, switch to the 'watching' marker
                                    : (channel === selectedChannel ? pastStreamWatchingMarker : pastStreamMarker),
                                    
                                    // Adjust scaledSize based on whether the channel is the selectedChannel
                                    scaledSize: new window.google.maps.Size(
                                        channel === selectedChannel ? 86 : 64, // Width
                                        channel === selectedChannel ? 86 : 64  // Height
                                    )
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
                                setShowTooltip(true);
                                moveCentreOutsideVideoBox();
                            }}

                        />
                    ))}

                    {/* routeMarkers.map((routePoint, index) => (
                        <Marker
                            key={index}
                            icon={finishMarker}
                            size={0.1}
                            position={{
                                lat: parseFloat(routePoint["latitude"]),
                                lng: parseFloat(routePoint["longitude"])
                            }}
                        />
                        )) */}
                    {routeLines}
                    {eventIDs.map((eventID, index) => {
                        const polygonCoords = getPolygonByEventID(eventID);
                        return (
                        <Polygon
                            key={eventID}
                            zIndex={1}
                            paths={polygonCoords}
                            options={{
                            strokeColor: "#FF0000",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#FF0000",
                            fillOpacity: 0.35,
                            }}
                            onClick={() => handlePolygonClick(eventID)}
                        />)
                    })}

                </GoogleMap>
                
                {
                    showMenu && (
                        <div className="menu-container">
                            <button className="menu-option" onClick={() => navigateAndClearInterval(`/about`)}><span className="CSBlack">About Crowd</span><span className="CSRed">Stream</span></button>
                            {/* 
                            <button className="menu-option" onClick={() => navigateAndClearInterval(`/newevent`)}>Create an Event</button>
                            */}
                            <button className="menu-option" onClick={() => navigateAndClearInterval(`/Streamer`)}><span className="CSBlack">Start Broadcasting</span></button>
                        </div>
                    )
                }


            </div>
            {
                showVideoPlayer && selectedChannel &&
                <div className="video-player-container" ref={videoPlayerRef} tabIndex="-1">
                    <XSquare onClick={onVideoClose} className="map-closebutton" />
                    <ArrowLeft onClick={backChannel} className="map-leftbutton" />
                    <ArrowRight onClick={forwardChannel} className="map-rightbutton" />
                    <VideoJSPlayer
                        channel_name={selectedChannel.name}
                        onFullscreenToggle={handleFullscreenToggle}
                        className="map-videojsplayer"
                    />
                    {showTooltip && 
                        <div className={`tooltip ${tooltipFade ? 'fade-out' : ''}`}>
                            <div>Use the left & right arrows to move up & down the course</div>
                        </div>
                    }

                </div>
            }

        </div>
    )
}

export default MapWithMarker;