const svg = document.getElementById("board");
const size = 30;
const rows = 25;
const cols = 25;
const padding = size;
const ns = "http://www.w3.org/2000/svg";
const boardWidth = cols * size;
const boardHeight = rows * size;

svg.setAttribute("width", boardWidth + padding * 2);
svg.setAttribute("height", boardHeight + padding * 2);

const rooms = [
  { name: "topLeft",     r: 0,  c: 0,  w: 6, h: 6, doors: [[5,1],[2,5]] },
  { name: "topMiddle",   r: 0,  c: 9,  w: 7, h: 6, doors: [[5,3]] },
  { name: "topRight",    r: 0,  c: 19, w: 6, h: 6, doors: [[5,3],[2,0]] },
  { name: "midLeft",     r: 9,  c: 0,  w: 6, h: 7, doors: [[3,5]] },
  { name: "center",      r: 9,  c: 9,  w: 7, h: 7, doors: [[0,3]] },
  { name: "midRight",    r: 9,  c: 18, w: 7, h: 7, doors: [[3,0]] },
  { name: "bottomLeft",  r: 19, c: 0,  w: 6, h: 6, doors: [[0,1],[3,5]] },
  { name: "bottomMiddle",r: 19, c: 9,  w: 7, h: 6, doors: [[0,3]] },
  { name: "bottomRight", r: 19, c: 18, w: 7, h: 6, doors: [[0,3],[3,0]] }
];

const charColors = {
  "Miss Scarlet": "#d83b3b",
  "Colonel Mustard": "#e0b12f",
  "Mrs. Peacock": "#2e86de",
  "Reverend Green": "#2ecc71",
  "Dr. Orchid": "#f5f5f5",
  "Professor Plum": "#8e44ad"
};

function createRect(x, y, width, height, className) {
  const rect = document.createElementNS(ns, "rect");
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", width);
  rect.setAttribute("height", height);
  rect.setAttribute("class", className);
  svg.appendChild(rect);
  return rect;
}

function inAnyRoom(r, c) {
  return rooms.some(room => r >= room.r && r < room.r + room.h && c >= room.c && c < room.c + room.w);
}

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (!inAnyRoom(r, c)) {
      let tile = createRect(padding + c * size, padding + r * size, size, size, "tile");
      tile.addEventListener('click', () => attemptMove(r, c));
    }
  }
}

rooms.forEach(room => {
  let rm = createRect(padding + room.c * size, padding + room.r * size, room.w * size, room.h * size, "room");
  rm.addEventListener('click', () => attemptMove(room.r, room.c));
});

rooms.forEach(room => {
  room.doors.forEach(([dr, dc]) => {
    createRect(padding + (room.c + dc) * size, padding + (room.r + dr) * size, size, size, "door");
  });
});

createRect(padding, padding, boardWidth, boardHeight, "board-outline");

const SERVER_URL = window.location.origin;
const socket = io(SERVER_URL);
const sessionId = localStorage.getItem('session_id');
const params = new URLSearchParams(window.location.search);
const roomCode = params.get('room');

socket.on('connect', () => {
    socket.emit('join_board', { room: roomCode, session_id: sessionId });
});

let playerTokens = {};

socket.on('board_update', (data) => {
    Object.values(playerTokens).forEach(token => svg.removeChild(token));
    playerTokens = {};
    
    data.players.forEach(p => {
        if (p.r !== undefined && p.c !== undefined) {
            let token = createRect(padding + p.c * size, padding + p.r * size, size, size, "start");
            token.setAttribute("fill", charColors[p.character] || "#000");
            playerTokens[p.session_id] = token;
        }
    });
});

function attemptMove(r, c) {
    socket.emit('move_player', { room: roomCode, session_id: sessionId, r: r, c: c });
}
