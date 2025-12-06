const SERVER_URL = 'http://127.0.0.1:5000';
let socket;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    
    // Connect to socket only if io is available
    if (typeof io !== 'undefined') {
        socket = io(SERVER_URL);
        console.log('Socket.IO connected');
    } else {
        console.error('Socket.IO not loaded!');
    }

    let selectedColor = null;
    let selectedName = null;

    const circles = document.querySelectorAll('.circle');
    const input = document.getElementById('playerName');
    const joinBtn = document.getElementById('joinBtn');
    const greeting = document.getElementById('greeting');

    console.log('Found circles:', circles.length);

    if (input) input.style.display = 'none';
    if (joinBtn) joinBtn.style.display = 'none';
    if (greeting) greeting.style.display = 'none';

    circles.forEach((circle, idx) => {
        circle.addEventListener('click', (e) => {
            console.log('Circle clicked!', circle.alt);
            
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
                
                console.log('Selected:', selectedName, selectedColor);
                
                if (greeting) { 
                    greeting.textContent = `Hello, ${selectedName} AKA.`; 
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
            if (!name && !selectedColor) {
                alert('Please enter a player name and pick a character.');
            } else if (!name) {
                alert('Please enter a player name.');
            } else if (!selectedColor) {
                alert('Please pick a character.');
            } else {
                const displayName = selectedName || selectedColor || 'Unknown';
                const params = new URLSearchParams(window.location.search);
                const room = params.get('room');
                
                console.log('Joining room:', room, 'as', name, displayName);
                
                // Emit to server only if socket is connected
                if (socket) {
                    socket.emit('player_join', { 
                        room: room, 
                        name: name, 
                        character: displayName 
                    });
                }

                // Navigate to wait page
                window.location.href = `wait.html?room=${room}`;
            }
        });
    }
});