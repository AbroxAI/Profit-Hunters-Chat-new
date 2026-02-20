// app.js (Telegram-style fully updated)
document.addEventListener("DOMContentLoaded", () => {
  const pinBanner = document.getElementById("tg-pin-banner");
  const container = document.getElementById("tg-comments-container");
  const unreadPill = document.getElementById("tg-unread-pill");

  if (!container) {
    console.error("tg-comments-container missing in DOM");
    return;
  }

  /** Increment unread counter */
  function incrementUnread() {
    if (!unreadPill) return;
    let count = parseInt(unreadPill.textContent) || 0;
    count++;
    unreadPill.textContent = count;
    unreadPill.style.display = "block";
  }

  /** Post admin broadcast bubble */
  function postAdminBroadcast() {
    const admin = window.identity?.Admin || { name: "Admin", avatar: "assets/admin.jpg", isAdmin: true };
    const caption = `📌 Group Rules
- New members are read-only until verified
- Admins do NOT DM directly
- No screenshots in chat
- Ignore unsolicited messages

✅ To verify or contact admin, use the inline button below.`;

    const image = "assets/broadcast.jpg";
    const timestamp = new Date();
    const message = {
      id: "m_admin_" + Date.now(),
      name: admin.name,
      avatar: admin.avatar,
      text: caption,
      image: image,
      time: timestamp.toISOString(),
      isOwn: true
    };

    window.TGRenderer.appendMessage(message);
    if (window.saveMessageHistory) window.saveMessageHistory(message);

    return message.id;
  }

  /** Show pin banner with glass pill-style layout */
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

    // Scroll to pinned message on click
    pinBanner.onclick = () => {
      const el = pinnedMessageId ? document.querySelector(`[data-id="${pinnedMessageId}"]`) : null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("tg-highlight");
        setTimeout(() => el.classList.remove("tg-highlight"), 2600);
      }
    };

    // Inline button click
    btn.onclick = (e) => {
      e.stopPropagation();
      window.open(btn.dataset.href, "_blank");
    };
  }

  /** Post pin notice (system message) */
  function postPinNotice() {
    const system = { name: "System", avatar: "assets/admin.jpg" };
    const message = {
      id: "m_sys_" + Date.now(),
      name: system.name,
      avatar: system.avatar,
      text: "Admin pinned a message",
      time: new Date().toISOString(),
      isOwn: false
    };
    window.TGRenderer.appendMessage(message);
    if (document.activeElement !== document.getElementById("tg-comment-input")) incrementUnread();
    if (window.saveMessageHistory) window.saveMessageHistory(message);
  }

  /** Initial setup: broadcast + pin banner */
  const pinnedMessageId = postAdminBroadcast();
  setTimeout(() => {
    postPinNotice();
    showPinBanner("assets/broadcast.jpg", "📌 Group Rules — Contact admin if needed", pinnedMessageId);
  }, 1200);

  /** Listen for outgoing messages mentioning admin */
  document.addEventListener("sendMessage", (ev) => {
    const text = ev.detail.text || "";
    if (text.toLowerCase().includes("admin") || text.toLowerCase().includes("contact")) {
      const admin = window.identity?.Admin || { name: "Admin", avatar: "assets/admin.jpg" };
      window.TGRenderer.showTyping?.(admin, 1200 + Math.random() * 800);
      setTimeout(() => {
        const reply = {
          id: "m_admin_reply_" + Date.now(),
          name: admin.name,
          avatar: admin.avatar,
          text: "Thanks — please use the Contact Admin button in the pinned banner. We'll respond there.",
          time: new Date().toISOString(),
          isOwn: true
        };
        window.TGRenderer.appendMessage(reply);
        if (window.saveMessageHistory) window.saveMessageHistory(reply);
      }, 1800 + Math.random() * 1200);
    }
  });

  /** Auto-reply for persona responses */
  document.addEventListener("autoReply", (ev) => {
    const { parentText, persona, text } = ev.detail;
    window.TGRenderer.showTyping?.(persona, 1000 + Math.random() * 1200);
    setTimeout(() => {
      const reply = {
        id: "m_auto_" + Date.now(),
        name: persona.name,
        avatar: persona.avatar,
        text: text,
        time: new Date().toISOString(),
        isOwn: false,
        replyToText: parentText
      };
      window.TGRenderer.appendMessage(reply);
      incrementUnread();
      if (window.saveMessageHistory) window.saveMessageHistory(reply);
    }, 1200 + Math.random() * 800);
  });

  /** Wrap TGRenderer.appendMessage to track unread for all incoming messages */
  if (window.TGRenderer) {
    const originalAppend = window.TGRenderer.appendMessage;
    window.TGRenderer.appendMessage = function(message) {
      originalAppend.call(window.TGRenderer, message);
      const isOutgoing = message.isOwn === true;
      if (!isOutgoing && document.activeElement !== document.getElementById("tg-comment-input")) {
        incrementUnread();
      }
    };
  }

  /** Trigger realism engine posts */
  if (window.realism?.simulateRandomCrowdV11) {
    setTimeout(() => window.realism.simulateRandomCrowdV11(), 600);
  } else if (window.realism?.postFromPoolV11) {
    setTimeout(() => window.realism.postFromPoolV11(6), 600);
  } else console.warn("realism engine not available (window.realism).");
});
