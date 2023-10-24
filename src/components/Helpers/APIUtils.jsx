//For testing locally, use http://localhost:8080
const LOCALTEST = 'http://localhost:8080';
//For production, use https://csc-node-rds-env.eba-qwi2z4cb.eu-west-2.elasticbeanstalk.com  https://livestreamapp-backend-7r4nlien6a-od.a.run.app
const REMOTETEST = 'https://livestreamapp-backend-7r4nlien6a-od.a.run.app';
const LOCALTEST2 = 'https://10.248.151.179:8080';


const BACKEND_URL = REMOTETEST;


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

export const getEvents = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/events/getEvents`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

export async function tagChannelInactive(channelName) {
    const data = {
        channelName: channelName
    };
    console.log(data);
    fetch(`${BACKEND_URL}/channels/markinactive`, {
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

export async function tagChannelActive(channelName) {
    const data = {
        channelName: channelName
    };
    console.log(data);
    fetch(`${BACKEND_URL}/channels/markactive`, {
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

export async function tagChannel(data) {
    // receives a dict of channelName and tags, sends to backend.

    fetch(`${BACKEND_URL}/channels/tagByName`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => data)
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
        return responseData.playbackURL;
    } catch (error) {
        console.error('Error in getStreamLinkFromName:', error);
    }
}

export async function createChannel(tags = {}) {

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

export async function deleteChannelByName(channelName) {
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
        return responseData;
    } catch (error) {
        console.error('Error in deleteChannelByName:', error);
    }

}

export function deleteChannelByNameSync(channelName) {
    // Synchronous version of deleteChannelByName, for use in beforeunload
    const data = new Blob([JSON.stringify({ channelName })], { type: 'application/json' });
    navigator.sendBeacon(`${BACKEND_URL}/channels/deleteByName`, data);
}

export async function channelHeartbeat(channelName) {
    const data = {
        channelName: channelName
    };

    try {
        const response = await fetch(`${BACKEND_URL}/channels/heartbeatByName`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        return responseData;
    }
    catch (error) {
        console.error('Error in channelHeartbeat:', error);
    }

}