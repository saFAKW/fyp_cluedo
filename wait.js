const playersBox = document.getElementById("playersBox");

// keep track of players in this client
let players = [];

document.addEventListener('DOMContentLoaded', () => {
    const playersBox = document.getElementById("playersBox");

    // keep track of players in this client
    let players = [];

    function renderPlayers() {
        playersBox.innerHTML = ""; // Clear list

        players.forEach((p, index) => {
            const pill = document.createElement("div");
            pill.className = "player-pill";

            // create avatar src from character name (strip spaces)
            const char = (p.character || '').toString();
            const avatarName = char.replace(/\s+/g, '');
            const avatarSrc = `assets/${avatarName}.PNG`;

            pill.innerHTML = `
                <img class="player-avatar" src="${avatarSrc}" alt="${char}" onerror="this.style.display='none'">
                <div class="player-info">
                    <strong>${p.name}</strong><br>
                    ${p.character}
                </div>
            `;

            playersBox.appendChild(pill);
        });
    }

    // read room from query param (moved down to include host flag)
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');

    // read host flag and wire Start button visibility
    const isHost = params.get('host') === '1';

    const startBtn = document.getElementById("startGame");
    if (startBtn && !isHost) {
        startBtn.style.display = 'none';
    }

    // connect to socket.io and listen for player joins for this room
    if (typeof io !== 'undefined') {
        const SERVER_URL = 'http://127.0.0.1:5000';
        const socket = io(SERVER_URL);

        socket.on('connect', () => {
            // optionally tell server we're watching this room (not necessary because server uses room broadcast)
            console.log('Connected to socket.io, watching room', room);
        });

        socket.on('player_joined', (data) => {
            // data.player, data.players (full list)
            if (data && data.players) {
                players = data.players;
                renderPlayers();
            } else if (data && data.player) {
                players.push(data.player);
                renderPlayers();
            }
        });

        socket.on('error_msg', (d) => {
            alert('Error: ' + (d.msg || JSON.stringify(d)));
        });
    }

    // Start Game button (you can change this)
    const startButton = document.getElementById("startGame");
    if (startButton) {
        startButton.addEventListener("click", () => {
            if (players.length === 0) {
                alert("You need at least one player to start the game.");
                return;
            }

            alert("Game Starting!");
        });
    }
});
