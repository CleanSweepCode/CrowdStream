//For testing locally, use http://localhost:8080
const LOCALTEST = 'http://localhost:8080';
//For production, use https://backend-7r4nlien6a-og.a.run.app
const REMOTETEST = 'https://backend-7r4nlien6a-og.a.run.app';


export const listChannels = async () => {
    try {
        const response = await fetch(`${LOCALTEST}/channels/list`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

export async function tagGeoLocationFromUtil(data) {

    fetch(`${LOCALTEST}/channels/tagByName`, {
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
        const response = await fetch(`${LOCALTEST}/channels/streamLinkByName`, {
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

