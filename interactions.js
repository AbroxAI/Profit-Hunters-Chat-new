// interactions.js
document.addEventListener("DOMContentLoaded", ()=> {
  const input = document.getElementById("tg-comment-input");
  const sendBtn = document.getElementById("tg-send-btn");
  const metaLine = document.getElementById("tg-meta-line");
  const contactAdminLink = window.CONTACT_ADMIN_LINK || "https://t.me/ph_suppp";

  // Create blue pill element
  let unreadPill = document.createElement("div");
  unreadPill.id = "tg-unread-pill";
  unreadPill.style.cssText = "position:absolute;top:12px;right:12px;background:#0088cc;color:#fff;font-size:12px;padding:2px 6px;border-radius:12px;display:none;z-index:50;";
  document.body.appendChild(unreadPill);

  let unreadCount = 0;

  if(metaLine) metaLine.textContent = `${(window.MEMBER_COUNT||1284).toLocaleString()} members, ${window.ONLINE_COUNT||128} online`;

  function toggleSendButton(){
    const hasText = input && input.value.trim().length > 0;
    if(!sendBtn) return;
    if(hasText){
      sendBtn.classList.remove("hidden");
    } else sendBtn.classList.add("hidden");
  }
  if(input) input.addEventListener("input", toggleSendButton);

  function updateUnreadPill(){
    if(unreadCount > 0){
      unreadPill.textContent = unreadCount;
      unreadPill.style.display = "block";
    } else {
      unreadPill.style.display = "none";
    }
  }

  function incrementUnread(){
    unreadCount++;
    updateUnreadPill();
  }

  function resetUnread(){
    unreadCount = 0;
    updateUnreadPill();
  }

  function doSendMessage(){
    if(!input) return;
    const text = input.value.trim(); if(!text) return;
    const persona = { name: "You", avatar: null };
    if(window.TGRenderer && window.TGRenderer.showTyping) window.TGRenderer.showTyping(persona, 400);
    setTimeout(()=>{
      if(window.TGRenderer && window.TGRenderer.appendMessage){
        window.TGRenderer.appendMessage(persona, text, { timestamp: new Date(), type:"outgoing" });
      } else if(window.BubbleRenderer && typeof window.BubbleRenderer.renderMessages === "function"){
        window.BubbleRenderer.renderMessages([{ id:"m_local_"+Date.now(), name:"You", text, time: new Date().toLocaleTimeString(), isOwn:true }]);
      }
      document.dispatchEvent(new CustomEvent("sendMessage", { detail: { text } }));
    }, 500 + Math.random()*300);
    input.value = "";
    toggleSendButton();
    resetUnread(); // reset pill when sending
  }

  if(sendBtn) sendBtn.addEventListener("click", doSendMessage);
  if(input) {
    input.addEventListener("keydown", (e)=>{
      if(e.key === "Enter"){
        e.preventDefault();
        doSendMessage();
      }
    });
    input.addEventListener("focus", resetUnread); // reset when user opens chat
  }

  document.addEventListener("click", (e) => {
    const target = e.target.closest && e.target.closest(".contact-admin-btn");
    if(target){
      const href = target.dataset && target.dataset.href ? target.dataset.href : contactAdminLink;
      window.open(href, "_blank");
      e.preventDefault();
    }
  });

  // auto reply and message context
  document.addEventListener("messageContext", (ev)=> {
    const info = ev.detail;
    const persona = window.identity ? window.identity.getRandomPersona() : { name:"User", avatar:"https://ui-avatars.com/api/?name=U" };
    setTimeout(()=> {
      const replyText = window.identity ? window.identity.generateHumanComment(persona, "Nice point!") : "Nice!";
      document.dispatchEvent(new CustomEvent("autoReply", { detail: { parentText: info.text, persona, text: replyText } }));
      incrementUnread(); // increment pill on new message
    }, 700 + Math.random()*1200);
  });

  // Listen to all incoming TGRenderer messages to increment pill
  if(window.TGRenderer){
    const origAppend = window.TGRenderer.appendMessage;
    window.TGRenderer.appendMessage = function(persona, text, opts){
      const isOutgoing = opts && opts.type === "outgoing";
      origAppend.call(window.TGRenderer, persona, text, opts);
      if(!isOutgoing && document.activeElement !== input) incrementUnread();
    };
  }
});
