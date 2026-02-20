// bubble-renderer.js — v2 connected to realism-v13 + identity-personas
(function(){
  function init(){
    const container = document.getElementById("tg-comments-container");
    const jumpIndicator = document.getElementById("tg-jump-indicator");
    const jumpText = document.getElementById("tg-jump-text");
    const metaLine = document.getElementById("tg-meta-line");

    if(!container){ console.error("bubble-renderer: container missing"); return; }

    let lastMessageDateKey = null;
    let unseenCount = 0;
    const MESSAGE_MAP = new Map();

    function formatTime(date){ return new Date(date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
    function formatDateKey(date){ const d = new Date(date); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; }

    function insertDateSticker(dateObj){
      const key = formatDateKey(dateObj);
      if(key === lastMessageDateKey) return;
      lastMessageDateKey = key;
      const sticker = document.createElement("div");
      sticker.className = "tg-date-sticker";
      sticker.textContent = new Date(dateObj).toLocaleDateString([], {year:'numeric', month:'short', day:'numeric'});
      container.appendChild(sticker);
    }

    function showTypingInHeader(names){
      if(!metaLine) return;
      metaLine.style.opacity = "0.95";
      metaLine.style.color = "#b9c7d8";
      metaLine.textContent = names.length > 2 ? `${names.slice(0,2).join(", ")} and others are typing...` : (names.join(" ") + (names.length>1?" are typing...":" is typing..."));
      setTimeout(()=>{ 
        if(metaLine) metaLine.textContent = `${(window.MEMBER_COUNT||0).toLocaleString()} members, ${(window.ONLINE_COUNT||0).toLocaleString()} online`;
        metaLine.style.color = ""; 
      }, 1000 + Math.floor(Math.random()*2000));
    }

    function showTypingIndicator(persona, duration=1600){
      const wrap = document.createElement("div");
      wrap.className = "tg-bubble incoming typing";
      const avatar = document.createElement("img");
      avatar.className = "tg-bubble-avatar";
      avatar.src = persona?.avatar || "https://ui-avatars.com/api/?name=U";
      avatar.alt = persona?.name || "user";
      avatar.onerror = function(){ this.src = "https://ui-avatars.com/api/?name=U"; };
      wrap.appendChild(avatar);

      const bubble = document.createElement("div");
      bubble.className = "tg-bubble-content";
      bubble.innerHTML = `<div class="tg-reply-preview">${persona?.name||"Someone"} is typing…</div>`;
      wrap.appendChild(bubble);

      container.appendChild(wrap);
      container.scrollTop = container.scrollHeight;
      setTimeout(()=>{ wrap.remove(); }, Math.max(800, duration));
    }

    function createBubbleElement(persona, text, opts={}){
      const { timestamp=new Date(), type="incoming", replyToText=null, image=null, caption=null, id=null, pinned=false } = opts;
      insertDateSticker(timestamp);

      const wrapper = document.createElement("div");
      wrapper.className = `tg-bubble ${type}` + (pinned?" pinned":"");
      if(id) wrapper.dataset.id = id;

      const avatar = document.createElement("img");
      avatar.className = "tg-bubble-avatar";
      avatar.src = persona?.avatar || "https://ui-avatars.com/api/?name=U";
      avatar.alt = persona?.name || "user";
      avatar.onerror = function(){ this.src = "https://ui-avatars.com/api/?name=U"; };

      const content = document.createElement("div");
      content.className = "tg-bubble-content";

      if(replyToText){
        const rp = document.createElement("div");
        rp.className = "tg-reply-preview";
        rp.textContent = replyToText.length>120 ? replyToText.slice(0,117)+"..." : replyToText;
        rp.addEventListener("click", ()=>{
          const norm = replyToText.toLowerCase().replace(/[\W\d_]+/g," ").trim().substring(0,120);
          for(const [mid, mobj] of MESSAGE_MAP.entries()){
            const mnorm = (mobj.text||"").toLowerCase().replace(/[\W\d_]+/g," ").trim().substring(0,120);
            if(mnorm.indexOf(norm)!==-1){ mobj.el.scrollIntoView({behavior:"smooth", block:"center"}); mobj.el.classList.add("tg-highlight"); setTimeout(()=>mobj.el.classList.remove("tg-highlight"),2600); break; }
          }
        });
        content.appendChild(rp);
      }

      const sender = document.createElement("div");
      sender.className = "tg-bubble-sender";
      sender.textContent = persona?.name || "User";
      content.appendChild(sender);

      if(image){
        const img = document.createElement("img");
        img.className = "tg-bubble-image";
        img.src = image;
        img.alt = "image";
        img.onerror = function(){ this.style.display="none"; };
        content.appendChild(img);
      }

      const textEl = document.createElement("div");
      textEl.className = "tg-bubble-text";
      textEl.textContent = text || "";
      content.appendChild(textEl);

      if(caption){
        const cap = document.createElement("div");
        cap.className = "tg-bubble-text";
        cap.style.marginTop = "6px";
        cap.textContent = caption;
        content.appendChild(cap);
      }

      const meta = document.createElement("div");
      meta.className = "tg-bubble-meta";
      const timeSpan = document.createElement("span");
      timeSpan.textContent = formatTime(timestamp);
      meta.appendChild(timeSpan);
      if(type==="outgoing"){
        const seen = document.createElement("div");
        seen.className = "seen";
        seen.innerHTML = `<i data-lucide="eye"></i> 1`;
        meta.appendChild(seen);
      }
      content.appendChild(meta);

      const reactions = document.createElement("div");
      reactions.className = "tg-reactions";
      content.appendChild(reactions);

      wrapper.appendChild(avatar);
      wrapper.appendChild(content);

      wrapper.addEventListener("contextmenu", (e)=>{
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("messageContext",{ detail:{ id, persona, text } }));
      });

      return wrapper;
    }

    function appendMessage(persona, text, opts={}){
      // fallback to identity/persona pool if persona missing
      if(!persona && window.identity?.getRandomPersona) persona = window.identity.getRandomPersona();
      const id = opts.id || ("m_"+Date.now()+"_"+Math.floor(Math.random()*9999));
      opts.id = id;

      const el = createBubbleElement(persona, text, opts);
      container.appendChild(el);
      MESSAGE_MAP.set(id, { el, text });

      const atBottom = (container.scrollTop + container.clientHeight) > (container.scrollHeight - 120);
      if(atBottom){ container.scrollTop = container.scrollHeight; hideJumpIndicator(); }
      else { unseenCount++; updateJumpIndicator(); showJumpIndicator(); }

      el.style.opacity=0; el.style.transform="translateY(6px)";
      requestAnimationFrame(()=>{ el.style.transition="all 220ms ease"; el.style.opacity=1; el.style.transform="translateY(0)"; });

      return id;
    }

    function showJumpIndicator(){ if(jumpIndicator?.classList.contains("hidden")) jumpIndicator.classList.remove("hidden"); }
    function hideJumpIndicator(){ if(!jumpIndicator?.classList.contains("hidden")) jumpIndicator.classList.add("hidden"); unseenCount=0; updateJumpIndicator(); }
    function updateJumpIndicator(){ if(jumpText) jumpText.textContent = unseenCount>1 ? `New messages · ${unseenCount}` : `New messages`; }

    jumpIndicator?.addEventListener("click", ()=>{ container.scrollTop = container.scrollHeight; hideJumpIndicator(); });
    container.addEventListener("scroll", ()=>{ const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight; scrollBottom>100?showJumpIndicator():hideJumpIndicator(); });

    const typingNames=[];
    document.addEventListener("headerTyping",(ev)=>{
      try{
        const name = ev.detail?.name || "Someone";
        typingNames.push(name);
        showTypingInHeader(typingNames.slice(-3));
        setTimeout(()=>{ typingNames.shift(); },1000 + Math.floor(Math.random()*2000));
      }catch(e){}
    });

    // expose TGRenderer & BubbleRenderer with identity integration
    window.TGRenderer = window.TGRenderer || {
      appendMessage: (persona,text,opts={})=>appendMessage(persona,text,opts),
      showTyping: (persona,duration=1600)=>{ 
        if(!persona && window.identity?.getRandomPersona) persona = window.identity.getRandomPersona();
        showTypingIndicator(persona,duration); 
        document.dispatchEvent(new CustomEvent("headerTyping",{ detail:{ name: persona?.name||"Someone" } }));
      }
    };

    window.BubbleRenderer = window.BubbleRenderer || {
      renderMessages: (arr=[])=>{ 
        arr.forEach(m => appendMessage(
          m.persona || window.identity?.getRandomPersona(),
          m.text,
          { id: m.id, timestamp: new Date(m.time||Date.now()), type: m.isOwn?"outgoing":"incoming" }
        ));
      }
    };

    if(window.lucide?.createIcons) try{ window.lucide.createIcons(); }catch(e){}

    console.log("bubble-renderer connected to realism-v13 + identity-personas");
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", init);
  else setTimeout(init,0);
})();
