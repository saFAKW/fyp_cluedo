const boxes = document.querySelectorAll(".code-box");

boxes.forEach((box, index) => {
    box.addEventListener("input", () => {
        // Move to next box if current one is filled
        if (box.value && index < boxes.length - 1) {
            boxes[index + 1].focus();
        }
    });
});

document.getElementById("joinGameBtn").addEventListener("click", () => {
    let code = "";
    boxes.forEach(b => code += b.value);

    // Simple validation to ensure all boxes are filled
    if (code.length < 6) {
        alert("Please enter a full 6-digit code.");
        return;
    }

    alert("Joining game with code: " + code);
});
