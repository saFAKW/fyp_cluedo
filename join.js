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
            window.location.href = `/wait?room=${code}`;
        });
    }

    socket.on('error_msg', function (data) {
        alert(data.msg);
        inputs.forEach(input => input.value = '');
        inputs[0].focus();
    });
});

function joinGame(code) {
    fetch('/api/games/join', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code: code,
            sessionId: sessionId,
            displayName: ""
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                const inputs = document.querySelectorAll('.code-box');
                inputs.forEach(input => input.value = '');
                inputs[0].focus();
            } else if (data.success) {
                window.location.href = "/wait?room=" + data.room + "&role=player";
            }
        })
        .catch(error => {
            alert("Connection error.");
        });
}
