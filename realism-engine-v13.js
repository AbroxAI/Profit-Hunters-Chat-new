// realism-engine-v13-fixed-robust.js
// ============================================================
// ULTRA REALITY MODE V13 — ROBUST
// REALISTIC ONLINE COUNT + UNREAD PILL + AVATAR TAILS + TELEGRAM BUBBLES + SAFETY
// ============================================================

(function(){

  const CONFIG = {
    initialSeedCount: 1000,
    minPoolSize: 800,
    targetPoolSize: 2500,
    postIntervalBase: 6000,
    postIntervalJitter: 25000,
    reactionChance: 0.38,
    repliesMax: 6,
    persistKey: "abrox_realism_v13_generated",
    persistMaxKeep: 10000,
    memoryTrimLimit: 7000,
    clusterMax: 5,
    onlineBase: 86,
    onlineJitter: 12,
    avatarFallback: "assets/avatars/avatar_default.jpg"
  };

  // ---------- Helpers ----------
  function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function maybe(p){ return Math.random() < p; }
  function rand(max=9999){ return Math.floor(Math.random()*max); }

  function safeId(prefix="r"){
    if(window.crypto && crypto.randomUUID){
      return prefix + "_" + crypto.randomUUID();
    }
    return prefix + "_" + Date.now().toString(36) + "_" + rand(99999);
  }

  function djb2Hash(str){
    let h = 5381;
    for(let i=0;i<str.length;i++){
      h = ((h << 5) + h) + str.charCodeAt(i);
      h = h >>> 0;
    }
    return String(h);
  }

  // =========================
  // 🔥 POOLS AND DATA
  // =========================
  const ASSETS = ["EUR/USD","BTC/USD","ETH/USD","USD/JPY","GBP/USD","AUD/USD","US30","NAS100",
    "GOLD","SILVER","NZD/USD","USD/CAD","EUR/JPY","SPX500","DOGE/USD",
    "XAU/USD","XAG/USD","GBP/JPY","EUR/GBP","AUD/JPY","USD/CHF","EUR/AUD"];
  const BROKERS = ["IQ Option","Binomo","Pocket Option","Deriv","Olymp Trade","Quotex",
    "Spectre","Binary.com","Expert Option","VideForex","RaceOption"];
  const TIMEFRAMES = ["M1","M2","M3","M5","M10","M15","M30","H1","H2","H4","D1"];
  const RESULT_WORDS = ["green","red","profit","loss","win","missed entry","recovered",
    "swing trade success","scalped nicely","small win","big win","moderate loss","loss recovered",
    "double profit","consistent profit","partial win","micro win","entry late but profitable",
    "stopped loss","hedged correctly","full green streak","partial loss","tp hit","closed in loss",
    "nice scalp","good hedge","stopped out","missed TP","took profit","broke even","perfect exit",
    "swing winner","overnight hold profit","clean entry","early entry","late entry but worked","fake breakout caught"];
  const EMOJIS = ["💸","🔥","💯","✨","😎","👀","📈","🚀","💰","🤑","🎯","🏆","🤖","🎉",
    "🍀","📊","⚡","💎","👑","🦄","🥂","💡","📉","🧠","🙏","🙌","😅",
    "🤦","😬","🤝","✅","❌","🔒","🔓","📣","📢","📌","🔔","⚠️",
    "🟢","🔴","💥","🥶","🥵","😤","🤯","🤩","😈","🤓","💪","📍",
    "💵","💲","💹","🧾","🧮","⏳","⌛","🛑","🎰","📆","🌙","☀️"];

  const REGIONAL_SLANG = {
    western: ["bro","ngl","lowkey","fr","tbh","bet","dope","lit","mad","cap","no cap","fam"],
    african: ["my guy","omo","chai","no wahala","gbam","yawa","sweet","jollof","palava","chop"],
    asian: ["lah","brother","steady","respect","solid one","ganbatte","wa","neat","ok lah","yah"],
    latin: ["amigo","vamos","muy bueno","dale","buenisimo","chevere","oye","mano","olé"],
    eastern: ["comrade","strong move","not bad","da","top","okey","nu","bravo","excellent","good work"]
  };
  const ENGAGEMENT = ["Nice!","GG","Solid entry","On point","Legend","Who else entered?",
    "Share entry","TP?","SL?","Risk %?","Any hedge?","Chart please",
    "Admin nailed it","Signal clean","That candle wicked"];

  // ---------- State ----------
  const GENERATED_HASHES = new Set();
  try{
    const raw = localStorage.getItem(CONFIG.persistKey);
    if(raw) JSON.parse(raw).forEach(h=>GENERATED_HASHES.add(h));
  }catch(e){}
  const POOL = [];
  let UNREAD_COUNT = 0;
  let timer = null;

  // ---------- Realistic Online Count ----------
  function simulateOnline(){
    if(!window.MEMBER_COUNT) window.MEMBER_COUNT=1284;
    if(!window.ONLINE_COUNT) window.ONLINE_COUNT=CONFIG.onlineBase;
    let delta = Math.floor(Math.random()*CONFIG.onlineJitter*2) - CONFIG.onlineJitter;
    window.ONLINE_COUNT = Math.max(45, Math.min(window.MEMBER_COUNT, window.ONLINE_COUNT + delta));
    const meta = document.getElementById("tg-meta-line");
    if(meta) meta.textContent = `${window.MEMBER_COUNT.toLocaleString()} members, ${window.ONLINE_COUNT.toLocaleString()} online`;
    timer && clearTimeout(timer);
    timer = setTimeout(simulateOnline, 5000 + rand(5000));
  }
  simulateOnline();

  // ---------- Core Methods ----------
  function isDuplicate(text){ return GENERATED_HASHES.has(djb2Hash(text.slice(0,300))); }
  function mark(text){
    const key = djb2Hash(text.slice(0,300));
    GENERATED_HASHES.add(key);
    const arr = Array.from(GENERATED_HASHES).slice(-CONFIG.persistMaxKeep);
    try{ localStorage.setItem(CONFIG.persistKey, JSON.stringify(arr)); }catch(e){}
  }

  function getPersona(){
    if(window.identity?.getRandomPersona) return window.identity.getRandomPersona();
    const name = "User"+rand(9999);
    const regions = Object.keys(REGIONAL_SLANG);
    const region = random(regions);
    return { name, region, avatar:`assets/avatars/avatar${rand(300)}.jpg` };
  }

  function composeMessage(persona){
    const asset = random(ASSETS), broker = random(BROKERS), tf = random(TIMEFRAMES), result = random(RESULT_WORDS);
    const templates = [
      ()=>`Took ${asset} ${tf} — ${result} ${random(EMOJIS)}`,
      ()=>`Scalped ${asset} on ${broker}, ${result} ${maybe(0.5)?random(EMOJIS):""}`,
      ()=>`${asset} ${tf} looking strong ${random(EMOJIS)}`,
      ()=>`${random(ENGAGEMENT)} ${asset}`,
      ()=>`${random(REGIONAL_SLANG[persona.region])} ${asset} ${result}`,
      ()=>`${persona.name.split(" ")[0]} caught ${asset} ${tf} ${random(EMOJIS)}`,
      ()=>`Anyone on ${asset}? ${random(EMOJIS)}`,
      ()=>`Missed ${asset} entry 😩 but next one locked in`,
      ()=>`Risked 2% on ${asset} ${tf} — ${result}`,
      ()=>`That ${asset} breakout was clean ${random(EMOJIS)}`
    ];
    let text = random(templates)();
    if(maybe(0.6)) text += " " + random(EMOJIS);
    if(maybe(0.3)) text += " " + random(REGIONAL_SLANG[persona.region]);
    return text.trim();
  }

  function generate(){
    const persona = getPersona();
    let text = composeMessage(persona);
    let tries = 0;
    while(isDuplicate(text) && tries<30){
      text = composeMessage(persona) + " " + rand(999);
      tries++;
    }
    mark(text);
    if(!persona.avatar) persona.avatar = CONFIG.avatarFallback;
    return { persona, text, timestamp:new Date(Date.now() - rand(2000000)), id:safeId() };
  }

  function ensurePool(min){ while(POOL.length < min) POOL.push(generate()); }

  function post(count=1){
    ensurePool(CONFIG.minPoolSize);
    for(let i=0;i<count;i++){
      if(!POOL.length) break;
      const msg = POOL.shift();
      if(window.TGRenderer?.appendMessage){
        window.TGRenderer.appendMessage(msg.persona,msg.text,{ timestamp:msg.timestamp,type:"incoming",id:msg.id });
        UNREAD_COUNT++;
        updateUnreadPill();
      }
      if(maybe(CONFIG.reactionChance)) triggerReply(msg.text);
    }
  }

  function triggerReply(baseText){
    const replies = 1 + rand(CONFIG.clusterMax);
    for(let i=0;i<replies;i++){
      setTimeout(()=>{
        const reply = generate();
        if(window.TGRenderer?.appendMessage){
          window.TGRenderer.appendMessage(reply.persona,reply.text,{ timestamp:new Date(), type:"incoming", replyToText:baseText });
          // auto-replies do NOT increment unread
        }
      }, 600 + rand(1800));
    }
  }

  // ---------- Unread Pill ----------
  function updateUnreadPill(){ const pill = document.getElementById("tg-unread-pill"); if(pill) pill.textContent = UNREAD_COUNT; }
  function resetUnreadPill(){ UNREAD_COUNT=0; updateUnreadPill(); }
  document.addEventListener("click", e=>{ if(e.target.closest("#tg-comment-input")) resetUnreadPill(); });

  // ---------- Scheduler ----------
  function tick(){
    post(1);
    if(maybe(0.25)) post(1 + rand(3));
    const hour = new Date().getHours();
    let delay = CONFIG.postIntervalBase + rand(CONFIG.postIntervalJitter);
    if(hour >=0 && hour <6) delay *= 1.8; // night slowdown
    timer=setTimeout(tick, delay);
  }

  function start(){ ensurePool(CONFIG.minPoolSize); setTimeout(()=>tick(),1500); }

  window.realism = { start, post, ensurePool, refill:()=>ensurePool(CONFIG.targetPoolSize), resetUnreadPill };

  function wait(){ if(window.TGRenderer?.appendMessage) start(); else setTimeout(wait,300); }
  wait();

  // ---------- Clean up on unload ----------
  window.addEventListener("beforeunload",()=>{ timer && clearTimeout(timer); });

  console.log("realism-engine-v13 FIXED ROBUST loaded");

})();
