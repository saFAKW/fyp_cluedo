from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, emit
import random, string, os

# Import session manager
from session_manager import (
    create_session,
    get_session,
    update_session,
    session_exists,
    sessions,
    is_username_taken_in_room,
    get_sessions_in_room
)

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__, 
            template_folder=basedir,
            static_folder=basedir,
            static_url_path='')
app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app, cors_allowed_origins="*")

rooms = {}

@app.route('/')
def index():
    return render_template('menu.html')

@app.route('/host')
def host_page():
    return render_template('host.html')

@app.route('/join')
def join_page():
    return render_template('join.html')

@app.route('/game')
def game_page():
    room_code = request.args.get('room')
    return render_template('main.html', room_code=room_code)

# PROTOTYPE ROUTE - Keep your prototype separate
@app.route('/prototype')
def prototype_index(): 
    return render_template_string(html)

def generate_code():
    return ''.join(random.choices(string.digits, k=6))

def get_code(): 
    return ''.join(random.choices(string.ascii_uppercase, k=4))

# SESSION MANAGEMENT HANDLERS

@socketio.on('request_session')
def handle_request_session():
    """Create and send a new session to the client"""
    session_data = create_session()
    emit('session_created', {'session_id': session_data['session_id']})
    print(f"Session requested and created: {session_data['session_id']}")

@socketio.on('validate_session')
def handle_validate_session(data):
    """Check if a session_id is still valid"""
    session_id = data.get('session_id')
    if session_exists(session_id):
        session = get_session(session_id)
        # Update last activity
        update_session(session_id, {'connected': True})
        
        # Check if session has an active room
        should_reconnect = session.get('room_code') is not None
        room_code = session.get('room_code')
        
        # Verify room still exists
        if should_reconnect and room_code not in rooms:
            should_reconnect = False
            update_session(session_id, {'room_code': None, 'is_host': False})
        
        emit('session_valid', {
            'session_id': session_id,
            'should_reconnect': should_reconnect,
            'room_code': room_code
        })
        print(f"Session validated: {session_id} (reconnect: {should_reconnect})")
    else:
        emit('session_invalid', {})
        print(f"Session invalid: {session_id}")

@socketio.on('reconnect_to_game')
def handle_reconnect(data):
    """Reconnect a player to their active game"""
    session_id = data.get('session_id')
    
    if not session_exists(session_id):
        emit('err', 'Invalid session')
        return
    
    session = get_session(session_id)
    room_code = session.get('room_code')
    username = session.get('username')
    
    # Verify room exists
    if not room_code or room_code not in rooms:
        emit('err', 'Game no longer exists')
        update_session(session_id, {'room_code': None, 'is_host': False})
        return
    
    # Rejoin the socket room
    join_room(room_code)
    
    # Get message history (if you're storing it)
    message_history = rooms[room_code].get('message_history', [])
    
    # Notify others in the room
    emit('msg', {'u': 'HQ', 'm': f"{username} reconnected."}, to=room_code, include_self=False)
    
    # Send reconnection success with game state
    emit('reconnected', {
        'room': room_code,
        'username': username,
        'is_host': session.get('is_host', False),
        'message_history': message_history
    })
    
    print(f"Session {session_id} ({username}) reconnected to room {room_code}")

# GAME HANDLERS

@socketio.on('create_game')
def handle_create(data):
    session_id = data.get('session_id')
    
    # Validate session exists
    if not session_exists(session_id):
        emit('error_msg', {'msg': 'Invalid session. Please refresh the page.'})
        print(f"Create game failed: Invalid session {session_id}")
        return
    
    room = generate_code()
    rooms[room] = {
        'meta': {
            'players': data.get('players'),
            'clues': data.get('clues')
        },
        'host_session': session_id,
        'players': [],
        'message_history': []
    }
    
    # Update session with room info
    update_session(session_id, {
        'room_code': room,
        'is_host': True
    })
    
    join_room(room)
    print(f"Room {room} created by session {session_id}. Max players: {data.get('players')}")
    emit('game_created', {'room': room})

@socketio.on('join_game')
def handle_join(data):
    session_id = data.get('session_id')
    room = data.get('code')
    
    # Validate session exists
    if not session_exists(session_id):
        emit('error_msg', {'msg': 'Invalid session. Please refresh the page.'})
        print(f"Join game failed: Invalid session {session_id}")
        return
    
    if room in rooms:
        current_count = len(rooms[room]['players'])
        max_players = int(rooms[room]['meta']['players'])
        
        if current_count >= max_players:
            emit('error_msg', {'msg': "The room is full."})
        else:
            # Update session with room info
            update_session(session_id, {
                'room_code': room,
                'is_host': False
            })
            emit('join_success', {'room': room})
    else:
        emit('error_msg', {'msg': "Invalid Room Code"})

@socketio.on('player_join')
def handle_player_join(data):
    room = data.get('room')
    name = data.get('name')
    character = data.get('character')
    session_id = data.get('session_id')
    
    if not room or room not in rooms:
        emit('error_msg', {'msg': 'Invalid Room Code'})
        return
    
    # Validate username uniqueness
    if is_username_taken_in_room(name, room, exclude_session_id=session_id):
        emit('error_msg', {'msg': f"Name '{name}' is already taken in this room."})
        print(f"Player join failed: Username '{name}' already taken in room {room}")
        return

    join_room(room)
    player = {'name': name, 'character': character, 'session_id': session_id}
    
    exists = False
    for p in rooms[room]['players']:
        if p.get('session_id') == session_id:
            exists = True
            # Update player info if reconnecting
            p['name'] = name
            p['character'] = character
            break
            
    if not exists:
        current_count = len(rooms[room]['players'])
        max_players = int(rooms[room]['meta']['players'])
        
        if current_count >= max_players:
            emit('error_msg', {'msg': 'The room is full.'})
            return

        rooms[room]['players'].append(player)
    
    # Update session
    update_session(session_id, {
        'username': name,
        'room_code': room
    })
    
    emit('player_join_confirmed', {'room': room})
    
    socketio.emit('player_joined', {
        'player': player, 
        'players': rooms[room]['players']
    }, room=room)
    
    print(f"Player {name} joined room {room}")

@socketio.on('join_waiting_room')
def handle_join_waiting(data):
    room = data.get('room')
    if room in rooms:
        join_room(room)
        emit('player_joined', {'players': rooms[room]['players']}, room=room)

@socketio.on('start_game_request')
def handle_start(data):
    room = data.get('room')
    socketio.emit('game_starting', room=room)

# PROTOTYPE HANDLERS (for /prototype route)

@socketio.on('create')
def c(d):
    session_id = d.get('session_id')
    user = d['name']
    
    # Validate session exists
    if not session_exists(session_id):
        emit('err', 'Invalid session. Please refresh the page.')
        print(f"Create room failed: Invalid session {session_id}")
        return
    
    r = get_code()
    rooms[r] = {
        'host_session': session_id,
        'players': [{'session_id': session_id, 'name': user}],
        'message_history': []
    }
    
    # Update session with room info
    update_session(session_id, {
        'username': user,
        'room_code': r,
        'is_host': True
    })
    
    join_room(r)
    emit('ok', {'room': r})
    print(f"Created {r} by session {session_id} (user: {user})")

@socketio.on('join')
def j(d):
    session_id = d.get('session_id')
    r = d['code'].upper()
    user = d['name']
    
    # Validate session exists
    if not session_exists(session_id):
        emit('err', 'Invalid session. Please refresh the page.')
        print(f"Join room failed: Invalid session {session_id}")
        return
    
    # Check if room exists
    if r not in rooms:
        emit('err', "Invalid Code")
        print(f"Join failed: Room {r} does not exist")
        return
    
    # Check if username is already taken in this room
    if is_username_taken_in_room(user, r, exclude_session_id=session_id):
        emit('err', f"Name '{user}' is already taken in this room. Please choose another.")
        print(f"Join failed: Username '{user}' already taken in room {r}")
        return
    
    # Check if session already in room (reconnection case)
    existing = [p for p in rooms[r]['players'] if p['session_id'] == session_id]
    if not existing:
        rooms[r]['players'].append({'session_id': session_id, 'name': user})
    else:
        # Update name in case it changed
        existing[0]['name'] = user
    
    # Update session with room info
    update_session(session_id, {
        'username': user,
        'room_code': r,
        'is_host': False
    })
    
    join_room(r)
    emit('ok', {'room': r})
    
    # Store and broadcast join message
    join_msg = {'u': 'HQ', 'm': f"{user} connected."}
    rooms[r]['message_history'].append(join_msg)
    emit('msg', join_msg, to=r)
    
    print(f"Joined {r} - session {session_id} (user: {user})")
    print(f"Room {r} now has {len(rooms[r]['players'])} players")

# DISCONNECT HANDLER

@socketio.on('disconnect')
def handle_disconnect():
    """Mark session as disconnected when user leaves"""
    print("Client disconnected")

# DEBUG ENDPOINTS (REMOVE IN PRODUCTION)

@app.route('/debug/sessions')
def debug_sessions():
    """View all active sessions - FOR DEVELOPMENT ONLY"""
    return {
        'total_sessions': len(sessions),
        'sessions': sessions
    }

@app.route('/debug/rooms')
def debug_rooms():
    """View all active rooms - FOR DEVELOPMENT ONLY"""
    return {
        'total_rooms': len(rooms),
        'rooms': rooms
    }

# HTML for prototype route
html = """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Cluedo Investigation</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.1/socket.io.js"></script>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Lato', sans-serif; }
    body { height: 100vh; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, #1a2a6c, #b21f1f, #fdbb2d); color: #fff; overflow: hidden; }
    @keyframes fade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    
    .card {
        width: 420px; padding: 40px; text-align: center; border-radius: 15px; 
        background: rgba(0,0,0,0.65); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.15);
        box-shadow: 0 30px 60px rgba(0,0,0,0.6); animation: fade 0.8s ease-out;
    }
    h1 { font-family: 'Cinzel'; color: #d4af37; font-size: 2.5em; text-shadow: 0 2px 10px rgba(0,0,0,0.5); margin-bottom: 5px; text-transform: uppercase; }
    p { color: #bbb; margin-bottom: 25px; font-weight: 300; }
    
    input { width: 100%; padding: 12px; margin-bottom: 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 6px; outline: none; transition: 0.3s; }
    input:focus { border-color: #d4af37; box-shadow: 0 0 10px rgba(212,175,55,0.3); }
    
    button { width: 100%; padding: 12px; cursor: pointer; border-radius: 6px; font-family: 'Cinzel'; font-weight: bold; font-size: 1rem; border: none; transition: 0.3s; margin-top: 5px;}
    .gold { background: linear-gradient(90deg, #d4af37, #c5a028); color: #000; box-shadow: 0 5px 15px rgba(212,175,55,0.3); }
    .gold:hover { transform: scale(1.02); box-shadow: 0 10px 25px rgba(212,175,55,0.5); }
    .ghost { background: transparent; border: 1px solid rgba(255,255,255,0.3); color: #ccc; }
    .ghost:hover { border-color: #fff; color: #fff; background: rgba(255,255,255,0.05); }

    .hide { display: none; }
    .code { font-family: 'Cinzel'; font-size: 3em; color: #d4af37; letter-spacing: 5px; margin: 15px 0; border: 2px dashed rgba(212,175,55,0.3); padding: 10px; }
    .log { height: 160px; overflow-y: auto; text-align: left; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; font-size: 0.9em; }
    .log div { border-bottom: 1px solid rgba(255,255,255,0.05); padding: 4px 0; }
    .err { color: #ff6b6b; height: 20px; font-size: 0.85em; margin-top: 10px; }
</style>
</head>
<body>
    <div id="login" class="card">
        <h1>Cluedo</h1>
        <p>Identity Verification Required</p >
        <input id="u" type="text" placeholder="Detective Name" autocomplete="off">
        <button class="gold" onclick="act('create')">Create Room with this Name</button>
        <p style="margin: 15px 0 5px; font-size: 0.8em; opacity: 0.6">- OR -</p >
        <input id="c" type="text" placeholder="Case Code (ABCD)" style="text-transform:uppercase; text-align:center; letter-spacing:2px">
        <button class="ghost" onclick="act('join')">Join Investigation</button>
        <div id="err" class="err"></div>
    </div>

    <div id="game" class="card hide">
        <h1>Case File</h1>
        <p>Agent: <b id="me" style="color:#d4af37"></b></p >
        <div id="rcode" class="code"></div>
        <div id="msgs" class="log"><div><i>Secure channel established...</i></div></div>
    </div>

    <script>
        const socket = io();
        let user;
        let sessionId = null;
        let currentRoom = null;
        const $ = id => document.getElementById(id);

        // Check for existing session on page load
        window.addEventListener('DOMContentLoaded', function() {
            checkSession();
        });

        function checkSession() {
            // Try to get session from localStorage
            const storedSession = localStorage.getItem('session_id');
            
            if (storedSession) {
                // Validate with server
                socket.emit('validate_session', { session_id: storedSession });
            } else {
                // Request new session
                socket.emit('request_session');
            }
        }

        // Handle new session creation
        socket.on('session_created', function(data) {
            sessionId = data.session_id;
            localStorage.setItem('session_id', sessionId);
            console.log('New session created:', sessionId);
        });

        // Handle session validation response
        socket.on('session_valid', function(data) {
            sessionId = data.session_id;
            console.log('Session validated:', sessionId);
            
            // Check if we should reconnect to a game
            if (data.should_reconnect && data.room_code) {
                console.log('Reconnecting to room:', data.room_code);
                socket.emit('reconnect_to_game', { session_id: sessionId });
            }
        });

        // Handle invalid session
        socket.on('session_invalid', function() {
            console.log('Session invalid, requesting new one');
            localStorage.removeItem('session_id');
            socket.emit('request_session');
        });

        // Handle reconnection success
        socket.on('reconnected', function(data) {
            currentRoom = data.room;
            user = data.username;
            
            $('login').classList.add('hide');
            $('game').classList.remove('hide');
            $('rcode').innerText = data.room;
            $('me').innerText = user;
            
            // Restore message history if provided
            if (data.message_history && data.message_history.length > 0) {
                let b = $('msgs');
                b.innerHTML = '<div><i>Reconnected to investigation...</i></div>';
                data.message_history.forEach(msg => {
                    b.innerHTML += `<div><b style="color:#d4af37">${msg.u}</b>: ${msg.m}</div>`;
                });
                b.scrollTop = b.scrollHeight;
            }
            
            console.log('Successfully reconnected to game');
        });

        function act(type) {
            user = $('u').value;
            let code = $('c').value;
            
            if(!user) return $('err').innerText = "Name is required.";
            if(type == 'join' && !code) return $('err').innerText = "Code is required.";
            
            if(!sessionId) {
                $('err').innerText = "Session not ready. Please wait...";
                return;
            }
            
            // Include session_id in the emit
            socket.emit(type, {
                name: user, 
                code: code,
                session_id: sessionId
            });
        }

        socket.on('ok', data => {
            currentRoom = data.room;
            $('login').classList.add('hide');
            $('game').classList.remove('hide');
            $('rcode').innerText = data.room;
            $('me').innerText = user;
        });

        socket.on('msg', d => {
            let b = $('msgs');
            b.innerHTML += `<div><b style="color:#d4af37">${d.u}</b>: ${d.m}</div>`;
            b.scrollTop = b.scrollHeight;
        });
        
        socket.on('err', m => $('err').innerText = m);
    </script>
</body>
</html>
"""

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)