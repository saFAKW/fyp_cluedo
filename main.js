// ── Taskbar ──────────────────────────────────────────────────────────────
const players = [
    { name: "Miss Scarlet",     color: "#D95F5F" },
    { name: "Colonel Mustard",  color: "#E6B830" },
    { name: "Dr. Orchid",       color: "#C96DB5" },
    { name: "Mrs. Peacock",     color: "#8AAEE0" },
    { name: "Reverend Green",   color: "#5BBF72" },
    { name: "Professor Plum",   color: "#7B4FA6" },
];

let currentPlayerTurn = 1; // index — change this to whoever's turn it is

function renderTaskbarPlayers() {
    const container = document.getElementById('taskbarPlayers');
    container.innerHTML = '';
    players.forEach((p, i) => {
        const el = document.createElement('div');
        el.className = 'player-token' + (i === currentPlayerTurn ? ' active-turn' : '');
        el.style.background = p.color;
        el.title = p.name;
        container.appendChild(el);
    });
}

// Timer
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

function setPlayerTurn(index) {
    currentPlayerTurn = index;
    renderTaskbarPlayers();
    resetTimer();
}

function leaveGame() {
    if (confirm('Are you sure you want to leave the game?')) {
        alert('You have left the game.');
    }
}

// ── End Taskbar ───────────────────────────────────────────────────────────



const findings = [
    "Kitchen", "Ballroom", "Conservatory", "Dining Room", "Lounge", "Hall", "Study", "Library", "Billiard Room",
    "Knife", "Revolver", "Rope", "Lead Pipe", "Wrench", "Candlestick",
    "Miss Scarlet", "Colonel Mustard", "Reverend Green", "Mrs. Peacock", "Professor Plum", "Dr. Orchid"
]

let letters = [];
let currentLetterId = null;

function generateFindings() {
    const findingsContent = document.getElementById('findingsContent');
    findingsContent.innerHTML = '';
    
    for (let i = 0; i <= (findings.length-1); i++) {
        const listItem = document.createElement('div');
        listItem.className = 'list-item';
        
        listItem.innerHTML = `
            <div class="checkbox-container">
                <input type="checkbox" id="finding-${i}" onchange="handleCheckbox(${i})">
                <label for="finding-${findings[i]}" class="checkbox-label">${findings[i]}</label>
            </div>
        `;
        
        findingsContent.appendChild(listItem);
    }
}

function generateCards() {
    const cardsContent = document.getElementById('cardsContent');
    cardsContent.innerHTML = ''; 

    for (let i=0; i <= (cards.length-1); i++){
        const cardItem = document.createElement('div');
        cardItem.className = 'card-item';
        cardItem.textContent = cards[i];
        cardsContent.appendChild(cardItem);
    }
}

function generateLettersRecieved() {
    const inboxContent = document.getElementById('inboxContent');
    
    inboxContent.innerHTML = '';
    
    if (letters.length === 0) {
        inboxContent.innerHTML = '<div class="empty-state">No messages</div>';
        return;
    }
    
    letters.forEach((letter, index) => {
        const letterItem = document.createElement('div');
        letterItem.className = 'letter-item';
        
        if (!letter.read) {
            letterItem.className += ' unread';
        }
        
        letterItem.innerHTML = `
            <div class="letter-header">From: ${letter.sender}</div>
            <div class="letter-preview">${letter.suspect}, ${letter.weapon}, ${letter.room}</div>
        `;
        
        letterItem.onclick = () => openLetter(index);
        
        inboxContent.appendChild(letterItem);
    });
}

function openLetter(letterId) {
    const letter = letters[letterId];
    currentLetterId = letterId;
    
    if (!letter.read) {
        letter.read = true;
        generateLettersRecieved(); 
    }
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `Letter from ${letter.sender}`;
    
    modalBody.innerHTML = `
        <div class="letter-info"><strong>From:</strong> ${letter.sender}</div>
        <div class="letter-info"><strong>To:</strong> ${letter.recipient}</div>
        <div class="letter-info"><strong>Suspect:</strong> ${letter.suspect}</div>
        <div class="letter-info"><strong>Weapon:</strong> ${letter.weapon}</div>
        <div class="letter-info"><strong>Room:</strong> ${letter.room}</div>
    `;
    
    const modal = document.getElementById('letterModal');
    modal.classList.add('active');
}

function closeLetterModal() {
    const modal = document.getElementById('letterModal');
    modal.classList.remove('active');
    currentLetterId = null;
}

let selectedReplyCard = undefined; // undefined = nothing chosen yet, null = "none" chosen

function openSendLetterModal() {
    document.getElementById('selectSuspect').value = '';
    document.getElementById('selectWeapon').value = '';
    document.getElementById('selectRoom').value = '';
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

    addLetter('You', 'All Players', suspect, weapon, room);
    closeSendLetterModal();
}

function openFinalGuessModal() {
    document.getElementById('guessSuspect').value = '';
    document.getElementById('guessWeapon').value = '';
    document.getElementById('guessRoom').value = '';
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

/* ════════════════════════════════════════
   WIN / LOSE
════════════════════════════════════════ */

// ── LEADERBOARD ENTRY ──────────────────────────────────────────────────────
// Backend: read `leaderboardEntry` after calling showResult(true, username).
// Format: [username, timeInSeconds]  e.g. ["Miss Scarlet", 142]
let leaderboardEntry = null;
// ──────────────────────────────────────────────────────────────────────────

function showResult(won, username) {
    if (won) {
        leaderboardEntry = [username, timerSeconds];
    }

    document.getElementById('resultTitle').textContent  = won ? '🎉 You Win!'  : '💀 You Lose!';
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


function replyToLetter() {
    if (currentLetterId === null) return;
    const letter = letters[currentLetterId];

    // Set title
    document.getElementById('replyModalTitle').textContent = `Reply to ${letter.sender}`;

    // Build card options
    const container = document.getElementById('replyCardsContainer');
    container.innerHTML = '';
    selectedReplyCard = undefined;

    // "No card" option
    const noneEl = document.createElement('div');
    noneEl.className = 'reply-card-none';
    noneEl.textContent = 'No card';
    noneEl.dataset.value = '__none__';
    noneEl.onclick = () => selectReplyCard(noneEl);
    container.appendChild(noneEl);

    // One element per card in hand
    cards.forEach((cardName, i) => {
        const el = document.createElement('div');
        el.className = 'reply-card-option';
        el.textContent = cardName;
        el.dataset.value = cardName;
        el.onclick = () => selectReplyCard(el);
        container.appendChild(el);
    });

    // Close letter modal, open reply modal
    closeLetterModal();
    document.getElementById('replyModal').classList.add('active');
}

function selectReplyCard(el) {
    // Deselect all
    document.querySelectorAll('.reply-card-option, .reply-card-none').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    selectedReplyCard = el.dataset.value;
}

function sendReply() {
    if (selectedReplyCard === undefined) {
        // Nothing selected — nudge the user
        document.getElementById('replyCardsContainer').style.outline = '2px solid red';
        setTimeout(() => document.getElementById('replyCardsContainer').style.outline = '', 800);
        return;
    }
    closeReplyModal();
}

function closeReplyModal() {
    document.getElementById('replyModal').classList.remove('active');
    selectedReplyCard = undefined;
}

function addLetter(sender, recipient, suspect, weapon, room) {
    const newLetter = {
        sender: sender,
        recipient: recipient,
        suspect: suspect,
        weapon: weapon,
        room: room,
        read: false
    };
    
    letters.push(newLetter);
    generateLettersRecieved();
}

//placeholder function again, remove when linking!!
function createTestLetter() {
    addLetter(
        "Professor Plum",
        "You",
        "Miss Scarlet",
        "Candlestick",
        "Library"
    );
}

function togglePanel(panel) {
    const panelLeft = document.getElementById('panelLeft');
    const panelRight = document.getElementById('panelRight');
    const panelBottom = document.getElementById('panelBottom');
    const tabLeft = document.querySelector('.tab-left');
    const tabRight = document.querySelector('.tab-right');
    const tabBottom = document.querySelector('.tab-bottom');
    
    if (panel === 'left') {
        panelLeft.classList.toggle('active');
        tabLeft.classList.toggle('active');
    } else if (panel === 'right') {
        panelRight.classList.toggle('active');
        tabRight.classList.toggle('active');
    } else if (panel === 'bottom') {
        panelBottom.classList.toggle('active');
        tabBottom.classList.toggle('active');
    }
}

function handleCheckbox(number) {
    const checkbox = document.getElementById(`finding-${number}`);
}

generateFindings();
generateCards();
createTestLetter(); //placeholder, remember to remove when linking!!
renderTaskbarPlayers();
startTimer();

// ── TEST: cycle through players every 3 seconds — remove when linking!! ──
setInterval(() => {
    currentPlayerTurn = (currentPlayerTurn + 1) % players.length;
    setPlayerTurn(currentPlayerTurn);
}, 3000);

/* ════════════════════════════════════════
   DICE ROLL
════════════════════════════════════════ */
let player_turn = true; // set to true to show dice popup on load

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
    const grid = Array.from({length: 9}, () => {
        const d = document.createElement('div');
        d.className = 'dot hidden';
        face.appendChild(d);
        return d;
    });
    DICE_PATTERNS[n].forEach(([r, c]) => grid[r * 3 + c].classList.remove('hidden'));
}

function rollDice() {
    const btn = document.getElementById('diceRollBtn');
    const face = document.getElementById('diceFace');
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
            result.textContent = `You rolled a ${final}`;
            btn.disabled = false;
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

if (player_turn) openDiceModal();