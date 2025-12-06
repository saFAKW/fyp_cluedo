from flask import Flask, render_template
from flask_socketio import SocketIO, join_room, emit
import random, string

app = Flask(__name__, template_folder='.', static_folder='.', static_url_path='')
app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app, cors_allowed_origins="*")

rooms = {}

@app.route('/')
def index():
    return render_template('host.html')

@app.route('/join')
def join_page():
    return render_template('join.html')

def generate_code():
    return ''.join(random.choices(string.digits, k=6))

@socketio.on('create_game')
def handle_create(data):
    room = generate_code()
    # initialize room state including players list
    rooms[room] = {
        'meta': data,
        'players': []
    }
    join_room(room)
    print(f"Room Created: {room}")
    emit('game_created', {'room': room})

@socketio.on('join_game')
def handle_join(data):
    room = data.get('code')
    if room in rooms:
        join_room(room)
        print(f"User joined: {room}")
        emit('join_success', {'room': room})
    else:
        emit('error_msg', {'msg': "Invalid Room Code"})


@socketio.on('player_join')
def handle_player_join(data):
    """Data must include: room, name, character"""
    room = data.get('room')
    name = data.get('name')
    character = data.get('character')
    if not room or room not in rooms:
        emit('error_msg', {'msg': 'Invalid Room Code'})
        return

    player = {'name': name, 'character': character}
    rooms[room]['players'].append(player)
    print(f"Player joined room {room}: {player}")
    # broadcast to everyone in the room that a player has joined
    socketio.emit('player_joined', {'player': player, 'players': rooms[room]['players']}, room=room)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
