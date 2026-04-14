// The library is now available as a global 'transformers' object
const { pipeline, env } = transformers;

// Essential local settings
env.allowLocalModels = false;
env.useBrowserCache = true;

const status = document.getElementById('status');
const chatLog = document.getElementById('chat-log');
const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let generator;

async function init() {
    try {
        status.textContent = 'Contacting AI...';
        
        // Using a very small, reliable model (Qwen 0.5B)
        generator = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat', {
            progress_callback: (data) => {
                if (data.status === 'progress') {
                    status.textContent = `Downloading AI: ${Math.round(data.loaded / data.total * 100)}%`;
                } else if (data.status === 'ready') {
                    status.textContent = 'AI Ready!';
                }
            }
        });

        sendBtn.disabled = false;
        status.textContent = 'AI Ready!';
    } catch (e) {
        console.error(e);
        status.textContent = 'Error loading AI. Try using Chrome or Edge.';
    }
}

sendBtn.onclick = async () => {
    const text = input.value;
    if (!text || !generator) return;

    chatLog.innerHTML += `<div class="msg"><strong>You:</strong> ${text}</div>`;
    input.value = '';
    status.textContent = 'Thinking...';

    const output = await generator(text, { 
        max_new_tokens: 60,
        temperature: 0.7,
        do_sample: true 
    });

    const botReply = output[0].generated_text.replace(text, '').trim();
    chatLog.innerHTML += `<div class="msg"><strong>AI:</strong> ${botReply}</div>`;
    status.textContent = 'AI Ready';
    chatLog.scrollTop = chatLog.scrollHeight;
};

init();