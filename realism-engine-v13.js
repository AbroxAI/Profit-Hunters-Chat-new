// realism-engine-v13-abrox-multi-persona-typos-typing-final.js
// ============================================================
// ULTRA REALITY MODE V13 — MULTI-PERSONA, HUMAN-LIKE COMMUNITY
// FULLY EXPANDED POOLS + REAL ABROX WINS + MICRO-DEBATES
// HUMAN TYPO MISTAKES + TYPING DELAYS + PER-PERSONA SPEED + SESSION MOOD + BULL/BEAR
// ============================================================

(function(){

  const CONFIG = {
    initialSeedCount: 2000,
    minPoolSize: 1500,
    targetPoolSize: 5000,
    postIntervalBase: 4000,
    postIntervalJitter: 30000,
    reactionChance: 0.5,
    repliesMax: 8,
    persistKey: "abrox_realism_v13_generated",
    persistMaxKeep: 20000,
    memoryTrimLimit: 15000,
    clusterMax: 8,
    onlineBase: 120,
    onlineJitter: 20,
    avatarFallback: "assets/avatars/avatar_default.jpg",
    debateChance: 0.3,
    sessionMood: { asia: 0.6, london: 1.0, ny: 1.5 },
    abroxWinChance: 0.85,
    multiPersonaChainChance: 0.45,
    typoChance: 0.3,
    typingDelayMin: 200,
    typingDelayMax: 2200
  };

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
  // POOLS AND DATA
  // =========================
  const ASSETS = ["EUR/USD","BTC/USD","ETH/USD","USD/JPY","GBP/USD","AUD/USD","US30","NAS100",
    "GOLD","SILVER","NZD/USD","USD/CAD","EUR/JPY","SPX500","DOGE/USD",
    "XAU/USD","XAG/USD","GBP/JPY","EUR/GBP","AUD/JPY","USD/CHF","EUR/AUD",
    "SOL/USD","ADA/USD","DOT/USD","BNB/USD","LTC/USD"];

  const BROKERS = ["IQ Option","Binomo","Pocket Option","Deriv","Olymp Trade","Quotex",
    "Spectre","Binary.com","Expert Option","VideForex","RaceOption","PocketTrader","AlphaOption"];

  const TIMEFRAMES = ["M1","M2","M3","M5","M10","M15","M30","H1","H2","H4","D1","W1"];

  const RESULT_WORDS = ["green","profit","win","big win","swing winner","tp hit","full green streak",
                        "micro win","entry late but profitable","recovered","nice scalp","took profit",
                        "excellent win","solid gain","consistent profit","double profit","partial win","clean exit"];

  const EMOJIS = ["💸","🔥","💯","✨","😎","👀","📈","🚀","💰","🤑","🎯","🏆","🤖","🎉",
    "🍀","📊","⚡","💎","👑","🦄","🥂","💡","📉","🧠","🙏","🙌","😅",
    "🤦","😬","🤝","✅","❌","🔒","🔓","📣","📢","📌","🔔","⚠️",
    "🟢","🔴","💥","🥶","🥵","😤","🤯","🤩","😈","🤓","💪","📍",
    "💵","💲","💹","🧾","🧮","⏳","⌛","🛑","🎰","📆","🌙","☀️",
    "💫","🌟","🔥🔥","🚀🚀","💹💹","📈📈"];

  const REGIONAL_SLANG = {
    western: ["bro","ngl","lowkey","fr","tbh","bet","dope","lit","mad","cap","no cap","fam","flex","hype","savage"],
    african: ["my guy","omo","chai","no wahala","gbam","yawa","sweet","jollof","palava","chop","shaba","sisi","broda"],
    asian: ["lah","brother","steady","respect","solid one","ganbatte","wa","neat","ok lah","yah","sugoi","kampai"],
    latin: ["amigo","vamos","muy bueno","dale","buenisimo","chevere","oye","mano","olé","qué tal","bien hecho"],
    eastern: ["comrade","strong move","not bad","da","top","okey","nu","bravo","excellent","good work","well done"]
  };

  const ENGAGEMENT = [
    "Nice!","GG","Solid entry","On point","Legend","Clean setup","Beautiful chart","That was smooth",
    "Perfect timing","Sharp entry","Sniper entry","This is why patience pays","Market respected that level",
    "Admin nailed it","Signal clean","That candle wicked","We eating today","Team green 🟢","Back in profit","Locked in",
    "Anyone else took this?","Did you hold full TP?","TP?","SL?","Risk %?","RR ratio?","How many pips?","Was that news driven?",
    "Manual or signal?","Spot or futures?","Scalp or swing?","Breakout or pullback entry?","Volume looked strong?","Late entry possible?",
    "Re-entry coming?","Next target where?","Session trade or overnight?","Who caught the wick?","Missed it 😩","FOMO hit hard",
    "Closed too early 😅","Held too long ngl","Partial profit better than loss","Discipline paid off","Patience wins again",
    "Almost panicked there","Market playing games today","That fake breakout though","Liquidity grab was obvious",
    "Smart money move","Retail got trapped","Spread was crazy","Slippage was wild","News spike madness","Consistency > luck"
  ];

  const GENERATED_HASHES = new Set();
  try{ 
    const raw = localStorage.getItem(CONFIG.persistKey); 
    if(raw) JSON.parse(raw).forEach(h=>GENERATED_HASHES.add(h)); 
  }catch(e){}

  const POOL = [];
  let UNREAD_COUNT = 0;
  let timer = null;

  // ---------- Online Count ----------
  function simulateOnline(){
    if(!window.MEMBER_COUNT) window.MEMBER_COUNT=2500;
    if(!window.ONLINE_COUNT) window.ONLINE_COUNT=CONFIG.onlineBase;
    let delta = Math.floor(Math.random()*CONFIG.onlineJitter*2) - CONFIG.onlineJitter;
    window.ONLINE_COUNT = Math.max(45, Math.min(window.MEMBER_COUNT, window.ONLINE_COUNT + delta));
    const meta = document.getElementById("tg-meta-line");
    if(meta) meta.textContent = `${window.MEMBER_COUNT.toLocaleString()} members, ${window.ONLINE_COUNT.toLocaleString()} online`;
    timer && clearTimeout(timer);
    timer = setTimeout(simulateOnline, 4000 + rand(4000));
  }
  simulateOnline();

  const IDENTITY = window.identity || {};
  window.REGIONAL_SLANG = REGIONAL_SLANG;

  function getPersona(){
    if(IDENTITY.getRandomPersona) return IDENTITY.getRandomPersona();
    const name = "User"+rand(9999);
    const regions = Object.keys(REGIONAL_SLANG);
    const region = random(regions);
    const sentiment = maybe(0.6) ? "bullish" : "bearish";
    // Assign per-persona typing speed
    const typingSpeed = CONFIG.typingDelayMin + rand(CONFIG.typingDelayMax-CONFIG.typingDelayMin);
    return { name, region, avatar:`assets/avatars/avatar${rand(300)}.jpg`, sentiment, typingSpeed };
  }

  // ---------- Human-like Typos ----------
  function humanizeText(text){
    if(!maybe(CONFIG.typoChance)) return text;
    const typoType = rand(4);
    const idx = rand(text.length);
    switch(typoType){
      case 0: // swap letters
        if(idx < text.length-1){
          const chars = text.split("");
          [chars[idx], chars[idx+1]] = [chars[idx+1], chars[idx]];
          text = chars.join("");
        }
        break;
      case 1: // remove letter
        text = text.slice(0,idx) + text.slice(idx+1);
        break;
      case 2: // duplicate letter
        const c = text[idx]||"";
        text = text.slice(0,idx)+c+c+text.slice(idx+1);
        break;
      case 3: // insert random letter
        const letters = "abcdefghijklmnopqrstuvwxyz";
        text = text.slice(0,idx)+letters[rand(letters.length)]+text.slice(idx);
        break;
    }
    return text;
  }

  function composeMessage(persona){
    let baseText = IDENTITY.generateHumanComment ? 
      IDENTITY.generateHumanComment(persona, composeRawMessage(persona)) :
      composeRawMessage(persona);

    if(persona.sentiment==="bullish" && maybe(0.7)) baseText = "🚀 " + baseText;
    if(persona.sentiment==="bearish" && maybe(0.5)) baseText = "⚠️ " + baseText;
    return humanizeText(baseText);
  }

  function composeRawMessage(persona){
    const asset = random(ASSETS), broker = random(BROKERS), tf = random(TIMEFRAMES);
    let result = maybe(CONFIG.abroxWinChance) ? random(RESULT_WORDS) : "minor loss";
    let text = random([
      ()=>`Abrox Bot: ${asset} ${tf} — ${result} ${random(EMOJIS)}`,
      ()=>`Trade update: ${asset} on ${broker} — ${result} ${random(EMOJIS)}`,
      ()=>`${asset} ${tf} looking strong ${random(EMOJIS)}`,
      ()=>`${random(ENGAGEMENT)} ${asset}`,
      ()=>`${persona.name} caught ${asset} ${tf} ${random(EMOJIS)}`,
      ()=>`Anyone tracking ${asset}? ${random(EMOJIS)}`
    ])();

    if(maybe(0.7)) text += " " + random(EMOJIS);

    if(maybe(CONFIG.debateChance) && POOL.length){
      const msg = POOL[rand(POOL.length)];
      if(msg && msg.text && msg.persona.name!==persona.name){
        text += " — "+random(["I think differently","Not sure about that","Disagree","Look closer","Check your setup"]);
      }
    }

    return text.trim();
  }

  function isDuplicate(text){ return GENERATED_HASHES.has(djb2Hash(text.slice(0,300))); }
  function mark(text){ 
    const key = djb2Hash(text.slice(0,300)); 
    GENERATED_HASHES.add(key); 
    try{ 
      localStorage.setItem(CONFIG.persistKey, JSON.stringify(Array.from(GENERATED_HASHES).slice(-CONFIG.persistMaxKeep))); 
    }catch(e){}
  }

  function generate(){ 
    const persona = getPersona();
    let text = composeMessage(persona);
    let tries = 0;
    while(isDuplicate(text) && tries<50){ text = composeMessage(persona) + " " + rand(999); tries++; }
    mark(text);
    if(!persona.avatar) persona.avatar = CONFIG.avatarFallback;
    return { persona, text, timestamp:new Date(Date.now() - rand(4000000)), id:safeId() };
  }

  function ensurePool(min){ while(POOL.length < min) POOL.push(generate()); }

  // ---------- Post with typing delay ----------
  function post(count=1){
    ensurePool(CONFIG.minPoolSize);
    for(let i=0;i<count;i++){
      if(!POOL.length) break;
      const msg = POOL.shift();
      const delay = msg.persona.typingSpeed || (CONFIG.typingDelayMin + rand(CONFIG.typingDelayMax-CONFIG.typingDelayMin));
      setTimeout(()=>{
        if(window.TGRenderer?.appendMessage){
          window.TGRenderer.appendMessage(msg.persona,msg.text,{ timestamp:msg.timestamp,type:"incoming",id:msg.id });
          UNREAD_COUNT++; updateUnreadPill();
        }
        if(maybe(CONFIG.reactionChance)) triggerMultiReplies(msg.text);
      }, delay);
    }
  }

  function triggerMultiReplies(baseText){
    const replies = 1 + rand(CONFIG.clusterMax);
    for(let i=0;i<replies;i++){
      const reply = generate();
      const delay = reply.persona.typingSpeed || (CONFIG.typingDelayMin + rand(CONFIG.typingDelayMax-CONFIG.typingDelayMin));
      setTimeout(()=>{
        if(window.TGRenderer?.appendMessage) window.TGRenderer.appendMessage(reply.persona,reply.text,{ timestamp:new Date(), type:"incoming", replyToText:baseText });
        if(maybe(CONFIG.multiPersonaChainChance)){
          const chainReply = generate();
          setTimeout(()=>{
            if(window.TGRenderer?.appendMessage) window.TGRenderer.appendMessage(chainReply.persona,chainReply.text,{ timestamp:new Date(), type:"incoming", replyToText:baseText });
          }, 400 + rand(1000));
        }
      }, delay);
    }
  }

  function updateUnreadPill(){ const pill = document.getElementById("tg-unread-pill"); if(pill) pill.textContent = UNREAD_COUNT; }
  function resetUnreadPill(){ UNREAD_COUNT=0; updateUnreadPill(); }
  document.addEventListener("click", e=>{ if(e.target.closest("#tg-comment-input")) resetUnreadPill(); });

  function tick(){
    post(1);
    if(maybe(0.35)) post(1 + rand(5));
    const hour = new Date().getHours();
    let delay = CONFIG.postIntervalBase + rand(CONFIG.postIntervalJitter);
    if(hour>=0 && hour<6) delay *= 1.8;
    else if(hour>=6 && hour<14) delay /= 1.05 * CONFIG.sessionMood.asia;
    else if(hour>=14 && hour<20) delay /= 1.0 * CONFIG.sessionMood.london;
    else delay /= 1.0 * CONFIG.sessionMood.ny;
    timer=setTimeout(tick, delay);
  }

  function start(){ ensurePool(CONFIG.minPoolSize); setTimeout(()=>tick(),1000); }

  window.realism = { start, post, ensurePool, refill:()=>ensurePool(CONFIG.targetPoolSize), resetUnreadPill };
  function wait(){ if(window.TGRenderer?.appendMessage) start(); else setTimeout(wait,300); }
  wait();
  window.addEventListener("beforeunload",()=>{ timer && clearTimeout(timer); });
  console.log("realism-engine-v13 ABROX BOT MULTI-PERSONA CHAINS + TYPO + PER-PERSONA TYPING loaded");

})();
