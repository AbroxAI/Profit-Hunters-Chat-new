// interactions.js (fixed with Telegram-style bubbles and input)
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("tg-comment-input");
  const sendBtn = document.getElementById("tg-send-btn");
  const cameraBtn = document.getElementById("tg-camera-btn");
  const container = document.getElementById("tg-comments-container");

  if (!input || !sendBtn || !container) {
    console.error("Essential DOM elements missing");
    return;
  }

  /** Show/hide send button based on input value */
  function toggleSendButton() {
    const hasText = input.value.trim().length > 0;
    sendBtn.classList.toggle("hidden", !hasText);
    if (cameraBtn) cameraBtn.classList.toggle("hidden", hasText);
  }

  input.addEventListener("input", toggleSendButton);

  /** Send message */
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    const message = {
      id: "m_" + Date.now(),
      name: "You",
      avatar: null,
      text: text,
      time: new Date().toISOString(),
      isOwn: true
    };

    window.TGRenderer.appendMessage(message);
    input.value = "";
    toggleSendButton();

    // Optional: save to history.json or backend
    if (window.saveMessageHistory) window.saveMessageHistory(message);
  }

  /** Send on Enter key */
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  /** Click camera to send image */
  cameraBtn?.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const message = {
          id: "m_" + Date.now(),
          name: "You",
          avatar: null,
          text: "",
          image: reader.result,
          time: new Date().toISOString(),
          isOwn: true
        };
        window.TGRenderer.appendMessage(message);
        if (window.saveMessageHistory) window.saveMessageHistory(message);
      };
      reader.readAsDataURL(file);
    };
    fileInput.click();
  });

  /** Focus scrolls container */
  input.addEventListener("focus", () => {
    setTimeout(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }, 100);
  });

  /** Adjust input bar height dynamically for mobile */
  function adjustInputBar() {
    const wrapper = document.querySelector(".tg-input-bar");
    if (!wrapper) return;
    wrapper.style.height = "auto";
    const scrollHeight = input.scrollHeight + 12; // extra padding
    wrapper.style.height = `${Math.max(scrollHeight, 44)}px`;
  }

  input.addEventListener("input", adjustInputBar);

  // Initialize
  toggleSendButton();
  adjustInputBar();
});
