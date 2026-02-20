// bubble-renderer.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("tg-comments-container");
  if (!container) {
    console.error("tg-comments-container missing in DOM");
    return;
  }

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

    if (name) {
      const sender = document.createElement("div");
      sender.className = "tg-bubble-sender";
      sender.textContent = name;
      content.appendChild(sender);
    }

    if (replyToText) {
      const reply = document.createElement("div");
      reply.className = "tg-reply-preview";
      reply.textContent = replyToText;
      content.appendChild(reply);
    }

    if (image) {
      const imgEl = document.createElement("img");
      imgEl.className = "tg-bubble-image";
      imgEl.src = image;
      imgEl.alt = "image";
      content.appendChild(imgEl);
    }

    const textEl = document.createElement("div");
    textEl.className = "tg-bubble-text";
    textEl.textContent = text;
    content.appendChild(textEl);

    const meta = document.createElement("div");
    meta.className = "tg-bubble-meta";
    const timeObj = new Date(time);
    meta.textContent = timeObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    content.appendChild(meta);

    // Append avatar & content
    bubble.appendChild(avatarEl);
    bubble.appendChild(content);

    return bubble;
  }

  function appendMessage(message) {
    const bubble = createBubble(message);
    container.appendChild(bubble);
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }

  // Optional: clear all messages
  function clearMessages() {
    container.innerHTML = "";
  }

  // Expose globally for interactions or app.js
  window.TGRenderer = window.TGRenderer || {};
  window.TGRenderer.appendMessage = appendMessage;
  window.TGRenderer.createBubble = createBubble;
  window.TGRenderer.clearMessages = clearMessages;
});
