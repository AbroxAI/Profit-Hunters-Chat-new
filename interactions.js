// interactions.js
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("tg-comment-input");
  const sendBtn = document.getElementById("tg-send-btn");
  const cameraBtn = document.getElementById("tg-camera-btn");
  const container = document.getElementById("tg-comments-container");

  if (!input || !sendBtn || !cameraBtn || !container) {
    console.error("One or more interaction elements are missing in DOM");
    return;
  }

  // Show send button only when there is text
  input.addEventListener("input", () => {
    if (input.value.trim().length > 0) {
      sendBtn.classList.remove("hidden");
      cameraBtn.classList.add("hidden"); // hide camera when typing
    } else {
      sendBtn.classList.add("hidden");
      cameraBtn.classList.remove("hidden"); // show camera when input empty
    }
  });

  // Handle sending message
  sendBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;

    // Create outgoing bubble
    const message = {
      id: "m_" + Date.now(),
      name: "You",
      avatar: null,
      text: text,
      time: new Date().toISOString(),
      isOwn: true
    };

    window.TGRenderer.appendMessage(message);

    // Clear input
    input.value = "";
    sendBtn.classList.add("hidden");
    cameraBtn.classList.remove("hidden");
    input.focus();

    // Optional: trigger realism responses
    if (window.TGRealism) {
      window.TGRealism.onUserMessage(message);
    }
  });

  // Press Enter to send
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  // Emoji button toggle (optional: connect emoji picker)
  const emojiBtn = document.getElementById("tg-emoji-btn");
  if (emojiBtn) {
    emojiBtn.addEventListener("click", () => {
      console.log("Emoji button clicked"); 
      // integrate your emoji picker here
    });
  }

  // Camera button (if you want image upload later)
  cameraBtn.addEventListener("click", () => {
    console.log("Camera button clicked"); 
    // integrate your image upload logic here
  });

  // Scroll to bottom on new message
  const observer = new MutationObserver(() => {
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  });
  observer.observe(container, { childList: true });

  // Optional: expose globally
  window.TGInteractions = {
    input,
    sendBtn,
    cameraBtn
  };
});
