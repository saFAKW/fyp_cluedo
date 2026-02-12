// max 10 cards for each hand (incl. cluecards)
const cards = [
    "card",
    "card",
    "card",
    "card",
    "card"
];

// all items the user looks out for
const findings = [
    "Peacock","Plum","Mustard","Scarlett",
    "Candelabra","Wrench","Rope","Knife","Lead Pipe","Revolver",
    "Bathroom","Games Room","Dining Room","Kitchen","Master Bedroom","Study"
]

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
    cardsContent.innerHTML = '';

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
}

//generate letters recieved (Inbox)
function generateLettersRecieved() {
    const letterContent = "" //to be recieved via backend sending
    //letter must incl. name of sender, recipient, and the the three part information
    //Works like a button and when clicked reveals a pop up in the center of the screen showing info in a div
    //Pop up can be closed using a "close button"
    //Inbox has a "ding" noise when updated with a new letter and new letters have a yellow outline to show they aren't read yet
    //Keep all letter objects in a retrievable list that doesnt dissapear in the entire game.
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