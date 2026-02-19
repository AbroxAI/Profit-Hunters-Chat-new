// interactions-fixed.js
document.addEventListener("DOMContentLoaded", () => {

  const input = document.getElementById("tg-comment-input");
  const sendBtn = document.getElementById("tg-send-btn");
  const metaLine = document.getElementById("tg-meta-line");
  const contactAdminLink = window.CONTACT_ADMIN_LINK || "https://t.me/ph_suppp";

  // ---------------------------
  // Meta line / online count
  // ---------------------------
  if(metaLine) metaLine.textContent = `${(window.MEMBER_COUNT||1284).toLocaleString()} members, ${(window.ONLINE_COUNT||86).toLocaleString()} online`;

  function updateMeta(){
    if(metaLine) metaLine.textContent = `${(window.MEMBER_COUNT||1284).toLocaleString()} members, ${(window.ONLINE_COUNT||86).toLocaleString()} online`;
  }

  // ---------------------------
  // Send button toggle
  // ---------------------------
  function toggleSendButton(){
    const hasText = input && input.value.trim().length > 0;
    if(!sendBtn) return;
    if(hasText) sendBtn.classList.remove("hidden");
    else sendBtn.classList.add("hidden");
  }

  if(input) input.addEventListener("input", toggleSendButton);

  // ---------------------------
  // Send message logic
  // ---------------------------
  function doSendMessage(){
    if(!input) return;
    const text = input.value.trim();
    if(!text) return;

    const persona = { name: "You", avatar: null };

    if(window.TGRenderer?.showTyping) window.TGRenderer.showTyping(persona, 400);

    setTimeout(() => {
      if(window.TGRenderer?.appendMessage){
        window.TGRenderer.appendMessage(persona, text, { timestamp: new Date(), type:"outgoing" });
      } else if(window.BubbleRenderer?.renderMessages){
        window.BubbleRenderer.renderMessages([{
          id:"m_local_"+Date.now(),
          name:"You",
          text,
          time: new Date().toLocaleTimeString(),
          isOwn:true
        }]);
      }
      document.dispatchEvent(new CustomEvent("sendMessage", { detail: { text } }));
      if(window.realism?.resetUnreadPill) window.realism.resetUnreadPill(); // reset unread
    }, 500 + Math.random()*300);

    input.value = "";
    toggleSendButton();
  }

  if(sendBtn) sendBtn.addEventListener("click", doSendMessage);
  if(input) input.addEventListener("keydown", (e) => { if(e.key === "Enter"){ e.preventDefault(); doSendMessage(); } });

  // ---------------------------
  // Contact admin button
  // ---------------------------
  document.addEventListener("click", (e) => {
    const target = e.target.closest(".contact-admin-btn");
    if(target){
      const href = target.dataset?.href || contactAdminLink;
      window.open(href, "_blank");
      e.preventDefault();
    }
  });

  // ---------------------------
  // Reset unread pill when user types
  // ---------------------------
  if(input){
    input.addEventListener("focus", () => { window.realism?.resetUnreadPill(); });
  }

  // ---------------------------
  // Message auto-replies
  // ---------------------------
  document.addEventListener("messageContext", (ev) => {
    const info = ev.detail;
    const persona = window.identity?.getRandomPersona() || { name:"User", avatar:"https://ui-avatars.com/api/?name=U" };
    setTimeout(() => {
      const replyText = window.identity?.generateHumanComment(persona,"Nice point!") || "Nice!";
      document.dispatchEvent(new CustomEvent("autoReply", { detail: { parentText: info.text, persona, text: replyText } }));
    }, 700 + Math.random()*1200);
  });

  // ---------------------------
  // Header icons (3-dot menu & back arrow)
  // ---------------------------
  const menuBtn = document.querySelector(".tg-header-menu");
  const backBtn = document.querySelector(".tg-header-back");

  if(menuBtn) menuBtn.style.cursor = "pointer";
  if(backBtn) backBtn.style.cursor = "pointer";

  // optional: log clicks
  if(menuBtn) menuBtn.addEventListener("click", () => console.log("3-dot menu clicked"));
  if(backBtn) backBtn.addEventListener("click", () => console.log("Back arrow clicked"));

  // ---------------------------
  // Avatar bubble tails & size fix (Telegram style)
  // ---------------------------
  const style = document.createElement("style");
  style.innerHTML = `
    .tg-bubble { border-radius: 22px; padding: 10px 14px; max-width: 75%; margin: 4px 0; position: relative; display: inline-block; }
    .tg-bubble.incoming { background:#fff; border:1px solid #eee; }
    .tg-bubble.outgoing { background:#0088ff; color:#fff; }
    .tg-bubble::after { content:""; position:absolute; width:10px; height:10px; bottom:0; ${/* tail to left or right */''} }
    .tg-bubble.incoming::after { left:-5px; border-bottom-left-radius:4px; border-top-right-radius:4px; background:#fff; }
    .tg-bubble.outgoing::after { right:-5px; border-bottom-right-radius:4px; border-top-left-radius:4px; background:#0088ff; }
    .tg-avatar { width:32px; height:32px; border-radius:50%; }
    .tg-bubble-meta { font-size:11px; color:#999; margin-top:2px; }
  `;
  document.head.appendChild(style);

});
