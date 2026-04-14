import { pipeline, env } from 'https://jsdelivr.net';

// Essential settings to bypass browser blocks
env.allowLocalModels = false;
env.useBrowserCache = true;
env.backbone_device = 'wasm'; // Force CPU to avoid WebGPU security errors

const status = document.getElementById('status');
const chatLog = document.getElementById('chat-log');
const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let generator;

async function init() {
    try {
        status.textContent = 'Contacting AI Server...';
        
        // Using an extremely small, highly compatible model
        generator = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
            device: 'wasm',
            progress_callback: (data) => {
                if (data.status === 'progress') {
                    status.textContent = `Downloading AI: ${Math.round(data.loaded / data.total * 100)}%`;
                }
            }
        });

        status.textContent = 'AI Ready!';
        sendBtn.disabled = false;
    } catch (e) {
        console.error("The " + e.name + " happened: " + e.message);
        status.textContent = "Security block detected. Try Chrome or check your connection.";
    }
}

sendBtn.onclick = async () => {
    const text = input.value;
    if (!text || !generator) return;

    chatLog.innerHTML += `<p><strong>You:</strong> ${text}</p>`;
    input.value = '';
    status.textContent = 'AI is thinking...';

    // Simple generation logic
    const output = await generator(text, { 
        max_new_tokens: 50,
        temperature: 0.7,
        do_sample: true 
    });

    const botReply = output[0].generated_text.replace(text, '').trim();
    chatLog.innerHTML += `<p><strong>AI:</strong> ${botReply}</p>`;
    status.textContent = 'AI Ready';
};

init();