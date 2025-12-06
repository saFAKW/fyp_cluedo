const SERVER_URL = 'http://127.0.0.1:5000';
let socket; // Declare but don't connect yet

document.addEventListener('DOMContentLoaded', () => {
    // Connect to socket AFTER page loads
    socket = io(SERVER_URL);

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
        console.error('Connection failed:', error);
        document.getElementById("errorBox").textContent = "Cannot connect to server. Make sure server is running.";
    });

    document.getElementById("makeGameBtn").addEventListener("click", function () {
        const players = document.getElementById("playersSelect").value;
        const clues = document.getElementById("clueSelect").value;
        const errorBox = document.getElementById("errorBox");

        if (!players || !clues) {
            errorBox.textContent = "Please select both options.";
            return;
        }

        socket.emit('create_game', { players: players, clues: clues });
        errorBox.textContent = "Creating game...";
    });

    socket.on('game_created', function(data) {
        alert("Room Created! Code: " + data.room);
        window.location.href = `wait.html?room=${data.room}&host=1`;
    });
});