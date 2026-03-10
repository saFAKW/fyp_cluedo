
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

// All DOM manipulation code inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.code-box');

    inputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (input.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value === '' && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

    const joinBtn = document.getElementById("joinGameBtn");
    if (joinBtn) {
        joinBtn.addEventListener("click", (e) => {
            e.preventDefault();
            let code = "";
            inputs.forEach(input => {
                code += input.value;
            });

            if (code.length < 6) {
                alert("Please enter the full 6-digit code.");
                return;
            }

            // If no session yet, wait and retry
            if (!sessionId) {
                alert("Initializing session... please try again in 1 second.");

                // Wait for session
                setTimeout(() => {
                    if (sessionId) {
                        joinGame(code);
                    } else {
                        alert("Session error. Please refresh the page.");
                    }
                }, 1000);
                return;
            }

            joinGame(code);
        });
    }

    socket.on('join_success', function (data) {
        window.location.href = "/game?room=" + data.room;
    });

    socket.on('error_msg', function (data) {
        alert(data.msg);
        inputs.forEach(input => input.value = '');
        inputs[0].focus();
    });
});

function joinGame(code) {
    socket.emit('join_game', {
        code: code,
        session_id: sessionId
    });
}