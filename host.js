const SERVER_URL = 'http://127.0.0.1:5000';
let socket = io(SERVER_URL);
let sessionId = null;

// Check for existing session on page load
window.addEventListener('DOMContentLoaded', function () {
    checkSession();
});

function checkSession() {
    // Try to get session from localStorage
    const storedSession = localStorage.getItem('session_id');

    if (storedSession) {
        // Validate with server
        socket.emit('validate_session', { session_id: storedSession });
    } else {
        // Request new session
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

// include session_id in create_game
document.addEventListener('DOMContentLoaded', () => {
    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
        const errorBox = document.getElementById("errorBox");
        if (errorBox) errorBox.textContent = "Cannot connect to server.";
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

            if (!sessionId) {
                errorBox.textContent = "Session not ready. Please wait...";
                return;
            }

            socket.emit('create_game', {
                players: players,
                clues: clues,
                session_id: sessionId  // Include session
            });
            errorBox.textContent = "Creating game...";
            errorBox.style.color = "blue";
        });
    }  // ← THIS CLOSING BRACE WAS MISSING!

    socket.on('game_created', function (data) {
        window.location.href = "/game?room=" + data.room;
    });
}); 