// bubble-renderer.js (Telegram-style tails fixed)
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("tg-comments-container");
  if (!container) {
    console.error("tg-comments-container missing in DOM");
    return;
  }

  /**
   * Create a Telegram-style chat bubble
   * @param {Object} options
   * @param {string} options.id - unique message id
   * @param {string} options.name - sender name
   * @param {string} options.avatar - avatar URL
   * @param {string} options.text - message text
   * @param {string} options.time - ISO timestamp
   * @param {boolean} options.isOwn - true if outgoing
   * @param {string} options.replyToText - optional reply preview text
   * @param {string} options.image - optional image URL
   */
  function createBubble({ id, name, avatar, text, time, isOwn, replyToText, image }) {
    const bubble = document.createElement("div");
    bubble.classList.add("tg-bubble", isOwn ? "outgoing" : "incoming");
    bubble.dataset.id = id;

    // Avatar
    const avatarEl = document.createElement("img");
    avatarEl.className = "tg-bubble-avatar";
    avatarEl.src = avatar || "assets/default-avatar.png";
    avatarEl.alt = name;

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
    const timeObj = new Date(time);
    meta.textContent = timeObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    content.appendChild(meta);

    // Append avatar & content
    bubble.appendChild(avatarEl);
    bubble.appendChild(content);

    // Add proper tail spacing and Telegram-style alignment
    content.style.position = "relative";
    const tail = document.createElement("div");
    tail.className = isOwn ? "tg-tail-outgoing" : "tg-tail-incoming";

    // Inline styling for tails (align from CSS)
    tail.style.position = "absolute";
    tail.style.top = "12px";
    if (isOwn) {
      tail.style.right = "-10px";
      tail.style.width = "0";
      tail.style.height = "0";
      tail.style.borderTop = "8px solid transparent";
      tail.style.borderBottom = "8px solid transparent";
      tail.style.borderLeft = "10px solid #2b5278";
    } else {
      tail.style.left = "-10px";
      tail.style.width = "0";
      tail.style.height = "0";
      tail.style.borderTop = "8px solid transparent";
      tail.style.borderBottom = "8px solid transparent";
      tail.style.borderRight = "10px solid #182533";
    }
    bubble.appendChild(tail);

    return bubble;
  }

  /** Append a message to the container */
  function appendMessage(message) {
    const bubble = createBubble(message);
    container.appendChild(bubble);
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }

  /** Clear all messages */
  function clearMessages() {
    container.innerHTML = "";
  }

  // Expose globally for interactions.js / app.js
  window.TGRenderer = window.TGRenderer || {};
  window.TGRenderer.appendMessage = appendMessage;
  window.TGRenderer.createBubble = createBubble;
  window.TGRenderer.clearMessages = clearMessages;
});
