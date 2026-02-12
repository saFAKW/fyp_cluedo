// Session management
const socket = io();
let sessionId = null;

// Check for existing session on page load
window.addEventListener('DOMContentLoaded', function () {
  initializeSession();
});

function initializeSession() {
  // Try to get session from localStorage
  const storedSession = localStorage.getItem('session_id');

  if (storedSession) {
    // Validate with server
    socket.emit('validate_session', { session_id: storedSession });
  } else {
    // Request new session
    socket.emit('request_session');
  }
}

// Handle new session creation
socket.on('session_created', function (data) {
  sessionId = data.session_id;
  localStorage.setItem('session_id', sessionId);
  console.log('New session created:', sessionId);
});

// Handle session validation response
socket.on('session_valid', function (data) {
  sessionId = data.session_id;
  console.log('Session validated:', sessionId);
});

// Handle invalid session
socket.on('session_invalid', function () {
  console.log('Session invalid, requesting new one');
  localStorage.removeItem('session_id');
  socket.emit('request_session');
});

let slideIndex = 1;
let slideInterval = null;

let suspects = ["Peacock", "Mustard", "Green", "Orchid", "Scarlett", "Plum"];
let weapons = ["Candelabra", "Wrench", "Pistol", "Rope", "Pipe"];
let rooms = ["Kitchen", "Conservatory", "Dining Room", "Lounge", "Hall", "Study", "Library"];

//these will be replaced by the backend configurations later in dev
let k_char = "Orchid";
let counter1 = 0;

let k_weapon = "Candelabra";
let counter2 = 0;

let k_room = "Kitchen";
let counter3 = 0;

// Elements will be queried after DOM ready
let char, c_text, weapon, w_text, r_text, c1, c2, c3;

//make the photo and text dependent on some other variable to mimic backend relation for stats
function changeLabel(type) {
  if (type === "c") {
    for (let i = 0; i < suspects.length; i++) {
      if (k_char === suspects[i]) {
        const png_text = "assets/" + suspects[i] + ".png"; // use name-based filename
        if (c_text) c_text.textContent = suspects[i];
        if (char) { char.setAttribute('src', png_text); char.setAttribute('alt', suspects[i]); }
        if (c1) c1.textContent = counter1;
        return;
      }
    }
    console.warn("Char not found:", k_char);

  } else if (type === "w") {
    for (let i = 0; i < weapons.length; i++) {
      if (k_weapon === weapons[i]) {
        const png_text = "assets/" + weapons[i] + ".png";
        if (w_text) w_text.textContent = weapons[i];
        if (weapon) { weapon.setAttribute('src', png_text); weapon.setAttribute('alt', weapons[i]); }
        if (c2) c2.textContent = counter2;
        return;
      }
    }
    console.warn("Weapon not found:", k_weapon);

  } else if (type === "r") {
    for (let i = 0; i < rooms.length; i++) {
      if (k_room === rooms[i]) {
        if (r_text) r_text.textContent = rooms[i];
        if (c3) c3.textContent = counter3;
        return;
      }
    }
    console.warn("Room not found:", k_room);
  }
}

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (slides.length === 0) return;
  if (n > slides.length) { slideIndex = 1; }
  if (n < 1) { slideIndex = slides.length; }

  // move the track to show the active slide
  const track = document.querySelector('.slideshow-track');
  if (track) {
    const offset = (slideIndex - 1) * 100;
    track.style.transform = `translateX(-${offset}%)`;
  }

  // update dots active state
  for (let i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  if (dots[slideIndex - 1]) dots[slideIndex - 1].className += " active";
}

// Initialize after DOM is ready and start automatic carousel
document.addEventListener('DOMContentLoaded', function () {
  showSlides(slideIndex);
  // auto-advance every 4 seconds
  slideInterval = setInterval(function () { plusSlides(1); }, 4000);

  // Elements for stats/labels — query after DOM ready
  char = document.getElementById('img1');
  c_text = document.getElementById('name');
  weapon = document.getElementById('img2');
  w_text = document.getElementById('weapon-text');
  r_text = document.getElementById('room');

  c1 = document.getElementById('count1');
  c2 = document.getElementById('count2');
  c3 = document.getElementById('count3');

  // initialize labels
  changeLabel('c');
  changeLabel('w');
  changeLabel('r');

  // Optional: pause on mouseenter and resume on mouseleave for slideshow container
  const container = document.querySelector('.slideshow-container');
  if (container) {
    container.addEventListener('mouseenter', () => { if (slideInterval) clearInterval(slideInterval); });
    container.addEventListener('mouseleave', () => { slideInterval = setInterval(function () { plusSlides(1); }, 4000); });
  }
});