# WebLLM WebGPU Application

This project demonstrates the use of the WebLLM library to create a web-based AI chatbot powered by machine learning models. The application allows users to interact with an AI agent by selecting a model, initializing it, and sending messages to receive AI-generated responses.

## How to Run the Application

### Prerequisites
- Node.js and npm installed on your system
- A modern web browser that supports WebGPU (Chrome 113+ or Edge 113+ recommended)

### Installing http-server
If you don't have http-server installed globally, you can install it using npm:

```bash
npm install -g http-server```


### running  http-server

```bash
http-server```

## File Overview: `index.js`

The `index.js` file contains the core logic for the application, including WebLLM integration, caching, and user interface (UI) handling. Below is a breakdown of its main components:

### 1. **WebLLM Logic**
This section handles the integration with the WebLLM library:
- **Messages Array**: Maintains a list of chat messages exchanged between the user and the AI.
- **Model Selection**: Fetches available models from WebLLM's configuration and allows the user to select one.
- **Engine Initialization**: Creates an instance of the WebLLM engine and initializes it with the selected model. Progress updates are displayed during initialization.
- **Streaming Response Generation**: Handles the streaming of AI-generated responses using WebLLM's `chat.completions.create` API.

### 2. **Cache Handling Logic**
This section provides a utility function to add responses to the browser's cache:
- **`addToCache` Function**: Adds a request-response pair to a specified cache. This is useful for storing frequently accessed resources.

### 3. **UI Logic**
This section manages user interactions and updates the chat interface:
- **Message Sending**: Captures user input, appends it to the chat, and triggers AI response generation.
- **Message Rendering**: Dynamically updates the chat box with user and AI messages.
- **Progress and Status Updates**: Displays the initialization progress, runtime statistics, and response generation status.

### 4. **UI Binding**
This section binds UI elements to their respective event handlers:
- **Model Selection Dropdown**: Populates the dropdown with available models and sets the default selection.
- **Buttons**: Binds the "Download" button to initialize the engine and the "Send" button to send messages.

## Key Functions

### `initializeWebLLMEngine()`
Initializes the WebLLM engine with the selected model and configuration. Displays progress and handles errors during initialization.

### `streamingGenerating(messages, onUpdate, onFinish, onError)`
Streams AI-generated responses in real-time. Updates the UI with partial responses and handles errors.

### `onMessageSend()`
Triggered when the user sends a message. Updates the chat interface, sends the message to the AI, and processes the response.

### `appendMessage(message)`
Appends a new message (user or AI) to the chat box.

### `updateLastMessage(content)`
Updates the content of the last message in the chat box (used for streaming responses).

## How to Use

1. **Select a Model**: Choose a model from the dropdown menu.
2. **Initialize the Model**: Click the "Download" button to load the selected model.
3. **Start Chatting**: Enter a message in the input box and click "Send" to interact with the AI.

## Dependencies

- **WebLLM Library**: Imported from `https://esm.run/@mlc-ai/web-llm`.

## Notes

- Ensure that the browser supports WebGPU for optimal performance.
- The application uses the browser's `caches` API for caching, which may not be available in all environments.

## Future Improvements

- Add error handling for unsupported browsers.
- Enhance the UI for better user experience.
- Implement additional features like saving chat history or switching models dynamically.
