
import {
    listChannels,
    createChannel,
    channelHeartbeat,
    tagChannelInactive,
    tagChannelActive,
    tagChannel,
    getChannelByARN,
    createStreamKey
} from '../../components/Helpers/APIUtils.jsx'
import IVSBroadcastClient, {
    Errors,
    BASIC_LANDSCAPE
} from 'amazon-ivs-web-broadcast';


const debug_arn = "arn:aws:ivs:eu-west-1:449365895007:channel/n6zGicg3Q28G";
const debug_stream_key = "sk_eu-west-1_Zxwigvkh9pOA_dnK9y3mmUFPpaoz4CzxA9oUDptlcH8"


export class StreamClient {
    constructor(stream_info, streamConfig) {
        this.stream_info = stream_info;
        this.client = IVSBroadcastClient.create({
            streamConfig: streamConfig,
            ingestEndpoint: stream_info.channel.ingestEndpoint,
            streamKey: stream_info.streamKey.value,
        });

        this.has_stream = false;
        this.channel_name = stream_info.channel.name;
    }

    static async create(tags, streamConfig) {
        const stream_api_call = await createChannel(tags);
        const stream_info = stream_api_call.data;
        return new StreamClient(stream_info, streamConfig);
    }

    static async create_debug(tags, streamConfig) {
        const channel = await getChannelByARN(debug_arn);
        const streamKey = {value: debug_stream_key}
        return new StreamClient({channel: channel, streamKey: streamKey}, streamConfig);
        }

    async setStream(stream) {
        if (!stream) {
            console.error("Camera stream for client is null");
        }

        if (this.has_stream) {
            this.client.removeVideoInputDevice('cam 1');
        }

        try {
            const { width, height } = stream.getVideoTracks()[0].getSettings();
            //obtain max resolution to center the video in the client
            const forced_width = 1920;
            const forced_height = 1080;
            await this.client.addVideoInputDevice(stream, 'cam 1', { index: 0, x: 0, y: 0, width: forced_width, height: forced_height });
        }
        catch (error) {
            console.warn('Error adding video input device to IVS: ', error);
        }


    }

    async addAudioInputDevice(microphoneStream) {
        this.client.addAudioInputDevice(microphoneStream, 'mic1');
    }

    async start() {
        this.client.startBroadcast(this.stream_info.streamKey.value)
        tagChannelActive(this.channel_name);
    }

    async stop() {
        this.client.stopBroadcast();
        tagChannelInactive(this.channel_name);
    }

    async sendHeartbeat() {
        await channelHeartbeat(this.channel_name);
    }

    async updateTags(tags) {
        const params = {
            channelName: this.channel_name,
            tags: tags
        };
        await tagChannel(params);
    }

}