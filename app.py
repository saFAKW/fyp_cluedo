from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, emit
import random, string, os

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

def generate_code():
    return ''.join(random.choices(string.digits, k=6))

@socketio.on('create_game')
def handle_create(data):
    room = generate_code()
    rooms[room] = {
        'meta': data,
        'players': []
    }
    join_room(room)
    print(f"Room {room} created. Max players: {data['players']}")
    emit('game_created', {'room': room})

@socketio.on('join_game')
def handle_join(data):
    room = data.get('code')
    if room in rooms:
        current_count = len(rooms[room]['players'])
        max_players = int(rooms[room]['meta']['players'])
        
        if current_count >= max_players:
            emit('error_msg', {'msg': "The room is full."})
        else:
            emit('join_success', {'room': room})
    else:
        emit('error_msg', {'msg': "Invalid Room Code"})

@socketio.on('player_join')
def handle_player_join(data):
    room = data.get('room')
    name = data.get('name')
    character = data.get('character')
    
    if not room or room not in rooms:
        emit('error_msg', {'msg': 'Invalid Room Code'})
        return

    join_room(room)
    player = {'name': name, 'character': character}
    
    exists = False
    for p in rooms[room]['players']:
        if p['name'] == name:
            exists = True
            break
            
    if not exists:
        current_count = len(rooms[room]['players'])
        max_players = int(rooms[room]['meta']['players'])
        
        if current_count >= max_players:
            emit('error_msg', {'msg': 'The room is full.'})
            return

        rooms[room]['players'].append(player)
    
    emit('player_join_confirmed', {'room': room})
    
    socketio.emit('player_joined', {
        'player': player, 
        'players': rooms[room]['players']
    }, room=room)

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

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
