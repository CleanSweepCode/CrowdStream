//For testing locally, use http://localhost:8080
const LOCALTEST = 'http://localhost:8080';
//For production, use https://backend-7r4nlien6a-og.a.run.app
const REMOTETEST = 'https://backend-7r4nlien6a-og.a.run.app';

const BACKEND_URL = LOCALTEST;


export const listChannels = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/channels/list`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

export async function tagGeoLocationFromUtil(data) {

    fetch(`${BACKEND_URL}/channels/tagByName`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch((error) => {
            console.error('Error:', error);
        });

}
export async function getStreamLinkFromName(channelName) {

    const data = {
        channelName: channelName
    };

    try {
        const response = await fetch(`${BACKEND_URL}/channels/streamLinkByName`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        console.log(responseData);
        return responseData.playbackURL;
    } catch (error) {
        console.error('Error in getStreamLinkFromName:', error);
    }
}

export async function createChannel(tags = {}){

    const data = {
        tags: tags
    };

    try {
        const response = await fetch(`${BACKEND_URL}/channels/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const channelData = await response.json();
        return channelData;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

export async function deleteChannelByName(channelName){
    const data = {
        channelName: channelName
    };

    try {
        const response = await fetch(`${BACKEND_URL}/channels/deleteByName`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        console.log(responseData);
        return responseData;
    } catch (error) {
        console.error('Error in deleteChannelByName:', error);
    }

}

export function deleteChannelByNameSync(channelName){
    // Synchronous version of deleteChannelByName, for us in beforeunload
    const data = new Blob([JSON.stringify({ channelName })], { type : 'application/json' });
    navigator.sendBeacon(`${BACKEND_URL}/channels/deleteByName`, data);
}