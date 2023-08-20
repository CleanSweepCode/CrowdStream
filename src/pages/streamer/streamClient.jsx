
import { listChannels, createChannel, channelHeartbeat, tagChannelInactive, tagChannelActive } from '../../components/Helpers/APIUtils.jsx'
import IVSBroadcastClient, {
    Errors,
    BASIC_LANDSCAPE
  } from 'amazon-ivs-web-broadcast';

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

    async setStream(stream) {
        if (!window.cameraStream) {
            console.error("Camera stream for client is null");
        }

        if (this.has_stream) {
            this.client.removeVideoInputDevice('camera1');
        }

        this.client.addVideoInputDevice(stream, 'camera1', { index: 0 });

        this.has_stream = true;
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