import {
    state,
    addTodo,
    toggleTodo,
    deleteTodo,
    setFilter,
    setSearchQuery,
    getFilteredTodos
} from './store.js';

// --- WEB AUDIO API (SENTETİK SES ÜRETİCİSİ) ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSound(type) {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'add') {
        // 🔊 "DINNK" (Kısa tatlı dınk efekti)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);

    } else if (type === 'complete') {
        // 🔊 "DIRINK" (Doğru cevap / 4 notalı zafer akoru)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const noteTime = now + (i * 0.05);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, noteTime);

            gain.gain.setValueAtTime(0.15, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(noteTime);
            osc.stop(noteTime + 0.22);
        });

    } else if (type === 'delete') {
        // 🔊 "FIŞŞ" (Rüzgar / Swoosh efekti)
        const bufferSize = ctx.sampleRate * 0.18;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.18);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + 0.18);

    } else if (type === 'bird') {
        // 🐦 KUŞ ÖTÜŞÜ (Sabah / Light Mode)
        [0, 0.12].forEach(offset => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(2200, now + offset);
            osc.frequency.exponentialRampToValueAtTime(3600, now + offset + 0.04);
            osc.frequency.exponentialRampToValueAtTime(2800, now + offset + 0.08);

            gain.gain.setValueAtTime(0.001, now + offset);
            gain.gain.linearRampToValueAtTime(0.12, now + offset + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + offset);
            osc.stop(now + offset + 0.08);
        });

    } else if (type === 'owl') {
        // 🦉 BAYKUŞ ÖTÜŞÜ (Gece / Dark Mode)
        const hoots = [
            { time: 0, duration: 0.28, freq: 320 },
            { time: 0.38, duration: 0.22, freq: 300 }
        ];

        hoots.forEach(h => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(h.freq, now + h.time);
            osc.frequency.exponentialRampToValueAtTime(h.freq - 35, now + h.time + h.duration);

            gain.gain.setValueAtTime(0.001, now + h.time);
            gain.gain.linearRampToValueAtTime(0.15, now + h.time + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + h.time + h.duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + h.time);
            osc.stop(now + h.time + h.duration);
        });
    }
}

// --- DOM ELEMANLARI ---
const addTaskForm = document.getElementById('addTaskForm');
const taskInput = document.getElementById('taskInput');
const searchInput = document.getElementById('searchInput');
const todoList = document.getElementById('todolist');
const taskCount = document.getElementById('taskCount');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

// --- TEMA VE AĞAÇ/SES YÖNETİMİ ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const iconSpan = themeToggleBtn.querySelector('.theme-icon');
    const icon = savedTheme === 'dark' ? '🌙' : '☀️';
    if (iconSpan) iconSpan.textContent = icon;
    else themeToggleBtn.textContent = icon;

    updateCanvasTheme(savedTheme);
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);

    const iconSpan = themeToggleBtn.querySelector('.theme-icon');
    const icon = newTheme === 'dark' ? '🌙' : '☀️';
    if (iconSpan) iconSpan.textContent = icon;
    else themeToggleBtn.textContent = icon;

    localStorage.setItem('theme', newTheme);
    updateCanvasTheme(newTheme);

    // Temaya özel ses çal
    if (newTheme === 'light') {
        playSound('bird'); // Sabah oldu, kuş ötsün 🐦
    } else {
        playSound('owl'); // Gece oldu, baykuş ötsün 🦉
    }
});

// --- GÖREV EKLEME ---
addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();

    if (text) {
        addTodo(text);
        playSound('add');
        taskInput.value = '';
        render();
    }
});

// --- ARAMA YAPMA ---
searchInput.addEventListener('input', (e) => {
    setSearchQuery(e.target.value);
    render();
});

// --- FİLTRELEME ---
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        setFilter(btn.dataset.filter);
        render();
    });
});

// --- TIKLAMA OLAYLARI (Silme ve Tamamlama) ---
todoList.addEventListener('click', (e) => {
    const todoItem = e.target.closest('.todo-item');
    if (!todoItem) return;

    const id = todoItem.dataset.id;

    if (e.target.classList.contains('delete-btn')) {
        deleteTodo(id);
        playSound('delete');
        render();
    } else if (e.target.closest('.todo-left')) {
        const targetTodo = state.todos.find(t => t.id === id);

        if (targetTodo && !targetTodo.completed) {
            playSound('complete');
        }

        toggleTodo(id);
        render();
    }
});

// --- RENDER MERKEZİ ---
function render() {
    const filteredTodos = getFilteredTodos();

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
      <li style="text-align: center; color: var(--completed-color); padding: 1.5rem; list-style: none;">
        Görev bulunamadı 😔 <br> Yeni bir görev ekleyiniz veya etkin filtreleri kontrol ediniz.
      </li>`;
    } else {
        todoList.innerHTML = filteredTodos.map(todo => `
      <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <div class="todo-left">
          <button type="button" class="custom-checkbox ${todo.completed ? 'checked' : ''}" aria-label="Tamamla">
            ${todo.completed ? '✓' : ''}
          </button>
          <span class="todo-title">${escapeHTML(todo.title)}</span>
        </div>
        <div class="todo-actions">
          <button type="button" class="delete-btn" aria-label="Sil">✕</button>
        </div>
      </li>
    `).join('');
    }

    const activeCount = state.todos.filter(t => !t.completed).length;
    taskCount.textContent = `${activeCount} Görev Kaldı`;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// --- ARKA PLAN CANVAS ANİMASYONU (Yıldızlar / Gün Işığı Parçacıkları) ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let currentThemeMode = 'dark';

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function initParticles() {
    particles = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / 18000);

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.8,
            speedX: (Math.random() - 0.5) * 0.4,
            speedY: Math.random() * 0.5 + 0.1,
            alpha: Math.random(),
            alphaSpeed: Math.random() * 0.02 + 0.005
        });
    }
}

function updateCanvasTheme(mode) {
    currentThemeMode = mode;
    initParticles();
}

function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        // Parçacık Hareketleri
        p.x += p.speedX;
        p.y -= p.speedY; // Yukarı / Çapraz doğru süzülme
        p.alpha += p.alphaSpeed;

        if (p.alpha >= 1 || p.alpha <= 0.1) {
            p.alphaSpeed = -p.alphaSpeed;
        }

        if (p.y < 0) p.y = canvas.height;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        // Çizim
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (currentThemeMode === 'dark') {
            // Gece: Parıldayan Beyaz/Mavi Kayan Yıldızlar
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(p.alpha)})`;
            ctx.shadowBlur = p.size * 3;
            ctx.shadowColor = '#60a5fa';
        } else {
            // Sabah: Gün Işığı / Altın Rengi Süzülen Parlamalar
            ctx.fillStyle = `rgba(245, 158, 11, ${Math.abs(p.alpha) * 0.6})`;
            ctx.shadowBlur = p.size * 4;
            ctx.shadowColor = '#fbbf24';
        }

        ctx.fill();
    });

    requestAnimationFrame(animateCanvas);
}

initTheme();
render();
animateCanvas();