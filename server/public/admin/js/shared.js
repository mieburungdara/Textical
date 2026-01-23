const socket = new WebSocket('ws://' + window.location.hostname + ':3000');

socket.onopen = () => {
    console.log("Admin connection established.");
};

socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "login_success") {
        window.location.href = "/admin/monsters";
    }
    // Global listener for specific page handlers
    if (window.handleServerMessage) {
        window.handleServerMessage(msg);
    }
};

function send(data) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    } else {
        console.error("Socket not ready.");
    }
}
