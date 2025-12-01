document.getElementById("makeGameBtn").addEventListener("click", function () {
    const players = document.getElementById("playersSelect").value;
    const clues = document.getElementById("clueSelect").value;
    const errorBox = document.getElementById("errorBox");

    // Validate selections
    if (!players || !clues) {
        errorBox.textContent = "Please select both the number of players and cluecards.";
        return;
    }

    // These can later be used by the backeend to set up the game
    localStorage.setItem("playerCount", players);
    localStorage.setItem("clueCount", clues);

    errorBox.textContent = "Game created! Redirecting…";
});
