const socket = io();

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
});
