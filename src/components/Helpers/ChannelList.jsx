// Channel List object, with filtering, sorting options etc.

import {listChannels} from './APIUtils.jsx';

class ChannelList {
    constructor() {
        this._raw = null;
    }

    async loadChannels() {
        this._raw = await listChannels();   
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
    return channelList;
}