const SERVER_URL = 'http://127.0.0.1:5000';
let socket; // Declare but don't connect yet

document.addEventListener('DOMContentLoaded', () => {
    // Connect AFTER page loads
    socket = io(SERVER_URL);

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
        console.error('Connection failed:', error);
        alert('Cannot connect to server. Make sure the server is running.');
    });

    const boxes = document.querySelectorAll(".code-box");

    boxes.forEach((box, index) => {
        box.addEventListener("input", () => {
            if (box.value && index < boxes.length - 1) {
                boxes[index + 1].focus();
            }
        });
    });

    document.getElementById("joinGameBtn").addEventListener("click", () => {
        let code = "";
        boxes.forEach(b => code += b.value);

        if (code.length < 6) {
            alert("Please enter a full 6-digit code.");
            return;
        }

        socket.emit('join_game', { code: code });
    });

    socket.on('join_success', function(data) {
        alert("Success! You joined room: " + data.room);
        window.location.href = `pick.html?room=${data.room}`;
    });

    socket.on('error_msg', function(data) {
        alert("Error: " + data.msg);
    });
});