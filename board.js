/* ════════════════════════════════════════
   BOARD.JS — board rendering & movement
════════════════════════════════════════ */

const svg = document.getElementById("board");
const size = 30;
const rows = 25;
const cols = 25;
const padding = size;
const ns = "http://www.w3.org/2000/svg";

const tileMap = new Map();
const walkableTiles = new Set();

const boardWidth  = cols * size;
const boardHeight = rows * size;

svg.setAttribute("width",  boardWidth  + padding * 2);
svg.setAttribute("height", boardHeight + padding * 2);

let currentPlayerIndex = 0;
let selectedTrapdoorRoom = null;

let hoveringRoom = false;
let hoveringSendButton = false;
let hideLetterButtonTimeout = null;

let movesLeft = 0;
let movementInProgress = false;
let movementPath = [];

/* ════════════════════════════════════════
   SOUND SYSTEM
════════════════════════════════════════ */

const SFX = {
    boom:      new Audio("sound effects/freesound_community-cinematic-boom-6872.mp3"),
    whoosh:    new Audio("sound effects/dragon-studio-simple-whoosh-382724.mp3"),
    pencil:    new Audio("sound effects/u_viypcpsnud-pencil_scribble_9-389258.mp3"),
    levelUp:   new Audio("sound effects/universfield-game-level-complete-143022.mp3"),
    doorOpen:  new Audio("sound effects/dragon-studio-open-door-stock-sfx-454246.mp3"),
    doorClose: new Audio("sound effects/soundreality-opening-door-411632.mp3"),
    footsteps: new Audio("sound effects/freesound_community-steps-in-high-heels-6332.mp3"),
    paper:     new Audio("sound effects/makigai_maimai-paper-245786.mp3"),
    dice:      new Audio("sound effects/freesound_community-rolling-dice-2-102706.mp3"),
};

// Footsteps loop while moving
SFX.footsteps.loop = true;

function playSound(sfx) {
    try {
        sfx.currentTime = 0;
        sfx.play().catch(() => {});
    } catch (e) {}
}

function stopSound(sfx) {
    try {
        sfx.pause();
        sfx.currentTime = 0;
    } catch (e) {}
}

// Exposed globally so board.html inline handlers and other scripts can call them
function playResultSound()     { playSound(SFX.boom); }
function playPaperSound()      { playSound(SFX.paper); }
function playSendLetterSound() { playSound(SFX.whoosh); }
function playPencilSound()     { playSound(SFX.pencil); }
function playDiceSound()       { playSound(SFX.dice); }

/* ════════════════════════════════════════
   BOARD DATA
════════════════════════════════════════ */

const rooms = [
    { name: "Kitchen",       r: 0,  c: 0,  w: 6, h: 6, doors: [[5,1],[2,5]],  isCorner: true,  trapdoor: { row: 1,  col: 1  }, destinationTile: { row: 2,  col: 2  } },
    { name: "Ballroom",      r: 0,  c: 9,  w: 7, h: 6, doors: [[5,3]] },
    { name: "Conservatory",  r: 0,  c: 19, w: 6, h: 6, doors: [[5,3],[2,0]],  isCorner: true,  trapdoor: { row: 1,  col: 23 }, destinationTile: { row: 2,  col: 22 } },
    { name: "Dining Room",   r: 9,  c: 0,  w: 6, h: 7, doors: [[3,5]] },
    { name: "Cellar",        r: 9,  c: 9,  w: 7, h: 7, doors: [], isCellar: true },
    { name: "Billiard Room", r: 9,  c: 18, w: 7, h: 7, doors: [[3,0]] },
    { name: "Lounge",        r: 19, c: 0,  w: 6, h: 6, doors: [[0,1],[3,5]],  isCorner: true,  trapdoor: { row: 23, col: 1  }, destinationTile: { row: 22, col: 2  } },
    { name: "Hall",          r: 19, c: 9,  w: 7, h: 6, doors: [[0,3]] },
    { name: "Study",         r: 19, c: 18, w: 7, h: 6, doors: [[0,3],[3,0]],  isCorner: true,  trapdoor: { row: 23, col: 23 }, destinationTile: { row: 22, col: 22 } }
];

// NOTE: playersData is the board's authoritative list of piece positions.
// main.js references this same array via getCurrentBoardPlayer() for turn sync.
const playersData = [
    { name: "Miss Scarlet",    color: "#d83b3b", row: 2,  col: 2,  piece: null },
    { name: "Colonel Mustard", color: "#e0b12f", row: 18, col: 0,  piece: null },
    { name: "Mrs Peacock",     color: "#2e86de", row: 8,  col: 24, piece: null },
    { name: "Mr Green",        color: "#2ecc71", row: 18, col: 24, piece: null },
    { name: "Mrs White",       color: "#f8f8e8", row: 24, col: 8,  piece: null },
    { name: "Professor Plum",  color: "#8e44ad", row: 24, col: 17, piece: null }
];

const CHARACTER_TO_BOARD_NAME = {
    "Miss Scarlet": "Miss Scarlet",
    "Colonel Mustard": "Colonel Mustard",
    "Mrs. Peacock": "Mrs Peacock",
    "Reverend Green": "Mr Green",
    "Dr. Orchid": "Mrs White",
    "Professor Plum": "Professor Plum"
};

// --- Turn Timer Integration ---
let turnTimerProcess = null;
let turnTimerDone = false;
let turnTimeoutId = null;

function stopTurnTimer() {
    if (turnTimerProcess) {
        turnTimerProcess.kill();
        turnTimerProcess = null;
    }
    if (turnTimeoutId) {
        clearTimeout(turnTimeoutId);
        turnTimeoutId = null;
    }
}

function startTurnTimer() {
    stopTurnTimer();
    turnTimerDone = false;
    turnTimerProcess = window.require ? window.require('child_process').spawn(
        'C:/Users/safa_/openCV/Scripts/opencv/Scripts/python.exe',
        ['turn_timer_bridge.py'],
        { cwd: '.' }
    ) : null;
    if (turnTimerProcess) {
        turnTimerProcess.stdout.on('data', (data) => {
            if (data.toString().includes('TURN_TIMER_DONE')) {
                turnTimerDone = true;
                if (movementInProgress === false) {
                    endTurn();
                }
            }
        });
    }

    // Always enforce a 60-second turn window in browser.
    turnTimeoutId = setTimeout(() => {
        turnTimerDone = true;
        if (movementInProgress === false) {
            endTurn();
        }
    }, 60000);
}

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
        r >= room.r && r < room.r + room.h &&
        c >= room.c && c < room.c + room.w
    );
}

// Draw corridor tiles — checkerboard pattern
for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        if (!inAnyRoom(r, c)) {
            const checkerClass = (r + c) % 2 === 0 ? "tile light" : "tile dark";
            const tile = createRect(padding + c * size, padding + r * size, size, size, checkerClass);
            const key = `${r},${c}`;
            tileMap.set(key, tile);
            walkableTiles.add(key);
            tile.addEventListener("click", () => handleTileClick(r, c));
        }
    }
}

// Draw rooms using PNG images
rooms.forEach(room => {
    if (room.name === "Center") return; // skip old center if present
    // Map room names to image filenames
    let imgName = room.name.toLowerCase().replace(/ /g, "_") + ".png";
    // Special case for library (handle possible duplicate/variant)
    if (room.name === "Library") imgName = "library.png";
    const img = document.createElementNS(ns, "image");
    img.setAttribute("href", `rooms/${imgName}`);
    img.setAttribute("x", padding + room.c * size);
    img.setAttribute("y", padding + room.r * size);
    img.setAttribute("width", room.w * size);
    img.setAttribute("height", room.h * size);
    img.setAttribute("class", "room-img");
    svg.appendChild(img);
    room.element = img;
});

// Draw doors
rooms.forEach(room => {
    room.doors.forEach(([dr, dc]) => {
        createRect(padding + (room.c + dc) * size, padding + (room.r + dr) * size, size, size, "door");
    });
});

// Draw board outline
createRect(padding, padding, boardWidth, boardHeight, "board-outline");

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

    circle.addEventListener("click", () => {
        if (player === getCurrentBoardPlayer() && !movementInProgress && movesLeft === 0) {
            startMovement(5);
        }
    });
}

playersData.forEach(createPlayerPiece);

function getCurrentBoardPlayer() {
    return playersData[currentPlayerIndex];
}

function getBoardPlayerByCharacter(characterName) {
    const boardName = CHARACTER_TO_BOARD_NAME[characterName] || characterName;
    return playersData.find(p => p.name === boardName) || null;
}

function applyServerPlayers(serverPlayers) {
    if (!Array.isArray(serverPlayers)) return;
    serverPlayers.forEach((sp) => {
        const bp = getBoardPlayerByCharacter(sp.character);
        if (!bp) return;
        if (typeof sp.r === "number" && typeof sp.c === "number") {
            animatePieceTo(bp, sp.r, sp.c, 120);
        }
    });
}

function getExitTilesForRoom(room) {
    return room.doors.map(([dr, dc]) => {
        const doorRow = room.r + dr;
        const doorCol = room.c + dc;
        if (dr === 0)              return { row: doorRow - 1, col: doorCol };
        if (dr === room.h - 1)     return { row: doorRow + 1, col: doorCol };
        if (dc === 0)              return { row: doorRow, col: doorCol - 1 };
        if (dc === room.w - 1)     return { row: doorRow, col: doorCol + 1 };
        return null;
    }).filter(Boolean);
}

let highlightedMoves = [];

function clearHighlights() {
    highlightedMoves.forEach(({ row, col }) => {
        const tile = tileMap.get(`${row},${col}`);
        if (tile) tile.classList.remove("valid-move");
    });
    highlightedMoves = [];
}

/* ── Room entry/exit detection ── */
function checkRoomTransition(player, newRow, newCol) {
    const prevRoom = getRoomAtPosition(player.row, player.col);
    const nextRoom = getRoomAtPosition(newRow, newCol);
    if (prevRoom && !nextRoom) {
        // Leaving a room — door closing behind
        playSound(SFX.doorClose);
    } else if (!prevRoom && nextRoom) {
        // Entering a room
        playSound(SFX.doorOpen);
    }
}

function animatePieceTo(player, newRow, newCol, duration = 300) {
    const startX = parseFloat(player.piece.getAttribute("cx"));
    const startY = parseFloat(player.piece.getAttribute("cy"));
    const end = getTileCenter(newRow, newCol);
    const startTime = performance.now();

    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        player.piece.setAttribute("cx", startX + (end.x - startX) * progress);
        player.piece.setAttribute("cy", startY + (end.y - startY) * progress);
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            player.row = newRow;
            player.col = newCol;
        }
    }
    requestAnimationFrame(step);
}

// Clue tiles
const clueTiles = [
    { row: 4,  col: 7  },
    { row: 8,  col: 12 },
    { row: 6,  col: 17 },
    { row: 16, col: 18 },
    { row: 18, col: 10 }
];

// Fast lookup set for clue tile positions
const clueTileSet = new Set(clueTiles.map(t => `${t.row},${t.col}`));

clueTiles.forEach(({ row, col }) => {
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
});

// Trapdoors
function getRoomAtPosition(row, col) {
    return rooms.find(room =>
        row >= room.r && row < room.r + room.h &&
        col >= room.c && col < room.c + room.w
    ) || null;
}

function drawTrapdoor(room) {
    const trap = createRect(
        padding + room.trapdoor.col * size,
        padding + room.trapdoor.row * size,
        size, size, "trapdoor"
    );
    trap.addEventListener("click", () => {
        const player = getCurrentBoardPlayer();
        const currentRoom = getRoomAtPosition(player.row, player.col);
        if (!currentRoom || currentRoom.name !== room.name || !room.isCorner) return;
        openTrapdoorModal(room);
    });
}

rooms.forEach(room => { if (room.isCorner) drawTrapdoor(room); });

function openTrapdoorModal(currentRoom) {
    selectedTrapdoorRoom = currentRoom;
    const select = document.getElementById("trapdoorSelect");
    select.innerHTML = "";
    rooms.filter(r => r.isCorner && r.name !== currentRoom.name).forEach(room => {
        const option = document.createElement("option");
        option.value = room.name;
        option.textContent = room.name;
        select.appendChild(option);
    });
    playPaperSound();
    document.getElementById("trapdoorModal").classList.add("active");
}

function closeTrapdoorModal() {
    document.getElementById("trapdoorModal").classList.remove("active");
    selectedTrapdoorRoom = null;
}

function confirmTrapdoorMove() {
    const chosenRoomName = document.getElementById("trapdoorSelect").value;
    if (!chosenRoomName) return;
    const dest = rooms.find(r => r.name === chosenRoomName);
    if (!dest) return;
    const player = getCurrentBoardPlayer();
    // Trapdoor is room-to-room: door closing then opening
    playSound(SFX.doorClose);
    setTimeout(() => playSound(SFX.doorOpen), 500);
    animatePieceTo(player, dest.destinationTile.row, dest.destinationTile.col);
    if (typeof emitMoveToServer === "function") {
        emitMoveToServer(dest.destinationTile.row, dest.destinationTile.col);
    }
    closeTrapdoorModal();
}

// Send Letter button — appears on room hover
const sendLetterBtn = document.querySelector(".send-letter-btn");

function showSendLetterButtonAt(x, y) {
    sendLetterBtn.style.display = "block";
    sendLetterBtn.style.left = `${x + 2}px`;
    sendLetterBtn.style.top  = `${y + 2}px`;
}

function scheduleHideSendLetterButton() {
    clearTimeout(hideLetterButtonTimeout);
    hideLetterButtonTimeout = setTimeout(() => {
        if (!hoveringRoom && !hoveringSendButton) sendLetterBtn.style.display = "none";
    }, 80);
}

sendLetterBtn.addEventListener("mouseenter", () => { hoveringSendButton = true;  clearTimeout(hideLetterButtonTimeout); });
sendLetterBtn.addEventListener("mouseleave", () => { hoveringSendButton = false; scheduleHideSendLetterButton(); });

// Whoosh on clicking the Send Letter button
sendLetterBtn.addEventListener("click", () => {
    playSound(SFX.whoosh);
}, true); // capture phase so it fires before openSendLetterModal

rooms.forEach(room => {
    room.element.addEventListener("mouseenter", () => { hoveringRoom = true; });
    room.element.addEventListener("mousemove", event => {
        const player = getCurrentBoardPlayer();
        const currentRoom = getRoomAtPosition(player.row, player.col);
        if (currentRoom && currentRoom.name === room.name) showSendLetterButtonAt(event.pageX, event.pageY);
    });
    room.element.addEventListener("mouseleave", () => { hoveringRoom = false; scheduleHideSendLetterButton(); });
});

// Final Guess Button logic
const finalGuessBtn = document.querySelector('.final-guess-btn');

function updateFinalGuessButton() {
    const player = getCurrentBoardPlayer();
    const currentRoom = getRoomAtPosition(player.row, player.col);
    if (currentRoom && currentRoom.name === 'Center') {
        finalGuessBtn.classList.add('visible');
    } else {
        finalGuessBtn.classList.remove('visible');
    }
}

// Movement
function getAdjacentTiles(row, col) {
    return [
        { row: row - 1, col },
        { row: row + 1, col },
        { row, col: col - 1 },
        { row, col: col + 1 }
    ];
}

function isOccupied(row, col, ignorePlayer = null) {
    return playersData.some(p => p !== ignorePlayer && p.row === row && p.col === col);
}

function showNextValidMoves(player) {
    clearHighlights();
    const currentRoom = getRoomAtPosition(player.row, player.col);
    let validTiles = [];

    if (currentRoom) {
        validTiles = getExitTilesForRoom(currentRoom).filter(tile => {
            const key = `${tile.row},${tile.col}`;
            return walkableTiles.has(key) && !isOccupied(tile.row, tile.col, player) && !movementPath.includes(key);
        });
    } else {
        validTiles = getAdjacentTiles(player.row, player.col).filter(tile => {
            const key = `${tile.row},${tile.col}`;
            return walkableTiles.has(key) && !isOccupied(tile.row, tile.col, player) && !movementPath.includes(key);
        });
    }

    highlightedMoves = validTiles;
    validTiles.forEach(({ row, col }) => {
        const tile = tileMap.get(`${row},${col}`);
        if (tile) tile.classList.add("valid-move");
    });
}

function handleTileClick(row, col) {
    if (!movementInProgress) return;
    if (typeof isLocalPlayersTurn === "function" && !isLocalPlayersTurn()) return;
    const isValidMove = highlightedMoves.some(t => t.row === row && t.col === col);
    if (!isValidMove) return;

    const player = getCurrentBoardPlayer();

    // Check for room entry / exit and play door sounds
    checkRoomTransition(player, row, col);

    animatePieceTo(player, row, col, 200);
    if (typeof emitMoveToServer === "function") {
        emitMoveToServer(row, col);
    }
    movementPath.push(`${row},${col}`);
    movesLeft--;
    clearHighlights();

    // Landing on a clue tile plays the level-up fanfare
    if (clueTileSet.has(`${row},${col}`)) {
        stopSound(SFX.footsteps);
        playSound(SFX.levelUp);
        // Resume footsteps after the fanfare if moves remain
        if (movesLeft > 0) {
            SFX.levelUp.addEventListener("ended", () => {
                if (movementInProgress) playSound(SFX.footsteps);
            }, { once: true });
        }
    }

    setTimeout(() => {
        if (movesLeft > 0) {
            showNextValidMoves(player);
        } else {
            stopSound(SFX.footsteps);
            movementInProgress = false;
            movementPath = [];
            endTurn();
        }
    }, 220);
}

function startMovement(rollValue) {
    if (movementInProgress || movesLeft > 0) return;
    if (typeof isLocalPlayersTurn === "function" && !isLocalPlayersTurn()) return;
    const player = getCurrentBoardPlayer();
    movesLeft = rollValue;
    movementInProgress = true;
    movementPath = [`${player.row},${player.col}`];
    playSound(SFX.footsteps);
    showNextValidMoves(player);
}

function endTurn() {
    if (!turnTimerDone) return;
    stopSound(SFX.footsteps);
    clearHighlights();
    movesLeft = 0;
    movementInProgress = false;
    movementPath = [];
    if (typeof requestTurnEnd === "function") {
        requestTurnEnd();
    } else {
        currentPlayerIndex = (currentPlayerIndex + 1) % playersData.length;
        setPlayerTurn(currentPlayerIndex);
    }
    stopTurnTimer();
}

function setBoardTurn(index) {
    currentPlayerIndex = index % playersData.length;
    setPlayerTurn(currentPlayerIndex);
    updateFinalGuessButton();
    if (typeof isLocalPlayersTurn === "function") {
        if (isLocalPlayersTurn()) {
            startTurnTimer();
        } else {
            stopTurnTimer();
            turnTimerDone = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', updateFinalGuessButton);