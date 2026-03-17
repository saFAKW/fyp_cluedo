from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, join_room, emit
import random, string, os

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
sid_to_session = {}

AVAILABLE_CHARACTERS = [
    "Miss Scarlet", "Colonel Mustard", "Reverend Green", 
    "Mrs. Peacock", "Professor Plum", "Dr. Orchid"
]

START_POSITIONS = {
    "Miss Scarlet": (8, 0),
    "Colonel Mustard": (18, 0),
    "Mrs. Peacock": (8, 24),
    "Reverend Green": (18, 24),
    "Dr. Orchid": (24, 8),
    "Professor Plum": (24, 17)
}

@app.route('/')
def index():
    return render_template('menu.html')

@app.route('/host')
def host_page():
    return render_template('host.html')

@app.route('/join')
def join_page():
    return render_template('join.html')

@app.route('/wait')
def wait_page():
    return render_template('wait.html')

@app.route('/game')
def game_page():
    return render_template('main.html')

def generate_code():
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if code not in rooms:
            return code

@app.route('/api/games/join', methods=['POST'])
def api_join_game():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400
    
    room = data.get('code')
    session_id = data.get('sessionId')
    name = data.get('displayName')
    
    if not session_exists(session_id):
        return jsonify({"error": "Invalid session"}), 401
        
    if room not in rooms:
        return jsonify({"error": "Invalid Room Code"}), 404
        
    exists = next((p for p in rooms[room]['players'] if p.get('session_id') == session_id), None)
    if exists:
        update_session(session_id, {'room_code': room})
        is_host = get_session(session_id).get('is_host', False)
        return jsonify({"success": True, "room": room, "character": exists['character'], "is_host": is_host}), 200

    if rooms[room].get('is_locked'):
        return jsonify({"error": "Game already started"}), 403
        
    max_players = int(rooms[room]['meta']['players'])
    if len(rooms[room]['players']) >= max_players:
        return jsonify({"error": "The room is full"}), 403
        
    used_chars = [p.get('character') for p in rooms[room]['players']]
    assigned_character = next((c for c in AVAILABLE_CHARACTERS if c not in used_chars), None)
    
    if not assigned_character:
        return jsonify({"error": "No characters available"}), 403

    player_name = name if name else assigned_character
    
    player_data = {'name': player_name, 'character': assigned_character, 'session_id': session_id}
    rooms[room]['players'].append(player_data)
    
    update_session(session_id, {
        'username': player_name,
        'room_code': room,
        'is_host': False
    })
    
    socketio.emit('player_joined', {'players': rooms[room]['players']}, room=room)
    
    return jsonify({"success": True, "room": room, "character": assigned_character, "is_host": False}), 200

@socketio.on('request_session')
def handle_request_session():
    session_data = create_session()
    emit('session_created', {'session_id': session_data['session_id']})

@socketio.on('validate_session')
def handle_validate_session(data):
    session_id = data.get('session_id')
    if session_exists(session_id):
        session = get_session(session_id)
        update_session(session_id, {'connected': True})
        sid_to_session[request.sid] = session_id
        
        should_reconnect = session.get('room_code') is not None
        room_code = session.get('room_code')
        
        if should_reconnect and room_code not in rooms:
            should_reconnect = False
            update_session(session_id, {'room_code': None, 'is_host': False})
        
        emit('session_valid', {
            'session_id': session_id,
            'should_reconnect': should_reconnect,
            'room_code': room_code
        })
    else:
        emit('session_invalid', {})

@socketio.on('reconnect_to_game')
def handle_reconnect(data):
    session_id = data.get('session_id')
    if not session_exists(session_id):
        emit('err', 'Invalid session')
        return
        
    session = get_session(session_id)
    room_code = session.get('room_code')
    username = session.get('username')
    
    if not room_code or room_code not in rooms:
        emit('err', 'Game no longer exists')
        update_session(session_id, {'room_code': None, 'is_host': False})
        return
        
    join_room(room_code)
    sid_to_session[request.sid] = session_id
    
    message_history = rooms[room_code].get('message_history', [])
    emit('msg', {'u': 'HQ', 'm': f"{username} reconnected."}, to=room_code, include_self=False)
    emit('reconnected', {
        'room': room_code,
        'username': username,
        'is_host': session.get('is_host', False),
        'message_history': message_history
    })

@socketio.on('create_game')
def handle_create(data):
    session_id = data.get('session_id')
    if not session_exists(session_id):
        emit('error_msg', {'msg': 'Invalid session. Please refresh the page.'})
        return
        
    room = generate_code()
    rooms[room] = {
        'meta': {
            'players': data.get('players'),
            'clues': data.get('clues')
        },
        'host_session': session_id,
        'players': [],
        'message_history': [],
        'is_locked': False
    }
    
    assigned_character = AVAILABLE_CHARACTERS[0]
    rooms[room]['players'].append({
        'name': 'Host',
        'character': assigned_character,
        'session_id': session_id
    })
    
    update_session(session_id, {
        'room_code': room,
        'is_host': True,
        'username': 'Host'
    })
    
    join_room(room)
    sid_to_session[request.sid] = session_id
    emit('game_created', {'room': room})

@socketio.on('join_game')
def handle_join(data):
    session_id = data.get('session_id')
    room = data.get('code')
    
    if not session_exists(session_id):
        emit('error_msg', {'msg': 'Invalid session. Please refresh the page.'})
        return
        
    if room not in rooms:
        emit('error_msg', {'msg': "Invalid Room Code"})
        return
        
    if rooms[room].get('is_locked'):
        emit('error_msg', {'msg': "Game already started"})
        return

    max_players = int(rooms[room]['meta']['players'])
    if len(rooms[room]['players']) >= max_players:
        emit('error_msg', {'msg': "The room is full."})
        return
        
    exists = any(p.get('session_id') == session_id for p in rooms[room]['players'])
    if not exists:
        used_chars = [p.get('character') for p in rooms[room]['players']]
        assigned_character = next((c for c in AVAILABLE_CHARACTERS if c not in used_chars), None)
        
        if not assigned_character:
            emit('error_msg', {'msg': "No characters available."})
            return
            
        player_name = assigned_character
        rooms[room]['players'].append({
            'name': player_name,
            'character': assigned_character,
            'session_id': session_id
        })
        
        update_session(session_id, {
            'room_code': room,
            'is_host': False,
            'username': player_name
        })

    join_room(room)
    sid_to_session[request.sid] = session_id
    emit('join_success', {'room': room})

@socketio.on('join_waiting_room')
def handle_join_waiting(data):
    room = data.get('room')
    if room in rooms:
        join_room(room)
        emit('player_joined', {'players': rooms[room]['players']}, room=room)

@socketio.on('start_game_request')
def handle_start(data):
    room = data.get('room')
    session_id = data.get('session_id')
    
    if not session_id:
        session_id = sid_to_session.get(request.sid)
        
    if room not in rooms:
        return
        
    session = get_session(session_id)
    if not session or not session.get('is_host'):
        emit('error_msg', {'msg': 'Only the host can start the game.'})
        return
        
    if len(rooms[room]['players']) < 2:
        emit('error_msg', {'msg': 'Need at least 2 players to start.'})
        return
        
    rooms[room]['is_locked'] = True
    
    for p in rooms[room]['players']:
        char = p.get('character')
        pos = START_POSITIONS.get(char, (0, 0))
        p['r'] = pos[0]
        p['c'] = pos[1]
        
    socketio.emit('game_starting', room=room)

@socketio.on('join_board')
def handle_join_board(data):
    room = data.get('room')
    if room in rooms:
        join_room(room)
        emit('board_update', {'players': rooms[room]['players']}, room=room)

@socketio.on('move_player')
def handle_move(data):
    room = data.get('room')
    session_id = data.get('session_id')
    target_r = data.get('r')
    target_c = data.get('c')
    
    if room in rooms:
        for p in rooms[room]['players']:
            if p.get('session_id') == session_id:
                p['r'] = target_r
                p['c'] = target_c
                break
        socketio.emit('board_update', {'players': rooms[room]['players']}, room=room)

@socketio.on('disconnect')
def handle_disconnect():
    session_id = sid_to_session.get(request.sid)
    if session_id and session_exists(session_id):
        update_session(session_id, {'connected': False})
    
    if request.sid in sid_to_session:
        del sid_to_session[request.sid]

@app.route('/debug/sessions')
def debug_sessions():
    return {'total_sessions': len(sessions), 'sessions': sessions}

@app.route('/debug/rooms')
def debug_rooms():
    return {'total_rooms': len(rooms), 'rooms': rooms}

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)
