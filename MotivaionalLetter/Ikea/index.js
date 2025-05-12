import * as webllm from "https://esm.run/@mlc-ai/web-llm";

/*************** WebLLM logic ***************/
const messages = [
  { content: "You are a helpful AI agent helping users.", role: "system" },
];

const availableModels = webllm.prebuiltAppConfig.model_list.map((m) => m.model_id);
let selectedModel = "Phi-3.5-mini-instruct-q4f16_1-MLC";

let modelLoaded = false;

// Callback function for initialization progress
function updateEngineInitProgressCallback(report) {
  console.log("initialize", report.progress);
  document.getElementById("download-status").textContent = `Please wait while downloading: ${report.text} (${Math.round(report.progress * 100)}%)`;
}

const engine = new webllm.MLCEngine();
engine.setInitProgressCallback(updateEngineInitProgressCallback);

async function initializeWebLLMEngine() {
  try {
    document.getElementById("download-status").classList.remove("hidden");
    selectedModel = document.getElementById("model-selection").value;
    const config = { temperature: 1.0, top_p: 1 };

    console.log("Starting model initialization for:", selectedModel);
    await engine.reload(selectedModel, config);

    document.getElementById("send").disabled = false;
    document.getElementById("download-status").textContent = "Model loaded successfully. You can start chatting.";
    modelLoaded = true;

    setTimeout(() => {
      const userInput = document.getElementById("user-input");
      userInput.value = `SYSTEM:
You are an expert language model specialized in writing clear, technically grounded motivation letters for senior engineering positions in mission-driven organizations.

TASK:
Write a motivation letter for Kraai du Toit applying for the position of Software Engineering Leader in the AI&Tech team at IKEA (Inter IKEA). This replaces a traditional motivation letter and should reflect the candidate's personality, technical credibility, and alignment with IKEA's values.

STRUCTURE:
- Address the letter to "Dear IKEA Recruitment Team,"
- Keep it between 250–300 words
- Use first-person voice
- End with a warm, professional note that invites a conversation

TONE:
- Curious, thoughtful, grounded
- Technically confident but humble
- Reflective of IKEA’s culture: pragmatic, collaborative, purpose-led

STYLE GUIDELINES:
- Avoid generic buzzwords and clichés
- Highlight key projects and problem-solving examples
- Show understanding of IKEA's mission to empower co-workers through GenAI
- Emphasize ability to build real-world GenAI systems and guide engineering teams hands-on
- Do not fabricate experience

CANDIDATE CONTEXT:
- Kraai du Toit, based in the Netherlands
- 15+ years of experience in software and systems architecture
- Currently focused on GenAI apps: RAG pipelines, LLM chat tools, LangChain/LlamaIndex, Python microservices
- Experience with Neo4j, Azure, AWS, Docker, Kubernetes, React, FastAPI, Terraform
- Loves building useful, well-integrated tools that bring LLMs into real-world co-worker use cases
- Enjoys dev-led teams and hands-on prototyping
- Portfolio: https://jfkproductions.github.io/`;

      document.getElementById("send").click();
    }, 500);
  } catch (err) {
    console.error("Initialization failed:", err);
    document.getElementById("download-status").textContent = "Initialization failed. Check console for details.";
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById("model-selection").value = selectedModel;
  initializeWebLLMEngine();
});

async function streamingGenerating(messages, onUpdate, onFinish, onError) {
  try {
    if (!modelLoaded) throw new Error("Model not loaded. Initialize the model before generating responses.");

    let curMessage = "";
    const completion = await engine.chat.completions.create({ stream: true, messages });

    for await (const chunk of completion) {
      const curDelta = chunk.choices[0].delta.content;
      if (curDelta) curMessage += curDelta;
      onUpdate(curMessage);
    }

    const finalMessage = await engine.getMessage();
    onFinish(finalMessage);
  } catch (err) {
    onError(err);
  }
}

/*************** Cache Handling Logic ***************/
async function addToCache(cacheName, request, response) {
  if ("caches" in window) {
    try {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      console.log(`Added ${request.url} to ${cacheName}`);
    } catch (err) {
      console.error("Failed to add to cache:", err);
    }
  } else {
    console.warn("The caches API is not available in this environment.");
  }
}

/*************** UI logic ***************/
function onMessageSend() {
  const input = document.getElementById("user-input").value.trim();
  if (input.length === 0) return;

  const message = { content: input, role: "user" };
  document.getElementById("send").disabled = true;

  messages.push(message);
  appendMessage(message);

  document.getElementById("user-input").value = "";
  document.getElementById("user-input").setAttribute("placeholder", "Generating...");

  const aiMessage = { content: "typing...", role: "assistant" };
  appendMessage(aiMessage);

  const onFinishGenerating = (finalMessage) => {
    updateLastMessage(finalMessage);
    document.getElementById("send").disabled = false;

    engine.runtimeStatsText().then((statsText) => {
      document.getElementById("chat-stats").classList.remove("hidden");
      document.getElementById("chat-stats").textContent = statsText;
    });
  };

  streamingGenerating(messages, updateLastMessage, onFinishGenerating, console.error);
}

function appendMessage(message) {
  const chatBox = document.getElementById("chat-box");
  const container = document.createElement("div");
  container.classList.add("message-container");

  const newMessage = document.createElement("div");
  newMessage.classList.add("message");
  newMessage.textContent = message.content;

  container.classList.add(message.role === "user" ? "user" : "assistant");
  container.appendChild(newMessage);
  chatBox.appendChild(container);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function updateLastMessage(content) {
  const messageDoms = document.getElementById("chat-box").querySelectorAll(".message");
  const lastMessageDom = messageDoms[messageDoms.length - 1];
  lastMessageDom.textContent = content;
}

/*************** UI Binding ***************/
availableModels.forEach((modelId) => {
  const option = document.createElement("option");
  option.value = modelId;
  option.textContent = modelId;
  document.getElementById("model-selection").appendChild(option);
});

document.getElementById("model-selection").value = selectedModel;
document.getElementById("download").addEventListener("click", initializeWebLLMEngine);
document.getElementById("send").addEventListener("click", onMessageSend);
document.getElementById("user-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") onMessageSend();
});

document.addEventListener("DOMContentLoaded", () => {
  const modal = new bootstrap.Modal(document.getElementById("welcome-modal"));
  const downloadButton = document.getElementById("download");

  // Show the modal on page load
  modal.show();

  // Simulate model download
  downloadButton.addEventListener("click", () => {
    modal.hide(); // Hide modal after clicking download
    document.getElementById("send").disabled = false; // Enable send button
  });

  // Automatically hide modal after 5 seconds (simulate download)
  setTimeout(() => {
    modal.hide();
    document.getElementById("send").disabled = false;
  }, 5000);
});

document.addEventListener("DOMContentLoaded", () => {
  const videoModal = new bootstrap.Modal(document.getElementById("video-modal"));
  const welcomeModal = new bootstrap.Modal(document.getElementById("welcome-modal"));

  // Show the video modal on page load
  videoModal.show();

  // Automatically show the welcome modal after the video ends
  const introVideo = document.getElementById("intro-video");
  introVideo.addEventListener("ended", () => {
    videoModal.hide();
    welcomeModal.show();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const welcomeModal = new bootstrap.Modal(document.getElementById("welcome-modal"), {
    backdrop: 'static', // Prevent accidental closure by clicking outside
    keyboard: false,    // Disable closing with the keyboard
  });

  // Show the welcome modal on page load
  welcomeModal.show();

  // Allow the user to close the modal manually
  document.querySelector('.btn-close').addEventListener('click', () => {
    welcomeModal.hide();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const welcomeModal = new bootstrap.Modal(document.getElementById("welcome-modal"), {
    backdrop: 'static', // Prevent accidental closure by clicking outside
    keyboard: false,    // Disable closing with the keyboard
  });

  const introVideo = document.getElementById("intro-video");

  // Show the welcome modal on page load
  welcomeModal.show();

  // Play the video with sound on startup
  introVideo.muted = false;
  introVideo.play().catch((err) => {
    console.error("Video autoplay failed:", err);
  });
});
