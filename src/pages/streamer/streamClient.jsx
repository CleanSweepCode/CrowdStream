
import { listChannels, createChannel, channelHeartbeat, tagChannelInactive, tagChannelActive } from '../../components/Helpers/APIUtils.jsx'
import IVSBroadcastClient, {
    Errors,
    BASIC_LANDSCAPE
} from 'amazon-ivs-web-broadcast';

export class StreamClient {
    constructor(stream_info, streamConfig) {
        this.stream_info = stream_info;
        this.streamConfig = streamConfig;
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
            const max_width = this.streamConfig.maxResolution.width;
            const max_height = this.streamConfig.maxResolution.height;
            const x_offset = (max_width - width) / 2;
            const y_offset = (max_height - height) / 2;
            await this.client.addVideoInputDevice(stream, 'cam 1', { index: 0, x: x_offset, y: y_offset, width: width, height: height });
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

}