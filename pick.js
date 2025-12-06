document.addEventListener('DOMContentLoaded', () => {
    let selectedColor = null;
    let selectedName = null;

    const circles = document.querySelectorAll('.circle');
    const input = document.getElementById('playerName');
    const joinBtn = document.getElementById('joinBtn');
    const greeting = document.getElementById('greeting');

    // hide input and button until a circle is selected
    if (input) input.style.display = 'none';
    if (joinBtn) joinBtn.style.display = 'none';

    // Select / toggle character circle
    circles.forEach(circle => {
        circle.addEventListener('click', () => {
            const alreadySelected = circle.classList.contains('selected');
            // clear previous selection
            circles.forEach(c => c.classList.remove('selected'));

            if (!alreadySelected) {
                circle.classList.add('selected');
                selectedColor = circle.dataset.color || null;
                // determine display name from alt attribute or filename
                const alt = circle.getAttribute('alt');
                let nameToShow = alt && alt.trim() ? alt.trim() : null;
                if (!nameToShow) {
                    const src = circle.getAttribute('src') || '';
                    const parts = src.split('/');
                    const file = parts[parts.length - 1] || '';
                    nameToShow = file.replace(/\.[^.]+$/, '');
                }
                selectedName = nameToShow;
                if (greeting) { 
                    greeting.textContent = `Hello, ${selectedName} AKA.`; greeting.style.display = 'block'; 
                }
                if (input) {
                    input.style.display = 'block';
                }
                if (joinBtn) {
                    joinBtn.style.display = 'inline-block';
                }
            } else {
                // deselect
                selectedColor = null;
                selectedName = null;
                if (greeting) { 
                    greeting.textContent = ''; greeting.style.display = 'none'; 
                }
                if (input) { 
                    input.style.display = 'none'; input.value = ''; 
                }
                if (joinBtn) {
                    joinBtn.style.display = 'none';
                }
            }
        });
    });

    
    // Validation on click
    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            const name = (input ? input.value.trim() : '').trim();
            if (!name && !selectedColor) {
                alert('Please enter a player name and pick a character.');
            } else if (!name) {
                alert('Please enter a player name.');
            } else if (!selectedColor) {
                alert('Please pick a character.');
                } else {
                const displayName = selectedName || selectedColor || 'Unknown';
                alert(`Player Joined!\nName: ${name}\nCharacter: ${displayName}`);
                // emit player_join event to server with room info (read from query param)
                const params = new URLSearchParams(window.location.search);
                const room = params.get('room');
                if (typeof io !== 'undefined') {
                    const SERVER_URL = 'http://127.0.0.1:5000';
                    const socket = io(SERVER_URL);
                    socket.emit('player_join', { room: room, name: name, character: displayName });
                }

                // redirect to wait page (host game page) so host and players see the waiting lobby
                window.location.href = `wait.html?room=${room}`;
            }
        });
    }
});