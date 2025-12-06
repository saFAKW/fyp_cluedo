const SERVER_URL = 'http://127.0.0.1:5000';
const socket = io(SERVER_URL);

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
    // wait for server confirmation (game_created) which will redirect host to the wait page
});

socket.on('game_created', function(data) {
    alert("Room Created! Code: " + data.room);
    // navigate to wait page so host can monitor joined players; mark host=1 in query
    window.location.href = `wait.html?room=${data.room}&host=1`;
});
