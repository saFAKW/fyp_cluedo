// Sequence: cover(0), page-1(1), page-2(2), page-3(3), page-4(4), page-5(5)
// cur = index of the NEXT leaf to flip (0 = cover showing)
const TOTAL = 6; // cover + 5 inner pages
let cur = 0;

const leaves = [
  document.getElementById('cover'),
  document.getElementById('page-1'),
  document.getElementById('page-2'),
  document.getElementById('page-3'),
  document.getElementById('page-4'),
  document.getElementById('page-5'),
];

const prevBtn   = document.getElementById('prev-btn');
const nextBtn   = document.getElementById('next-btn');
const indicator = document.getElementById('indicator');

function setZIndexes() {
  leaves.forEach((leaf, i) => {
    if (i < cur) {
      // Flipped — park at back with low z-index
      leaf.style.zIndex = i + 1;
    } else {
      // Unflipped — stacked at front, cover on absolute top
      leaf.style.zIndex = TOTAL * 2 - i;
    }
  });
}

function updateNav() {
  prevBtn.disabled = cur === 0;
  nextBtn.disabled = cur === TOTAL;

  if (cur === 0)          indicator.textContent = 'Cover';
  else if (cur === TOTAL) indicator.textContent = 'Back Cover';
  else {
    const p = (cur - 1) * 2 + 1;
    indicator.textContent = `Page ${p} – ${p + 1}`;
  }
}

function nextPage() {
  if (cur < TOTAL) {
    leaves[cur].classList.add('flipped');
    cur++;
    setZIndexes();
    updateNav();
  }
}

function prevPage() {
  if (cur > 0) {
    cur--;
    leaves[cur].classList.remove('flipped');
    setZIndexes();
    updateNav();
  }
}

// Build editable rule lines for each section
const sections = ['1f', '1b', '2f', '2b', '3f', '3b', '4f', '4b', '5f'];
const placeholders = [
  'Write your introduction here...',
  'Write core rules here...',
  'Write conduct guidelines here...',
  'Write scoring details here...',
  'Write special conditions here...',
  'Write amendments here...',
  'Write notes & references here...',
  'Write closing remarks here...',
  'Write index entries here...',
];

sections.forEach((id, idx) => {
  const area = document.getElementById(`rules-${id}`);
  if (!area) return;
  for (let i = 0; i < 12; i++) {
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'rule-line';
    if (i === 0) inp.placeholder = placeholders[idx];
    area.appendChild(inp);
  }
});

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') nextPage();
  if (e.key === 'ArrowLeft')  prevPage();
});

// Initialise
setZIndexes();
updateNav();