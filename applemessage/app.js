/* ============================================================
   app.js — iMessage-style Chat Application
   ============================================================
   Sections:
     1. Icon Helpers (Feather SVG wrappers)
     2. Static Data (conversations, emoji sets)
     3. App State
     4. Initialisation
     5. Theme
     6. Icon Injection (static DOM icons)
     7. Sidebar Rendering
     8. Conversation Selection
     9. Message Rendering
    10. Message Sending
    11. Reactions
    12. Emoji Picker
    13. Input Bar Helpers
    14. Utility Functions
    15. Event Binding
   ============================================================ */

'use strict';

/* ============================================================
   1. ICON HELPERS
   Uses Feather Icons (loaded via CDN before this script)
   feather.icons['name'].toSvg(attrs) returns an SVG string.
   ============================================================ */

/**
 * Returns an SVG string for the given Feather icon name.
 * @param {string} name   - Feather icon name (e.g. 'moon', 'send')
 * @param {object} [opts] - Override attributes (width, height, stroke, etc.)
 */
function icon(name, opts = {}) {
  if (!window.feather || !feather.icons[name]) {
    console.warn(`Feather icon "${name}" not found.`);
    return '';
  }
  return feather.icons[name].toSvg({
    width: 18,
    height: 18,
    'stroke-width': 2,
    ...opts,
  });
}

/** Inject icon SVG into an element, replacing inner HTML. */
function setIcon(el, name, opts = {}) {
  if (el) el.innerHTML = icon(name, opts);
}

/* ============================================================
   2. STATIC DATA
   ============================================================ */

/** Pre-loaded conversations with realistic message histories. */
const CONVERSATIONS = [
  {
    id: 1,
    name: 'Minions',
    avatar: 'M',
    avatarColor: '#bfaf34',
    online: true,
    unread: 2,
    messages: [
      { id: 101, sender: 'them', text: 'Banana',                         time: '9:41 AM',  date: 'Yesterday' },
      { id: 102, sender: 'me',   text: 'Hello',                 time: '9:43 AM',  date: 'Yesterday', status: 'Read' },
      { id: 103, sender: 'them', text: '오늘 하루는 어땠니',                time: '9:45 AM',  date: 'Yesterday' },
      { id: 104, sender: 'me',   text: '좋았어 너는?',                   time: '9:46 AM',  date: 'Yesterday', status: 'Read' },
      { id: 105, sender: 'them', text: '굿 오늘 일정이 뭐야?',    time: '9:48 AM',  date: 'Yesterday' },
      { id: 106, sender: 'me', text: '시험 공부하고..별 다른 건 없어',time: '9:48 AM',  date: 'Yesterday' },
      { id: 107, sender: 'them',   text: '화이팅',                                   time: '9:50 AM',  date: 'Yesterday', status: 'Read' },
      { id: 108, sender: 'me', text: '고마워~',                                 time: '10:02 AM', date: 'Today' },
      { id: 109, sender: 'me', text: 'Bye Bye',            time: '10:03 AM', date: 'Today' },
    ],
  },
  {
    id: 2,
    name: 'Friend',
    avatar: 'DT',
    avatarColor: '#5856D6',
    online: false,
    unread: 0,
    messages: [
      { id: 201, sender: 'them', text: 'Hello.',                          time: 'Mon 2:11 PM', date: 'Monday' },
      { id: 202, sender: 'me',   text: 'Hi.',      time: 'Mon 2:14 PM', date: 'Monday',  status: 'Read' },
      { id: 203, sender: 'them', text: 'whats ur favorite fruit',                                time: 'Mon 2:15 PM', date: 'Monday' },
      { id: 204, sender: 'me',   text: 'I cannot choose.. maybe apple?',         time: 'Mon 2:16 PM', date: 'Monday',  status: 'Read' },
      { id: 205, sender: 'them', text: 'same',             time: 'Mon 2:20 PM', date: 'Monday' },
      { id: 206, sender: 'me',   text: 'have a nice day',                                time: 'Mon 2:21 PM', date: 'Monday',  status: 'Delivered' },
      { id: 207, sender: 'them', text: 'ty! u too.',               time: 'Tue 9:05 AM', date: 'Tuesday' },
      { id: 208, sender: 'me',   text: '👍',                                             time: 'Tue 9:06 AM', date: 'Tuesday', status: 'Read' },
    ],
  },
  {
    id: 3,
    name: 'Mom',
    avatar: 'M',
    avatarColor: '#FF9500',
    online: true,
    unread: 1,
    messages: [
      { id: 301, sender: 'them', text: 'Did you eat today?',                                     time: '8:00 AM',  date: 'Today' },
      { id: 302, sender: 'me',   text: 'Yes mom, I had a very nutritious bowl of cereal.',       time: '8:32 AM',  date: 'Today', status: 'Read' },
      { id: 303, sender: 'them', text: 'That is NOT a meal. I\'m sending you a recipe.',         time: '8:33 AM',  date: 'Today' },
      { id: 304, sender: 'me',   text: 'Haha okay okay. How are you doing?',                     time: '8:35 AM',  date: 'Today', status: 'Read' },
      { id: 305, sender: 'them', text: 'Good! Your aunt is visiting next month. You should come too.', time: '11:48 AM', date: 'Today' },
    ],
  },
];

/** Emoji categories for the picker panel. */
const EMOJI_DATA = [
  {
    label: 'Smileys',
    emojis: ['😀','😂','🥹','😊','😍','🤩','😎','🥺','😢','😡','🤯','🥳','🤔','😴','😈','👻','💀','🤖','🫠','😏'],
  },
  {
    label: 'Gestures & Symbols',
    emojis: ['👍','👎','👏','🙌','🤝','✌️','🤞','🫶','❤️','💯','🔥','⭐','✨','🎉','🏆','💪','🫡','🙏','💡','🚀'],
  },
  {
    label: 'Nature & Food',
    emojis: ['🐶','🐱','🐼','🦊','🐸','🌸','🌈','☀️','🌙','⚡','🍀','🌊','🍕','🍔','☕','🍜','🎂','🍦','🍎','🍓'],
  },
];

/* ============================================================
   3. APP STATE
   ============================================================ */

const state = {
  /** Currently open conversation id (null = none). */
  activeConvoId: null,

  /** Deep clone of CONVERSATIONS — mutated as messages are added/reacted. */
  conversations: JSON.parse(JSON.stringify(CONVERSATIONS)),

  /** Current colour theme: 'light' | 'dark'. */
  theme: localStorage.getItem('theme') || 'light',

  /** Reaction popup — which message is being reacted to. */
  reactionTarget: null, // { msgId: number, convoId: number }
};

/* ============================================================
   4. INITIALISATION
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.theme);
  injectStaticIcons();
  buildEmojiPicker();
  renderSidebar();
  bindEvents();

  // Auto-select first conversation on load
  selectConversation(state.conversations[0].id);
});

/* ============================================================
   5. THEME
   ============================================================ */

/**
 * Apply a theme ('light' | 'dark') and persist to localStorage.
 * Also updates the theme toggle button icon.
 */
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  // Swap icon: moon in light mode, sun in dark mode
  const btn = document.getElementById('theme-toggle');
  const iconName = theme === 'dark' ? 'sun' : 'moon';
  setIcon(btn, iconName, { width: 18, height: 18 });
}

/* ============================================================
   6. STATIC ICON INJECTION
   Runs once after DOMContentLoaded to fill static UI elements
   with Feather SVG icons.
   ============================================================ */

function injectStaticIcons() {
  // Sidebar search icon
  setIcon(document.getElementById('search-icon-el'), 'search', { width: 15, height: 15 });

  // Mobile hamburger
  setIcon(document.getElementById('hamburger'), 'menu', { width: 20, height: 20 });

  // Chat header action buttons
  setIcon(document.getElementById('btn-video'), 'video',  { width: 17, height: 17 });
  setIcon(document.getElementById('btn-phone'), 'phone',  { width: 17, height: 17 });
  setIcon(document.getElementById('btn-info'),  'info',   { width: 17, height: 17 });

  // Input bar icons
  setIcon(document.getElementById('attach-btn'),    'paperclip', { width: 18, height: 18 });
  setIcon(document.getElementById('emoji-toggle'),  'smile',     { width: 20, height: 20 });

  // Send button (arrow pointing up, iMessage style)
  setIcon(document.getElementById('send-btn'), 'arrow-up', {
    width: 16, height: 16, stroke: 'white', 'stroke-width': 2.5,
  });

  // Empty state icon
  setIcon(document.getElementById('empty-icon'), 'message-circle', {
    width: 64, height: 64,
  });
}

/* ============================================================
   7. SIDEBAR RENDERING
   ============================================================ */

/**
 * Render the conversations list, optionally filtered by a search string.
 * @param {string} [filter=''] - Search query to filter by name or message text.
 */
function renderSidebar(filter = '') {
  const list = document.getElementById('conversations-list');
  list.innerHTML = '';

  const lc = filter.toLowerCase();

  state.conversations.forEach((convo) => {
    const lastMsg   = convo.messages[convo.messages.length - 1];
    const preview   = lastMsg ? lastMsg.text : '';
    const matchName = convo.name.toLowerCase().includes(lc);
    const matchMsg  = preview.toLowerCase().includes(lc);

    // Skip if filter is active and nothing matches
    if (filter && !matchName && !matchMsg) return;

    const item = document.createElement('div');
    item.className = 'convo-item' + (convo.id === state.activeConvoId ? ' active' : '');
    item.dataset.id = convo.id;
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `Conversation with ${convo.name}`);

    item.innerHTML = `
      <div class="convo-avatar" style="background:${convo.avatarColor}">
        ${escHtml(convo.avatar)}
        ${convo.online ? '<div class="online-dot" aria-label="Online"></div>' : ''}
      </div>
      <div class="convo-meta">
        <div class="convo-row">
          <span class="convo-name">${escHtml(convo.name)}</span>
          <span class="convo-time">${lastMsg ? escHtml(lastMsg.time) : ''}</span>
        </div>
        <div class="convo-preview">
          ${lastMsg && lastMsg.sender === 'me'
            ? '<span class="convo-preview-you">You: </span>'
            : ''}
          <span>${escHtml(truncate(preview, 38))}</span>
          ${convo.unread > 0
            ? `<span class="unread-badge" aria-label="${convo.unread} unread">${convo.unread}</span>`
            : ''}
        </div>
      </div>`;

    // Click / keyboard to select
    item.addEventListener('click',   () => { selectConversation(convo.id); closeMobileSidebar(); });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectConversation(convo.id);
        closeMobileSidebar();
      }
    });

    list.appendChild(item);
  });
}

/* ============================================================
   8. CONVERSATION SELECTION
   ============================================================ */

/**
 * Switch to a conversation: mark unread as read, update header, render messages.
 * @param {number} id - Conversation id.
 */
function selectConversation(id) {
  const convo = state.conversations.find((c) => c.id === id);
  if (!convo) return;

  // Clear unread
  convo.unread = 0;
  state.activeConvoId = id;

  // Update sidebar active state and re-render list
  renderSidebar(document.getElementById('search-input').value);

  // --- Update chat header ---
  const avatarEl  = document.getElementById('chat-avatar');
  avatarEl.style.background = convo.avatarColor;
  avatarEl.innerHTML = escHtml(convo.avatar)
    + (convo.online ? '<div class="online-dot"></div>' : '');

  document.getElementById('chat-name').textContent   = convo.name;
  document.getElementById('chat-status').textContent = convo.online ? 'Active now' : 'Last seen recently';

  // --- Fade chat area and re-render messages ---
  renderMessages(convo, /* animate= */ true);
}

/* ============================================================
   9. MESSAGE RENDERING
   ============================================================ */

/**
 * Render all messages for a conversation into #messages-area.
 * @param {object}  convo   - Conversation object.
 * @param {boolean} animate - If true, cross-fade and stagger messages.
 */
function renderMessages(convo, animate = false) {
  const area = document.getElementById('messages-area');

  // Remove empty state if present
  const empty = document.getElementById('empty-state');
  if (empty) empty.remove();

  // Fade out
  if (animate) {
    area.style.opacity    = '0';
    area.style.transition = 'opacity 0.15s ease';
  }

  const doRender = () => {
    area.innerHTML = '';
    let lastDate   = '';
    let lastSender = '';
    let delayMs    = 0;

    convo.messages.forEach((msg, i) => {
      // Date separator on date change
      if (msg.date !== lastDate) {
        const sep = document.createElement('div');
        sep.className   = 'date-separator';
        sep.textContent = `${msg.date}  ·  ${msg.time}`;

        if (animate) {
          sep.classList.add('msg-stagger');
          sep.style.animationDelay = `${delayMs}ms`;
          delayMs += 25;
        }
        area.appendChild(sep);
        lastDate   = msg.date;
        lastSender = '';
      }

      const isMe      = msg.sender === 'me';
      const nextMsg   = convo.messages[i + 1];
      // Show avatar on last message in a consecutive received block
      const showAvatar = !isMe && (
        !nextMsg || nextMsg.sender !== 'them' || nextMsg.date !== msg.date
      );
      const grouped = msg.sender === lastSender;

      const row = buildMsgRow(msg, convo, isMe, showAvatar, grouped);

      if (animate) {
        row.classList.add('msg-stagger');
        row.style.animationDelay = `${delayMs}ms`;
        delayMs += 38;
      }

      area.appendChild(row);
      lastSender = msg.sender;
    });

    if (animate) {
      area.style.opacity    = '1';
      area.style.transition = 'opacity 0.2s ease';
    }

    scrollToBottom();
  };

  if (animate) {
    setTimeout(doRender, 130);
  } else {
    doRender();
  }
}

/**
 * Build a single message row DOM element.
 *
 * Structure (received):
 *   .msg-row.received
 *     .msg-avatar | .msg-avatar-space
 *     .bubble-wrap
 *       .bubble
 *       .reactions-row   (if any)
 *       .bubble-meta     (status, sent only)
 *     button.reaction-trigger
 *
 * Structure (sent): same but flex-reversed, trigger on left side.
 *
 * @param {object}  msg        - Message object.
 * @param {object}  convo      - Parent conversation.
 * @param {boolean} isMe       - Is this a sent message?
 * @param {boolean} showAvatar - Show avatar bubble beside received message?
 * @param {boolean} grouped    - Consecutive same-sender (reduce top margin)?
 * @returns {HTMLElement}
 */
function buildMsgRow(msg, convo, isMe, showAvatar, grouped) {
  const row = document.createElement('div');
  row.className    = 'msg-row ' + (isMe ? 'sent' : 'received');
  row.dataset.msgId   = msg.id;
  row.dataset.convoId = convo.id;
  row.style.marginTop = grouped ? '1px' : '6px';

  // — Reaction trigger button (reveal on hover, left of sent / right of received) —
  const trigger = document.createElement('button');
  trigger.className  = 'reaction-trigger';
  trigger.innerHTML  = icon('smile', { width: 14, height: 14, 'stroke-width': 2 });
  trigger.title      = 'React';
  trigger.setAttribute('aria-label', 'Add reaction');
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    showReactionPopup(e.currentTarget, msg.id, convo.id);
  });

  // — Avatar / spacer (received side only) —
  if (!isMe) {
    if (showAvatar) {
      const av       = document.createElement('div');
      av.className   = 'msg-avatar';
      av.style.background = convo.avatarColor;
      av.textContent = convo.avatar;
      row.appendChild(av);
    } else {
      const sp = document.createElement('div');
      sp.className = 'msg-avatar-space';
      row.appendChild(sp);
    }
  }

  // — Bubble wrap —
  const wrap = document.createElement('div');
  wrap.className = 'bubble-wrap';

  // Bubble
  const bubble = document.createElement('div');
  bubble.className = 'bubble' + (isEmojiOnly(msg.text) ? ' emoji-only' : '');
  bubble.innerHTML = linkify(escHtml(msg.text));

  // Right-click to react (alternative to hover trigger)
  bubble.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showReactionPopupAt(e.clientX, e.clientY, msg.id, convo.id);
  });

  wrap.appendChild(bubble);

  // Existing reactions
  if (msg.reactions && Object.keys(msg.reactions).length > 0) {
    wrap.appendChild(buildReactionsRow(msg, convo));
  }

  // Delivery status (sent messages only, last status message)
  if (isMe && msg.status) {
    const meta = document.createElement('div');
    meta.className   = 'bubble-meta';
    meta.textContent = msg.status;
    wrap.appendChild(meta);
  }

  // Assemble: for sent, trigger goes BEFORE bubble-wrap (renders on left in row-reverse)
  if (isMe) {
    row.appendChild(trigger);
  }
  row.appendChild(wrap);
  if (!isMe) {
    row.appendChild(trigger);
  }

  return row;
}

/**
 * Build the reactions-row element for a message.
 * @param {object} msg   - Message with a `reactions` map.
 * @param {object} convo - Parent conversation.
 * @returns {HTMLElement}
 */
function buildReactionsRow(msg, convo) {
  const rrow    = document.createElement('div');
  rrow.className = 'reactions-row';
  rrow.id        = `reactions-${convo.id}-${msg.id}`;

  Object.entries(msg.reactions || {}).forEach(([emoji, data]) => {
    // data can be a number (count) or { count, mine }
    const count = typeof data === 'object' ? data.count : data;
    const mine  = typeof data === 'object' ? data.mine  : false;
    if (count <= 0) return;

    const pill = document.createElement('button');
    pill.className = 'reaction-pill' + (mine ? ' mine' : '');
    pill.innerHTML = `${emoji}<span class="rc-count">${count}</span>`;
    pill.title     = `${emoji} ${count}`;
    pill.setAttribute('aria-label', `${count} ${emoji} reaction`);

    pill.addEventListener('click', () => toggleReaction(emoji, msg.id, convo.id));
    rrow.appendChild(pill);
  });

  return rrow;
}

/* ============================================================
   10. MESSAGE SENDING
   ============================================================ */

/** Read the textarea, create a message, append it to the active conversation. */
function sendMessage() {
  const input = document.getElementById('msg-input');
  const text  = input.value.trim();
  if (!text || !state.activeConvoId) return;

  const convo = state.conversations.find((c) => c.id === state.activeConvoId);
  if (!convo) return;

  // Remove status from all prior sent messages (only last should show it)
  convo.messages.forEach((m) => { if (m.sender === 'me') delete m.status; });

  // Build new message
  const newMsg = {
    id:     Date.now(),
    sender: 'me',
    text,
    time:   formatTime(new Date()),
    date:   'Today',
    status: 'Delivered',
  };
  convo.messages.push(newMsg);

  // Remove empty state if still showing
  const empty = document.getElementById('empty-state');
  if (empty) empty.remove();

  // Remove old status labels from DOM
  const area = document.getElementById('messages-area');
  area.querySelectorAll('.sent .bubble-meta').forEach((el) => el.remove());

  // Append new message row
  const row = buildMsgRow(newMsg, convo, /* isMe */ true, /* showAvatar */ false, /* grouped */ false);
  area.appendChild(row);

  // Clear input
  input.value        = '';
  input.style.height = 'auto';
  updateSendBtn();

  // Update sidebar preview
  renderSidebar(document.getElementById('search-input').value);
  scrollToBottom();

  // Animate send button bounce
  const btn = document.getElementById('send-btn');
  btn.classList.remove('bounce');
  void btn.offsetWidth; // force reflow
  btn.classList.add('bounce');
  setTimeout(() => btn.classList.remove('bounce'), 400);
}

/* ============================================================
   11. REACTIONS
   ============================================================ */

/**
 * Show the reaction popup anchored to a trigger button element.
 * Positions above the button, flipping if too close to top of viewport.
 * @param {HTMLElement} triggerEl - The reaction trigger button.
 * @param {number}      msgId     - Target message id.
 * @param {number}      convoId   - Target conversation id.
 */
function showReactionPopup(triggerEl, msgId, convoId) {
  state.reactionTarget = { msgId, convoId };

  const popup  = document.getElementById('reaction-popup');
  const rect   = triggerEl.getBoundingClientRect();
  const pw     = 280; // approximate popup width
  const ph     = 56;  // approximate popup height

  // Default: place above the trigger, horizontally centred
  let left = rect.left + rect.width / 2 - pw / 2;
  let top  = rect.top  - ph - 10;

  // Clamp horizontally
  if (left < 8) left = 8;
  if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;

  // If too close to top, place below the trigger instead
  if (top < 8) top = rect.bottom + 10;

  popup.style.left = `${left}px`;
  popup.style.top  = `${top}px`;
  popup.classList.add('visible');
  popup.setAttribute('aria-hidden', 'false');

  // Re-trigger animation
  popup.style.animation = 'none';
  void popup.offsetWidth;
  popup.style.animation = '';
}

/**
 * Show the reaction popup at an arbitrary x, y coordinate (e.g. from contextmenu).
 * @param {number} x        - Viewport x.
 * @param {number} y        - Viewport y.
 * @param {number} msgId    - Target message id.
 * @param {number} convoId  - Target conversation id.
 */
function showReactionPopupAt(x, y, msgId, convoId) {
  state.reactionTarget = { msgId, convoId };

  const popup = document.getElementById('reaction-popup');
  const pw    = 280;
  const ph    = 56;

  let left = x - pw / 2;
  let top  = y - ph - 12;

  if (left < 8)                         left = 8;
  if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
  if (top  < 8)                          top  = y + 12;

  popup.style.left = `${left}px`;
  popup.style.top  = `${top}px`;
  popup.classList.add('visible');
  popup.setAttribute('aria-hidden', 'false');

  popup.style.animation = 'none';
  void popup.offsetWidth;
  popup.style.animation = '';
}

/** Hide the reaction popup. */
function hideReactionPopup() {
  const popup = document.getElementById('reaction-popup');
  popup.classList.remove('visible');
  popup.setAttribute('aria-hidden', 'true');
  state.reactionTarget = null;
}

/**
 * Toggle a reaction emoji on a specific message.
 * - If the current user hasn't reacted with this emoji → add (count++)
 * - If the current user has already reacted → remove (count--)
 * Then re-render the reactions row in the DOM.
 *
 * @param {string} emoji   - Emoji character (e.g. '❤️').
 * @param {number} msgId   - Target message id.
 * @param {number} convoId - Target conversation id.
 */
function toggleReaction(emoji, msgId, convoId) {
  const convo = state.conversations.find((c) => c.id === convoId);
  if (!convo) return;
  const msg = convo.messages.find((m) => m.id === msgId);
  if (!msg) return;

  if (!msg.reactions) msg.reactions = {};

  const existing = msg.reactions[emoji];

  if (existing && existing.mine) {
    // Already reacted — remove
    existing.count--;
    existing.mine = false;
    if (existing.count <= 0) delete msg.reactions[emoji];
  } else if (existing) {
    // Others reacted, add own
    existing.count++;
    existing.mine = true;
  } else {
    // No reaction yet
    msg.reactions[emoji] = { count: 1, mine: true };
  }

  // Update reactions row in DOM
  refreshReactionsRow(msg, convo);
  hideReactionPopup();
}

/**
 * Re-render the reactions-row for a message in the DOM.
 * Replaces the old row if it exists, or appends a new one to bubble-wrap.
 */
function refreshReactionsRow(msg, convo) {
  const rowId  = `reactions-${convo.id}-${msg.id}`;
  const oldRow = document.getElementById(rowId);

  // Build fresh row
  const hasReactions = msg.reactions && Object.values(msg.reactions).some((d) => {
    const count = typeof d === 'object' ? d.count : d;
    return count > 0;
  });

  if (oldRow) {
    if (hasReactions) {
      oldRow.replaceWith(buildReactionsRow(msg, convo));
    } else {
      oldRow.remove();
    }
  } else if (hasReactions) {
    // Find the message row and append to its bubble-wrap
    const msgRow = document.querySelector(`[data-msg-id="${msg.id}"]`);
    if (msgRow) {
      const wrap    = msgRow.querySelector('.bubble-wrap');
      const meta    = wrap.querySelector('.bubble-meta');
      const newRow  = buildReactionsRow(msg, convo);
      if (meta) wrap.insertBefore(newRow, meta);
      else       wrap.appendChild(newRow);
    }
  }
}

/* ============================================================
   12. EMOJI PICKER
   ============================================================ */

/** Build and populate the emoji picker panel with categories and grids. */
function buildEmojiPicker() {
  const picker = document.getElementById('emoji-picker');

  EMOJI_DATA.forEach((cat) => {
    const label       = document.createElement('div');
    label.className   = 'emoji-category-label';
    label.textContent = cat.label;
    picker.appendChild(label);

    const grid      = document.createElement('div');
    grid.className  = 'emoji-grid';

    cat.emojis.forEach((em) => {
      const btn       = document.createElement('button');
      btn.className   = 'emoji-btn';
      btn.textContent = em;
      btn.title       = em;
      btn.setAttribute('aria-label', em);
      btn.addEventListener('click', () => {
        const input  = document.getElementById('msg-input');
        input.value += em;
        input.focus();
        autoResize(input);
        updateSendBtn();
      });
      grid.appendChild(btn);
    });

    picker.appendChild(grid);
  });
}

/** Toggle the emoji picker panel open/closed. */
function toggleEmojiPicker() {
  const picker = document.getElementById('emoji-picker');
  const btn    = document.getElementById('emoji-toggle');
  const open   = picker.classList.toggle('open');
  picker.setAttribute('aria-hidden', String(!open));
  btn.setAttribute('aria-expanded', String(open));
  btn.classList.toggle('active', open);
}

/** Close the emoji picker if it's open. */
function closeEmojiPicker() {
  const picker = document.getElementById('emoji-picker');
  picker.classList.remove('open');
  picker.setAttribute('aria-hidden', 'true');
  document.getElementById('emoji-toggle').setAttribute('aria-expanded', 'false');
  document.getElementById('emoji-toggle').classList.remove('active');
}

/* ============================================================
   13. INPUT BAR HELPERS
   ============================================================ */

/** Auto-expand the textarea height to fit its content (up to max-height in CSS). */
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

/** Enable/disable the send button based on whether the textarea has content. */
function updateSendBtn() {
  const hasText = document.getElementById('msg-input').value.trim().length > 0;
  const btn     = document.getElementById('send-btn');
  btn.disabled  = !hasText;
}

/* ============================================================
   14. UTILITY FUNCTIONS
   ============================================================ */

/** Smooth-scroll the messages area to the very bottom. */
function scrollToBottom() {
  const area = document.getElementById('messages-area');
  requestAnimationFrame(() => {
    area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
  });
}

/**
 * Format a Date object to a 12-hour time string (e.g. "3:45 PM").
 * @param {Date} d
 * @returns {string}
 */
function formatTime(d) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Truncate a string to `n` chars, appending an ellipsis if needed.
 * @param {string} str
 * @param {number} n
 * @returns {string}
 */
function truncate(str, n) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

/**
 * Escape HTML special characters to prevent XSS when injecting user text.
 * @param {string} str
 * @returns {string}
 */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Wrap bare URLs in anchor tags.
 * @param {string} str - Already HTML-escaped string.
 * @returns {string}
 */
function linkify(str) {
  return str.replace(
    /(https?:\/\/[^\s<>"']+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
  );
}

/**
 * Return true if the string contains only emoji characters (no plain text).
 * Used to render "emoji-only" messages larger.
 * @param {string} str
 * @returns {boolean}
 */
function isEmojiOnly(str) {
  const stripped = str
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u{2600}-\u{27FF}]/gu,   '')
    .replace(/[\u{FE00}-\u{FEFF}]/gu,   '')
    .replace(/\uD83C[\uDF00-\uDFFF]/g,  '')
    .replace(/\uD83D[\uDC00-\uDFFF]/g,  '')
    .replace(/\uD83E[\uDD00-\uDFFF]/g,  '')
    .trim();
  return stripped.length === 0 && str.trim().length > 0;
}

/* ============================================================
   MOBILE SIDEBAR HELPERS
   ============================================================ */

function openMobileSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('visible');
}

function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('visible');
}

/* ============================================================
   15. EVENT BINDING
   ============================================================ */

function bindEvents() {

  /* — Theme toggle — */
  document.getElementById('theme-toggle').addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  /* — Sidebar search — */
  document.getElementById('search-input').addEventListener('input', (e) => {
    renderSidebar(e.target.value);
  });

  /* — Send button — */
  document.getElementById('send-btn').addEventListener('click', sendMessage);

  /* — Textarea: auto-resize + enable send btn + Enter to send — */
  const msgInput = document.getElementById('msg-input');

  msgInput.addEventListener('input', () => {
    autoResize(msgInput);
    updateSendBtn();
  });

  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  /* — Emoji picker toggle — */
  document.getElementById('emoji-toggle').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleEmojiPicker();
  });

  /* — Reaction popup: click each emoji button — */
  document.getElementById('reaction-popup').querySelectorAll('.react-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!state.reactionTarget) return;
      const { msgId, convoId } = state.reactionTarget;
      toggleReaction(btn.dataset.emoji, msgId, convoId);
    });
  });

  /* — Close emoji picker & reaction popup on outside click — */
  document.addEventListener('click', (e) => {
    // Close emoji picker
    const picker      = document.getElementById('emoji-picker');
    const emojiToggle = document.getElementById('emoji-toggle');
    if (picker.classList.contains('open') && !picker.contains(e.target) && e.target !== emojiToggle) {
      closeEmojiPicker();
    }

    // Close reaction popup
    const popup = document.getElementById('reaction-popup');
    if (popup.classList.contains('visible') && !popup.contains(e.target)) {
      hideReactionPopup();
    }
  });

  /* — Escape key: close panels — */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEmojiPicker();
      hideReactionPopup();
    }
  });

  /* — Mobile hamburger — */
  document.getElementById('hamburger').addEventListener('click', openMobileSidebar);
  document.getElementById('sidebar-overlay').addEventListener('click', closeMobileSidebar);

}