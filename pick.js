const SERVER_URL = 'http://127.0.0.1:5000';
let socket;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof io !== 'undefined') {
        socket = io(SERVER_URL);
    }

    let selectedColor = null;
    let selectedName = null;

    const circles = document.querySelectorAll('.circle');
    const input = document.getElementById('playerName');
    const joinBtn = document.getElementById('joinBtn');
    const greeting = document.getElementById('greeting');

    if (input) input.style.display = 'none';
    if (joinBtn) joinBtn.style.display = 'none';
    if (greeting) greeting.style.display = 'none';

    circles.forEach((circle, idx) => {
        circle.addEventListener('click', (e) => {
            const alreadySelected = circle.classList.contains('selected');
            circles.forEach(c => c.classList.remove('selected'));

            if (!alreadySelected) {
                circle.classList.add('selected');
                selectedColor = circle.dataset.color || null;
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
                    greeting.textContent = `Hello, ${selectedName}`; 
                    greeting.style.display = 'block'; 
                }
                if (input) {
                    input.style.display = 'block';
                }
                if (joinBtn) {
                    joinBtn.style.display = 'inline-block';
                }
            } else {
                selectedColor = null;
                selectedName = null;
                if (greeting) { 
                    greeting.textContent = ''; 
                    greeting.style.display = 'none'; 
                }
                if (input) { 
                    input.style.display = 'none'; 
                    input.value = ''; 
                }
                if (joinBtn) {
                    joinBtn.style.display = 'none';
                }
            }
        });
    });

    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            const name = (input ? input.value.trim() : '').trim();
            const params = new URLSearchParams(window.location.search);
            const room = params.get('room');
            const role = params.get('role') || 'player';

            if (!name && !selectedColor) {
                alert('Please enter a player name and pick a character.');
            } else if (!name) {
                alert('Please enter a player name.');
            } else if (!selectedColor) {
                alert('Please pick a character.');
            } else {
                const displayName = selectedName || selectedColor || 'Unknown';
                
                if (socket) {
                    socket.emit('player_join', { 
                        room: room, 
                        name: name, 
                        character: displayName 
                    });
                }

                window.location.href = `wait.html?room=${room}&role=${role}`;
            }
        });
    }
});
