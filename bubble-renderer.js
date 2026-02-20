// bubble-renderer.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("tg-comments-container");
  if (!container) {
    console.error("tg-comments-container missing in DOM");
    return;
  }

  /**
   * Create a Telegram-style chat bubble
   */
  function createBubble({ id, name, avatar, text, time, isOwn, replyToText, image }) {
    const bubble = document.createElement("div");
    bubble.classList.add("tg-bubble", isOwn ? "outgoing" : "incoming");
    bubble.dataset.id = id;

    // Avatar
    const avatarEl = document.createElement("img");
    avatarEl.className = "tg-bubble-avatar";
    avatarEl.src = avatar || "assets/default-avatar.png";
    avatarEl.alt = name || "User";

    // Bubble content
    const content = document.createElement("div");
    content.className = "tg-bubble-content";

    // Sender name
    if (name) {
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
      const imgEl = document.createElement("img");
      imgEl.className = "tg-bubble-image";
      imgEl.src = image;
      imgEl.alt = "image";
      content.appendChild(imgEl);
    }

    // Message text
    const textEl = document.createElement("div");
    textEl.className = "tg-bubble-text";
    textEl.textContent = text;
    content.appendChild(textEl);

    // Timestamp meta
    const meta = document.createElement("div");
    meta.className = "tg-bubble-meta";
    meta.textContent = new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    content.appendChild(meta);

    // Tail spacing for Telegram-style
    const tail = document.createElement("div");
    tail.className = isOwn ? "tg-tail-outgoing" : "tg-tail-incoming";
    bubble.appendChild(tail);

    bubble.appendChild(avatarEl);
    bubble.appendChild(content);
    return bubble;
  }

  function appendMessage(message) {
    const bubble = createBubble(message);
    container.appendChild(bubble);
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }

  function clearMessages() {
    container.innerHTML = "";
  }

  window.TGRenderer = window.TGRenderer || {};
  window.TGRenderer.appendMessage = appendMessage;
  window.TGRenderer.createBubble = createBubble;
  window.TGRenderer.clearMessages = clearMessages;
});
