const socket = io();
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
document.getElementById("makeGameBtn").addEventListener("click", function () {
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

socket.on('game_created', function (data) {
    window.location.href = "/game?room=" + data.room;
});