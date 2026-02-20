// bubble-renderer.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("tg-comments-container");

  if (!container) {
    console.error("tg-comments-container missing in DOM");
    return;
  }

  /**
   * Create Telegram-style bubble
   */
  function createBubble({
    id,
    name,
    avatar,
    text,
    time,
    isOwn,
    replyToText,
    image
  }) {
    const bubble = document.createElement("div");
    bubble.classList.add("tg-bubble", isOwn ? "outgoing" : "incoming");
    bubble.dataset.id = id || "msg_" + Date.now();

    // Avatar
    const avatarEl = document.createElement("img");
    avatarEl.className = "tg-bubble-avatar";
    avatarEl.src = avatar || "assets/default-avatar.png";
    avatarEl.alt = name || "User";

    // Bubble content
    const content = document.createElement("div");
    content.className = "tg-bubble-content";

    // Show sender name only for incoming messages
    if (!isOwn && name) {
      const sender = document.createElement("div");
      sender.className = "tg-bubble-sender";
      sender.textContent = name;
      content.appendChild(sender);
    }

    // Reply preview
    if (replyToText) {
      const reply = document.createElement("div");
      reply.className = "tg-reply-preview";
      reply.textContent = replyToText;
      content.appendChild(reply);
    }

    // Optional image
    if (image) {
      const img = document.createElement("img");
      img.className = "tg-bubble-image";
      img.src = image;
      img.alt = "image";
      content.appendChild(img);
    }

    // Message text
    if (text) {
      const textEl = document.createElement("div");
      textEl.className = "tg-bubble-text";
      textEl.textContent = text;
      content.appendChild(textEl);
    }

    // Timestamp
    if (time) {
      const meta = document.createElement("div");
      meta.className = "tg-bubble-meta";
      const timeObj = new Date(time);
      meta.textContent = timeObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
      content.appendChild(meta);
    }

    // Structure order (Telegram style)
    if (isOwn) {
      bubble.appendChild(content);
      bubble.appendChild(avatarEl);
    } else {
      bubble.appendChild(avatarEl);
      bubble.appendChild(content);
    }

    return bubble;
  }

  /**
   * Append message to chat
   */
  function appendMessage(message) {
    const bubble = createBubble(message);
    container.appendChild(bubble);

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth"
    });
  }

  /**
   * Append Telegram-style join sticker
   */
  function appendJoinSticker(joiners = []) {
    const sticker = document.createElement("div");
    sticker.className = "tg-join-sticker";

    const cluster = document.createElement("div");
    cluster.className = "join-cluster";

    joiners.forEach(user => {
      const avatar = document.createElement("img");
      avatar.src = user.avatar || "assets/default-avatar.png";
      avatar.alt = user.name;
      cluster.appendChild(avatar);
    });

    sticker.appendChild(cluster);

    const names = document.createElement("div");
    names.className = "join-names";
    names.textContent = joiners.map(u => u.name).join(", ");
    sticker.appendChild(names);

    const sub = document.createElement("div");
    sub.className = "join-sub";
    sub.textContent = `${joiners.length} joined the chat`;
    sticker.appendChild(sub);

    container.appendChild(sticker);

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth"
    });
  }

  /**
   * Clear all messages
   */
  function clearMessages() {
    container.innerHTML = "";
  }

  // Expose globally (standalone but connected)
  window.TGRenderer = window.TGRenderer || {};
  window.TGRenderer.appendMessage = appendMessage;
  window.TGRenderer.createBubble = createBubble;
  window.TGRenderer.appendJoinSticker = appendJoinSticker;
  window.TGRenderer.clearMessages = clearMessages;
});
