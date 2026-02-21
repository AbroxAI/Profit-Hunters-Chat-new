// app.js
document.addEventListener("DOMContentLoaded", () => {
  const pinBanner = document.getElementById("tg-pin-banner");
  const container = document.getElementById("tg-comments-container");
  if(!container){ console.error("tg-comments-container missing in DOM"); return; }

  function postAdminBroadcast(){
    const admin = (window.identity && window.identity.Admin) ? window.identity.Admin : { name:"Admin", avatar:"assets/admin.jpg", isAdmin:true };
    const caption = `📌 Group Rules

- New members are read-only until verified
- Admins do NOT DM directly
- No screenshots in chat
- Ignore unsolicited messages

✅ To verify or contact admin, use the “Contact Admin” button below.`;
    const image = "assets/broadcast.jpg";
    const timestamp = new Date(2025,2,14,10,0,0); // Mar 14 2025
    const id = window.TGRenderer ? window.TGRenderer.appendMessage(admin, "Broadcast", { timestamp, type:"outgoing", image, caption }) : null;
    return { id, caption, image };
  }

  function showPinBanner(image, caption, pinnedMessageId){
    if(!pinBanner) return;
    pinBanner.innerHTML = "";
    const img = document.createElement("img"); img.src = image; img.onerror = ()=>{ img.src = "assets/admin.jpg"; };
    const text = document.createElement("div"); text.className="pin-text"; text.textContent = (caption||"Pinned message").split("\n")[0];
    const btn = document.createElement("button"); btn.className = "contact-admin-btn"; btn.dataset.href = window.CONTACT_ADMIN_LINK || "https://t.me/ph_suppp"; btn.textContent = "Contact Admin";
    pinBanner.appendChild(img); pinBanner.appendChild(text); pinBanner.appendChild(btn);
    pinBanner.classList.remove("hidden"); pinBanner.classList.add("show");
    pinBanner.onclick = ()=> { const el = pinnedMessageId ? document.querySelector(`[data-id="${pinnedMessageId}"]`) : null; if(el){ el.scrollIntoView({behavior:"smooth", block:"center"}); el.classList.add("tg-highlight"); setTimeout(()=> el.classList.remove("tg-highlight"), 2600); } };
  }

  function postPinNotice(){
    const system = { name:"System", avatar:"assets/admin.jpg" };
    if(window.TGRenderer) window.TGRenderer.appendMessage(system, "Admin pinned a message", { timestamp: new Date(), type:"incoming" });
  }

  const broadcast = postAdminBroadcast();
  setTimeout(()=>{ postPinNotice(); if(broadcast && broadcast.id) showPinBanner(broadcast.image, broadcast.caption, broadcast.id); else showPinBanner(broadcast.image, broadcast.caption, null); }, 1200);

  document.addEventListener("sendMessage", (ev) => {
    const text = ev.detail.text;
    if(text.toLowerCase().includes("admin") || text.toLowerCase().includes("contact")){
      const admin = window.identity && window.identity.Admin ? window.identity.Admin : { name:"Admin", avatar:"assets/admin.jpg" };
      window.TGRenderer && window.TGRenderer.showTyping(admin, 1200 + Math.random()*800);
      setTimeout(()=> { window.TGRenderer && window.TGRenderer.appendMessage(admin, "Thanks — please use the Contact Admin button in the pinned banner. We'll respond there.", { timestamp: new Date(), type:"outgoing" }); }, 1800 + Math.random()*1200);
    }
  });

  document.addEventListener("autoReply", (ev) => {
    const { parentText, persona, text } = ev.detail;
    window.TGRenderer && window.TGRenderer.showTyping(persona, 1000 + Math.random()*1200);
    setTimeout(()=> window.TGRenderer && window.TGRenderer.appendMessage(persona, text, { timestamp: new Date(), type:"incoming", replyToText: parentText }), 1200 + Math.random()*800);
  });

  if(window.realism && typeof window.realism.simulateRandomCrowdV11 === "function"){ setTimeout(()=> window.realism.simulateRandomCrowdV11(), 600); }
  else if(window.realism && typeof window.realism.postFromPoolV11 === "function"){ setTimeout(()=> window.realism.postFromPoolV11(6), 600); }
  else console.warn("realism engine not available (window.realism).");
});
