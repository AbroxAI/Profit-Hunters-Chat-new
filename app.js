// app.js
document.addEventListener("DOMContentLoaded", () => {
  const pinBanner = document.getElementById("tg-pin-banner");
  const container = document.getElementById("tg-comments-container");
  if (!container) { console.error("tg-comments-container missing in DOM"); return; }

  // Unread counter pill
  const unreadPill = document.getElementById("tg-unread-pill");
  function incrementUnread() {
    if (!unreadPill) return;
    let count = parseInt(unreadPill.textContent) || 0;
    count++;
    unreadPill.textContent = count;
    unreadPill.style.display = "block";
  }

  // Admin broadcast
  function postAdminBroadcast() {
    const admin = (window.identity && window.identity.Admin) ? window.identity.Admin : { name: "Admin", avatar: "assets/admin.jpg", isAdmin: true };
    const caption = `📌 Group Rules

- New members are read-only until verified
- Admins do NOT DM directly
- No screenshots in chat
- Ignore unsolicited messages

✅ To verify or contact admin, use the “Contact Admin” button below.`;
    const image = "assets/broadcast.jpg";
    const timestamp = new Date(2025, 2, 14, 10, 0, 0); // Mar 14 2025
    const id = window.TGRenderer ? window.TGRenderer.appendMessage({ name: admin.name, avatar: admin.avatar, text: caption, time: timestamp, isOwn: true, image }) : null;
    return { id, caption, image };
  }

  // Show pinned banner
  function showPinBanner(image, caption, pinnedMessageId) {
    if (!pinBanner) return;
    pinBanner.innerHTML = "";
    const img = document.createElement("img");
    img.src = image;
    img.onerror = () => { img.src = "assets/admin.jpg"; };
    const text = document.createElement("div");
    text.className = "pin-text";
    text.textContent = (caption || "Pinned message").split("\n")[0];
    const btn = document.createElement("button");
    btn.className = "contact-admin-btn";
    btn.dataset.href = window.CONTACT_ADMIN_LINK || "https://t.me/ph_suppp";
    btn.textContent = "Contact Admin";
    pinBanner.appendChild(img);
    pinBanner.appendChild(text);
    pinBanner.appendChild(btn);
    pinBanner.classList.remove("hidden");
    pinBanner.classList.add("show");
    pinBanner.onclick = () => {
      const el = pinnedMessageId ? document.querySelector(`[data-id="${pinnedMessageId}"]`) : null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("tg-highlight");
        setTimeout(() => el.classList.remove("tg-highlight"), 2600);
      }
    };
  }

  // Post system notice for pinned message
  function postPinNotice() {
    const system = { name: "System", avatar: "assets/admin.jpg" };
    if (window.TGRenderer) {
      window.TGRenderer.appendMessage({ ...system, text: "Admin pinned a message", time: new Date(), isOwn: false });
      incrementUnread();
    }
  }

  const broadcast = postAdminBroadcast();
  setTimeout(() => {
    postPinNotice();
    if (broadcast && broadcast.id) showPinBanner(broadcast.image, broadcast.caption, broadcast.id);
    else showPinBanner(broadcast.image, broadcast.caption, null);
  }, 1200);

  // Listen for sendMessage events
  document.addEventListener("sendMessage", (ev) => {
    const text = ev.detail.text;
    if (text.toLowerCase().includes("admin") || text.toLowerCase().includes("contact")) {
      const admin = window.identity && window.identity.Admin ? window.identity.Admin : { name: "Admin", avatar: "assets/admin.jpg" };
      window.TGRenderer && window.TGRenderer.showTyping(admin, 1200 + Math.random() * 800);
      setTimeout(() => {
        window.TGRenderer && window.TGRenderer.appendMessage({ name: admin.name, avatar: admin.avatar, text: "Thanks — please use the Contact Admin button in the pinned banner. We'll respond there.", time: new Date(), isOwn: true });
      }, 1800 + Math.random() * 1200);
    }
  });

  // Listen for autoReply events
  document.addEventListener("autoReply", (ev) => {
    const { parentText, persona, text } = ev.detail;
    window.TGRenderer && window.TGRenderer.showTyping(persona, 1000 + Math.random() * 1200);
    setTimeout(() => {
      if (window.TGRenderer) {
        window.TGRenderer.appendMessage({ name: persona.name, avatar: persona.avatar, text, time: new Date(), isOwn: false, replyToText: parentText });
        incrementUnread();
      }
    }, 1200 + Math.random() * 800);
  });

  // Wrap appendMessage to increment unread for any incoming message
  if (window.TGRenderer) {
    const originalAppend = window.TGRenderer.appendMessage;
    window.TGRenderer.appendMessage = function (message) {
      originalAppend.call(window.TGRenderer, message);
      if (!message.isOwn && document.activeElement !== document.getElementById("tg-comment-input")) {
        incrementUnread();
      }
    };
  }

  // Trigger realism engine
  if (window.realism && typeof window.realism.simulateRandomCrowdV11 === "function") {
    setTimeout(() => window.realism.simulateRandomCrowdV11(), 600);
  } else if (window.realism && typeof window.realism.postFromPoolV11 === "function") {
    setTimeout(() => window.realism.postFromPoolV11(6), 600);
  } else console.warn("realism engine not available (window.realism).");
});
