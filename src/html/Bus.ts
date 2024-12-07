import {LiveStreamState} from "../LiveStream";

class Bus extends EventTarget{

    constructor(){
        super();
        this.init();
    }

    private socket: WebSocket | null = null;

    private init(){
        // connect to websocket
        this.socket = new WebSocket('ws://localhost:5002');
        this.socket.onopen = () => {
            console.log('connected to bus server');
        };
        this.socket.onclose = () => {
            console.log('disconnected from bus server');
            this.reconnect();
        };
        this.socket.onerror = (error) => {
            console.error('error connecting to bus server', error);
            this.reconnect();
        }

        this.socket.onmessage = (event) => {
            const state = JSON.parse(event.data) as LiveStreamState;
            this.dispatchEvent(new CustomEvent('state', {
                detail: state
            }));
        }
    }

    private reconnect(){
        if(this.socket){
            this.socket.close();
        }
        setTimeout(() => {
            this.init();
        }, 1000);
    }

}

export default new Bus()