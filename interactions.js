// interactions.js
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
    if (input.value.trim().length > 0) {
      sendBtn.classList.remove("hidden");
      cameraBtn?.classList.add("hidden");
    } else {
      sendBtn.classList.add("hidden");
      cameraBtn?.classList.remove("hidden");
    }
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

    // Scroll handled inside appendMessage
    // Optional: push message to history.json / backend
    if (window.saveMessageHistory) window.saveMessageHistory(message);
  }

  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  /** Optional: click camera to trigger file input */
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

  /** Optional: focus input scrolls container */
  input.addEventListener("focus", () => {
    setTimeout(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }, 100);
  });

  // Initialize
  toggleSendButton();
});
