let selectedColor = null;

// Select character circle
document.querySelectorAll(".circle").forEach(circle => {
    circle.addEventListener("click", () => {
        document.querySelectorAll(".circle").forEach(c => c.classList.remove("selected"));
        circle.classList.add("selected");
        selectedColor = circle.dataset.color;
    });
});

// Validation on click
document.getElementById("joinBtn").addEventListener("click", () => {
    const name = document.getElementById("playerName").value.trim();

    if (!name && !selectedColor) {
        alert("Please enter a player name and pick a character.");
    } else if (!name) {
        alert("Please enter a player name.");
    } else if (!selectedColor) {
        alert("Please pick a character.");
    } else {
        alert(`Player Joined!\nName: ${name}\nCharacter: ${selectedColor}`);
    }
});