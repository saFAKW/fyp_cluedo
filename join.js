const SERVER_URL = 'http://127.0.0.1:5000';
let socket = io(SERVER_URL);

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

            socket.emit('join_game', { code: code });
        });
    }

    socket.on('join_success', function(data) {
        window.location.href = `pick.html?room=${data.room}&role=player`;
    });

    socket.on('error_msg', function(data) {
        alert(data.msg);
        inputs.forEach(input => input.value = '');
        inputs[0].focus();
    });
});
