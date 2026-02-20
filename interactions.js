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

  function toggleSendButton() {
    if (input.value.trim().length > 0) {
      sendBtn.classList.remove("hidden");
      cameraBtn?.classList.add("hidden");
    } else {
      sendBtn.classList.add("hidden");
      cameraBtn?.classList.remove("hidden");
    }
  }

  function sendMessage(text, image = null) {
    const message = {
      id: "m_" + Date.now(),
      name: "You",
      avatar: null,
      text: text || "",
      image: image || null,
      time: new Date().toISOString(),
      isOwn: true
    };

    window.TGRenderer.appendMessage(message);
    input.value = "";
    toggleSendButton();

    if (window.saveMessageHistory) window.saveMessageHistory(message);
  }

  sendBtn.addEventListener("click", () => sendMessage(input.value.trim()));

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value.trim());
    }
  });

  cameraBtn?.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => sendMessage("", reader.result);
      reader.readAsDataURL(file);
    };
    fileInput.click();
  });

  input.addEventListener("input", toggleSendButton);
  input.addEventListener("focus", () => setTimeout(() => container.scrollTo({ top: container.scrollHeight, behavior: "smooth" }), 100));

  toggleSendButton();
});
