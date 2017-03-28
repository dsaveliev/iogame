export default class WS {
    constructor(props) {
        this.webSocket = new WebSocket(props.server);
        this.webSocket.onopen = () => {
            console.log("OPEN");
        };
        this.webSocket.onclose = event => {
            console.log("CLOSE");
            console.log(event);
            this.webSocket = null;
        };
        this.webSocket.onmessage = event => {
            const state = JSON.parse(event.data);
            props.onMessage(state);
        };
        this.webSocket.onerror = event => {
            console.log("ERROR");
            console.log(event.data);
        }
    }
};
