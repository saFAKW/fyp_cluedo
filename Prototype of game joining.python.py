from flask import Flask, render_template_string
from flask_socketio import SocketIO, join_room, emit
import random, string

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
        const $ = id => document.getElementById(id); // 简写函数

        function act(type) {
            user = $('u').value;
            let code = $('c').value;
            if(!user) return $('err').innerText = "Name is required.";
            if(type == 'join' && !code) return $('err').innerText = "Code is required.";
            socket.emit(type, {name: user, code: code});
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

def get_code(): return ''.join(random.choices(string.ascii_uppercase, k=4))

@app.route('/')
def index(): return render_template_string(html)

@socketio.on('create')
def c(d):
    r = get_code()
    rooms[r], user = [d['name']], d['name']
    join_room(r); emit('ok', {'room': r})
    print(f"Created {r}")

@socketio.on('join')
def j(d):
    r, user = d['code'].upper(), d['name']
    if r in rooms:
        join_room(r); emit('ok', {'room': r})
        emit('msg', {'u': 'HQ', 'm': f"{user} connected."}, to=r)
        print(f"Joined {r}")
    else: emit('err', "Invalid Code")

if __name__ == '__main__':
    socketio.run(app, debug=True)
