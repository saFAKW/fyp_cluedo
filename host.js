const SERVER_URL = window.location.origin;
let socket = io(SERVER_URL);
let sessionId = null;

// Check for existing session on page load
window.addEventListener('DOMContentLoaded', function () {
    checkSession();
});

function checkSession() {
    const storedSession = localStorage.getItem('session_id');

    if (storedSession) {
        socket.emit('validate_session', { session_id: storedSession });
    } else {
        socket.emit('request_session');
    }
}

// Handle new session creation
socket.on('session_created', function (data) {
    sessionId = data.session_id;
    localStorage.setItem('session_id', sessionId);
    console.log('New session created:', sessionId);
});

// Handle session validation response
socket.on('session_valid', function (data) {
    sessionId = data.session_id;
    console.log('Session validated:', sessionId);
});

// Handle invalid session
socket.on('session_invalid', function () {
    console.log('Session invalid, requesting new one');
    localStorage.removeItem('session_id');
    socket.emit('request_session');
});

// Connection handlers
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('connect_error', (error) => {
    const errorBox = document.getElementById("errorBox");
    if (errorBox) errorBox.textContent = "Cannot connect to server.";
});

// Make Game button handler
document.addEventListener('DOMContentLoaded', () => {
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

            // If no session yet, wait a moment and retry
            if (!sessionId) {
                errorBox.textContent = "Initializing... please wait";
                errorBox.style.color = "orange";

                // Wait 500ms for session to arrive, then retry
                setTimeout(() => {
                    if (sessionId) {
                        // Session arrived, proceed
                        createGame(players, clues, errorBox);
                    } else {
                        errorBox.textContent = "Session error. Please refresh the page.";
                        errorBox.style.color = "red";
                    }
                }, 500);
                return;
            }

            createGame(players, clues, errorBox);
        });
    }
});

function createGame(players, clues, errorBox) {
    socket.emit('create_game', {
        players: players,
        clues: clues,
        session_id: sessionId
    });
    errorBox.textContent = "Creating game...";
    errorBox.style.color = "blue";
}

socket.on('game_created', function (data) {
    window.location.href = "/game?room=" + data.room;
});