// ===================== v4 Joiner Simulator =====================
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

  function randInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
  function safeMeta(){return document.getElementById("tg-meta-line");}
  function bumpMemberCount(n=1){
    window.MEMBER_COUNT=Math.max(0,(window.MEMBER_COUNT||0)+n);
    const m=safeMeta();
    if(m) m.textContent=`${(window.MEMBER_COUNT||0).toLocaleString()} members, ${(window.ONLINE_COUNT||0).toLocaleString()} online`;
  }
  function createJoinerFromIdentity(){
    if(window.identity && typeof window.identity.getRandomPersona==="function"){
      for(let i=0;i<10;i++){
        const p=window.identity.getRandomPersona();
        if(!usedJoinNames.has(p.name)){usedJoinNames.add(p.name);p.lastSeen=Date.now();return p;}
      }
    }
    const f={name:"NewMember"+randInt(1000,99999),avatar:`https://i.pravatar.cc/100?img=${randInt(1,90)}`,isAdmin:false};
    usedJoinNames.add(f.name);
    return f;
  }
  function preGenerate(count){preGenPool=preGenPool||[];const toCreate=Math.max(0,count-preGenPool.length);for(let i=0;i<toCreate;i++) preGenPool.push(createJoinerFromIdentity());return preGenPool.length;}
  function nextJoiner(){if(preGenPool&&preGenPool.length)return preGenPool.shift();return createJoinerFromIdentity();}

  // ---------- Expanded welcome texts + emojis + random tips ----------
  function randomWelcomeText(persona){
    const baseVariants=[
      "Hi everyone! 👋","Hello! Glad to join.","Hey — excited to learn and trade with you all.",
      "New here — say hi!","Thanks for having me 😊","Just joined, looking forward to the signals.",
      "Looking forward to contributing!","Excited to be part of this group!","Hello traders! 🚀",
      "Hey everyone, ready to learn and grow!","Happy to join this community.","Hi all, hoping to share and learn insights.",
      "Excited for the trading discussions!","Glad to meet you all here.","Here to learn, trade, and share ideas."
    ];
    const bullishVariants=["Ready to go long 🔥","Feeling bullish today! 💹","Let’s catch some green! 🚀","Long vibes only! 📈","Eyes on the breakout! 💯"];
    const bearishVariants=["Cautious today… ⚠️","Watching the dip… 😅","Short setup incoming? 🤔","Bearish vibes here 🐻","Protecting my capital first."];
    const tipsVariants=["Tip: Diversify your portfolio! 💡","Quote: Patience pays off! ⏳","Tip: Always check your charts! 📊","Quote: Buy low, sell high! 💰","Remember: Risk management is key! ⚖️"];

    let variants=[...baseVariants];
    if(persona && persona.sentiment==="bullish" && Math.random()<0.5) variants=variants.concat(bullishVariants);
    else if(persona && persona.sentiment==="bearish" && Math.random()<0.5) variants=variants.concat(bearishVariants);
    if(Math.random()<0.1) variants=variants.concat(tipsVariants);

    let v=variants[Math.floor(Math.random()*variants.length)];
    if(Math.random()<0.5){
      const emojis=["💸","📈","🔥","✨","🤑","🎯","🚀","💎","😎","💡","🌟","🧠","⚡","🎉","🍀","🤝","💬","🎯"];
      v+=" "+emojis[Math.floor(Math.random()*emojis.length)];
    }
    return v;
  }

  // ---------- Random trading facts ----------
  const tradingFacts=[
    "Did you know? Bitcoin's first price was less than $0.01! 💰",
    "Fact: The S&P 500 has historically returned ~10% per year. 📈",
    "Trading tip: Never risk more than 1-2% of your capital on a single trade. ⚖️",
    "Fun fact: The NYSE is the world's largest stock exchange by market cap. 🏦",
    "Did you know? 'Bull' and 'Bear' come from how each animal attacks. 🐂🐻",
    "Tip: Always check for support and resistance levels. 📊",
    "Quote: Plan your trade, trade your plan. 💡",
    "Fun fact: The first stock ever traded was in 1602 by the Dutch East India Company. 🚢"
  ];

  function postRandomFact(joiner){
    const fact=tradingFacts[randInt(0,tradingFacts.length-1)];
    setTimeout(()=>{
      if(window.realism?.start){ 
        // inject fact via realism engine
        const msg = { persona: joiner, text: fact, timestamp:new Date(), id:"fact_"+Date.now() };
        window.TGRenderer?.appendMessage(msg.persona,msg.text,{ timestamp:msg.timestamp,type:"incoming",id:msg.id });
      }
    },randInt(2000,4000));
  }

  // ---------- sticker + bubble rendering remains intact ----------
  function createJoinStickerElement(joiners){
    const container=document.createElement("div");
    container.className="tg-join-sticker";
    const cluster=document.createElement("div"); cluster.className="join-cluster";
    const maxAv=Math.min(cfg.stickerMaxAvatars,joiners.length);
    const shown=joiners.slice(0,maxAv);
    shown.forEach(p=>{
      const a=document.createElement("img");
      a.src=p.avatar||(p.isAdmin?"assets/admin.jpg":`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}`);
      a.alt=p.name||"user";
      a.onerror=function(){try{this.src="assets/admin.jpg";}catch(e){this.src="https://ui-avatars.com/api/?name=U";}};
      cluster.appendChild(a);
    });
    if(joiners.length>shown.length){
      const more=document.createElement("div");
      more.textContent=`+${joiners.length-shown.length}`;
      more.style.width=cfg.stickerAvatarSize+"px";
      more.style.height=cfg.stickerAvatarSize+"px";
      more.style.display="flex";
      more.style.alignItems="center";
      more.style.justifyContent="center";
      more.style.borderRadius="50%";
      more.style.background="rgba(255,255,255,0.06)";
      more.style.color="var(--tg-text)";
      more.style.fontSize="13px";
      cluster.appendChild(more);
    }
    container.appendChild(cluster);
    const names=document.createElement("div");
    names.className="join-names";
    names.textContent=shown.map(p=>p.name).join(", ")+(joiners.length>shown.length?` and ${joiners.length-shown.length} others`:"");
    container.appendChild(names);
    const sub=document.createElement("div");
    sub.className="join-sub";
    sub.textContent="joined the group";
    container.appendChild(sub);
    return container;
  }

  function appendStickerToChat(stickerEl,timestamp){
    const chat=document.getElementById("tg-comments-container");
    if(!chat) return null;
    const wrapper=document.createElement("div");
    wrapper.style.display="flex";
    wrapper.style.justifyContent="center";
    wrapper.style.padding="6px 0";
    wrapper.dataset.joinTimestamp=timestamp?new Date(timestamp).toISOString():new Date().toISOString();
    wrapper.appendChild(stickerEl);
    chat.appendChild(wrapper);
    chat.scrollTo({top:chat.scrollHeight,behavior:"smooth"});
    return wrapper;
  }

  function postWelcomeAsBubbles(joiner,opts){
    const persona=joiner;
    const text=randomWelcomeText(joiner);
    if(window.TGRenderer?.showTyping) window.TGRenderer.showTyping(persona,700+Math.random()*500);
    setTimeout(()=>{if(window.TGRenderer?.appendMessage) window.TGRenderer.appendMessage(persona,text,{timestamp:opts?.timestamp||new Date(),type:"incoming"});},700+Math.random()*500);
  }

  function postJoinerFlow(joiners,opts){
    opts=opts||{};
    const timestamp=opts.timestamp||new Date();
    bumpMemberCount(joiners.length||1);
    if((joiners.length||1)>2){
      const stickerEl=createJoinStickerElement(joiners);
      appendStickerToChat(stickerEl,timestamp);
      const sample=joiners.slice(0,Math.min(cfg.initialBurstPreview,joiners.length));
      sample.forEach((p,idx)=>{
        setTimeout(()=>{
          postWelcomeAsBubbles(p,{timestamp:new Date()});
          postRandomFact(p);

          // ------ CONNECT TO v13 realism engine ------
          if(window.realism?.ensurePool){
            window.realism.ensurePool(1);
            // inject joiner persona into pool
            if(window.realism.POOL) window.realism.POOL.push({ persona:p, text:"joined the group", timestamp:new Date(), id:"join_"+Date.now() });
          }
        },800+idx*600+Math.random()*300);
      });
    } else joiners.forEach((p,idx)=>setTimeout(()=>{
      postWelcomeAsBubbles(p,{timestamp:new Date()});
      postRandomFact(p);

      if(window.realism?.ensurePool){
        window.realism.ensurePool(1);
        if(window.realism.POOL) window.realism.POOL.push({ persona:p, text:"joined the group", timestamp:new Date(), id:"join_"+Date.now() });
      }
    },idx*600+Math.random()*200));
  }

  function scheduleNext(){
    if(!running) return;
    const min=Math.max(1000,cfg.minIntervalMs), max=Math.max(min+1,cfg.maxIntervalMs);
    const base=Math.floor(min+Math.random()*(max-min)), jitter=Math.floor(Math.random()*Math.min(60000,Math.floor(base*0.25)));
    const next=base+jitter;
    _timer=setTimeout(()=>{
      const burst=randInt(cfg.burstMin,cfg.burstMax);
      const joiners=[];
      for(let i=0;i<burst;i++) joiners.push(nextJoiner());
      try{postJoinerFlow(joiners,{timestamp:new Date()});}catch(e){}
      scheduleNext();
    },next);
  }

  function start(){if(running) return; running=true; preGenerate(8); scheduleNext(); try{localStorage.setItem(LS_KEY,JSON.stringify({lastRun:Date.now()}));}catch(e){} console.log("joiner-simulator started");}
  function stop(){if(_timer) clearTimeout(_timer); running=false; console.log("joiner-simulator stopped");}
  function joinNow(n){n=Math.max(1,Math.floor(n||1)); const CHUNK=40; let done=0; function doChunk(){const take=Math.min(CHUNK,n-done); const arr=[]; for(let i=0;i<take;i++) arr.push(nextJoiner()); try{postJoinerFlow(arr,{timestamp:new Date()});}catch(e){} done+=take; if(done<n) setTimeout(doChunk,120);} doChunk();}
  function seedHistory(days=90,perDay=5){days=Math.max(1,Math.floor(days)); perDay=Math.max(0,Math.floor(perDay)); const total=days*perDay; if(total===0) return Promise.resolve(0); return new Promise(resolve=>{const CHUNK=80; let done=0; function doChunk(){const take=Math.min(CHUNK,total-done); for(let i=0;i<take;i++){const idx=done+i; const day=Math.floor(idx/perDay); const timeInDay=Math.floor(Math.random()*24*60*60*1000); const ts=new Date(Date.now()-day*24*60*60*1000-timeInDay); const j=nextJoiner(); try{postJoinerFlow([j],{timestamp:ts,welcomeAsSystem:true});}catch(e){}} done+=take; if(done<total) setTimeout(doChunk,120); else resolve(total);} setTimeout(doChunk,40);});}

  function sanityCheck(){return {identity:!!(window.identity?.getRandomPersona),TGRenderer:!!(window.TGRenderer?.appendMessage),chat:!!document.getElementById("tg-comments-container"),meta:!!document.getElementById("tg-meta-line")};}

  window.joiner=window.joiner||{};
  Object.assign(window.joiner,{start,stop,joinNow,seedHistory,preGenerate,preGenPool,sanityCheck,config:cfg,isRunning:()=>running});

  setTimeout(()=>{try{joinNow(Math.max(1,(window.JOINER_CONFIG?.initialJoins)||3));}catch(e){}},500);
  console.log("joiner-simulator ready: connected to realism engine");
})();
