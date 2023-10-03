
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleMap, Marker, Polygon, Polyline } from '@react-google-maps/api';

import './MapWithMarker.css';
import '../videoJS/videojs.css';
import { listChannels, getEvents } from '../Helpers/APIUtils.jsx'
import { getChannelList } from '../Helpers/ChannelList.jsx';

import { Switch, FormControlLabel } from '@material-ui/core';  // Importing Material UI Slider for this example

import liveStreamMarker from '../../assets/markers/cameralive.svg';
import pastStreamMarker from '../../assets/markers/paststreamlive.svg';
import liveStreamWatchingMarker from '../../assets/markers/cameralivewatching.svg';
import pastStreamWatchingMarker from '../../assets/markers/pastStreamWatching.svg';

import Timer from '../Timer/Timer.jsx'


import finishMarker from '../../assets/finishMarker64.png';
import VideoJSPlayer from '../videoJS/videojs.jsx';
import { XSquare, ArrowLeft, ArrowRight } from 'lucide-react';
import MenuIcon from '@material-ui/icons/Menu';



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
    const mapRef = useRef(null); // Create a ref for the map instance
    const [includePastStreams, setIncludePastStreams] = useState(true);  // This is the new piece of state
    includePastStreams == 1;
    // const [channelInfo, setChannelInfo] = useState([]);
    const [center, setCenter] = useState(defaultCenter);
    const [zoom, setZoom] = useState(10);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [intervalId, setIntervalId] = useState(null); // Add state for interval ID
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);
    const [eventIDs, setEventIDs] = useState([]);
    const [eventInfo, setEventInfo] = useState({});
    const [eventRouteInfo, setEventRouteInfo] = useState({});
    const [routeLines, setRouteLines] = useState([]);


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

        setZoom(zoom_);
        
        return;
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
    }, [intervalId]);

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

    const displayedChannels = channelList.filterActive(includePastStreams);

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
        // Perhaps not the most robus, waits a second after map has loaded, zooms in on event if given
        setTimeout(() => {
            if (URLEventID) {
                calculateCenterEvent(URLEventID);
            };
          }, 1000);
    };

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
    
                <div className="map-top-bar"></div>

                <button className="map-StartStreamButton"
                    onClick={() => navigateAndClearInterval(`/streamer`)}>
                    Start <br /> Broadcasting
                </button>

                {/* TIMER object */}
                {/* <div className="map-timercontainer">
                    <Timer />
                </div> */}

                <div className="map-titlecontainer">
                    <span className="CSFont">
                        <span className="CSBlack">Crowd</span>
                        <span className="CSRed">Stream</span>
                    </span>
                </div>

                <div className="map-helpText">
                    Click on a marker to view an event
                </div>

                <div className="map-refreshStreamButtonDiv">
                    <button className="map-refreshStreamButton"
                        onClick={handleRefreshStreams}>
                        &#8635;
                    </button>
                </div>


                <div className='map-MenuButtonDiv'>
                    <button className="map-MenuButton" onClick={() => setShowMenu(!showMenu)}>
                        <MenuIcon style={{ fontSize: '37px' }} />
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
                            <button className="menu-option" onClick={() => navigateAndClearInterval(`/streamer`)}><span className="CSBlack">Start Broadcasting</span></button>
                        </div>
                    )
                }


            </div>
            {
                showVideoPlayer && selectedChannel &&
                <div className="video-player-container" ref={videoPlayerRef}>
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