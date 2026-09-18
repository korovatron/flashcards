// AQA A Level Computer Science flashcard viewer
// Data files: flashcards_unit1.json / flashcards_unit2.json, each an array
// of { front, back, section } objects (see scripts/tag_flashcards.py).
// "section" is the specification sub-section the card belongs to, eg "4.1".

const UNIT_FILES = {
  unit1: { file: 'flashcards_unit1.json', title: 'Unit 1' },
  unit2: { file: 'flashcards_unit2.json', title: 'Unit 2' },
};

// Specification sections available per unit, and their display titles.
const UNIT_SECTIONS = {
  unit1: ['4.1', '4.2', '4.3', '4.4'],
  unit2: ['4.5', '4.6', '4.7', '4.8', '4.9', '4.10', '4.11', '4.12'],
};

const SECTION_TITLES = {
  '4.1': '4.1 Fundamentals of programming',
  '4.2': '4.2 Fundamentals of data structures',
  '4.3': '4.3 Fundamentals of algorithms',
  '4.4': '4.4 Theory of computation',
  '4.5': '4.5 Fundamentals of data representation',
  '4.6': '4.6 Fundamentals of computer systems',
  '4.7': '4.7 Fundamentals of computer organisation and architecture',
  '4.8': '4.8 Consequences of uses of computing',
  '4.9': '4.9 Fundamentals of communication and networking',
  '4.10': '4.10 Fundamentals of databases',
  '4.11': '4.11 Big Data',
  '4.12': '4.12 Fundamentals of functional programming',
};

const screens = {
  loading: document.getElementById('screen-loading'),
  error: document.getElementById('screen-error'),
  card: document.getElementById('screen-card'),
};

const selectUnitEl = document.getElementById('select-unit');
const selectSectionEl = document.getElementById('select-section');
const selectOrderEl = document.getElementById('select-order');

// Below this width, dropdown labels are abbreviated (eg "Unit 1" -> "1")
// so the three dropdowns stay side by side instead of stacking.
const narrowQuery = window.matchMedia('(max-width: 520px)');

// Runtime state for the deck currently being studied.
const state = {
  unitKey: selectUnitEl.value,
  sectionKey: 'all',
  orderMode: selectOrderEl.value,
  cards: [],       // all cards loaded for the chosen unit
  order: [],       // indices into state.cards, filtered by section, in show order
  position: 0,     // index into state.order
  revealed: false,
};

const unitCache = {}; // unitKey -> cards array, so we don't refetch on unit change

function showScreen(name) {
  Object.values(screens).forEach((el) => el.classList.remove('active'));
  screens[name].classList.add('active');
}

function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function sectionLabel(sectionValue) {
  if (sectionValue === 'all') {
    return narrowQuery.matches ? 'All' : 'All sections';
  }
  return narrowQuery.matches ? sectionValue : SECTION_TITLES[sectionValue];
}

function unitLabel(unitKey) {
  return narrowQuery.matches ? unitKey.replace('unit', '') : UNIT_FILES[unitKey].title;
}

// Re-applies the current (narrow/wide) label text to each dropdown's
// existing options, without touching which option is selected.
function refreshDropdownLabels() {
  Array.from(selectUnitEl.options).forEach((opt) => {
    opt.textContent = unitLabel(opt.value);
  });
  Array.from(selectSectionEl.options).forEach((opt) => {
    opt.textContent = sectionLabel(opt.value);
  });
}

function populateSectionOptions(unitKey) {
  const sections = UNIT_SECTIONS[unitKey];
  const values = ['all', ...sections];
  selectSectionEl.innerHTML = values.map((v) => `<option value="${v}"></option>`).join('');
  selectSectionEl.value = 'all';
  state.sectionKey = 'all';
  refreshDropdownLabels();
}

async function loadUnit(unitKey) {
  state.unitKey = unitKey;

  if (unitCache[unitKey]) {
    state.cards = unitCache[unitKey];
    rebuildDeck();
    return;
  }

  showScreen('loading');
  try {
    const response = await fetch(UNIT_FILES[unitKey].file);
    if (!response.ok) {
      throw new Error(`Could not load ${UNIT_FILES[unitKey].file} (HTTP ${response.status})`);
    }
    const cards = await response.json();
    unitCache[unitKey] = cards;
    state.cards = cards;
    rebuildDeck();
  } catch (err) {
    document.getElementById('error-message').textContent =
      `Sorry, the flashcards could not be loaded. ${err.message}. ` +
      `If you opened this file directly in a browser, try running it from a local web server instead.`;
    showScreen('error');
  }
}

// Recompute state.order from the current section filter and order mode,
// then reset to the first card. Call whenever unit/section/order changes.
function rebuildDeck() {
  const indices = state.cards
    .map((card, i) => i)
    .filter((i) => state.sectionKey === 'all' || state.cards[i].section === state.sectionKey);
  state.order = state.orderMode === 'random' ? shuffle(indices) : indices;
  state.position = 0;
  state.revealed = false;
  showScreen('card');
  renderCard();
}

function currentCard() {
  const cardIndex = state.order[state.position];
  return state.cards[cardIndex];
}

function renderCard() {
  if (state.order.length === 0) {
    document.getElementById('card-front-text').textContent = '';
    document.getElementById('card-back-text').textContent = '';
    document.getElementById('section-tag').textContent = '';
    document.getElementById('progress').textContent = 'No cards in this section';
    return;
  }
  const card = currentCard();
  document.getElementById('card-front-text').textContent = card.front;
  document.getElementById('card-back-text').textContent = card.back;
  document.getElementById('card').classList.toggle('revealed', state.revealed);
  document.getElementById('btn-reveal').textContent = state.revealed ? 'Hide answer' : 'Show answer';
  document.getElementById('section-tag').textContent = SECTION_TITLES[card.section] || '';
  document.getElementById('progress').textContent =
    `Card ${state.position + 1} of ${state.order.length}`;
}

function goToOffset(offset) {
  const length = state.order.length;
  if (length === 0) return;
  state.position = (state.position + offset + length) % length;
  state.revealed = false;
  renderCard();
  rotateCardColour(offset > 0 ? 1 : -1);
}

// Neon border colours the card cycles through as you navigate next/previous.
const CARD_COLOURS = ['#39ff14', '#b026ff', '#ffe600'];
let cardColourIndex = 0;

function applyCardColour() {
  document.getElementById('card').style.setProperty('--ring-colour', CARD_COLOURS[cardColourIndex]);
}

function rotateCardColour(direction) {
  cardColourIndex = (cardColourIndex + direction + CARD_COLOURS.length) % CARD_COLOURS.length;
  applyCardColour();
}

// Wire up events

selectUnitEl.addEventListener('change', () => {
  populateSectionOptions(selectUnitEl.value);
  loadUnit(selectUnitEl.value);
});

selectSectionEl.addEventListener('change', () => {
  state.sectionKey = selectSectionEl.value;
  rebuildDeck();
});

selectOrderEl.addEventListener('change', () => {
  state.orderMode = selectOrderEl.value;
  rebuildDeck();
});

document.getElementById('btn-restart').addEventListener('click', rebuildDeck);

function toggleReveal() {
  state.revealed = !state.revealed;
  renderCard();
}

document.getElementById('btn-reveal').addEventListener('click', toggleReveal);
document.getElementById('card').addEventListener('click', toggleReveal);

// Swipe left/right on touch devices to move between cards.
const cardEl = document.getElementById('card');
const SWIPE_THRESHOLD = 50; // minimum horizontal px to count as a swipe
let touchStartX = 0;
let touchStartY = 0;
let touchIsSwipe = false;

cardEl.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchIsSwipe = false;
}, { passive: true });

cardEl.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  // Once a clearly horizontal drag is detected, claim the gesture as a swipe
  // (prevents the page from scrolling and stops the trailing click from firing).
  if (!touchIsSwipe && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
    touchIsSwipe = true;
  }
  if (touchIsSwipe) {
    e.preventDefault();
  }
}, { passive: false });

cardEl.addEventListener('touchend', (e) => {
  if (!touchIsSwipe) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) >= SWIPE_THRESHOLD) {
    goToOffset(dx < 0 ? 1 : -1);
  }
});

document.getElementById('btn-next').addEventListener('click', () => goToOffset(1));
document.getElementById('btn-prev').addEventListener('click', () => goToOffset(-1));

narrowQuery.addEventListener('change', refreshDropdownLabels);

applyCardColour();
populateSectionOptions(selectUnitEl.value);
loadUnit(selectUnitEl.value);
