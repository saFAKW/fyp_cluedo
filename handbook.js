// ── Page content per book
// Each entry is the HTML for one page. Index = page number - 1.

const pageContents = {

  // Rules book (book index 0) — 5 pages
  0: [

    // Page 1 — Board rules + Handouts
    `<h2>Basic Rules – The Board</h2>
     <p>The game takes place on a board representing Dr White's Manor, made up of hallways and rooms.</p>
     <p>Players take turns moving their character around the board to investigate different areas of the house.</p>
     <h3>Movement Rules</h3>
     <ul class="star-list">
       <li>Players may move one space at a time along the pathways based off a dice roll.</li>
       <li>Movement is allowed forward, backward, left, or right.</li>
       <li>Diagonal movement is not allowed.</li>
       <li>Players cannot move through walls or blocked spaces.</li>
       <li>Rooms can only be entered through their designated doorways.</li>
     </ul>
     <p>Exploring new rooms will help you gather important information about the events of that night.</p>
     <p>Plan your movements carefully, as reaching the right room at the right time may reveal the clue you need.</p>
     <div class="gap"></div>
     <h2>Handouts</h2>
     <p>Each player will have access to the following:</p>
     <ul class="star-list">
       <li>A record sheet</li>
       <li>Up to 5 cards with info on who, what or where the murder <strong>didn't</strong> happen</li>
       <li>An Inbox holding a history of letters that players send between each other in game</li>
     </ul>`,

    // Page 2 — Full Record Sheet
    `<h2>The Record Sheet</h2>
     <p>Each player receives a Record Sheet at the beginning of the game.</p>
     <p>The Record Sheet is your personal detective notebook. It is where you will track clues, record information, and eliminate possibilities as you investigate the mystery of Mr White's death.</p>
     <h3>As the game progresses, write down:</h3>
     <ul class="star-list">
       <li>Rooms you have investigated</li>
       <li>Suspects that have been mentioned or ruled out</li>
       <li>Possible weapons involved in the crime</li>
       <li>Information you receive from other players, including responses from the Letter System</li>
     </ul>
     <p>By carefully keeping records, you can begin to <strong>narrow down the possibilities</strong> and identify what information is still missing.</p>
     <p>Your Record Sheet is private and should not be shown to other players during the game.</p>
     <p>Keeping clear and organised notes is one of the most important skills in <em>Who Dunnit?</em>. The better your records, the easier it will be to connect the clues and uncover the truth.</p>`,

    // Page 3 — The Letter System
    `<h2>The Letter System</h2>
     <p>During your turn, you may choose to send a letter to another player.</p>
     <p>A letter allows you to privately ask one player a question related to the mystery. This could involve:</p>
     <ul class="star-list">
       <li>A room</li>
       <li>A suspect</li>
       <li>A possible weapon</li>
       <li>Information they may have discovered</li>
     </ul>
     <p>When a player receives a letter, they must respond truthfully.</p>
     <h3>The Rules of the Manor</h3>
     <ul class="star-list">
       <li>No lying is allowed.</li>
       <li>Players must answer honestly based on the information they possess.</li>
       <li>Fair play is essential to solving the mystery.</li>
     </ul>
     <p>Use the letter system wisely. Asking the right question to the right person could bring you one step closer to discovering who dunnit!</p>`,

    // Page 4 — Final Accusations
    `<h2>Final Accusations</h2>
     <p>At any point during the game, if you believe you have solved the mystery, you may make a Final Accusation.</p>
     <p>A Final Accusation must clearly state three things:</p>
     <ul class="star-list">
       <li>Who committed the crime</li>
       <li>Where the crime took place</li>
       <li>What was used to commit the crime</li>
     </ul>
     <p>When making your accusation, announce your answer to the group. The solution is then checked to see if you are correct.</p>
     <h3>Important Rules</h3>
     <ul class="star-list">
       <li>Only make a final accusation when you are confident in your deduction.</li>
       <li>If your accusation is <strong>incorrect</strong>, you are eliminated from making further accusations for the rest of the game.</li>
       <li>However, you may still remain in the game and continue moving and gathering information.</li>
     </ul>
     <p>Making a careful and well-timed accusation is key. Guessing too early could cost you the chance to win.</p>`,

    // Page 5 — Winning + Leaderboard
    `<h2>Winning the Game</h2>
     <p>The game is won by the player who correctly solves the mystery of Mr White's death. To win, a player must successfully identify:</p>
     <ul class="star-list">
       <li>The culprit</li>
       <li>The location of the crime</li>
       <li>The weapon used</li>
     </ul>
     <p>Once the correct solution is revealed, the mystery is solved and the game ends.</p>
     <hr class="divider"/>
     <h2>Leaderboard</h2>
     <p>This version of <em>Who Dunnit?</em> also tracks how quickly players solve the mystery.</p>
     <ul class="star-list">
       <li>The timer begins when the game starts.</li>
       <li>The player who makes the <strong>correct final accusation</strong> records their completion time.</li>
       <li>Faster times earn a higher ranking.</li>
     </ul>
     <p>Players who solve the mystery quickly may earn a place on the public leaderboard. Study the clues, question the guests, and move wisely. Only the sharpest investigators will uncover the truth.</p>`,
  ],

  // Story & Character Profiles book (book index 1) — 2 pages
  1: [

    // Page 1 — Overview and Introduction
    `<h2>Overview and Introduction</h2>
     <h3>Welcome to Who Dunnit?</h3>
     <p>Last night, the wealthy and eccentric Mr White was found dead in his grand manor. Only hours earlier, the house had been alive with laughter, music, and celebration. Now the halls are silent, and the truth is buried somewhere within its many rooms.</p>
     <p>You and the other guests were all present that night. Each of you received a mysterious invitation asking you to return to the manor to uncover what really happened.</p>
     <p>Somewhere in the house lies the answer to three questions:</p>
     <ul class="star-list">
       <li>Who committed the crime?</li>
       <li>Where did it happen?</li>
       <li>How was it done?</li>
     </ul>
     <p>By moving through the manor and investigating its rooms, you must gather clues and eliminate possibilities. The other players are doing the same, so pay attention to what they discover.</p>
     <p>Search carefully, think logically, and trust no assumption.</p>
     <p><strong>Only one player will solve the mystery of Mr White's death.</strong></p>`,

    // Page 2 — Character Bios
    `<h2>Character Bios</h2>
     <h3>Miss Scarlet</h3>
     <p>A clever and confident socialite known for her sharp wit and mysterious past. Miss Scarlet is always watching closely and rarely reveals more than she intends.</p>
     <h3>Colonel Mustard</h3>
     <p>A decorated military officer with a booming voice and a commanding presence. Years of strategy and discipline make him a formidable thinker in the search for the truth.</p>
     <h3>Mrs Peacock</h3>
     <p>A wealthy and influential aristocrat who prides herself on reputation and status. Behind her polite manners lies a keen observer of everything happening in the room.</p>
     <h3>Professor Plum</h3>
     <p>A brilliant academic with a mind full of theories and possibilities. His curiosity often leads him to uncover clues others might overlook.</p>
     <h3>Reverend Green</h3>
     <p>A seemingly respectable man of faith who always appears calm and composed. However, some wonder if his quiet nature hides more than it reveals.</p>
     <h3>Dr Orchid</h3>
     <p>A brilliant scientist raised within the walls of the manor itself, Dr White's apprentice. Intelligent and observant, Dr Orchid approaches every mystery with careful logic.</p>`,
  ]
};

// ── Book metadata
const books = [
  { title: 'Rules',                         color: 'green', pages: 5, w: 120, h: 210, spine: 24 },
  { title: 'Story &amp; Character Profiles', color: 'red',   pages: 2, w: 120, h: 210, spine: 24 },
];

let activeBook = null;
let currentSpread = 0;

// ── Focus a book (zoom it to centre of screen)
function focusBook(idx) {
  activeBook = idx;
  const b = books[idx];
  const container = document.getElementById('focusBookContainer');
  const bgColor    = b.color === 'green' ? '#1a3a2a' : '#3a0f0f';
  const spineColor = b.color === 'green' ? '#122a1e' : '#2a0808';
  const spineLabel = b.color === 'red' ? 'Story & Characters' : b.title;

  container.innerHTML = `
    <div style="position:relative;width:${b.w * 1.9}px;height:${b.h * 1.9}px;transform-style:preserve-3d;">
      <div style="
        position:absolute;top:0;left:0;
        width:${b.spine * 1.9}px;height:100%;
        transform-origin:right center;
        transform:rotateY(-90deg) translateX(${-b.spine * 1.9}px);
        display:flex;align-items:center;justify-content:center;
        background:${spineColor};
      ">
        <span style="font-family:'Cinzel',serif;font-size:11px;font-weight:600;
          letter-spacing:0.15em;writing-mode:vertical-lr;transform:rotate(180deg);
          color:#d4af5a;">${spineLabel}</span>
      </div>
      <div style="
        position:absolute;inset:0;
        display:flex;align-items:center;justify-content:center;
        background:${bgColor};overflow:hidden;
      ">
        <div style="position:absolute;inset:14px;border:1px solid rgba(184,150,46,0.35);pointer-events:none;"></div>
        <div style="position:absolute;inset:20px;border:1px solid rgba(184,150,46,0.15);pointer-events:none;"></div>
        <div style="font-family:'Cinzel',serif;font-weight:600;font-size:clamp(13px,1.4vw,17px);
          color:#d4af5a;text-align:center;letter-spacing:0.1em;line-height:1.6;padding:0 20px;">
          ${b.title}
        </div>
      </div>
    </div>`;

  document.getElementById('shelf').classList.add('focused');
  document.getElementById('libraryTitle').classList.add('hidden');
  document.getElementById('subtitle').classList.add('hidden');
  document.getElementById('focusStage').classList.add('active');
  document.getElementById('btnClose').classList.add('active');
  setTimeout(() => document.getElementById('hint').classList.add('active'), 500);
}

// ── Return to shelf from focus view
function closeFocus() {
  activeBook = null;
  document.getElementById('focusStage').classList.remove('active');
  document.getElementById('btnClose').classList.remove('active');
  document.getElementById('hint').classList.remove('active');
  document.getElementById('shelf').classList.remove('focused');
  document.getElementById('libraryTitle').classList.remove('hidden');
  document.getElementById('subtitle').classList.remove('hidden');
}

// ── Open the focused book to its pages
function openBook() {
  if (activeBook === null) return;
  currentSpread = 0;
  document.getElementById('hint').classList.remove('active');
  document.getElementById('focusStage').classList.remove('active');
  document.getElementById('btnClose').classList.remove('active');
  document.getElementById('openBookStage').classList.add('active');
  document.getElementById('pageNav').classList.add('active');
  document.getElementById('btnCloseBook').classList.add('active');
  renderSpread();
}

// ── Render the current page spread
function renderSpread() {
  const b        = books[activeBook];
  const contents = pageContents[activeBook];
  const total    = b.pages;
  const lNum     = currentSpread * 2 + 1;
  const rNum     = currentSpread * 2 + 2;

  document.getElementById('contentLeft').innerHTML   = lNum <= total ? (contents[lNum - 1] || '') : '';
  document.getElementById('pageNumLeft').textContent  = lNum <= total ? lNum : '';

  document.getElementById('contentRight').innerHTML   = rNum <= total ? (contents[rNum - 1] || '') : '';
  document.getElementById('pageNumRight').textContent = rNum <= total ? rNum : '';
  document.getElementById('pageRight').style.opacity  = rNum <= total ? '1' : '0.35';

  const spreads = Math.ceil(total / 2);
  document.getElementById('pageIndicator').textContent = `${currentSpread + 1} / ${spreads}`;
  document.getElementById('btnPrev').disabled = currentSpread === 0;
  document.getElementById('btnNext').disabled = currentSpread >= spreads - 1;
}

// ── Turn to the next or previous spread
function turnPage(dir) {
  const spreads = Math.ceil(books[activeBook].pages / 2);
  currentSpread = Math.max(0, Math.min(spreads - 1, currentSpread + dir));
  const book = document.getElementById('openBook');
  book.style.transform = `scale(0.88) rotateY(${dir * 5}deg)`;
  setTimeout(() => {
    renderSpread();
    book.style.transform = `scale(0.9) rotateY(0deg)`;
  }, 200);
}

// ── Close the open book and return to shelf
function closeBook() {
  document.getElementById('openBookStage').classList.remove('active');
  document.getElementById('pageNav').classList.remove('active');
  document.getElementById('btnCloseBook').classList.remove('active');
  activeBook = null;
  document.getElementById('shelf').classList.remove('focused');
  document.getElementById('libraryTitle').classList.remove('hidden');
  document.getElementById('subtitle').classList.remove('hidden');
}