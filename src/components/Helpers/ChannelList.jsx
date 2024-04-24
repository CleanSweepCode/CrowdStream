// Channel List object, with filtering, sorting options etc.

import {listChannels, getEvents} from './APIUtils.jsx';
import * as turf from '@turf/turf';

class ChannelList {
    constructor() {
        this._raw = null;
        this.preFetchedEvents = null; // Initial setup for storing pre-fetched events

    }

    async loadChannels() {
        this._raw = await listChannels();   
    }

    async loadEvents() {
        const data = await getEvents();
        console.log(data); // Log the complete data to verify its structure
        this.preFetchedEvents = data.events;
    }

    filterActive(includePastStreams){
        // Filter in/out inactive channels
        // if includePastStreams, display only channel with tag active == 'true'
        // if !includePastStreams, display those channels, + those with a tag RecordingURL
        return this._raw.filter(channel => {
            if (!includePastStreams) {
                return channel.tags.active === "true";
            } else {
                return channel.tags.active === "true" || channel.tags.RecordingURL;
            }
        });
    }

    activeOnly() {
        return this.filterActive(false);
    }

    averagePosition(includePastStreams) {
        // return the average position of all streams found

        const channelList = this.filterActive(includePastStreams);

        let totalLat = 0;
        let totalLng = 0;
        let numChannels = channelList.length;

        if (numChannels === 0) {
            return null;
        }

        for (let i = 0; i < channelList.length; i++) {
            totalLat += parseFloat(channelList[i].tags.latitude) / numChannels;
            totalLng += parseFloat(channelList[i].tags.longitude) / numChannels;
        }

        return {
            lat: totalLat,
            lng: totalLng
        };

    }

    sortByLongitude(arr){
        return arr.sort((a, b) => parseFloat(a.tags.longitude) - parseFloat(b.tags.longitude));
    }

    getNextByLongitude(currentChannel, includePastStreams) {
        const sortedByLongitude = this.sortByLongitude(this.filterActive(includePastStreams));        
        const currentEventId = currentChannel.tags.eventId; // maybe "undefined"
        const channelsWithSameEventId = sortedByLongitude.filter(channel => channel.tags.eventId === currentEventId);
        const curIdx = channelsWithSameEventId.findIndex(channel => channel.name === currentChannel.name);

        if (curIdx === -1) {
            return null;
        }
    
        let nextChannel = channelsWithSameEventId[(curIdx + 1) % channelsWithSameEventId.length];

        return nextChannel;
    }
    
    // Returns the event ID of the route IF the channel is near a route. Otherwise returns false
    whichEventNear(channel, distance, includePastStreams) {
        const channelList = this.filterActive(includePastStreams);
        const channelPoint = turf.point([channel.tags.longitude, channel.tags.latitude]);
        const events = this.preFetchedEvents; // This should now directly contain the events object
        if (!events) {
            console.error("Events data not loaded or is empty");
            return false;
        }
        // Iterate over each event in the object
        for (let key of Object.keys(events)) {
            const event = events[key];
            if (!event.routePoints) {
                continue; // Skip this event as it doesn't have routePoints
            }
            const route = turf.lineString(event.routePoints); // Use routePoints to create the line string
            const flippedRoutePoints = event.routePoints.map(coords => [coords[1], coords[0]]);
            if (turf.pointToLineDistance(channelPoint, flippedRoutePoints) < distance) {
                // Returns the event ID if the channel is near the route
                console.log("Channel is near route of event", key);
                return key;
            }
        }
        return false;
    }


    sortByRoute(eventID, includePastStreams) {
        const routeEvent = this.preFetchedEvents[eventID];
        // Ensure coordinates are flipped correctly for GeoJSON format
        const routeLine = turf.lineString(routeEvent.routePoints.map(p => [p[1], p[0]]));
        console.log("No error yet")
        const filteredChannels = this._raw.filter(channel => {
            const lat = parseFloat(channel.tags.latitude);
            const lon = parseFloat(channel.tags.longitude);
            // Ensure the correct order of longitude and latitude for the point
            const point = turf.point([lon, lat]);
            // Calculate distance using correct units and filter based on threshold
            const distance = turf.pointToLineDistance(point, routeLine, { units: 'meters' });
            console.log(distance);
            return distance < 400;
        });    
        // Map filtered channels to include the nearest point on line and sort them
        return filteredChannels.map(channel => {
            const point = turf.point([parseFloat(channel.tags.longitude), parseFloat(channel.tags.latitude)]);
            return {
                channel,
                pointOnLine: turf.nearestPointOnLine(routeLine, point)
            };
        })
        .sort((a, b) => a.pointOnLine.properties.location - b.pointOnLine.properties.location)
        .map(obj => obj.channel);
    }
    
    
    // Returns the previous channel along the route (toward the start of the route)
    getPreviousByRoute(currentChannel, nearbyEvent, includePastStreams) {
        const sortedChannels = this.sortByRoute(nearbyEvent, includePastStreams);
        console.log(sortedChannels);
        const currentIdx = sortedChannels.findIndex(channel => channel.name === currentChannel.name);
        if (currentIdx === -1) {
            return null; 
        }
        else if(currentIdx === 0){
            //loop back to the end of the route
            return sortedChannels[sortedChannels.length - 1];
        }
        return sortedChannels[currentIdx - 1];
        }
 
    // Returns the next channel along the route (toward the end of the route)
    getNextByRoute(currentChannel, route, includePastStreams) {
        const sortedChannels = this.sortByRoute(route);
        console.log(sortedChannels);
        const currentIdx = sortedChannels.findIndex(channel => channel.name === currentChannel.name);
        if (currentIdx === -1) {
            return null; // Current channel not found
        }
        else if(currentIdx === sortedChannels.length - 1){
            //loop back to the start of the route
            return sortedChannels[0];
        }
        return sortedChannels[currentIdx + 1];    
    }


    getPreviousByLongitude(currentChannel, includePastStreams) {
        const sortedByLongitude = this.sortByLongitude(this.filterActive(includePastStreams));        
        const currentEventId = currentChannel.tags.eventId; // maybe "undefined"
        const channelsWithSameEventId = sortedByLongitude.filter(channel => channel.tags.eventId === currentEventId);
        const curIdx = channelsWithSameEventId.findIndex(channel => channel.name === currentChannel.name);

        if (curIdx === -1) {
            return null;
        }

        const channelsWithSameEventIdLength = channelsWithSameEventId.length
        let nextChannel = channelsWithSameEventId[(curIdx + channelsWithSameEventIdLength - 1) % channelsWithSameEventIdLength];

        return nextChannel;
    }

}

export async function getChannelList() {
    const channelList = new ChannelList();
    await channelList.loadChannels();
    await channelList.loadEvents();
    return channelList;
}