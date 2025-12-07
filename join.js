const socket = io();
const inputs = document.querySelectorAll('.code-box');

inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
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

document.getElementById("joinGameBtn").addEventListener("click", function () {
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

socket.on('join_success', function(data) {
    window.location.href = "/game?room=" + data.room;
});

socket.on('error_msg', function(data) {
    alert(data.msg);
    inputs.forEach(input => input.value = '');
    inputs[0].focus();
});
