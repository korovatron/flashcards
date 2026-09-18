// AQA A Level Computer Science flashcard viewer
// Data files: flashcards_unit1.json / flashcards_unit2.json, each an array
// of { front, back } objects (see scripts/extract_flashcards.py).

const UNIT_FILES = {
  unit1: { file: 'flashcards_unit1.json', title: 'Unit 1' },
  unit2: { file: 'flashcards_unit2.json', title: 'Unit 2' },
};

const screens = {
  select: document.getElementById('screen-select'),
  loading: document.getElementById('screen-loading'),
  error: document.getElementById('screen-error'),
  mode: document.getElementById('screen-mode'),
  card: document.getElementById('screen-card'),
};

// Runtime state for the deck currently being studied.
const state = {
  unitKey: null,
  cards: [],       // all cards loaded for the chosen unit
  order: [],       // indices into state.cards, in the order they'll be shown
  position: 0,     // index into state.order
  revealed: false,
};

const unitCache = {}; // unitKey -> cards array, so we don't refetch on "change unit"

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

async function selectUnit(unitKey) {
  state.unitKey = unitKey;

  if (unitCache[unitKey]) {
    state.cards = unitCache[unitKey];
    showModeScreen();
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
    showModeScreen();
  } catch (err) {
    document.getElementById('error-message').textContent =
      `Sorry, the flashcards could not be loaded. ${err.message}. ` +
      `If you opened this file directly in a browser, try running it from a local web server instead.`;
    showScreen('error');
  }
}

function showModeScreen() {
  document.getElementById('mode-title').textContent = UNIT_FILES[state.unitKey].title;
  document.getElementById('mode-card-count').textContent =
    `${state.cards.length} card${state.cards.length === 1 ? '' : 's'}`;
  showScreen('mode');
}

function startDeck(mode) {
  const indices = state.cards.map((_, i) => i);
  state.order = mode === 'random' ? shuffle(indices) : indices;
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
  const card = currentCard();
  document.getElementById('card-front-text').textContent = card.front;
  document.getElementById('card-back-text').textContent = card.back;
  document.getElementById('card').classList.toggle('revealed', state.revealed);
  document.getElementById('btn-reveal').textContent = state.revealed ? 'Hide answer' : 'Show answer';
  document.getElementById('progress').textContent =
    `Card ${state.position + 1} of ${state.order.length}`;
}

function goToOffset(offset) {
  const length = state.order.length;
  state.position = (state.position + offset + length) % length;
  state.revealed = false;
  renderCard();
}

// Wire up events

document.querySelectorAll('#screen-select [data-unit]').forEach((btn) => {
  btn.addEventListener('click', () => selectUnit(btn.dataset.unit));
});

document.getElementById('btn-error-back').addEventListener('click', () => showScreen('select'));
document.getElementById('btn-back-to-units').addEventListener('click', () => showScreen('select'));
document.getElementById('btn-change-unit').addEventListener('click', () => showScreen('select'));
document.getElementById('btn-change-mode').addEventListener('click', showModeScreen);

document.getElementById('btn-order').addEventListener('click', () => startDeck('order'));
document.getElementById('btn-random').addEventListener('click', () => startDeck('random'));

document.getElementById('btn-restart').addEventListener('click', () => {
  const wasRandom = state.order.length > 1 &&
    JSON.stringify(state.order) !== JSON.stringify(state.cards.map((_, i) => i));
  startDeck(wasRandom ? 'random' : 'order');
});

document.getElementById('btn-reveal').addEventListener('click', () => {
  state.revealed = !state.revealed;
  renderCard();
});

document.getElementById('btn-next').addEventListener('click', () => goToOffset(1));
document.getElementById('btn-prev').addEventListener('click', () => goToOffset(-1));

showScreen('select');
