// bubble-renderer.js — Fixed avatar sizing, joiners, pin banner & safe rendering
(function(){
  'use strict';

  const CONTAINER = document.getElementById('tg-comments-container');
  const SEEN_MAP = window.__abrox_seen_map || new Map();
  const DATE_FORMAT = { month: 'short', day: 'numeric' };

  if(!CONTAINER){
    console.error('bubble-renderer.js: container missing');
    return;
  }

  const MSG_MAP = new Map();
  let lastDateStr = '';

  // -----------------------------
  // HELPERS
  // -----------------------------
  function formatDate(date){
    return new Intl.DateTimeFormat('en-US', DATE_FORMAT).format(date);
  }

  function createAvatar(src, fallbackName){
    const img = document.createElement('img');
    img.className = 'tg-bubble-avatar';
    img.src = src || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&size=256&background=random`;
    img.onerror = () => { img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&size=256&background=random`; };
    img.width = 36;
    img.height = 36;
    return img;
  }

  function createBubble(persona, text, opts={}){
    const bubble = document.createElement('div');
    bubble.className = `tg-bubble ${opts.type||'incoming'}`;
    bubble.dataset.id = opts.id || `msg_${Date.now()}_${Math.floor(Math.random()*9999)}`;

    // Avatar
    const avatar = createAvatar(persona.avatar, persona.name);
    bubble.appendChild(avatar);

    // Content
    const content = document.createElement('div');
    content.className = 'tg-bubble-content';

    if(opts.replyToText){
      const reply = document.createElement('div');
      reply.className = 'tg-bubble-reply';
      reply.textContent = opts.replyToText.slice(0,120);
      content.appendChild(reply);
    }

    const txt = document.createElement('div');
    txt.className = 'tg-bubble-text';
    txt.textContent = text;
    content.appendChild(txt);

    bubble.appendChild(content);

    // Seen indicator for outgoing
    if(opts.type==='outgoing'){
      const seen = document.createElement('span');
      seen.className = 'tg-bubble-seen';
      seen.textContent = SEEN_MAP.get(bubble.dataset.id) || '✓';
      content.appendChild(seen);
    }

    insertDateSticker(bubble, opts.timestamp || new Date());

    MSG_MAP.set(bubble.dataset.id, bubble);
    return bubble;
  }

  // -----------------------------
  // DATE STICKER
  // -----------------------------
  function insertDateSticker(bubble, ts){
    const dateStr = formatDate(new Date(ts));
    if(dateStr !== lastDateStr){
      lastDateStr = dateStr;
      const sticker = document.createElement('div');
      sticker.className = 'tg-date-sticker';
      sticker.textContent = dateStr;
      CONTAINER.appendChild(sticker);
    }
  }

  // -----------------------------
  // APPEND SAFE
  // -----------------------------
  function appendMessage(persona, text, opts={}){
    const bubble = createBubble(persona, text, opts);

    CONTAINER.appendChild(bubble);
    CONTAINER.scrollTop = CONTAINER.scrollHeight;

    return bubble.dataset.id;
  }

  // -----------------------------
  // JOIN STICKERS
  // -----------------------------
  function createJoinSticker(joiners){
    const container = document.createElement('div');
    container.className = 'tg-join-sticker';

    const cluster = document.createElement('div');
    cluster.className = 'join-cluster';

    joiners.forEach((p, idx)=>{
      if(idx>7) return; // max 8 avatars
      const img = createAvatar(p.avatar, p.name);
      img.className = 'join-avatar';
      img.style.marginLeft = idx===0 ? '0px' : '-12px';
      cluster.appendChild(img);
    });

    if(joiners.length>8){
      const more = document.createElement('div');
      more.className = 'join-more';
      more.textContent = `+${joiners.length-8}`;
      cluster.appendChild(more);
    }

    container.appendChild(cluster);

    const names = document.createElement('div');
    names.className = 'join-names';
    names.textContent = joiners.slice(0,8).map(p=>p.name).join(', ') +
      (joiners.length>8 ? ` and ${joiners.length-8} others` : '');
    container.appendChild(names);

    const sub = document.createElement('div');
    sub.className = 'join-sub';
    sub.textContent = 'joined the group';
    container.appendChild(sub);

    CONTAINER.appendChild(container);
    CONTAINER.scrollTop = CONTAINER.scrollHeight;
  }

  // -----------------------------
  // EXPORTS
  // -----------------------------
  window.TGRenderer = {
    appendMessage,
    showTyping: function(persona, duration=1000){
      const bubble = createBubble(persona, '...', { type:'incoming' });
      bubble.classList.add('typing');
      CONTAINER.appendChild(bubble);
      CONTAINER.scrollTop = CONTAINER.scrollHeight;
      setTimeout(()=>{ bubble.remove(); }, duration);
    },
    appendJoinSticker: createJoinSticker
  };

  console.log('bubble-renderer.js — avatars, bubbles, join stickers fixed');
})();
