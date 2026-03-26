/* ------------------------------------------------
   MAIN.JS — UI, panels, letters, dice, win/lose
   NOTE: board.js must load before this file.
   Player piece data lives in playersData (board.js).
---------------------------------------------------*/


let myCards   = [];
const SERVER_URL = window.location.origin;
const socket = io(SERVER_URL);
const queryParams = new URLSearchParams(window.location.search);
const roomCode = queryParams.get('room');
let sessionId = localStorage.getItem('session_id');

const findings = [
    "Kitchen", "Ballroom", "Conservatory", "Dining Room", "Lounge", "Hall", "Study", "Library", "Billiard Room",
    "Knife", "Revolver", "Rope", "Lead Pipe", "Wrench", "Candlestick",
    "Miss Scarlet", "Colonel Mustard", "Reverend Green", "Mrs. Peacock", "Professor Plum", "Dr. Orchid"
];

let letters = [];
let currentLetterId = null;

/* ── Taskbar ── */
// Uses playersData from board.js for colours/names
let currentPlayerTurn = 0; // index into playersData
let localPlayerIndex = -1;

function renderTaskbarPlayers() {
    const container = document.getElementById('taskbarPlayers');
    container.innerHTML = '';
    playersData.forEach((p, i) => {
        const el = document.createElement('div');
        el.className = 'player-token' + (i === currentPlayerTurn ? ' active-turn' : '');
        el.style.background = p.color;
        el.title = p.name;
        container.appendChild(el);
    });
}

let timerSeconds = 0;
let timerInterval = null;

function startTimer() {
    timerInterval = setInterval(() => {
        timerSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function resetTimer() {
    timerSeconds = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const mm = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
    const ss = String(timerSeconds % 60).padStart(2, '0');
    document.getElementById('taskbarTimer').textContent = `${mm}:${ss}`;
}

// Called by board.js endTurn() and by test interval below
function setPlayerTurn(index) {
    currentPlayerTurn = index;
    renderTaskbarPlayers();
    resetTimer();
}

function isLocalPlayersTurn() {
    return localPlayerIndex >= 0 && currentPlayerTurn === localPlayerIndex;
}

function requestTurnEnd() {
    if (!roomCode || !sessionId) return;
    socket.emit('end_turn', { room: roomCode, session_id: sessionId });
}

function emitMoveToServer(row, col) {
    if (!roomCode || !sessionId) return;
    socket.emit('move_player', { room: roomCode, session_id: sessionId, r: row, c: col });
}

function updateDiceModalForTurn() {
    if (isLocalPlayersTurn()) {
        openDiceModal();
    } else {
        closeDiceModal();
    }
}

function setLocalPlayerIndexFromServerPlayers(serverPlayers) {
    if (!sessionId || !Array.isArray(serverPlayers)) return;
    const idx = serverPlayers.findIndex(p => p.session_id === sessionId);
    if (idx >= 0) {
        localPlayerIndex = idx;
    }
}

function leaveGame() {
    if (confirm('Are you sure you want to leave the game?')) {
        window.location.href = 'menu.html';
    }
}

/* ── Panels ── */
function togglePanel(panel) {
    if (panel === 'left') {
        document.getElementById('panelLeft').classList.toggle('active');
        document.querySelector('.tab-left').classList.toggle('active');
    } else if (panel === 'right') {
        document.getElementById('panelRight').classList.toggle('active');
        document.querySelector('.tab-right').classList.toggle('active');
    } else if (panel === 'bottom') {
        document.getElementById('panelBottom').classList.toggle('active');
        document.querySelector('.tab-bottom').classList.toggle('active');
    }
}

/* ── Findings ── */
function generateFindings() {
    const el = document.getElementById('findingsContent');
    el.innerHTML = '';
    findings.forEach((f, i) => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="checkbox-container">
                <input type="checkbox" id="finding-${i}" onchange="handleCheckbox(${i})">
                <label for="finding-${i}" class="checkbox-label">${f}</label>
            </div>`;
        el.appendChild(item);
    });
}

function handleCheckbox(number) {
    // placeholder
}

/* ── Cards ── */
function generateCards() {
    const el = document.getElementById('cardsContent');
    el.innerHTML = '';

    if (myCards.length === 0) {
        el.innerHTML = '<div class="empty-state">Waiting for cards...</div>';
        return;
    }

    myCards.forEach(prefixedCard => {
        const name = prefixedCard.slice(1); // "WKnife" → "Knife"
        const card = document.createElement('div');
        card.className = 'card-item';
        card.textContent = name;
        el.appendChild(card);
    });
}

/* ── Inbox / Letters ── */
function generateLettersRecieved() {
    const el = document.getElementById('inboxContent');
    el.innerHTML = '';
    if (letters.length === 0) {
        el.innerHTML = '<div class="empty-state">No messages</div>';
        return;
    }
    letters.forEach((letter, index) => {
        const item = document.createElement('div');
        item.className = 'letter-item' + (letter.read ? '' : ' unread');
        item.innerHTML = `
            <div class="letter-header">From: ${letter.sender}</div>
            <div class="letter-preview">${letter.suspect}, ${letter.weapon}, ${letter.room}</div>`;
        item.onclick = () => openLetter(index);
        el.appendChild(item);
    });
}

function openLetter(id) {
    const letter = letters[id];
    currentLetterId = id;
    if (!letter.read) { letter.read = true; generateLettersRecieved(); }
    document.getElementById('modalTitle').textContent = `Letter from ${letter.sender}`;
    document.getElementById('modalBody').innerHTML = `
        <div class="letter-info"><strong>From:</strong> ${letter.sender}</div>
        <div class="letter-info"><strong>To:</strong> ${letter.recipient}</div>
        <div class="letter-info"><strong>Suspect:</strong> ${letter.suspect}</div>
        <div class="letter-info"><strong>Weapon:</strong> ${letter.weapon}</div>
        <div class="letter-info"><strong>Room:</strong> ${letter.room}</div>`;
    document.getElementById('letterModal').classList.add('active');
}

function closeLetterModal() {
    document.getElementById('letterModal').classList.remove('active');
    currentLetterId = null;
}

function addLetter(sender, recipient, suspect, weapon, room) {
    letters.push({ sender, recipient, suspect, weapon, room, read: false });
    generateLettersRecieved();
}

//function createTestLetter() { // placeholder — remove when linking!!
//    addLetter("Professor Plum", "You", "Miss Scarlet", "Candlestick", "Library");
//}

/* ── Reply ── */
let selectedReplyCard = undefined;

function replyToLetter() {
    if (currentLetterId === null) return;
    const letter = letters[currentLetterId];
    document.getElementById('replyModalTitle').textContent = `Reply to ${letter.sender}`;
    const container = document.getElementById('replyCardsContainer');
    container.innerHTML = '';
    selectedReplyCard = undefined;

    const noneEl = document.createElement('div');
    noneEl.className = 'reply-card-none';
    noneEl.textContent = 'No card';
    noneEl.dataset.value = '__none__';
    noneEl.onclick = () => selectReplyCard(noneEl);
    container.appendChild(noneEl);

    myCards.forEach(prefixedCard => {
    const cardName = prefixedCard.slice(1);  // strip W/R/S prefix
    const el = document.createElement('div');
    el.className = 'reply-card-option';
    el.textContent = cardName;
    el.dataset.value = cardName;
    el.onclick = () => selectReplyCard(el);
    container.appendChild(el);
});

    closeLetterModal();
    document.getElementById('replyModal').classList.add('active');
}

function selectReplyCard(el) {
    document.querySelectorAll('.reply-card-option, .reply-card-none').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    selectedReplyCard = el.dataset.value;
}

function sendReply() {
    if (selectedReplyCard === undefined) {
        const c = document.getElementById('replyCardsContainer');
        c.style.outline = '2px solid red';
        setTimeout(() => c.style.outline = '', 800);
        return;
    }
    const container      = document.getElementById('replyCardsContainer');
    const senderSession  = container.dataset.senderSession;
    const responderName  = container.dataset.responderName;

    socket.emit('letter_reply', {
        room:           roomCode,
        card_shown:     selectedReplyCard === '__none__' ? null : selectedReplyCard,
        sender_session: senderSession,
        responder_name: responderName
    });
    closeReplyModal();
}

function closeReplyModal() {
    document.getElementById('replyModal').classList.remove('active');
    selectedReplyCard = undefined;
}

/* ── Send Letter Modal ── */
function openSendLetterModal() {
    document.getElementById('selectSuspect').value = '';
    document.getElementById('selectWeapon').value  = '';
    document.getElementById('selectRoom').value    = '';
    document.getElementById('sendLetterError').textContent = '';
    document.getElementById('sendLetterModal').classList.add('active');
}

function closeSendLetterModal() {
    document.getElementById('sendLetterModal').classList.remove('active');
}

function submitSendLetter() {
    const suspect = document.getElementById('selectSuspect').value;
    const weapon  = document.getElementById('selectWeapon').value;
    const room    = document.getElementById('selectRoom').value;
    if (!suspect || !weapon || !room) {
        document.getElementById('sendLetterError').textContent = 'Please select a suspect, weapon, and room.';
        return;
    }
    // Emit to server instead of handling locally
    socket.emit('send_letter', {
        room:       roomCode,
        session_id: sessionId,
        suspect:    suspect,
        weapon:     weapon,
        room_name:  room
    });
    closeSendLetterModal();
    requestTurnEnd();
}

/* ── Final Guess Modal ── */
function openFinalGuessModal() {
    document.getElementById('guessSuspect').value = '';
    document.getElementById('guessWeapon').value  = '';
    document.getElementById('guessRoom').value    = '';
    document.getElementById('finalGuessError').textContent = '';
    document.getElementById('finalGuessModal').classList.add('active');
}

function closeFinalGuessModal() {
    document.getElementById('finalGuessModal').classList.remove('active');
}

function submitFinalGuess() {
    const suspect = document.getElementById('guessSuspect').value;
    const weapon  = document.getElementById('guessWeapon').value;
    const room    = document.getElementById('guessRoom').value;
    if (!suspect || !weapon || !room) {
        document.getElementById('finalGuessError').textContent = 'Please select a suspect, weapon, and room.';
        return;
    }
    closeFinalGuessModal();
    // TODO: send accusation to server and check against solution
}

/* ── Win / Lose ── */

// ── LEADERBOARD ENTRY ──────────────────────────────────────────────────────
// Backend: read `leaderboardEntry` after calling showResult(true, username).
// Format: [username, timeInSeconds]  e.g. ["Miss Scarlet", 142]
let leaderboardEntry = null;
// ──────────────────────────────────────────────────────────────────────────

function showResult(won, username) {
    if (won) leaderboardEntry = [username, timerSeconds];
    document.getElementById('resultTitle').textContent   = won ? '🎉 You Win!'  : '💀 You Lose!';
    document.getElementById('resultMessage').textContent = won
        ? `Congratulations ${username}! You cracked the case in ${formatTime(timerSeconds)}.`
        : `Better luck next time, ${username}. The truth remains hidden…`;
    document.getElementById('resultModal').classList.add('active');
}

function closeResultModal() {
    document.getElementById('resultModal').classList.remove('active');
}

function formatTime(s) {
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
}

/* ── Dice Roll ── */
const DICE_PATTERNS = {
    1: [[1,1]],
    2: [[0,0],[2,2]],
    3: [[0,0],[1,1],[2,2]],
    4: [[0,0],[0,2],[2,0],[2,2]],
    5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
    6: [[0,0],[0,2],[1,0],[1,2],[2,0],[2,2]]
};

function renderDiceDots(n) {
    const face = document.getElementById('diceFace');
    face.innerHTML = '';
    const grid = Array.from({ length: 9 }, () => {
        const d = document.createElement('div');
        d.className = 'dot hidden';
        face.appendChild(d);
        return d;
    });
    DICE_PATTERNS[n].forEach(([r, c]) => grid[r * 3 + c].classList.remove('hidden'));
}

function rollDice() {
    if (!isLocalPlayersTurn()) return;
    const btn    = document.getElementById('diceRollBtn');
    const face   = document.getElementById('diceFace');
    const result = document.getElementById('diceResult');
    btn.disabled = true;
    result.textContent = '';

    let ticks = 0;
    const interval = setInterval(() => {
        renderDiceDots(Math.ceil(Math.random() * 6));
        ticks++;
        if (ticks >= 10) {
            clearInterval(interval);
            const final = Math.ceil(Math.random() * 6);
            renderDiceDots(final);
            face.classList.remove('shaking');
            void face.offsetWidth;
            face.classList.add('shaking');
            result.textContent = `Rolling...`;
            btn.disabled = false;
            socket.emit('roll_dice', { room: roomCode, session_id: sessionId });
        }
    }, 55);
}

function openDiceModal() {
    renderDiceDots(1);
    document.getElementById('diceResult').textContent = '';
    document.getElementById('diceModal').classList.add('active');
}

function closeDiceModal() {
    document.getElementById('diceModal').classList.remove('active');
}

socket.on('deal_hand', function(data) {
    myCards = data.hand;
    generateCards();
});

/* ── Init ── */
generateFindings();
generateCards();
//createTestLetter(); // placeholder — remove when linking!!
renderTaskbarPlayers();
startTimer();

socket.on('session_created', (data) => {
    sessionId = data.session_id;
    localStorage.setItem('session_id', sessionId);
    if (roomCode) {
        socket.emit('join_board', { room: roomCode, session_id: sessionId });
    }
});

socket.on('session_valid', (data) => {
    sessionId = data.session_id;
    if (roomCode) {
        socket.emit('join_board', { room: roomCode, session_id: sessionId });
    }
});

socket.on('session_invalid', () => {
    localStorage.removeItem('session_id');
    sessionId = null;
    socket.emit('request_session');
});

socket.on('board_update', (data) => {
    setLocalPlayerIndexFromServerPlayers(data.players);
    if (typeof applyServerPlayers === 'function') {
        applyServerPlayers(data.players);
    }
});

socket.on('turn_update', (data) => {
    if (typeof setBoardTurn === 'function') {
        setBoardTurn(data.turn_index);
    } else {
        setPlayerTurn(data.turn_index);
    }
    updateDiceModalForTurn();
});

socket.on('dice_rolled', (data) => {
    const isMine = data.session_id === sessionId;
    const result = document.getElementById('diceResult');
    result.textContent = isMine
        ? `You rolled a ${data.roll}`
        : `${data.player_name} rolled a ${data.roll}`;

    renderDiceDots(data.roll);

    if (isMine) {
        startMovement(data.roll);
        closeDiceModal();
    }
});

socket.on('error_msg', (data) => {
    alert(data.msg);
});

// Server is asking YOU to respond to someone else's suggestion
socket.on('letter_request', function(data) {
    // data: { from_name, suspect, weapon, room, your_matching_cards, sender_session }
    const container = document.getElementById('replyCardsContainer');
    container.innerHTML = '';
    document.getElementById('replyModalTitle').textContent = `Reply to ${data.from_name}`;

    // Store sender session so we can send it back with the reply
    container.dataset.senderSession  = data.sender_session;
    container.dataset.responderName  = // your own name
        (playersData[localPlayerIndex] || {}).name || 'Unknown';

    selectedReplyCard = undefined;

    // Only show cards that actually match — the server already filtered these
    data.your_matching_cards.forEach(cardName => {
        const el         = document.createElement('div');
        el.className     = 'reply-card-option';
        el.textContent   = cardName;
        el.dataset.value = cardName;
        el.onclick       = () => selectReplyCard(el);
        container.appendChild(el);
    });

    document.getElementById('replyModal').classList.add('active');
});

// Server is telling YOU (the sender) what the result was
socket.on('letter_result', function(data) {
    // data: { responder_name, card_shown, nobody_disproved }
    let bodyHtml;
    if (data.nobody_disproved) {
        bodyHtml = '<p>Nobody could disprove your suggestion.</p>';
    } else {
        bodyHtml = `<p><strong>${data.responder_name}</strong> showed you: <strong>${data.card_shown || 'no card'}</strong></p>`;
    }
    document.getElementById('modalTitle').textContent = 'Letter Result';
    document.getElementById('modalBody').innerHTML    = bodyHtml;
    // Hide the Reply button — this is a results view
    document.querySelector('#letterModal .modal-button.primary').style.display = 'none';
    document.getElementById('letterModal').classList.add('active');
});

if (sessionId) {
    socket.emit('validate_session', { session_id: sessionId });
} else {
    socket.emit('request_session');
}