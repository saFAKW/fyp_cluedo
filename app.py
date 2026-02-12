from flask import Flask, render_template_string, request
from flask_socketio import SocketIO, join_room, emit
import random, string, os

# Import session manager
from session_manager import (
    create_session,
    get_session,
    update_session,
    session_exists,
    sessions
)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'cluedo_pro'
socketio = SocketIO(app)
rooms = {}

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
        });

        // Handle invalid session
        socket.on('session_invalid', function() {
            console.log('Session invalid, requesting new one');
            localStorage.removeItem('session_id');
            socket.emit('request_session');
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

def get_code(): 
    return ''.join(random.choices(string.ascii_uppercase, k=4))

@app.route('/')
def index(): 
    return render_template_string(html)

# request new session
@socketio.on('request_session')
def handle_request_session():
    """Create and send a new session to the client"""
    session_data = create_session()
    emit('session_created', {'session_id': session_data['session_id']})
    print(f"Session requested and created: {session_data['session_id']}")

# validate existing session
@socketio.on('validate_session')
def handle_validate_session(data):
    """Check if a session_id is still valid"""
    session_id = data.get('session_id')
    if session_exists(session_id):
        # Update last activity
        update_session(session_id, {'connected': True})
        emit('session_valid', {'session_id': session_id})
        print(f"Session validated: {session_id}")
    else:
        emit('session_invalid', {})
        print(f"Session invalid: {session_id}")

# create room with session
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
        'players': [{'session_id': session_id, 'name': user}]
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

# Join room with session
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
    
    if r in rooms:
        # Check if session already in room
        existing = [p for p in rooms[r]['players'] if p['session_id'] == session_id]
        if not existing:
            rooms[r]['players'].append({'session_id': session_id, 'name': user})
        
        # Update session with room info
        update_session(session_id, {
            'username': user,
            'room_code': r,
            'is_host': False
        })
        
        join_room(r)
        emit('ok', {'room': r})
        emit('msg', {'u': 'HQ', 'm': f"{user} connected."}, to=r)
        print(f"Joined {r} - session {session_id} (user: {user})")
        print(f"Room {r} now has {len(rooms[r]['players'])} players")
    else: 
        emit('err', "Invalid Code")
        print(f"Join failed: Room {r} does not exist")

# Handle disconnect
@socketio.on('disconnect')
def handle_disconnect():
    """Mark session as disconnected when user leaves"""
    print("Client disconnected")

# Debug endpoint to view sessions (remove in production)
@app.route('/debug/sessions')
def debug_sessions():
    """View all active sessions - FOR DEVELOPMENT ONLY"""
    return {
        'total_sessions': len(sessions),
        'sessions': sessions
    }

# Debug endpoint to view rooms (remove in production)
@app.route('/debug/rooms')
def debug_rooms():
    """View all active rooms - FOR DEVELOPMENT ONLY"""
    return {
        'total_rooms': len(rooms),
        'rooms': rooms
    }

if __name__ == '__main__':
    socketio.run(app, debug=True)