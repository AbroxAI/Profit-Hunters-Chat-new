// bubble-renderer.js
// Robust bubble renderer with reply-preview, date stickers, typing in header,
// avatar/image fallbacks, jump indicator behavior, and safe global exports.

(function(){
  // init on DOM ready or immediately if already loaded
  function init(){
    const container = document.getElementById("tg-comments-container");
    const jumpIndicator = document.getElementById("tg-jump-indicator");
    const jumpText = document.getElementById("tg-jump-text");
    const metaLine = document.getElementById("tg-meta-line");

    if(!container){
      console.error("bubble-renderer: tg-comments-container not found — renderer exiting");
      return;
    }

    // state
    let lastMessageDateKey = null;
    let unseenCount = 0;
    const MESSAGE_MAP = new Map();

    // utilities
    function formatTime(date){ const d = new Date(date); return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
    function formatDateKey(date){ const d = new Date(date); return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`; }

    // insert date sticker when day changes
    function insertDateSticker(dateObj){
      const key = formatDateKey(dateObj);
      if(key === lastMessageDateKey) return;
      lastMessageDateKey = key;
      const sticker = document.createElement("div");
      sticker.className = "tg-date-sticker";
      const d = new Date(dateObj);
      sticker.textContent = d.toLocaleDateString([], {year:'numeric', month:'short', day:'numeric'});
      container.appendChild(sticker);
    }

    // header typing short preview
    function showTypingInHeader(names){
      if(!metaLine) return;
      try{
        metaLine.style.opacity = "0.95";
        metaLine.style.color = "#b9c7d8";
        metaLine.textContent = names.length > 2 ? `${names.slice(0,2).join(", ")} and others are typing...` : (names.join(" ") + (names.length>1?" are typing...":" is typing..."));
        setTimeout(()=>{ if(metaLine) metaLine.textContent = `${(window.MEMBER_COUNT||0).toLocaleString()} members, ${(window.ONLINE_COUNT||0).toLocaleString()} online`; metaLine.style.color = ""; }, 1000 + Math.floor(Math.random()*2000));
      }catch(e){ /* fail silently */ }
    }

    // small typing bubble (visual)
    function showTypingIndicator(persona, duration=1600){
      const wrap = document.createElement("div");
      wrap.className = "tg-bubble incoming typing";
      const avatar = document.createElement("img");
      avatar.className = "tg-bubble-avatar";
      avatar.src = persona && persona.avatar ? persona.avatar : "https://ui-avatars.com/api/?name=U";
      avatar.alt = persona && persona.name ? persona.name : "user";
      avatar.onerror = function(){
        if(this.src && !this.src.includes("assets/admin.jpg")) this.src = "assets/admin.jpg";
        else this.src = "https://ui-avatars.com/api/?name=U";
      };
      wrap.appendChild(avatar);

      const bubble = document.createElement("div");
      bubble.className = "tg-bubble-content";
      bubble.innerHTML = `<div class="tg-reply-preview">${persona && persona.name ? persona.name : "Someone"} is typing…</div>`;
      wrap.appendChild(bubble);

      container.appendChild(wrap);
      container.scrollTop = container.scrollHeight;
      setTimeout(()=>{ if(wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap); }, Math.max(800, duration));
    }

    // create a bubble element (incoming or outgoing)
    function createBubbleElement(persona, text, opts={}){
      const { timestamp=new Date(), type="incoming", replyToText=null, image=null, caption=null, id=null, pinned=false } = opts;
      insertDateSticker(timestamp);

      const wrapper = document.createElement("div");
      wrapper.className = `tg-bubble ${type}` + (pinned ? " pinned" : "");
      if(id) wrapper.dataset.id = id;

      // avatar (with robust fallback)
      const avatar = document.createElement("img");
      avatar.className = "tg-bubble-avatar";
      avatar.src = persona && persona.avatar ? persona.avatar : "https://ui-avatars.com/api/?name=U";
      avatar.alt = persona && persona.name ? persona.name : "user";
      avatar.onerror = function(){
        try{
          if(this.src && !this.src.includes("assets/admin.jpg")) this.src = "assets/admin.jpg";
          else this.src = "https://ui-avatars.com/api/?name=U";
        }catch(e){}
      };

      // content
      const content = document.createElement("div"); content.className = "tg-bubble-content";

      // reply preview block (click to jump)
      if(replyToText){
        const rp = document.createElement("div");
        rp.className = "tg-reply-preview";
        rp.textContent = replyToText.length > 120 ? replyToText.substring(0,117) + "..." : replyToText;
        rp.addEventListener("click", ()=>{ 
          const norm = replyToText.toLowerCase().replace(/[\W\d_]+/g," ").trim().substring(0,120);
          for(const [mid, mobj] of MESSAGE_MAP.entries()){
            try{
              const mnorm = (mobj.text||"").toLowerCase().replace(/[\W\d_]+/g," ").trim().substring(0,120);
              if(mnorm && norm && mnorm.indexOf(norm) !== -1){
                mobj.el.scrollIntoView({ behavior:"smooth", block:"center" });
                mobj.el.classList.add("tg-highlight");
                setTimeout(()=> mobj.el.classList.remove("tg-highlight"), 2600);
                break;
              }
            }catch(e){}
          }
        });
        content.appendChild(rp);
      }

      // sender name
      const sender = document.createElement("div");
      sender.className = "tg-bubble-sender";
      sender.textContent = persona && persona.name ? persona.name : "User";
      content.appendChild(sender);

      // image (optional) with fallback
      if(image){
        const img = document.createElement("img");
        img.className = "tg-bubble-image";
        img.src = image;
        img.alt = "image";
        img.onerror = function(){
          try{
            if(!this.src.includes("assets/broadcast.jpg")) this.src = "assets/broadcast.jpg";
            else this.style.display = "none";
          }catch(e){ this.style.display = "none"; }
        };
        content.appendChild(img);
      }

      // message text
      const textEl = document.createElement("div");
      textEl.className = "tg-bubble-text";
      textEl.textContent = text || "";
      content.appendChild(textEl);

      // caption (optional)
      if(caption){
        const cap = document.createElement("div");
        cap.className = "tg-bubble-text";
        cap.style.marginTop = "6px";
        cap.textContent = caption;
        content.appendChild(cap);
      }

      // meta row (timestamp + seen)
      const meta = document.createElement("div");
      meta.className = "tg-bubble-meta";
      const timeSpan = document.createElement("span");
      timeSpan.textContent = formatTime(timestamp);
      meta.appendChild(timeSpan);
      if(type === "outgoing"){
        const seen = document.createElement("div");
        seen.className = "seen";
        seen.innerHTML = `<i data-lucide="eye"></i> 1`;
        meta.appendChild(seen);
      }
      content.appendChild(meta);

      // reactions container
      const reactions = document.createElement("div");
      reactions.className = "tg-reactions";
      content.appendChild(reactions);

      // assemble
      wrapper.appendChild(avatar);
      wrapper.appendChild(content);

      // context menu for quick reply simulation
      wrapper.addEventListener("contextmenu", (e)=>{ 
        try{ e.preventDefault(); const ev = new CustomEvent("messageContext",{ detail:{ id, persona, text } }); document.dispatchEvent(ev); }catch(err){} 
      });

      return wrapper;
    }

    // append message to DOM and track map
    function appendMessage(persona, text, opts={}){
      const id = opts.id || ("m_" + Date.now() + "_" + Math.floor(Math.random()*9999));
      opts.id = id;
      const el = createBubbleElement(persona, text, opts);
      container.appendChild(el);
      MESSAGE_MAP.set(id, { el, text });

      // scroll behavior
      const atBottom = (container.scrollTop + container.clientHeight) > (container.scrollHeight - 120);
      if(atBottom){ container.scrollTop = container.scrollHeight; hideJumpIndicator(); }
      else { unseenCount++; updateJumpIndicator(); showJumpIndicator(); }

      // entry animation
      el.style.opacity = 0; el.style.transform = "translateY(6px)";
      requestAnimationFrame(()=>{ el.style.transition = "all 220ms ease"; el.style.opacity = 1; el.style.transform = "translateY(0)"; });

      return id;
    }

    // jump indicator controls
    function showJumpIndicator(){ if(jumpIndicator && jumpIndicator.classList.contains("hidden")) jumpIndicator.classList.remove("hidden"); }
    function hideJumpIndicator(){ if(jumpIndicator && !jumpIndicator.classList.contains("hidden")) jumpIndicator.classList.add("hidden"); unseenCount = 0; updateJumpIndicator(); }
    function updateJumpIndicator(){ if(jumpText) jumpText.textContent = unseenCount > 1 ? `New messages · ${unseenCount}` : `New messages`; }

    if(jumpIndicator){
      jumpIndicator.addEventListener("click", ()=>{ container.scrollTop = container.scrollHeight; hideJumpIndicator(); });
    }

    container.addEventListener("scroll", ()=>{ const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight; if(scrollBottom > 100) showJumpIndicator(); else hideJumpIndicator(); });

    // header typing stack
    const typingNames = [];
    document.addEventListener("headerTyping", (ev)=>{ 
      try{
        const name = ev.detail && ev.detail.name ? ev.detail.name : "Someone";
        typingNames.push(name);
        showTypingInHeader(typingNames.slice(-3));
        setTimeout(()=>{ typingNames.shift(); }, 1000 + Math.floor(Math.random()*2000));
      }catch(e){}
    });

    // expose API: TGRenderer & BubbleRenderer (stable aliases)
    window.TGRenderer = window.TGRenderer || {
      appendMessage: (persona, text, opts={}) => appendMessage(persona, text, opts),
      showTyping: (persona, duration=1600) => { showTypingIndicator(persona, duration); document.dispatchEvent(new CustomEvent("headerTyping",{ detail:{ name: persona && persona.name ? persona.name : "Someone" } })); }
    };

    window.BubbleRenderer = window.BubbleRenderer || {
      renderMessages: (arr=[]) => { try{ arr.forEach(m => appendMessage({ name: m.name, avatar: m.avatar || "https://ui-avatars.com/api/?name=U" }, m.text, { id: m.id, timestamp: new Date(m.time || Date.now()), type: m.isOwn ? "outgoing" : "incoming" })); }catch(e){ console.warn("BubbleRenderer.renderMessages err", e); } }
    };

    // create lucide icons if available (safe)
    if(window.lucide && typeof window.lucide.createIcons === "function"){
      try{ window.lucide.createIcons(); }catch(e){}
    }

    // lightweight debug helper
    console.log("bubble-renderer initialized");
  } // end init

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else setTimeout(init, 0);
})();
