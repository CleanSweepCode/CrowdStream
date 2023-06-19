export const listChannels = async () => {
    try {
        const response = await fetch('http://localhost:8080/channels/list');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}


export async function getStreamLinkFromName(channelName) {

    const data = {
        channelName: channelName
    };

    try {
        const response = await fetch('http://localhost:8080/channels/streamLinkByName', {
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

