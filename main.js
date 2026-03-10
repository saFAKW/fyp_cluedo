const cards = []; 

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
        cardItem.className = cards[i];
        cardItem.textContent = cards[i];
        cardsContent.appendChild(cardItem);
    }
}

function generateLettersSend(type) {
    pass
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

function replyToLetter() {
    if (currentLetterId !== null) {
        const letter = letters[currentLetterId];
        alert(`Replying to ${letter.sender}...`);
        closeLetterModal();
    }
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
createTestLetter();
