const socket = io();
const boxes = document.querySelectorAll(".code-box");

boxes.forEach((box, index) => {
    box.addEventListener("input", () => {
        if (box.value && index < boxes.length - 1) {
            boxes[index + 1].focus();
        }
    });
});

document.getElementById("joinGameBtn").addEventListener("click", () => {
    let code = "";
    boxes.forEach(b => code += b.value);

    if (code.length < 6) {
        alert("Please enter a full 6-digit code.");
        return;
    }

    socket.emit('join_game', { code: code });
});

socket.on('join_success', function(data) {
    alert("Success! You joined room: " + data.room);
    // navigate to pick page after successful join
    window.location.href = 'pick.html';
});

socket.on('error_msg', function(data) {
    alert("Error: " + data.msg);
});

