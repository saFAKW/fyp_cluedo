const svg = document.getElementById("board");

const size = 30;
const rows = 25;
const cols = 25;
const padding = size; 
const ns = "http://www.w3.org/2000/svg";

const tileMap = new Map();  
const walkableTiles = new Set();

const boardWidth = cols * size;
const boardHeight = rows * size;

svg.setAttribute("width", boardWidth + padding * 2);
svg.setAttribute("height", boardHeight + padding * 2);

let currentPlayerIndex = 0;
let selectedTrapdoorRoom = null;

let hoveringRoom = false;
let hoveringSendButton = false;
let hideLetterButtonTimeout = null;

/*
Room layout:
r = top row
c = left col
w = width in tiles
h = height in tiles

*/
const rooms = [
  // top row
  {
    name: "Kitchen",
    r: 0, c: 0, w: 6, h: 6,
    doors: [[5,1],[2,5]],
    isCorner: true,
    trapdoor: { row: 1, col: 1 },
    destinationTile: { row: 2, col: 2 }
  },
  {
    name: "Ballroom",
    r: 0, c: 9, w: 7, h: 6,
    doors: [[5,3]]
  },
  {
    name: "Conservatory",
    r: 0, c: 19, w: 6, h: 6,
    doors: [[5,3],[2,0]],
    isCorner: true,
    trapdoor: { row: 1, col: 23 },
    destinationTile: { row: 2, col: 22 }
  },

  // middle row
  {
    name: "Dining Room",
    r: 9, c: 0, w: 6, h: 7,
    doors: [[3,5]]
  },
  {
    name: "Center",
    r: 9, c: 9, w: 7, h: 7,
    doors: [[0,3]]
  },
  {
    name: "Billiard Room",
    r: 9, c: 18, w: 7, h: 7,
    doors: [[3,0]]
  },

  // bottom row
  {
    name: "Lounge",
    r: 19, c: 0, w: 6, h: 6,
    doors: [[0,1],[3,5]],
    isCorner: true,
    trapdoor: { row: 23, col: 1 },
    destinationTile: { row: 22, col: 2 }
  },
  {
    name: "Hall",
    r: 19, c: 9, w: 7, h: 6,
    doors: [[0,3]]
  },
  {
    name: "Study",
    r: 19, c: 18, w: 7, h: 6,
    doors: [[0,3],[3,0]],
    isCorner: true,
    trapdoor: { row: 23, col: 23 },
    destinationTile: { row: 22, col: 22 }
  }
];

const players = [
  { name: "Miss Scarlet", color: "#d83b3b", row: 2,  col: 2,  piece: null }, /* Start position for her is just for testing purposes*/
  { name: "Colonel Mustard", color: "#e0b12f", row: 18, col: 0,  piece: null },
  { name: "Mrs Peacock", color: "#2e86de", row: 8,  col: 24, piece: null },
  { name: "Mr Green", color: "#2ecc71", row: 18, col: 24, piece: null },
  { name: "Mrs White", color: "#f8f8e8", row: 24, col: 8,  piece: null },
  { name: "Professor Plum", color: "#8e44ad", row: 24, col: 17, piece: null }
];

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
  return rooms.some(room =>
    r >= room.r &&
    r < room.r + room.h &&
    c >= room.c &&
    c < room.c + room.w
  );
}

//  Draw corridor tiles everywhere not occupied by rooms
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (!inAnyRoom(r, c)) {
      const tile = createRect(
      padding + c * size,
      padding + r * size,
      size,
      size,
      "tile"
    );

    const key = `${r},${c}`;

    tileMap.set(key, tile);
    walkableTiles.add(key);
    }
  }
}

// Draw rooms
rooms.forEach(room => {
  room.element = createRect(
    padding + room.c * size,
    padding + room.r * size,
    room.w * size,
    room.h * size,
    "room"
  );
});

// Draw doors INSIDE rooms
rooms.forEach(room => {
  room.doors.forEach(([dr, dc]) => {
    createRect(
      padding + (room.c + dc) * size,
      padding + (room.r + dr) * size,
      size,
      size,
      "door"
    );
  });
});

// Draw board outline around the actual 25x25 board
createRect(
  padding,
  padding,
  boardWidth,
  boardHeight,
  "board-outline"
);

function getTileCenter(row, col) {
  return {
    x: padding + col * size + size / 2,
    y: padding + row * size + size / 2
  };
}

function createPlayerPiece(player) {
  const pos = getTileCenter(player.row, player.col);

  const circle = document.createElementNS(ns, "circle");
  circle.setAttribute("cx", pos.x);
  circle.setAttribute("cy", pos.y);
  circle.setAttribute("r", 9);
  circle.setAttribute("fill", player.color);
  circle.setAttribute("stroke", "#222");
  circle.setAttribute("stroke-width", "1.5");

  svg.appendChild(circle);
  player.piece = circle;
}

// Draw players
players.forEach(createPlayerPiece);

let highlightedMoves = [];

function clearHighlights() {
  highlightedMoves.forEach(({row, col}) => {
    const tile = tileMap.get(`${row},${col}`);
    if (tile) tile.classList.remove("valid-move");
  });
  highlightedMoves = [];
}

function highlightTiles(tiles) {
  clearHighlights();

  highlightedMoves = tiles;

  tiles.forEach(({row, col}) => {
    const tile = tileMap.get(`${row},${col}`);
    if (tile) tile.classList.add("valid-move");
  });
}

function getTileCenter(row, col) {
  return {
    x: padding + col * size + size / 2,
    y: padding + row * size + size / 2
  };
}

function animatePieceTo(player, newRow, newCol, duration = 300) {
  // Get the piece's current screen position
  const startX = parseFloat(player.piece.getAttribute("cx"));
  const startY = parseFloat(player.piece.getAttribute("cy"));

  // Get the center position of the destination tile
  const end = getTileCenter(newRow, newCol);
  const endX = end.x;
  const endY = end.y;

  // Save the time the animation starts
  const startTime = performance.now();

  function step(now) {
    // Work out how far through the animation we are (from 0 to 1)
    const progress = Math.min((now - startTime) / duration, 1);

    // Move the piece a little closer to the destination each frame
    const currentX = startX + (endX - startX) * progress;
    const currentY = startY + (endY - startY) * progress;

    // Update the circle's position on the SVG
    player.piece.setAttribute("cx", currentX);
    player.piece.setAttribute("cy", currentY);

    // Keep animating until the piece reaches the end
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // Once finished, update the player's row/col in the game data
      player.row = newRow;
      player.col = newCol;
    }
  }

  // Start the animation
  requestAnimationFrame(step);
}

const clueTiles = [
  { row: 4, col: 7 },
  { row: 8, col: 12 },
  { row: 6, col: 17 },
  { row: 16, col: 18 },
  { row: 18, col: 10 }
];

function drawClueTile(row, col) {
  const center = getTileCenter(row, col);

  const text = document.createElementNS(ns, "text");
  text.setAttribute("x", center.x);
  text.setAttribute("y", center.y + 6);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-size", "20");
  text.setAttribute("font-weight", "bold");
  text.setAttribute("fill", "red");
  text.textContent = "?";

  svg.appendChild(text);
}

clueTiles.forEach(tile => drawClueTile(tile.row, tile.col));

function getCurrentPlayer() {
  return players[currentPlayerIndex];
}

function drawTrapdoor(room) {
  const trap = createRect(
    padding + room.trapdoor.col * size,
    padding + room.trapdoor.row * size,
    size,
    size,
    "trapdoor"
  );

  trap.addEventListener("click", () => {
    const player = getCurrentPlayer();
    const currentRoom = getRoomAtPosition(player.row, player.col);

    if (!currentRoom) return;
    if (currentRoom.name !== room.name) return;
    if (!room.isCorner) return;

    openTrapdoorModal(room);
  });
}

function openTrapdoorModal(currentRoom) {
  const options = rooms.filter(room => room.isCorner && room !== currentRoom);
  // populate modal buttons/select
}

function getRoomAtPosition(row, col) {
  return rooms.find(room =>
    row >= room.r &&
    row < room.r + room.h &&
    col >= room.c &&
    col < room.c + room.w
  ) || null;
}

rooms.forEach(room => {
  if (room.isCorner) {
    drawTrapdoor(room);
  }
});

function openTrapdoorModal(currentRoom) {
  selectedTrapdoorRoom = currentRoom;

  const select = document.getElementById("trapdoorSelect");
  select.innerHTML = "";

  const options = rooms.filter(room => room.isCorner && room.name !== currentRoom.name);

  options.forEach(room => {
    const option = document.createElement("option");
    option.value = room.name;
    option.textContent = room.name;
    select.appendChild(option);
  });

  document.getElementById("trapdoorModal").style.display = "flex";
}

function closeTrapdoorModal() {
  document.getElementById("trapdoorModal").style.display = "none";
  selectedTrapdoorRoom = null;
}

function confirmTrapdoorMove() {
  const select = document.getElementById("trapdoorSelect");
  const chosenRoomName = select.value;

  if (!chosenRoomName) return;

  const destinationRoom = rooms.find(room => room.name === chosenRoomName);
  if (!destinationRoom) return;

  const player = getCurrentPlayer();

  animatePieceTo(
    player,
    destinationRoom.destinationTile.row,
    destinationRoom.destinationTile.col
  );

  closeTrapdoorModal();
}

function currentPlayerRoom() {
  const player = players[currentPlayerIndex];
  return getRoomAtPosition(player.row, player.col);
}

const sendLetterBtn = document.querySelector(".send-letter-btn");

function showSendLetterButtonAt(x, y) {
  sendLetterBtn.style.display = "block";
  sendLetterBtn.style.left = `${x + 2}px`;
  sendLetterBtn.style.top = `${y + 2}px`;
}

function scheduleHideSendLetterButton() {
  clearTimeout(hideLetterButtonTimeout);

  hideLetterButtonTimeout = setTimeout(() => {
    if (!hoveringRoom && !hoveringSendButton) {
      sendLetterBtn.style.display = "none";
    }
  }, 80);
}

sendLetterBtn.addEventListener("mouseenter", () => {
  hoveringSendButton = true;
  clearTimeout(hideLetterButtonTimeout);
});

sendLetterBtn.addEventListener("mouseleave", () => {
  hoveringSendButton = false;
  scheduleHideSendLetterButton();
});

rooms.forEach(room => {
  room.element.addEventListener("mouseenter", () => {
    hoveringRoom = true;
  });

  room.element.addEventListener("mousemove", (event) => {
    const player = getCurrentPlayer();
    const currentRoom = getRoomAtPosition(player.row, player.col);

    if (currentRoom && currentRoom.name === room.name) {
      showSendLetterButtonAt(event.pageX, event.pageY);
    }
  });

  room.element.addEventListener("mouseleave", () => {
    hoveringRoom = false;
    scheduleHideSendLetterButton();
  });
});

function showWinScreen(winnerName) {
  document.getElementById("endGameTitle").textContent = `${winnerName} Wins!`;
  document.getElementById("endGameMessage").textContent = "The mystery has been solved.";
  document.getElementById("endGameOverlay").classList.remove("hidden");
}

function showLoseScreen(playerName) {
  document.getElementById("endGameTitle").textContent = `${playerName} Loses`;
  document.getElementById("endGameMessage").textContent = "That accusation was incorrect.";
  document.getElementById("endGameOverlay").classList.remove("hidden");
}
