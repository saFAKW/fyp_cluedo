// max 10 cards for each hand (incl. cluecards)
const cards = []; //filled in by Jed python program

// all items the user looks out for
const findings = [
    "Kitchen", "Ballroom", "Conservatory", "Dining Room", "Lounge", "Hall", "Study", "Library", "Billiard Room",
    "Knife", "Revolver", "Rope", "Lead Pipe", "Wrench", "Candlestick",
    "Miss Scarlet", "Colonel Mustard", "Reverend Green", "Mrs. Peacock", "Professor Plum", "Dr. Orchid"
]

// Store all received letters
let letters = [];
let currentLetterId = null;

//Generate correct number of players in main taskbar 
//Generate starting timer (count upwards)
//Generate dice roll

// Generate Findings items (12 items with checkboxes)
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

// Generate Cards items
function generateCards() {
    const cardsContent = document.getElementById('cardsContent');
    cardsContent.innerHTML = ''; //use the cardsShuffle.py to socket and collate a hand for a player

    for (let i=0; i <= (cards.length-1); i++){
        const cardItem = document.createElement('div');
        cardItem.className = cards[i];
        cardItem.textContent = cards[i];
        cardsContent.appendChild(cardItem);
    }
}

//generate Letters to send (two types)
//asking and replying
function generateLettersSend(type) {
    //type is either a reply or ask
    //after clicking a room, popup shows and 4 drop down options. player, room, weapon, and person to be checked
    //to reply, you click the letter IN INBOX that you want to reply to
    //letters in inbox when clicked ask player "view or reply" they pick accordingly
    //if view a letter, JUMP TO generateLettersRecieved()
    //to send, you click a room instead
    pass
}

//generate letters recieved (Inbox)
function generateLettersRecieved() {
    const inboxContent = document.getElementById('inboxContent');
    
    // Clear existing content
    inboxContent.innerHTML = '';
    
    // If no letters, show empty state
    if (letters.length === 0) {
        inboxContent.innerHTML = '<div class="empty-state">No messages</div>';
        return;
    }
    
    // Create letter items for each letter in the list
    letters.forEach((letter, index) => {
        const letterItem = document.createElement('div');
        letterItem.className = 'letter-item';
        
        // Add unread class if letter hasn't been read
        if (!letter.read) {
            letterItem.className += ' unread';
        }
        
        letterItem.innerHTML = `
            <div class="letter-header">From: ${letter.sender}</div>
            <div class="letter-preview">${letter.suspect}, ${letter.weapon}, ${letter.room}</div>
        `;
        
        // Add click handler to open the letter
        letterItem.onclick = () => openLetter(index);
        
        inboxContent.appendChild(letterItem);
    });
}

// Open a letter and show the modal
function openLetter(letterId) {
    const letter = letters[letterId];
    currentLetterId = letterId;
    
    // Mark letter as read and remove yellow outline
    if (!letter.read) {
        letter.read = true;
        generateLettersRecieved(); // Refresh the inbox to remove yellow outline
    }
    
    // Populate modal content
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
    
    // Show the modal
    const modal = document.getElementById('letterModal');
    modal.classList.add('active');
}

// Close the letter modal
function closeLetterModal() {
    const modal = document.getElementById('letterModal');
    modal.classList.remove('active');
    currentLetterId = null;
}

// Reply to the current letter
function replyToLetter() {
    if (currentLetterId !== null) {
        const letter = letters[currentLetterId];
        alert(`Replying to ${letter.sender}... (Reply code not ready yet)`);
        //Implement reply functionality
        closeLetterModal();
    }
}

// Add a new letter to the inbox (with optional "ding" sound)
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

    // const ding = new Audio('ding.mp3');
    // ding.play();
}

// Create a test letter for demonstration
function createTestLetter() {
    addLetter(
        "Professor Plum",
        "You",
        "Miss Scarlet",
        "Candlestick",
        "Library"
    );
}

// Toggle panel function
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

// Handle checkbox changes
function handleCheckbox(number) {
    const checkbox = document.getElementById(`finding-${number}`);
    console.log(`Finding ${number} is now ${checkbox.checked ? 'checked' : 'unchecked'}`);
}

// Initialize the panels
generateFindings();
generateCards();

// Create a test letter for demonstration
createTestLetter();