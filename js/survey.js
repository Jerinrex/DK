/**
 * survey.js — Survey logic for page 2
 * Birthday Surprise · Monic Dayana
 *
 * ── HOW TO ADD MORE QUESTIONS ────────────────────────────
 * Add a new object to the QUESTIONS array below.
 *
 * Types available:
 *   'text'  → open text input
 *   'pills' → clickable pill/chip buttons
 *
 * Example:
 *   {
 *     id: 'q6',
 *     label: 'What is your favorite song? 🎵',
 *     type: 'text',
 *     placeholder: 'The one always on repeat…',
 *   },
 *   {
 *     id: 'q7',
 *     label: 'Where is your dream vacation? 🌏',
 *     type: 'pills',
 *     options: ['Maldives', 'Paris', 'Tokyo', 'Bali', 'New York'],
 *   },
 * ─────────────────────────────────────────────────────────
 */

const QUESTIONS = [
  {
    id:          'q1',
    label:       'What is your favorite food? 🍽️',
    type:        'text',
    placeholder: 'Tell me what you love to eat…',
  },
  {
    id:          'q2',
    label:       'What is your favorite place? 🌍',
    type:        'text',
    placeholder: 'Anywhere in the world…',
  },
  {
    id:          'q3',
    label:       'What is your favorite game? 🎮',
    type:        'text',
    placeholder: 'Any game you love playing…',
  },
  {
    id:          'q4',
    label:       'What is your favorite color? 🎨',
    type:        'text',
    placeholder: 'The color that speaks to you…',
  },
  {
    id:      'q5',
    label:   'What kind of vibe do you like most? ✨',
    type:    'pills',
    options: ['Calm', 'Funny', 'Peaceful', 'Chaotic', 'Emotional'],
  },

  // ── ADD YOUR NEW QUESTIONS BELOW THIS LINE ──────────────
  // { id: 'q6', label: '…', type: 'text', placeholder: '…' },
];

/* ── Web3Forms access key ── */
const WEB3FORMS_KEY = '912efcd7-9a18-4463-a047-75a6cc588138';
// Get a free key at https://web3forms.com  then paste it above.

/* ── State ── */
const Survey = (() => {
  let current = 0;
  const answers = {};

  /* DOM refs */
  const getEl = id => document.getElementById(id);

  function render() {
    const total = QUESTIONS.length;
    const q     = QUESTIONS[current];
    const pct   = ((current + 1) / total) * 100;

    // Progress
    getEl('progressLabel').textContent = `Question ${current + 1} of ${total}`;
    getEl('progressFill').style.width  = `${pct}%`;

    // Animate question in
    const qText = getEl('questionText');
    qText.classList.remove('q-enter');
    void qText.offsetWidth;
    qText.classList.add('q-enter');
    qText.textContent = q.label;

    // Build input
    const area = getEl('inputArea');
    area.classList.remove('q-enter');
    void area.offsetWidth;
    area.classList.add('q-enter');
    area.innerHTML = '';

    if (q.type === 'text') {
      const inp = document.createElement('input');
      inp.type        = 'text';
      inp.className   = 'survey-input';
      inp.placeholder = q.placeholder || 'Your answer…';
      inp.value       = answers[q.id] || '';
      inp.addEventListener('input', () => { answers[q.id] = inp.value.trim(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') next(); });
      area.appendChild(inp);
      setTimeout(() => inp.focus(), 80);

    } else if (q.type === 'pills') {
      const wrap = document.createElement('div');
      wrap.className = 'pill-group';
      (q.options || []).forEach(opt => {
        const b = document.createElement('button');
        b.className   = 'pill-btn';
        b.textContent = opt;
        if (answers[q.id] === opt) b.classList.add('selected');
        b.addEventListener('click', () => {
          wrap.querySelectorAll('.pill-btn').forEach(x => x.classList.remove('selected'));
          b.classList.add('selected');
          answers[q.id] = opt;
        });
        wrap.appendChild(b);
      });
      area.appendChild(wrap);
    }

    // Buttons
    const isLast = current === total - 1;
    getEl('btnPrev').classList.toggle('hidden', current === 0);
    getEl('btnNext').classList.toggle('hidden', isLast);
    getEl('btnSubmit').classList.toggle('hidden', !isLast);
  }

  function collectCurrent() {
    const q = QUESTIONS[current];
    if (q.type === 'text') {
      const inp = document.querySelector('.survey-input');
      if (inp) answers[q.id] = inp.value.trim();
    }
  }

  function prev() {
    collectCurrent();
    if (current > 0) { current--; render(); }
  }

  function next() {
    collectCurrent();
    if (current < QUESTIONS.length - 1) { current++; render(); }
  }

  async function submit() {
    collectCurrent();

    const btn = getEl('btnSubmit');
    btn.textContent = 'Sending… ✦';
    btn.disabled    = true;

    // Build readable message
    const body = QUESTIONS.map((q, i) =>
      `Q${i + 1}: ${q.label}\nAnswer: ${answers[q.id] || '(no answer)'}`
    ).join('\n\n');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject:    '🎂 Birthday Survey — Monic Dayana',
          from_name:  'Birthday Surprise Website',
          message:    `Survey answers from Monic Dayana:\n\n${body}`,
        }),
      });
      const data = await res.json();
      if (!data.success) console.warn('Web3Forms response:', data);
    } catch (e) {
      console.warn('Submit error (will still proceed):', e);
    }

    showSuccess();
  }

  function showSuccess() {
    getEl('surveyCard').classList.add('hidden');
    getEl('surveySuccess').classList.remove('hidden');
    // Navigate to page 3 after 2.8 s
    setTimeout(() => navigateTo('page3-note.html'), 2800);
  }

  function init() {
    current = 0;
    Object.keys(answers).forEach(k => delete answers[k]);
    render();
  }

  // Expose public API
  return { init, prev, next, submit };
})();
