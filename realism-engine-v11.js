// realism-engine-v11.js (expanded pools + testimonials + emojis)
// ============================================================
// ULTRA-REALISM ENGINE V11 — EXPANDED
// - larger asset list (fx, indices, crypto, commodities)
// - more brokers
// - more timeframes
// - larger result words + testimonials pool (hundreds)
// - expanded emoji set
// - same dedupe, persistence, idempotence, reaction tick
// ============================================================

(function(){
  // ---------- expanded data pools ----------
  const ASSETS = [
    "EUR/USD","USD/JPY","GBP/USD","AUD/USD","BTC/USD","ETH/USD","USD/CHF","EUR/JPY","NZD/USD",
    "US30","NAS100","SPX500","DAX30","FTSE100","GOLD","SILVER","WTI","BRENT",
    "ADA/USD","SOL/USD","DOGE/USD","DOT/USD","LINK/USD","MATIC/USD","LUNC/USD","AVAX/USD",
    "JPY/CHF","GBP/JPY","EUR/GBP","AUD/JPY","CAD/JPY","US500","RUS_50"
  ];

  const BROKERS = [
    "IQ Option","Binomo","Pocket Option","Deriv","Olymp Trade","OlympTrade","Binary.com",
    "eToro","Plus500","IG","XM","FXTM","Pepperstone","IC Markets","Bybit","Binance","OKX","Kraken"
  ];

  const TIMEFRAMES = ["M1","M5","M15","M30","H1","H4","D1","W1","MN1"];

  const RESULT_WORDS = [
    "green","red","profit","loss","win","missed entry","recovered","scalped nicely","small win","big win","moderate loss",
    "loss recovered","double profit","consistent profit","partial win","micro win","entry late but profitable",
    "stopped loss","hedged correctly","full green streak","partial loss","break-even","tight stop","wide stop",
    "re-entry success","slippage hit","perfect exit","stop hunted","rolled over","swing profit","scalp win","gap fill",
    "retest failed","trend follow","mean reversion hit","liquidity grab","fakeout","nice tp hit","sloppy execution"
  ];

  const TESTIMONIALS = [
    "Made $450 in 2 hours using Abrox",
    "Closed 3 trades, all green today ✅",
    "Recovered a losing trade thanks to Abrox",
    "7 days straight of consistent profit 💹",
    "Abrox saved me from a $200 loss",
    "50% ROI in a single trading session 🚀",
    "Signal timing was perfect today",
    "Scalped 5 trades successfully today 🚀",
    "Missed entry but recovered",
    "Made $120 in micro trades this session",
    "Small wins add up over time, Abrox is legit",
    "Never had such accurate entries before",
    "This bot reduced stress, makes trading predictable 😌",
    "Entry was late but still profitable 💹",
    "Hedged correctly thanks to bot signals",
    "Altcoin signals were on point today",
    "Recovered yesterday’s loss in one trade",
    "Made $300 in under 3 hours",
    "Bot suggested perfect exit on USD/JPY",
    "Day trading made predictable thanks to Abrox",
    "Partial loss turned into full profit",
    "Consistency over randomness, love it! ❤️",
    "Scalping signals were super fast and accurate",
    "This bot makes trading almost automatic",
    "All my trades were profitable today",
    "Abrox reduced stress during volatile sessions",
    "Finally a signal provider that matches my style",
    "Demo->live transition was smooth using Abrox",
    "Excellent risk management suggestions from the bot",
    "Saved my account from a bad streak",
    "Signals for gold were spot on last week",
    "BTC signal hit full TP, insane accuracy",
    "Low drawdown profile, consistent green days",
    "Recovered losses in three trades today",
    "Good entries, taught me better timing",
    "Accurate scalp signals during London open",
    "Perfect for high-volatility sessions",
    "Signals paired well with my manual strategy",
    "Great for micro-scalping sessions",
    "Improved my win rate significantly",
    "Reduced FOMO, executed better with Abrox",
    "Reliable even in low-liquidity hours",
    "Saved me from a margin call",
    "Entry alerts always early enough to act",
    "Nice confluence signals — love the confirmations",
    "Good mix of conservative and aggressive setups",
    "Signals helped me hit consistent monthly goals",
    "Excellent for NAS100 scalps",
    "Hedging suggestion saved 40% of position",
    "Alerts are clear and actionable",
    "Support team quick to help with setup",
    "Works well with broker execution",
    "Good risk/reward setups most days",
    "Nice filters — avoid midday noise",
    "Recovered yesterday, green today",
    "Solid wins across forex majors",
    "Great for busy traders, low maintenance",
    "Consistent entries on H1 and H4",
    "TP levels conservative but reliable",
    "Great community, honest results",
    "Really helps manage emotional trading",
    "Reliable backtest results",
    "Easy to customize risk profile",
    "Never been this consistent before",
    "Compound profits slowly stacking up",
    "Good for both beginners and pros",
    "Clean UI, easy to follow signals",
    "Combined with my macro view it’s lethal",
    "Saved me time and improved accuracy",
    "Signals gave me a confident exit strategy",
    "High precision scalps during NY open",
    "Nice follow-through after breakout",
    "Recovered 3 losing days in one session",
    "Great for hedged entries and partial exits",
    "The alerts have a clear risk plan",
    "Abrox helped me manage portfolio drawdown",
    "Signals work well with limit orders",
    "Good for swing entries into trend"
    // (You can add more testimonials here; list is intentionally long)
  ];

  // expanded emoji set
  const EMOJIS = [
    "💸","🔥","💯","✨","😎","👀","📈","🚀","💰","🤑","🎯","🏆","🤖","🎉","🍀","📊","⚡","💎","👑","🦄",
    "🧠","🔮","🪙","🥂","💡","🛸","📉","📱","💬","🙌","👏","👍","❤️","😂","😅","🤞","✌️","😴","🤩",
    "😬","🤝","🧾","📌","🔔","⚠️","✅","❌","📎","🧩","🔗","🔒","🌕","🌑","🌟","🏁","💹","🏦","🧭","🧯",
    "🧨","📣","💤","🕐","🕒","🕘","🕛","🕓","🧿","🎚️","📬","🎲","📡","🪄","🧰","🔭","🌊","🌪️","🌤️","🛰️"
  ];

  // ---------- utilities & dedupe ----------
  function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function maybe(p){ return Math.random() < p; }
  function rand(max=9999){ return Math.floor(Math.random()*max); }

  // djb2 fingerprint for dedupe (stable)
  function djb2(str){ let h=5381; for(let i=0;i<str.length;i++) h=((h<<5)+h)+str.charCodeAt(i); return (h>>>0).toString(36); }
  function normalizeText(t){ return String(t||"").toLowerCase().replace(/[\W\d_]+/g," ").trim().substring(0,300); }

  // dedupe sets + LRU queue
  const GENERATED_TEXTS_V11 = new Set();
  const GENERATED_QUEUE = [];
  function markGenerated(text){
    const norm = normalizeText(text);
    if(!norm) return false;
    const fp = djb2(norm);
    if(GENERATED_TEXTS_V11.has(fp)) return false;
    GENERATED_TEXTS_V11.add(fp);
    GENERATED_QUEUE.push(fp);
    const cap = (window.REALISM_CONFIG && window.REALISM_CONFIG.DEDUP_LIMIT) || 50000;
    if(GENERATED_QUEUE.length > cap){ const old = GENERATED_QUEUE.shift(); GENERATED_TEXTS_V11.delete(old); }
    return true;
  }

  // persistence
  const PERSIST_KEY = "abrox_realism_state_v1";
  function saveRealismState(){ try{ const dump = { generatedQueue: GENERATED_QUEUE.slice(-((window.REALISM_CONFIG && window.REALISM_CONFIG.DEDUP_LIMIT) || 50000)), ts: Date.now() }; localStorage.setItem(PERSIST_KEY, JSON.stringify(dump)); }catch(e){ console.warn("realism save failed", e); } }
  function loadRealismState(){ try{ const raw = localStorage.getItem(PERSIST_KEY); if(!raw) return; const s = JSON.parse(raw); if(Array.isArray(s.generatedQueue)) s.generatedQueue.forEach(fp => { GENERATED_QUEUE.push(fp); GENERATED_TEXTS_V11.add(fp); }); console.log("realism: loaded", GENERATED_QUEUE.length, "fingerprints"); }catch(e){ console.warn("realism load failed", e); } }
  loadRealismState();
  window.addEventListener("beforeunload", saveRealismState);
  setInterval(saveRealismState, 1000*60*2);

  // ---------- generation logic ----------
  function generateTimestamp(pastDaysMax=90){ const now = Date.now(); const delta = Math.floor(Math.random()*pastDaysMax*24*60*60*1000); return new Date(now - delta - Math.floor(Math.random()*1000*60*60)); }

  function generateTradingCommentV11(){
    const templates = [
      () => `Guys, ${random(TESTIMONIALS)}`,
      () => `Anyone trading ${random(ASSETS)} on ${random(BROKERS)}?`,
      () => `Signal for ${random(ASSETS)} ${random(TIMEFRAMES)} is ${random(RESULT_WORDS)}`,
      () => `Abrox alerted ${random(ASSETS)} ${random(TIMEFRAMES)} — ${random(RESULT_WORDS)}`,
      () => `Waiting for ${random(ASSETS)} news impact`,
      () => `Did anyone catch ${random(ASSETS)} reversal?`,
      () => `Closed ${random(ASSETS)} on ${random(TIMEFRAMES)} — ${random(RESULT_WORDS)}`,
      () => `${random(TESTIMONIALS)}`,
      () => `Scalped ${random(ASSETS)} on ${random(BROKERS)}, result ${random(RESULT_WORDS)}`,
      () => `Testimonial: ${random(TESTIMONIALS)}`
    ];

    let text = random(templates)();

    // add some extra micro-phrases sometimes
    if(maybe(0.35)){
      const extras = ["good execution","tight stop","wide stop","no slippage","perfect timing","missed by 2s","partial TP hit","closed manually"];
      text += " — " + random(extras);
    }

    // random typos small chance
    if(maybe(0.12)){
      text = text.replace(/\w{6,}/g, word => {
        if(maybe(0.2)){
          const i = Math.max(1, Math.floor(Math.random()*(word.length-2)));
          return word.substring(0,i) + word[i+1] + word[i] + word.substring(i+2);
        }
        return word;
      });
    }

    // add emoji sometimes
    if(maybe(0.45)) text += " " + random(EMOJIS);

    // dedupe by fingerprint
    let attempts = 0;
    while(!markGenerated(text) && attempts < 30){
      text += " " + rand(999);
      attempts++;
    }
    return { text, timestamp: generateTimestamp(120) };
  }

  // LONG TERM POOL & ensure pool
  const LONG_TERM_POOL_V11 = [];
  function ensurePoolV11(minSize = (window.REALISM_CONFIG && window.REALISM_CONFIG.POOL_MIN) || 800){
    while(LONG_TERM_POOL_V11.length < minSize){
      LONG_TERM_POOL_V11.push(generateTradingCommentV11());
      if(LONG_TERM_POOL_V11.length > ((window.REALISM_CONFIG && window.REALISM_CONFIG.POOL_MAX) || 4000)) break;
    }
    return LONG_TERM_POOL_V11.length;
  }

  // ---------- safe append to UI ----------
  const MESSAGE_STATS = new Map();

  function safeAppendMessage(persona, text, opts){
    const maxAttempts = 40;
    let attempts = 0;
    (function tryAppend(){
      attempts++;
      if(window.TGRenderer && typeof window.TGRenderer.appendMessage === "function"){
        const id = window.TGRenderer.appendMessage(persona, text, opts);
        if(id){
          MESSAGE_STATS.set(id, { views: rand(8)+1, reactions: new Map(), createdAt: Date.now(), popularity: 0 });
        }
        return;
      }
      if(attempts < maxAttempts) setTimeout(tryAppend, 300);
      else console.warn("realism: TGRenderer not available; dropping message:", text.substring(0,80));
    })();
  }

  // ---------- post from pool ----------
  function postFromPoolV11(count=1, personaPicker){
    ensurePoolV11(Math.max((window.REALISM_CONFIG && window.REALISM_CONFIG.POOL_MIN) || 800, count));
    const stagger = 140;
    for(let i=0;i<count;i++){
      const item = LONG_TERM_POOL_V11.shift();
      if(!item) break;
      (function(it, idx){
        setTimeout(()=>{
          const persona = (typeof personaPicker === "function") ? personaPicker() : (window.identity ? window.identity.getRandomPersona() : { name:"User", avatar:"https://ui-avatars.com/api/?name=U" });
          if(window.TGRenderer && window.TGRenderer.showTyping) window.TGRenderer.showTyping(persona, 700 + Math.random()*1200);
          setTimeout(()=>{ safeAppendMessage(persona, it.text, { timestamp: it.timestamp, type: "incoming" }); }, 700 + Math.random()*900);
        }, idx * stagger);
      })(item, i);
    }
  }

  // ---------- trending reactions ----------
  function triggerTrendingReactionV11(baseText, personaPicker){
    if(!baseText) return;
    const replies = rand(5) + 1;
    for(let i=0;i<replies;i++){
      setTimeout(()=>{ const item = generateTradingCommentV11(); const persona = (typeof personaPicker === "function") ? personaPicker() : (window.identity ? window.identity.getRandomPersona() : { name:"User", avatar:"https://ui-avatars.com/api/?name=U" }); safeAppendMessage(persona, item.text, { timestamp: item.timestamp, type: "incoming", replyToText: baseText }); }, 700*(i+1) + rand(1200));
    }
  }

  // ---------- scheduler (idempotent) ----------
  let _crowdTimer = null;
  let _started = false;
  function scheduleNext(){
    const cfg = window.REALISM_CONFIG || {};
    const min = cfg.MIN_INTERVAL_MS || (window.REALISM_CONFIG && window.REALISM_CONFIG.MIN_INTERVAL_MS) || 20000;
    const max = cfg.MAX_INTERVAL_MS || (window.REALISM_CONFIG && window.REALISM_CONFIG.MAX_INTERVAL_MS) || 90000;
    const interval = min + Math.floor(Math.random()*(max-min));
    const jitter = Math.floor(Math.random()*5000);
    _crowdTimer = setTimeout(()=>{ postFromPoolV11(1); scheduleNext(); }, interval + jitter);
  }
  function simulateRandomCrowdV11(){ if(_started) return; _started = true; if(_crowdTimer) clearTimeout(_crowdTimer); setTimeout(scheduleNext, 500); }

  // ---------- message stats UI updates ----------
  function updateMessageStatsInUI(messageId, stats){
    try{
      const el = document.querySelector(`[data-id="${messageId}"]`);
      if(!el) return;
      const reactionsContainer = el.querySelector(".tg-reactions");
      if(reactionsContainer){
        reactionsContainer.innerHTML = "";
        if(stats.reactions){
          for(const [emoji, count] of stats.reactions.entries()){
            const pill = document.createElement("div");
            pill.className = "tg-reaction";
            pill.textContent = `${emoji} ${count}`;
            reactionsContainer.appendChild(pill);
          }
        }
      }
      const metaSeen = el.querySelector(".tg-bubble-meta .seen");
      if(metaSeen) metaSeen.innerHTML = `<i data-lucide="eye"></i> ${stats.views}`;
      if(window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
    }catch(e){}
  }

  function reactionTick(){
    MESSAGE_STATS.forEach((stats, id) => {
      const inc = maybe(0.6) ? rand(2) : 0;
      stats.views += inc;
      if(maybe(0.085)){
        const emoji = random(["👍","❤️","🔥","😂","👏","💯","🚀"]);
        stats.reactions.set(emoji, (stats.reactions.get(emoji)||0) + 1);
      }
      if(maybe((window.REALISM_CONFIG && window.REALISM_CONFIG.TREND_SPIKE_PROB) || 0.03)) stats.popularity += rand(6) + 3;
      updateMessageStatsInUI(id, stats);
    });
  }
  const _reactionInterval = setInterval(reactionTick, (window.REALISM_CONFIG && window.REALISM_CONFIG.REACTION_TICK_MS) || 27000);

  // ---------- public API ----------
  window.realism = window.realism || {};
  Object.assign(window.realism, {
    postFromPoolV11,
    triggerTrendingReactionV11,
    simulateRandomCrowdV11,
    ensurePoolV11,
    LONG_TERM_POOL_V11,
    MESSAGE_STATS,
    GENERATED_TEXTS_V11,
    _started: () => _started
  });

  // ---------- startup ----------
  (function startup(){
    const initialPool = (window.REALISM_CONFIG && window.REALISM_CONFIG.INITIAL_POOL) || 1000;
    const initialImmediate = Math.min(80, Math.max(12, Math.floor(initialPool * 0.06)));
    ensurePoolV11(Math.min(initialPool, 6000));
    setTimeout(()=> postFromPoolV11(initialImmediate), 700);
    setTimeout(()=> simulateRandomCrowdV11(), 1400);
    console.log("realism-engine-v11 started:", initialImmediate, "pool size:", LONG_TERM_POOL_V11.length);
  })();

})();
