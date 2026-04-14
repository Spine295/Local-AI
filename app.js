import { pipeline } from 'https://jsdelivr.net';

const status = document.getElementById('status');
const chatLog = document.getElementById('chat-log');
const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let generator;

// 1. Initialize the Chatbot
async function init() {
    status.textContent = 'Downloading Chatbot (approx 650MB)...';
    try {
        generator = await pipeline('text-generation', 'onnx-community/TinyLlama-1.1B-Chat-v1.0-ONNX', {
            device: 'webgpu', // Uses your GPU for speed
            dtype: 'q4',     // Uses a "quantized" version to save space/memory
        });
        status.textContent = 'Chatbot Ready (Offline & WebGPU)';
        sendBtn.disabled = false;
    } catch (e) {
        status.textContent = 'WebGPU failed. Trying CPU (Slower)...';
        generator = await pipeline('text-generation', 'onnx-community/TinyLlama-1.1B-Chat-v1.0-ONNX');
        status.textContent = 'Chatbot Ready (CPU Mode)';
        sendBtn.disabled = false;
    }
}

// 2. Handle Chatting
sendBtn.onclick = async () => {
    const text = input.value;
    if (!text || !generator) return;

    // Display user message
    chatLog.innerHTML += `<p><strong>You:</strong> ${text}</p>`;
    input.value = '';
    status.textContent = 'Thinking...';

    // Format for TinyLlama Chat
    const messages = [{ role: "user", content: text }];
    
    // Generate response
    const output = await generator(messages, { 
        max_new_tokens: 100,
        temperature: 0.7,
        do_sample: true 
    });

    const botReply = output[0].generated_text.at(-1).content;
    
    // Display bot message
    chatLog.innerHTML += `<p><strong>AI:</strong> ${botReply}</p>`;
    status.textContent = 'Chatbot Ready';
    chatLog.scrollTop = chatLog.scrollHeight;
};

init();