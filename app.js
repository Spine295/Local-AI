import { pipeline, env } from 'https://jsdelivr.net';

// Disable WebGPU to avoid security/origin errors on GitHub Pages
env.allowLocalModels = false;
env.useBrowserCache = true;

const status = document.getElementById('status');
const chatLog = document.getElementById('chat-log');
const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let generator;

async function init() {
    try {
        status.textContent = 'Loading Small AI (135MB)...';
        
        // Using SmolLM-135M: it's tiny, fast, and works on almost any browser
        generator = await pipeline('text-generation', 'onnx-community/SmolLM2-135B-Instruct-ONNX', {
            device: 'wasm', // Use standard WebAssembly (CPU) for maximum compatibility
            progress_callback: (data) => {
                if (data.status === 'progress') {
                    status.textContent = `Downloading: ${Math.round(data.loaded / data.total * 100)}%`;
                }
            }
        });

        status.textContent = 'AI Ready!';
        sendBtn.disabled = false;
    } catch (e) {
        console.error("Initialization Error:", e);
        status.textContent = 'Error: ' + e.message;
    }
}

sendBtn.onclick = async () => {
    const text = input.value;
    if (!text || !generator) return;

    chatLog.innerHTML += `<p><strong>You:</strong> ${text}</p>`;
    input.value = '';
    status.textContent = 'Thinking...';

    const output = await generator(text, { 
        max_new_tokens: 50,
        temperature: 0.6,
        do_sample: true 
    });

    const botReply = output[0].generated_text.replace(text, '').trim();
    chatLog.innerHTML += `<p><strong>AI:</strong> ${botReply}</p>`;
    status.textContent = 'AI Ready';
    chatLog.scrollTop = chatLog.scrollHeight;
};

init();