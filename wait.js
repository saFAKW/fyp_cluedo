document.addEventListener('DOMContentLoaded', () => {
    const playersBox = document.getElementById("playersBox");
    
    // keep track of players in this client
    let players = [];
    let isHost = false;
    let currentRoom = null;

    function renderPlayers() {
        if (players.length === 0) {
            playersBox.innerHTML = '<p style="color: #999; font-style: italic;">Waiting for players to join...</p>';
            return;
        }

        playersBox.innerHTML = ""; // Clear list

        players.forEach((p, index) => {
            const pill = document.createElement("div");
            pill.className = "player-pill";

            // create avatar src from character name (strip spaces)
            const char = (p.character || '').toString();
            const avatarName = char.replace(/\s+/g, '');
            const avatarSrc = `assets/${avatarName}.PNG`;

            // Create the pill HTML
            pill.innerHTML = `
                <img class="player-avatar" src="${avatarSrc}" alt="${char}" onerror="this.style.display='none'">
                <div class="player-info">
                    <strong>${p.name}</strong>
                    <span>${p.character}</span>
                </div>
            `;

            // Only add remove button if user is the host
            if (isHost) {
                const removeBtn = document.createElement("button");
                removeBtn.className = "remove-btn";
                removeBtn.innerHTML = "×";
                removeBtn.setAttribute("data-index", index);
                removeBtn.addEventListener("click", () => {
                    removePlayer(index);
                });
                pill.appendChild(removeBtn);
            }

            playersBox.appendChild(pill);
        });
    }

    function removePlayer(index) {
        if (!isHost) return;
        
        const removedPlayer = players[index];
        if (confirm(`Remove ${removedPlayer.name} from the game?`)) {
            // Remove from local array
            players.splice(index, 1);
            
            // Emit to server to remove player and broadcast to all
            if (socket) {
                socket.emit('remove_player', { 
                    room: currentRoom, 
                    playerIndex: index 
                });
            }
            
            renderPlayers();
        }
    }

    // read room from query param
    const params = new URLSearchParams(window.location.search);
    currentRoom = params.get('room');

    // Display the room code in the h2 element
    const roomCodeElement = document.getElementById('roomCode');
    if (roomCodeElement && currentRoom) {
        roomCodeElement.textContent = `Room Code: ${currentRoom}`;
    }

    // read host flag and wire Start button visibility
    isHost = params.get('host') === '1';

    const startBtn = document.getElementById("startGame");
    if (startBtn && !isHost) {
        startBtn.style.display = 'none';
    }

    // connect to socket.io and listen for player joins for this room
    let socket;
    if (typeof io !== 'undefined') {
        const SERVER_URL = 'http://127.0.0.1:5000';
        socket = io(SERVER_URL);

        socket.on('connect', () => {
            console.log('Connected to socket.io, watching room', currentRoom);
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

        socket.on('player_removed', (data) => {
            // Update players list when someone is removed
            if (data && data.players) {
                players = data.players;
                renderPlayers();
            }
        });

        socket.on('error_msg', (d) => {
            alert('Error: ' + (d.msg || JSON.stringify(d)));
        });
    }

    // Start Game button
    const startButton = document.getElementById("startGame");
    if (startButton) {
        startButton.addEventListener("click", () => {
            if (players.length === 0) {
                alert("You need at least one player to start the game.");
                return;
            }

            alert("Game Starting!");
            // TODO: Navigate to main game page
            // window.location.href = `main.html?room=${currentRoom}`;
        });
    }
});