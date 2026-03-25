console.log('wait.js loaded!'); // Debug

const SERVER_URL = window.location.origin;
let socket = io(SERVER_URL);
let sessionId = null;
let roomCode = null;
let isHost = false;

// Get session on page load
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded'); // Debug

    // Get room code and role from URL
    const params = new URLSearchParams(window.location.search);
    roomCode = params.get('room');
    const role = params.get('role');
    isHost = (role === 'host');

    console.log('Room code:', roomCode, 'Is host:', isHost); // Debug

    // Display room code in both places
    const roomDisplay = document.getElementById('roomCodeDisplay');
    const roomPreview = document.getElementById('roomCodePreview');
    if (roomDisplay) roomDisplay.textContent = roomCode || 'Loading...';
    if (roomPreview) roomPreview.textContent = roomCode || 'Loading...';

    const waitTitle = document.getElementById('waitPageTitle');
    if (waitTitle) waitTitle.textContent = isHost ? 'Host Game' : 'Lobby';

    const storedSession = localStorage.getItem('session_id');
    console.log('Stored session:', storedSession); // Debug

    if (storedSession) {
        sessionId = storedSession;
        socket.emit('validate_session', { session_id: storedSession });
    } else {
        socket.emit('request_session');
    }

    // Joiners need the name step; sessionId is set above when reusing localStorage
    if (!isHost) {
        showUsernamePrompt();
    } else {
        showWaitingRoom();
    }
});

// Handle session events
socket.on('session_created', function (data) {
    console.log('Session created event received:', data); // Debug
    sessionId = data.session_id;
    localStorage.setItem('session_id', sessionId);

    if (!isHost) {
        console.log('Showing username prompt (new session)'); // Debug
        showUsernamePrompt();
    } else {
        showWaitingRoom();
        joinSocketRoom();
    }
});

socket.on('session_valid', function (data) {
    console.log('Session valid event received:', data); // Debug
    sessionId = data.session_id;

    // Check if this session is already in this specific room
    if (data.room_code === roomCode) {
        console.log('Already in this room, showing waiting room'); // Debug
        showWaitingRoom();
        joinSocketRoom();
    } else {
        // Different room or no room - show username prompt
        console.log('Not in this room, showing username prompt'); // Debug
        showUsernamePrompt();
    }
});

socket.on('session_invalid', function () {
    console.log('Session invalid, requesting new one'); // Debug
    localStorage.removeItem('session_id');
    socket.emit('request_session');
});

// Show username entry screen
function showUsernamePrompt() {
    console.log('showUsernamePrompt called'); // Debug

    const promptDiv = document.getElementById('usernamePrompt');
    const waitingDiv = document.getElementById('waitingRoom');

    console.log('promptDiv:', promptDiv); // Debug
    console.log('waitingDiv:', waitingDiv); // Debug

    if (promptDiv) {
        promptDiv.style.display = 'flex';
        console.log('Username prompt shown'); // Debug
    } else {
        console.error('usernamePrompt element not found!'); // Debug
    }

    if (waitingDiv) {
        waitingDiv.style.display = 'none';
    }

    // Set up join button
    const joinBtn = document.getElementById('joinWithNameBtn');
    if (joinBtn) {
        // Remove old listeners by cloning
        const newJoinBtn = joinBtn.cloneNode(true);
        joinBtn.parentNode.replaceChild(newJoinBtn, joinBtn);
        newJoinBtn.onclick = joinWithUsername;
    }

    // Enter key to submit
    const nameInput = document.getElementById('usernameInput');
    if (nameInput) {
        // Remove old listeners
        const newNameInput = nameInput.cloneNode(true);
        nameInput.parentNode.replaceChild(newNameInput, nameInput);

        newNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                joinWithUsername();
            }
        });
        newNameInput.focus();
    }

    const joinBtnEl = document.getElementById('joinWithNameBtn');
    if (joinBtnEl) {
        joinBtnEl.disabled = !sessionId;
    }
}

// Join game with username
function joinWithUsername() {
    console.log('joinWithUsername called'); // Debug

    const nameInput = document.getElementById('usernameInput');
    const errorDiv = document.getElementById('usernameError');
    const username = nameInput ? nameInput.value.trim() : '';

    console.log('Username entered:', username); // Debug

    // Clear previous error
    if (errorDiv) errorDiv.textContent = '';

    // Validate username
    if (!username) {
        if (errorDiv) errorDiv.textContent = 'Please enter your detective name';
        return;
    }

    if (username.length < 2) {
        if (errorDiv) errorDiv.textContent = 'Name must be at least 2 characters';
        return;
    }

    if (username.length > 20) {
        if (errorDiv) errorDiv.textContent = 'Name must be less than 20 characters';
        return;
    }

    // Disable button while processing
    const joinBtn = document.getElementById('joinWithNameBtn');
    if (joinBtn) {
        joinBtn.disabled = true;
        joinBtn.textContent = 'Joining...';
    }

    console.log('Calling API to join...'); // Debug

    // Call API to join
    fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code: roomCode,
            sessionId: sessionId,
            displayName: username
        })
    })
        .then(res => res.json())
        .then(data => {
            console.log('API response:', data); // Debug

            if (data.success) {
                console.log('Joined successfully as', username);
                showWaitingRoom();
                joinSocketRoom();
            } else {
                // Show error
                if (errorDiv) {
                    errorDiv.textContent = data.error || 'Failed to join';
                }
                // Re-enable button
                if (joinBtn) {
                    joinBtn.disabled = false;
                    joinBtn.textContent = 'Join Game';
                }
            }
        })
        .catch(err => {
            console.error('Join error:', err);
            if (errorDiv) {
                errorDiv.textContent = 'Connection error. Please try again.';
            }
            // Re-enable button
            if (joinBtn) {
                joinBtn.disabled = false;
                joinBtn.textContent = 'Join Game';
            }
        });
}

// Show waiting room screen
function showWaitingRoom() {
    console.log('showWaitingRoom called'); // Debug

    const promptDiv = document.getElementById('usernamePrompt');
    const waitingDiv = document.getElementById('waitingRoom');

    if (promptDiv) {
        promptDiv.style.display = 'none';
    }

    if (waitingDiv) {
        waitingDiv.style.display = 'inline-block';
        console.log('Waiting room shown'); // Debug
    } else {
        console.error('waitingRoom element not found!'); // Debug
    }

    // Update room code display in waiting room
    const roomDisplay = document.getElementById('roomCodeDisplay');
    if (roomDisplay && roomCode) {
        roomDisplay.textContent = roomCode;
    }
}

// Join socket room for real-time updates
function joinSocketRoom() {
    console.log('joinSocketRoom called'); // Debug
    socket.emit('join_waiting_room', { room: roomCode });

    // Show start button if host
    const startBtn = document.getElementById('startGameBtn');
    if (startBtn && isHost) {
        startBtn.style.display = 'block';
        startBtn.onclick = () => {
            socket.emit('start_game_request', { room: roomCode, session_id: sessionId });
        };
    }
}

// Listen for player updates
socket.on('player_joined', (data) => {
    console.log('player_joined event:', data); // debugging
    const list = document.getElementById('playerList');
    if (list) {
        list.innerHTML = '';
        if (data.players.length === 0) {
            list.innerHTML = '<div class="waiting-text">Waiting for players to join...</div>';
        } else {
            data.players.forEach(player => {
                const li = document.createElement('li');
                li.textContent = `${player.name} (${player.character})`;
                list.appendChild(li);
            });
        }
    }
});

// Listen for game start
socket.on('game_starting', () => {
    console.log('Game starting, redirecting...'); // debugging
    window.location.href = `/game?room=${roomCode}`;
});

// Listen for errors
socket.on('error_msg', function (data) {
    console.log('Error message:', data.msg); // debuggin
    alert(data.msg);
});