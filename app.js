import { pipeline, env } from 'https://jsdelivr.net';

// Ensure the model stays in the browser's persistent storage
env.useBrowserCache = true;

const status = document.getElementById('status');
const chatLog = document.getElementById('chat-log');
const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let generator;

async function init() {
    try {
        status.textContent = 'Initializing AI (checking local storage)...';
        
        generator = await pipeline('text-generation', 'onnx-community/TinyLlama-1.1B-Chat-v1.0-ONNX', {
            device: 'webgpu', 
            dtype: 'q4',
            // This function updates the status bar while the model downloads
            progress_callback: (data) => {
                if (data.status === 'progress') {
                    status.textContent = `Downloading AI: ${Math.round(data.loaded / data.total * 100)}%`;
                } else if (data.status === 'ready') {
                    status.textContent = 'AI Ready (Offline & WebGPU)';
                }
            }
        });

        sendBtn.disabled = false;
    } catch (e) {
        console.error(e);
        status.textContent = 'Error: Check if your browser supports WebGPU or try refreshing.';
    }
}

sendBtn.onclick = async () => {
    const text = input.value;
    if (!text || !generator) return;

    chatLog.innerHTML += `<p><strong>You:</strong> ${text}</p>`;
    input.value = '';
    status.textContent = 'AI is thinking...';

    const messages = [{ role: "user", content: text }];
    const output = await generator(messages, { 
        max_new_tokens: 120,
        temperature: 0.7,
        do_sample: true 
    });

    const botReply = output[0].generated_text.at(-1).content;
    chatLog.innerHTML += `<p><strong>AI:</strong> ${botReply}</p>`;
    status.textContent = 'AI Ready';
    chatLog.scrollTop = chatLog.scrollHeight;
};

init();