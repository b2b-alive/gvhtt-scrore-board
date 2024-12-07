import ws from 'ws';
import {LiveStreamState} from "./LiveStream";

class BusServer {

    private wss: ws.Server | null = null;
    private currentLiveStreamState: LiveStreamState | null = null;

    constructor() {
        this.init();
    }

    private init() {
        const wss = new ws.Server({port: 5002});
        wss.on('connection', (ws) => {
            console.log(`New client connected`);
            if (this.currentLiveStreamState) {
                ws.send(JSON.stringify(this.currentLiveStreamState));
            }
        });
        this.wss = wss;
        console.log('Bus server started');
    }

    sendLiveStreamState(state: LiveStreamState) {
        this.currentLiveStreamState = state;
        const jsonState = JSON.stringify(state);
        this.wss?.clients.forEach(function each(client) {
            if (client.readyState === ws.OPEN) {
                client.send(jsonState);
            }
        });
    }
}

export default new BusServer();