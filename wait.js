const SERVER_URL = window.location.origin;
let socket = io(SERVER_URL);
let sessionId = localStorage.getItem('session_id');

if (sessionId) {
    socket.emit('validate_session', { session_id: sessionId });
}

document.addEventListener('DOMContentLoaded', () => {

    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    const role = params.get('role');

    const roomDisplay = document.getElementById('roomCodeDisplay');
    if (roomDisplay) {
        roomDisplay.textContent = room;
    }

    socket.emit('join_waiting_room', { room: room });

    socket.on('player_joined', (data) => {
        const list = document.getElementById('playerList');

        if (list) {
            list.innerHTML = '';
            if (data.players.length === 0) {
                list.innerHTML = '<div class="waiting-text">Waiting for players to join...</div>';
            } else {
                data.players.forEach(player => {
                    const li = document.createElement('li');
                    li.textContent = `${player.name} (${player.character})`;
                    list.appendChild(li);
                });
            }
        }
    });

    const startBtn = document.getElementById('startGameBtn');
    if (startBtn && role === 'host') {
        startBtn.style.display = 'inline-block';
        startBtn.addEventListener('click', () => {
            socket.emit('start_game_request', { room: room, session_id: sessionId });
        });
    }

    socket.on('game_starting', () => {
        window.location.href = `/game?room=${room}`;
    });
    
    socket.on('error_msg', function(data) {
        alert(data.msg);
    });
});
