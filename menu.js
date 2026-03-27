/* ════════════════════════════════════════
   MENU.JS — main menu logic + background music
════════════════════════════════════════ */

// ── Background music — loops indefinitely on the main menu ──
const menuMusic = new Audio("montogoronto-short-percussive-orchestral-tension-v02-481586.mp3");
menuMusic.loop = true;
menuMusic.volume = 0.55; // comfortable background level

// Browsers block autoplay until the user has interacted with the page.
// We attempt to play immediately, then fall back to playing on the first
// user interaction if the browser blocks it.
function startMenuMusic() {
    menuMusic.play().catch(() => {
        // Autoplay blocked — wait for any interaction then start
        const unlock = () => {
            menuMusic.play().catch(() => {});
            document.removeEventListener('click',     unlock);
            document.removeEventListener('keydown',   unlock);
            document.removeEventListener('touchstart', unlock);
        };
        document.addEventListener('click',      unlock, { once: true });
        document.addEventListener('keydown',    unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true });
    });
}

// Session management
const socket = io(window.location.origin);
let sessionId = null;

window.addEventListener('DOMContentLoaded', function () {
    initializeSession();
    startMenuMusic();
});

function initializeSession() {
    const storedSession = localStorage.getItem('session_id');
    if (storedSession) {
        socket.emit('validate_session', { session_id: storedSession });
    } else {
        socket.emit('request_session');
    }
}

socket.on('session_created', function (data) {
    sessionId = data.session_id;
    localStorage.setItem('session_id', sessionId);
});

socket.on('session_valid', function (data) {
    sessionId = data.session_id;
});

socket.on('session_invalid', function () {
    localStorage.removeItem('session_id');
    socket.emit('request_session');
});

let slideIndex = 1;
let slideInterval = null;

let suspects = ["Peacock", "Mustard", "Green", "Orchid", "Scarlett", "Plum"];
let weapons  = ["Candelabra", "Wrench", "Pistol", "Rope", "Pipe"];
let rooms    = ["Kitchen", "Conservatory", "Dining Room", "Lounge", "Hall", "Study", "Library"];

let k_char   = "Orchid";
let counter1 = 0;

let k_weapon = "Candelabra";
let counter2 = 0;

let k_room   = "Kitchen";
let counter3 = 0;

let char, c_text, weapon, w_text, r_text, c1, c2, c3;

function changeLabel(type) {
    if (type === "c") {
        for (let i = 0; i < suspects.length; i++) {
            if (k_char === suspects[i]) {
                const png_text = "assets/" + suspects[i] + ".png";
                if (c_text)  c_text.textContent = suspects[i];
                if (char)  { char.setAttribute('src', png_text); char.setAttribute('alt', suspects[i]); }
                if (c1)      c1.textContent = counter1;
                return;
            }
        }
    } else if (type === "w") {
        for (let i = 0; i < weapons.length; i++) {
            if (k_weapon === weapons[i]) {
                const png_text = "assets/" + weapons[i] + ".png";
                if (w_text)   w_text.textContent = weapons[i];
                if (weapon) { weapon.setAttribute('src', png_text); weapon.setAttribute('alt', weapons[i]); }
                if (c2)       c2.textContent = counter2;
                return;
            }
        }
    } else if (type === "r") {
        for (let i = 0; i < rooms.length; i++) {
            if (k_room === rooms[i]) {
                if (r_text) r_text.textContent = rooms[i];
                if (c3)     c3.textContent = counter3;
                return;
            }
        }
    }
}

function plusSlides(n)    { showSlides(slideIndex += n); }
function currentSlide(n)  { showSlides(slideIndex = n); }

function showSlides(n) {
    let slides = document.getElementsByClassName("mySlides");
    let dots   = document.getElementsByClassName("dot");
    if (slides.length === 0) return;
    if (n > slides.length) { slideIndex = 1; }
    if (n < 1)             { slideIndex = slides.length; }

    const track = document.querySelector('.slideshow-track');
    if (track) {
        const offset = (slideIndex - 1) * 100;
        track.style.transform = `translateX(-${offset}%)`;
    }

    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    if (dots[slideIndex - 1]) dots[slideIndex - 1].className += " active";
}

document.addEventListener('DOMContentLoaded', function () {
    showSlides(slideIndex);
    slideInterval = setInterval(function () { plusSlides(1); }, 4000);

    char   = document.getElementById('img1');
    c_text = document.getElementById('name');
    weapon = document.getElementById('img2');
    w_text = document.getElementById('weapon-text');
    r_text = document.getElementById('room');
    c1     = document.getElementById('count1');
    c2     = document.getElementById('count2');
    c3     = document.getElementById('count3');

    changeLabel('c');
    changeLabel('w');
    changeLabel('r');

    const container = document.querySelector('.slideshow-container');
    if (container) {
        container.addEventListener('mouseenter', () => { if (slideInterval) clearInterval(slideInterval); });
        container.addEventListener('mouseleave', () => { slideInterval = setInterval(function () { plusSlides(1); }, 4000); });
    }
});