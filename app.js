/* =========================================================
   Valentine Arcade ❤️
   - SPA screens
   - Session-based progress (resets on a new "sitting")
   - Love Notes (reveal to show; next hides again)
   - Memory Match (photo pairs)
   - "Too small" guessing game
   - Final unlock
========================================================= */

/*
  RESET-EACH-SITTING STRATEGY:
  - Use sessionStorage (per-tab/per-session)
  - When she closes the browser/tab and returns later, progress resets automatically
*/
const STORAGE_KEY = "valentineArcade_session_v1";

const defaultState = () => ({
  completed: { notes: false, memory: false, guess: false },
  // Love Notes
  notesRevealedCount: 0,
  noteIndex: 0,
  noteIsRevealed: false
});

let state = loadState() ?? defaultState();

function saveState() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateProgressUI();
}

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* -------------------------
   Screen navigation
------------------------- */
const screens = ["homeScreen","notesScreen","memoryScreen","guessScreen","finalScreen"];

function showScreen(id){
  screens.forEach(s => document.getElementById(s).classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Screen-specific refreshes
  if (id === "notesScreen") renderNotesUI();
}

document.querySelectorAll("[data-screen]").forEach(btn => {
  btn.addEventListener("click", () => showScreen(btn.dataset.screen));
});

document.getElementById("notesBack").onclick = () => showScreen("homeScreen");
document.getElementById("memoryBack").onclick = () => showScreen("homeScreen");
document.getElementById("guessBack").onclick = () => showScreen("homeScreen");
document.getElementById("finalBack").onclick = () => showScreen("homeScreen");

/* -------------------------
   Progress + unlock logic
------------------------- */
function allComplete() {
  return state.completed.notes && state.completed.memory && state.completed.guess;
}

function updateProgressUI(){
  const badge = (id, done) => {
    const el = document.getElementById(id);
    el.classList.remove("text-bg-secondary","text-bg-success");
    el.classList.add(done ? "text-bg-success" : "text-bg-secondary");
  };

  badge("badgeNotes", state.completed.notes);
  badge("badgeMemory", state.completed.memory);
  badge("badgeGuess", state.completed.guess);
  badge("badgeFinal", allComplete());

  const finalBtn = document.getElementById("finalBtn");
  if (allComplete()) finalBtn.classList.remove("d-none");
  else finalBtn.classList.add("d-none");
}

updateProgressUI();

/* -------------------------
   Floating hearts background
------------------------- */
(function heartsBackground(){
  const container = document.querySelector(".hearts-bg");
  const hearts = ["❤","💗","💖","💘","💝"];
  function spawn(){
    const el = document.createElement("div");
    el.className = "heart";
    el.textContent = hearts[Math.floor(Math.random()*hearts.length)];
    el.style.left = Math.random()*100 + "vw";
    el.style.animationDuration = (6 + Math.random()*6) + "s";
    el.style.fontSize = (14 + Math.random()*18) + "px";
    el.style.opacity = (0.10 + Math.random()*0.18).toFixed(2);
    container.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  }
  for(let i=0;i<10;i++) setTimeout(spawn, i*200);
  setInterval(spawn, 450);
})();

/* =========================================================
   1) LOVE NOTES (fixed reveal behavior)
========================================================= */
const NOTES = [
  "All my best memories are with you.",
  "Every day with you makes me feel like the luckiest person alive.",
  "You make me happier than I thought possible.",
  "You make ordinary moments feel special.",
  "I love your laugh, your personality, and your sense of humor.",
  "Thank you for being the person I always want to tell things to first.",
  "You were my greatest choice I ever made.",
  "You are the sexiest thing on the face of the Earth.",
  "My favorite place is next to you.",
  "You are the sweetest thing there ever was."
];

// How many reveals to count as “completed”
const NOTES_TO_COMPLETE = 3;

const noteTextEl = document.getElementById("noteText");
const revealBtn = document.getElementById("revealNoteBtn");
const nextBtn = document.getElementById("nextNoteBtn");

function hiddenNoteText() {
  return 'Tap “Reveal” to get a love note…';
}

function renderNotesUI(){
  // If not revealed, show placeholder; if revealed, show the current note
  if (!state.noteIsRevealed) {
    noteTextEl.textContent = hiddenNoteText();
  } else {
    noteTextEl.textContent = NOTES[state.noteIndex % NOTES.length];
  }

  // Optional: make it feel responsive
  revealBtn.disabled = state.noteIsRevealed; // once revealed, disable until Next
}

revealBtn.addEventListener("click", () => {
  if (state.noteIsRevealed) return;

  state.noteIsRevealed = true;
  state.notesRevealedCount += 1;

  if (state.notesRevealedCount >= NOTES_TO_COMPLETE) {
    state.completed.notes = true;
  }

  saveState();
  renderNotesUI();
});

nextBtn.addEventListener("click", () => {
  // Move to next note, but hide it until Reveal is clicked again
  state.noteIndex = (state.noteIndex + 1) % NOTES.length;
  state.noteIsRevealed = false;

  saveState();
  renderNotesUI();
});

document.getElementById("notesReset").addEventListener("click", () => {
  state.completed.notes = false;
  state.notesRevealedCount = 0;
  state.noteIndex = 0;
  state.noteIsRevealed = false;

  saveState();
  renderNotesUI();
});

// Initial render
renderNotesUI();

/* =========================================================
   2) MEMORY MATCH (PHOTO PAIRS)
========================================================= */
/*
  ✅ ADD YOUR PHOTOS HERE ✅

  1) Create folder: /assets (next to index.html)
  2) Convert HEIC -> JPG (recommended)
  3) Add pairs below. Each object is ONE MATCH (two photos from the same day)
*/
const PHOTO_PAIRS = [
  // Replace these with your real ones:
  { label: "Example", a: "assets/1_1.jpeg", b: "assets/1_2.jpeg" },
  { label: "Example2", a: "assets/2_1.jpeg", b: "assets/2_2.jpeg" },
  { label: "Example", a: "assets/3_1.jpeg", b: "assets/3_2.jpeg" },
  { label: "Example", a: "assets/4_1.jpeg", b: "assets/4_2.jpeg" },
  { label: "Example", a: "assets/5_1.jpeg", b: "assets/5_2.jpeg" },
  { label: "Example", a: "assets/6_1.jpeg", b: "assets/6_2.jpeg" },
  { label: "Example", a: "assets/7_1.jpeg", b: "assets/7_2.jpeg" },
  { label: "Example", a: "assets/8_1.jpeg", b: "assets/8_2.jpeg" }
];

const memoryGrid = document.getElementById("memoryGrid");
const memoryWinEl = document.getElementById("memoryWin");

let memory = null;

function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function cryptoRandomId(){
  if (window.crypto?.getRandomValues) {
    const a = new Uint32Array(2);
    window.crypto.getRandomValues(a);
    return `${a[0].toString(16)}${a[1].toString(16)}`;
  }
  return String(Math.random()).slice(2);
}

function buildDeckFromPhotoPairs(pairs){
  const deck = [];
  pairs.forEach((pair, idx) => {
    const matchId = `pair_${idx}`;
    deck.push({ id: cryptoRandomId(), matchId, src: pair.a, alt: `Photo A - ${pair.label}` });
    deck.push({ id: cryptoRandomId(), matchId, src: pair.b, alt: `Photo B - ${pair.label}` });
  });
  return shuffle(deck);
}

function newMemoryGame(){
  if (!PHOTO_PAIRS.length) {
    memoryGrid.innerHTML = `<div class="alert alert-warning mb-0">
      Add photo pairs in <code>app.js</code> under <code>PHOTO_PAIRS</code>.
    </div>`;
    return;
  }

  memory = {
    deck: buildDeckFromPhotoPairs(PHOTO_PAIRS),
    flipped: [],          // card ids currently flipped (max 2)
    locked: false,
    matches: 0,
    matchedIds: new Set()
  };

  renderMemory();
  memoryWinEl.classList.add("d-none");
}

function renderMemory(){
  memoryGrid.innerHTML = "";

  memory.deck.forEach(card => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "card-tile face-down";
    tile.setAttribute("aria-label", "memory card");

    const isMatched = memory.matchedIds.has(card.id);
    const isFlipped = memory.flipped.includes(card.id);

    if (isMatched || isFlipped) {
      tile.classList.remove("face-down");
      tile.innerHTML = "";
      const img = document.createElement("img");
      img.className = "card-photo";
      img.src = card.src;
      img.alt = card.alt;
      img.loading = "lazy";
      img.draggable = false;
      tile.appendChild(img);
      if (isMatched) tile.classList.add("matched");
    } else {
      tile.innerHTML = `<span class="card-back">💗</span>`;
    }

    tile.addEventListener("click", () => onFlip(card.id));
    memoryGrid.appendChild(tile);
  });
}

function onFlip(id){
  if (!memory || memory.locked) return;
  if (memory.matchedIds.has(id)) return;
  if (memory.flipped.includes(id)) return;

  memory.flipped.push(id);
  renderMemory();

  if (memory.flipped.length === 2){
    const [aId, bId] = memory.flipped;
    const a = memory.deck.find(c => c.id === aId);
    const b = memory.deck.find(c => c.id === bId);

    if (a.matchId === b.matchId){
      memory.matchedIds.add(aId);
      memory.matchedIds.add(bId);
      memory.matches += 1;
      memory.flipped = [];
      renderMemory();

      if (memory.matches === PHOTO_PAIRS.length){
        memoryWinEl.classList.remove("d-none");
        state.completed.memory = true;
        saveState();
      }
    } else {
      memory.locked = true;
      setTimeout(() => {
        memory.flipped = [];
        memory.locked = false;
        renderMemory();
      }, 800);
    }
  }
}

document.getElementById("memoryRestart").addEventListener("click", () => {
  state.completed.memory = false;
  saveState();
  newMemoryGame();
});

newMemoryGame();

/* =========================================================
   3) "LOVE AMOUNT" GUESSING GAME
========================================================= */
const guessForm = document.getElementById("guessForm");
const guessInput = document.getElementById("guessInput");
const guessResponse = document.getElementById("guessResponse");

let guessCount = 0;

const TOO_SMALL_LINES = [
  "Too small girly girl.",
  "Too small girly girl.",
  "Astronomically too small.",
  "Adorable guess but try bigger.",
  "Still not big enough.",
  "Nope. Still too small.",
  "Just because you're so cute you can pass. Still too small though. ❤️"
];

guessForm.addEventListener("submit", (e) => {
  e.preventDefault();
  guessCount += 1;

  const idx = Math.min(guessCount - 1, TOO_SMALL_LINES.length - 1);
  guessResponse.textContent = TOO_SMALL_LINES[idx];
  guessResponse.classList.remove("d-none");

  // Mark completed after 3 guesses (tweak if you want)
  if (guessCount >= 3) {
    state.completed.guess = true;
    saveState();
  }

  guessInput.select();
});

document.getElementById("guessReset").addEventListener("click", () => {
  guessCount = 0;
  state.completed.guess = false;
  guessResponse.classList.add("d-none");
  guessResponse.textContent = "";
  guessInput.value = "";
  saveState();
});

/* =========================================================
   FINAL CONFETTI
========================================================= */
document.getElementById("finalConfetti").addEventListener("click", () => {
  burstConfetti(120);
});

function burstConfetti(n){
  for (let i=0; i<n; i++){
    const p = document.createElement("div");
    p.style.position = "fixed";
    p.style.left = (Math.random()*100) + "vw";
    p.style.top = "-10px";
    p.style.width = "10px";
    p.style.height = "10px";
    p.style.borderRadius = "2px";
    p.style.background = `hsl(${Math.floor(Math.random()*360)}, 85%, 65%)`;
    p.style.zIndex = "9999";
    p.style.opacity = "0.95";
    document.body.appendChild(p);

    const drift = (Math.random()*2 - 1) * 120;
    const fall = 100 + Math.random()*80;
    const rot = (Math.random()*720 - 360);

    p.animate([
      { transform: `translate(0px, 0px) rotate(0deg)` },
      { transform: `translate(${drift}px, ${fall}vh) rotate(${rot}deg)` }
    ], {
      duration: 1400 + Math.random()*900,
      easing: "cubic-bezier(.2,.8,.2,1)",
      fill: "forwards"
    });

    setTimeout(() => p.remove(), 2600);
  }
}

/* -------------------------
   Persist initial state + UI
------------------------- */
saveState();