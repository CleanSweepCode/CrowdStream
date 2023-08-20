
import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useNavigate } from "react-router-dom";
import './MapWithMarker.css';
import { listChannels } from '../Helpers/APIUtils.jsx'
import { Switch, FormControlLabel } from '@material-ui/core';  // Importing Material UI Slider for this example
import liveIconMarker from '../../assets/marker64.png';
import oldIconMarker from '../../assets/filmMarker64.png';

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



function MapWithMarker() {
    const navigate = useNavigate();
    const [activeOnly, setActiveOnly] = useState(true);  // This is the new piece of state
    const [channelInfo, setChannelInfo] = useState([]);
    const [center, setCenter] = useState(defaultCenter);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [intervalId, setIntervalId] = useState(null); // Add state for interval ID


    useEffect(() => {
        const fetchChannelInfo = async () => {
            const fetchedChannelInfo = await listChannels();
            setChannelInfo(fetchedChannelInfo);

            if (fetchedChannelInfo.length > 0) {
                let totalLat = 0.0;
                let totalLng = 0.0;
                let numPoints = fetchedChannelInfo.length;
                let numActiveChannels = 0;

                for (let i = 0; i < numPoints; i++) {
                    if (fetchedChannelInfo[i].tags.active === "true") {
                        totalLat += parseFloat(fetchedChannelInfo[i].tags.latitude);
                        totalLng += parseFloat(fetchedChannelInfo[i].tags.longitude);
                        numActiveChannels++;
                    }
                }

                if (numActiveChannels > 0) {
                    const averageLat = totalLat / numActiveChannels;
                    const averageLng = totalLng / numActiveChannels;

                    setCenter({
                        lat: averageLat,
                        lng: averageLng
                    });
                } else {
                    // Handle case when no active channels found
                    // For example, set a default center location
                    setCenter(defaultCenter);
                }
            }
        
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
            const fetchedChannelInfo = await listChannels(); // Call your API to get new channel data
            setChannelInfo(fetchedChannelInfo); // Update the channel data
            
            // Might need to update the center and other map-related logic here
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

    const displayedChannels = activeOnly ? channelInfo.filter(channel => channel.tags.active === "true") : channelInfo.filter(channel => channel.tags.active === "false");

    return (
        <div>
            <div className="map-container">
                <FormControlLabel
                    control={
                        <Switch
                            checked={activeOnly}
                            onChange={e => setActiveOnly(e.target.checked)}
                            color="primary"
                        />
                    }
                    // Label should be 'Active channels' if activeOnly else 'All channels'
                    label={activeOnly ? 'Active channels' : 'All channels'}
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

                

                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={8}
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
                            icon={channel.tags.active === "true" ? liveIconMarker : oldIconMarker}
                            scaledSize={2000}
                            clickable={channel.tags.active === "true"}
                            position={{
                                lat: parseFloat(channel.tags.latitude),
                                lng: parseFloat(channel.tags.longitude)
                            }}
                            onClick={() => navigateAndClearInterval(`/viewer/${channel.name}`)}
                            onMouseOver={() => setSelectedChannel(channel)}
                            onMouseOut={() => setSelectedChannel(null)}
                        />
                    ))}

                </GoogleMap>

            </div>
        </div>
    )
}

export default MapWithMarker;