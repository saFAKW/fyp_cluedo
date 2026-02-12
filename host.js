const SERVER_URL = 'http://127.0.0.1:5000';
let socket = io(SERVER_URL);

document.addEventListener('DOMContentLoaded', () => {
    
    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
        const errorBox = document.getElementById("errorBox");
        if(errorBox) errorBox.textContent = "Cannot connect to server.";
    });

    const makeGameBtn = document.getElementById("makeGameBtn");
    if (makeGameBtn) {
        makeGameBtn.addEventListener("click", function () {
            const players = document.getElementById("playersSelect").value;
            const clues = document.getElementById("clueSelect").value;
            const errorBox = document.getElementById("errorBox");

            if (!players || !clues) {
                errorBox.textContent = "Please select both options.";
                return;
            }

            socket.emit('create_game', { players: players, clues: clues });
            errorBox.textContent = "Creating game...";
            errorBox.style.color = "blue"; 
        });
    }

    socket.on('game_created', function(data) {
        window.location.href = `pick.html?room=${data.room}&role=host`;
    });
});
