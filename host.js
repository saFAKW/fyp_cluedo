const SERVER_URL = window.location.origin;
let socket = io(SERVER_URL);
let sessionId = null;

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

socket.on('session_created', function (data) {
    sessionId = data.session_id;
    localStorage.setItem('session_id', sessionId);
});

socket.on('session_valid', function (data) {
    sessionId = data.session_id;
});

socket.on('session_invalid', function () {
    localStorage.removeItem('session_id');
    socket.emit('request_session');
});

socket.on('connect', () => {
});

socket.on('connect_error', (error) => {
    const errorBox = document.getElementById("errorBox");
    if (errorBox) errorBox.textContent = "Cannot connect to server.";
});

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

            if (!sessionId) {
                errorBox.textContent = "Initializing... please wait";
                errorBox.style.color = "orange";

                setTimeout(() => {
                    if (sessionId) {
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
    window.location.href = "/wait?room=" + data.room + "&role=host";
});

socket.on('error_msg', function (data) {
    const errorBox = document.getElementById("errorBox");
    if (errorBox) {
        errorBox.textContent = data.msg;
        errorBox.style.color = "red";
    } else {
        alert(data.msg);
    }
});
