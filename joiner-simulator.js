// joiner-simulator.js (enhanced, chunked, sticker)
// -------------------------------------------------
// Responsible for simulating new joiners, creating Telegram-style join stickers,
// posting welcome messages, seeding history, and updating member counts.
// Non-blocking chunked operations and robust fallbacks included.
// -------------------------------------------------

(function(){
  const LS_KEY = "abrox_joiner_state_v1_v2";
  const DEFAULTS = {
    minIntervalMs: 1000*60*60*6,
    maxIntervalMs: 1000*60*60*24,
    burstMin: 1,
    burstMax: 6,
    welcomeAsSystem: true,
    verifyMessageProbability: 0.18,
    stickerMaxAvatars: 8,
    stickerAvatarSize: 42,
    stickerOverlap: 12,
    initialBurstPreview: 6
  };

  const cfg = Object.assign({}, DEFAULTS, window.JOINER_CONFIG || {});
  let running = false;
  let _timer = null;
  const usedJoinNames = new Set();
  let preGenPool = [];

  // small helpers
  function randInt(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
  function safeMeta(){ return document.getElementById("tg-meta-line"); }
  function bumpMemberCount(n = 1){
    window.MEMBER_COUNT = Math.max(0, (window.MEMBER_COUNT || 0) + n);
    const m = safeMeta();
    if(m) m.textContent = `${(window.MEMBER_COUNT||0).toLocaleString()} members, ${(window.ONLINE_COUNT||0).toLocaleString()} online`;
  }

  function createJoinerFromIdentity(){
    if(window.identity && typeof window.identity.getRandomPersona === "function"){
      const p = window.identity.getRandomPersona();
      if(usedJoinNames.has(p.name)){
        for(let i=0;i<10;i++){
          const q = window.identity.getRandomPersona();
          if(!usedJoinNames.has(q.name)){
            usedJoinNames.add(q.name);
            q.lastSeen = Date.now();
            return q;
          }
        }
      } else {
        usedJoinNames.add(p.name);
        p.lastSeen = Date.now();
        return p;
      }
    }
    // fallback synthetic joiner
    const f = { name: "NewMember" + randInt(1000, 99999), avatar: `https://i.pravatar.cc/100?img=${randInt(1,90)}`, isAdmin:false };
    usedJoinNames.add(f.name);
    return f;
  }

  // pre-generate pool to avoid small-latency at join time
  function preGenerate(count){
    preGenPool = preGenPool || [];
    const toCreate = Math.max(0, count - preGenPool.length);
    for(let i=0;i<toCreate;i++) preGenPool.push(createJoinerFromIdentity());
    return preGenPool.length;
  }

  function nextJoiner(){
    if(preGenPool && preGenPool.length) return preGenPool.shift();
    return createJoinerFromIdentity();
  }

  function randomWelcomeText(persona){
    const variants = [
      "Hi everyone! 👋",
      "Hello! Glad to join.",
      "Hey — excited to learn and trade with you all.",
      "New here — say hi!",
      "Thanks for having me 😊",
      "Just joined, looking forward to the signals."
    ];
    let v = variants[Math.floor(Math.random()*variants.length)];
    if(persona && persona.sentiment === "bullish" && Math.random() < 0.4) v = "Ready to go long 🔥";
    return v;
  }

  // create a Telegram-like join sticker element (clustered avatars + names)
  function createJoinStickerElement(joiners){
    const container = document.createElement("div");
    container.className = "tg-join-sticker";

    const cluster = document.createElement("div");
    cluster.className = "join-cluster";

    const maxAv = Math.min(cfg.stickerMaxAvatars, joiners.length);
    const shown = joiners.slice(0, maxAv);

    shown.forEach((p, i) => {
      const a = document.createElement("img");
      a.src = p.avatar || (p.isAdmin ? "assets/admin.jpg" : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}`);
      a.alt = p.name || "user";
      a.onerror = function(){
        try{
          if(!this.src.includes("assets/admin.jpg")) this.src = "assets/admin.jpg";
          else this.src = "https://ui-avatars.com/api/?name=U";
        }catch(e){ this.src = "https://ui-avatars.com/api/?name=U"; }
      };
      // overlapping look handled by CSS margin-left negative
      cluster.appendChild(a);
    });

    if(joiners.length > shown.length){
      const more = document.createElement("div");
      more.textContent = `+${joiners.length - shown.length}`;
      more.style.width = cfg.stickerAvatarSize + "px";
      more.style.height = cfg.stickerAvatarSize + "px";
      more.style.display = "flex";
      more.style.alignItems = "center";
      more.style.justifyContent = "center";
      more.style.borderRadius = "50%";
      more.style.background = "rgba(255,255,255,0.06)";
      more.style.color = "var(--tg-text)";
      more.style.fontSize = "13px";
      cluster.appendChild(more);
    }

    container.appendChild(cluster);

    const names = document.createElement("div");
    names.className = "join-names";
    names.textContent = shown.map(p => p.name).join(", ") + (joiners.length > shown.length ? ` and ${joiners.length - shown.length} others` : "");
    container.appendChild(names);

    const sub = document.createElement("div");
    sub.className = "join-sub";
    sub.textContent = "joined the group";
    container.appendChild(sub);

    return container;
  }

  function appendStickerToChat(stickerEl, timestamp){
    const chat = document.getElementById("tg-comments-container");
    if(!chat){
      console.warn("joiner-simulator: chat container missing");
      return null;
    }
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.justifyContent = "center";
    wrapper.style.padding = "6px 0";
    wrapper.dataset.joinTimestamp = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();
    wrapper.appendChild(stickerEl);
    chat.appendChild(wrapper);
    // scroll to latest
    chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });
    return wrapper;
  }

  function postWelcomeAsBubbles(joiner, opts){
    const persona = joiner;
    const text = randomWelcomeText(joiner);
    if(window.TGRenderer && typeof window.TGRenderer.showTyping === "function") window.TGRenderer.showTyping(persona, 700 + Math.random()*500);
    setTimeout(()=>{
      if(window.TGRenderer && typeof window.TGRenderer.appendMessage === "function"){
        window.TGRenderer.appendMessage(persona, text, { timestamp: opts && opts.timestamp ? opts.timestamp : new Date(), type: "incoming" });
      }
    }, 700 + Math.random()*500);
  }

  function postJoinerFlow(joiners, opts){
    opts = opts || {};
    const timestamp = opts.timestamp || new Date();
    bumpMemberCount(joiners.length || 1);

    if((joiners.length || 1) > 2){
      const stickerEl = createJoinStickerElement(joiners);
      appendStickerToChat(stickerEl, timestamp);

      // then post a few personal welcome messages from sample joiners
      const sample = joiners.slice(0, Math.min(cfg.initialBurstPreview, joiners.length));
      sample.forEach((p, idx) => {
        setTimeout(()=> postWelcomeAsBubbles(p, { timestamp: new Date() }), 800 + idx*600 + Math.random()*300);
      });
    } else {
      joiners.forEach((p, idx) => {
        setTimeout(()=> postWelcomeAsBubbles(p, { timestamp: new Date() }), idx*600 + Math.random()*200);
      });
    }

    // small probability admin asks to verify via Contact Admin (simulate safety/flow)
    if(Math.random() < cfg.verifyMessageProbability){
      const admin = (window.identity && window.identity.Admin) ? window.identity.Admin : { name: "Admin", avatar: "assets/admin.jpg" };
      setTimeout(()=> {
        if(window.TGRenderer && typeof window.TGRenderer.appendMessage === "function"){
          window.TGRenderer.appendMessage(admin, "Please verify via Contact Admin.", { timestamp: new Date(), type: "outgoing" });
        }
      }, 1200 + (joiners.length * 200));
    }
  }

  // schedule repeated joiner bursts
  function scheduleNext(){
    if(!running) return;
    const min = Math.max(1000, cfg.minIntervalMs || DEFAULTS.minIntervalMs);
    const max = Math.max(min+1, cfg.maxIntervalMs || DEFAULTS.maxIntervalMs);
    const base = Math.floor(min + Math.random() * (max - min));
    const jitter = Math.floor(Math.random() * Math.min(60000, Math.floor(base * 0.25)));
    const next = base + jitter;
    _timer = setTimeout(()=>{
      const burst = randInt(cfg.burstMin, cfg.burstMax);
      const joiners = [];
      for(let i=0;i<burst;i++) joiners.push(nextJoiner());
      try{ postJoinerFlow(joiners, { timestamp: new Date() }); }catch(e){ console.warn("joiner-simulator: postJoinerFlow failed", e); }
      scheduleNext();
    }, next);
  }

  function start(){
    if(running) return;
    running = true;
    // small pre-generate
    try{ preGenerate(8); }catch(e){}
    scheduleNext();
    try{ localStorage.setItem(LS_KEY, JSON.stringify({ lastRun: Date.now() })); }catch(e){}
    console.log("joiner-simulator started");
  }

  function stop(){
    if(_timer) clearTimeout(_timer);
    running = false;
    console.log("joiner-simulator stopped");
  }

  // immediate join now (non-blocking chunked if many)
  function joinNow(n){
    n = Math.max(1, Math.floor(n || 1));
    const CHUNK = 40;
    let done = 0;
    function doChunk(){
      const take = Math.min(CHUNK, n - done);
      const arr = [];
      for(let i=0;i<take;i++) arr.push(nextJoiner());
      try{ postJoinerFlow(arr, { timestamp: new Date() }); }catch(e){ console.warn("joiner-simulator chunk post failed", e); }
      done += take;
      if(done < n) setTimeout(doChunk, 120);
    }
    doChunk();
  }

  // seed history in chunks to avoid freezing UI
  function seedHistory(days = 90, perDay = 5){
    days = Math.max(1, Math.floor(days));
    perDay = Math.max(0, Math.floor(perDay));
    const total = days * perDay;
    if(total === 0) return Promise.resolve(0);
    return new Promise(resolve => {
      const CHUNK = 80;
      let done = 0;
      function doChunk(){
        const take = Math.min(CHUNK, total - done);
        for(let i=0;i<take;i++){
          const idx = done + i;
          const day = Math.floor(idx / perDay);
          const timeInDay = Math.floor(Math.random() * 24 * 60 * 60 * 1000);
          const ts = new Date(Date.now() - day * 24 * 60 * 60 * 1000 - timeInDay);
          const j = nextJoiner();
          try{ postJoinerFlow([j], { timestamp: ts, welcomeAsSystem: true }); }catch(e){ /* continue */ }
        }
        done += take;
        if(done < total) setTimeout(doChunk, 120);
        else resolve(total);
      }
      setTimeout(doChunk, 40);
    });
  }

  function sanityCheck(){
    return {
      identity: !!(window.identity && typeof window.identity.getRandomPersona === "function"),
      TGRenderer: !!(window.TGRenderer && typeof window.TGRenderer.appendMessage === "function"),
      chat: !!document.getElementById("tg-comments-container"),
      meta: !!document.getElementById("tg-meta-line")
    };
  }

  // expose API
  window.joiner = window.joiner || {};
  Object.assign(window.joiner, {
    start,
    stop,
    joinNow,
    seedHistory,
    preGenerate,
    preGenPool,
    sanityCheck,
    config: cfg,
    isRunning: () => running
  });

  // small preview burst to show activity on load
  setTimeout(()=>{ try{ joinNow(Math.max(1, (window.JOINER_CONFIG && window.JOINER_CONFIG.initialJoins) || 3)); }catch(e){} }, 500);

  console.log("joiner-simulator ready");
})();
