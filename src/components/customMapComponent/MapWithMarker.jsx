
import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useNavigate } from "react-router-dom";
import './MapWithMarker.css';
import { listChannels } from '../Helpers/APIUtils.jsx'
import { Switch, FormControlLabel } from '@material-ui/core';  // Importing Material UI Slider for this example
import iconMarker from '../../assets/marker64.png';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDpcl7prQQADOD4o_jRuWSsnD79kGvPBMw';

// Google Map Styling
const containerStyle = {
    width: '100vw',
    //height: 'calc(var(--vh) - 56px)'  // Assuming the height of the iOS Navbar is 56px
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


    useEffect(() => {
        const fetchChannelInfo = async () => {
            const fetchedChannelInfo = await listChannels();
            setChannelInfo(fetchedChannelInfo);

            if (fetchedChannelInfo.length > 0) {
                setCenter({
                    lat: parseFloat(fetchedChannelInfo[0].tags.latitude),
                    lng: parseFloat(fetchedChannelInfo[0].tags.longitude)
                });
            }

        };
        fetchChannelInfo();
    }, []);

    const displayedChannels = activeOnly ? channelInfo.filter(channel => channel.tags.active === "true") : channelInfo;

    return (
        <div>
            <div className="mapContainer">
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
                    className="switchContainer"
                />


                <button className="startStreamingContainer"
                    onClick={() => navigate(`/streamer`)}>
                    Start Streaming
                </button>

                <div className="textOverlayContainer">
                    CrowdStream
                </div>

                <div className="helpTextOverlay">
                    Click a marker to view event
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
                            icon={iconMarker}
                            scaledSize={2000}
                            position={{
                                lat: parseFloat(channel.tags.latitude),
                                lng: parseFloat(channel.tags.longitude)
                            }}
                            onClick={() => navigate(`/viewer/${channel.name}`)}
                            onMouseOver={() => setSelectedChannel(channel)}
                            onMouseOut={() => setSelectedChannel(null)}
                        />
                    ))}

                </GoogleMap>

            </div>
        </div>
    )
}

export { GOOGLE_MAPS_API_KEY };
export default MapWithMarker;