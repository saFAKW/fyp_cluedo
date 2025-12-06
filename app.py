from flask import Flask, render_template
from flask_socketio import SocketIO, join_room, emit
import random, string

app = Flask(__name__, template_folder='.', static_folder='.', static_url_path='')
app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app)

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
    rooms[room] = data
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

if __name__ == '__main__':
    socketio.run(app, debug=True)
