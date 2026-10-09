/**
 * Interactive HTML5 Canvas Scratch Card Component
 * with Real Touch/Mouse Physics, Web Audio API Sound Effects, and Auto-Reveal
 */
class ScratchCard {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.options = Object.assign({
      scratchSize: 32,
      revealThreshold: 42, // percent
      coverColor: '#D97706',
      accentColor: '#F59E0B',
      onScratchProgress: () => {},
      onComplete: () => {}
    }, options);

    this.isDrawing = false;
    this.isCompleted = false;
    this.lastPoint = null;
    this.audioCtx = null;
    this.sampleStep = 10; // sample every 10 pixels for fast calculation

    this.initAudio();
    this.initCanvas();
    this.bindEvents();
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn('Web Audio not supported', e);
    }
  }

  playScratchSound() {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 80, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {}
  }

  playWinChime() {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0, this.audioCtx.currentTime + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.2, this.audioCtx.currentTime + idx * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + idx * 0.1);
        osc.stop(this.audioCtx.currentTime + idx * 0.1 + 0.45);
      });
    } catch (e) {}
  }

  playRetrySound() {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const notes = [440, 392]; // A4, G4
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.15 + 0.3);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(this.audioCtx.currentTime + idx * 0.15);
        osc.stop(this.audioCtx.currentTime + idx * 0.15 + 0.35);
      });
    } catch (e) {}
  }

  initCanvas() {
    const parent = this.canvas.parentElement;
    const rect = this.canvas.getBoundingClientRect();
    const width = this.canvas.width = Math.max(280, Math.floor(rect.width || (parent ? parent.clientWidth : 320) || 320));
    const height = this.canvas.height = Math.max(160, Math.floor(rect.height || (parent ? parent.clientHeight : 185) || 185));

    // Reset composite operation
    this.ctx.globalCompositeOperation = 'source-over';

    // Draw rich metallic golden-amber scratch cover
    const gradient = this.ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#F59E0B');
    gradient.addColorStop(0.3, '#FCD34D');
    gradient.addColorStop(0.6, '#D97706');
    gradient.addColorStop(1, '#B45309');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);

    // Subtle pattern overlay
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    for (let x = 0; x < width; x += 18) {
      for (let y = 0; y < height; y += 18) {
        if ((x + y) % 36 === 0) {
          this.ctx.beginPath();
          this.ctx.arc(x, y, 2.5, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    // Border glow
    this.ctx.lineWidth = 6;
    this.ctx.strokeStyle = '#FEF08A';
    this.ctx.strokeRect(3, 3, width - 6, height - 6);

    // Center Banner Text
    this.ctx.fillStyle = '#78350F';
    this.ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
    this.ctx.shadowBlur = 4;
    this.ctx.fillText('✨ SCRATCH HERE TO REVEAL ✨', width / 2, height / 2 - 12);

    this.ctx.shadowBlur = 0;
    this.ctx.font = '12px Inter, system-ui, sans-serif';
    this.ctx.fillStyle = '#92400E';
    this.ctx.fillText('🎁 Scratch with finger or mouse', width / 2, height / 2 + 16);

    this.isCompleted = false;
  }

  bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (this.canvas.width / rect.width),
        y: (clientY - rect.top) * (this.canvas.height / rect.height)
      };
    };

    const startScratch = (e) => {
      if (this.isCompleted) return;
      this.isDrawing = true;
      this.lastPoint = getPos(e);
      this.scratchAt(this.lastPoint.x, this.lastPoint.y);
      this.playScratchSound();
      if (e.type === 'touchstart') e.preventDefault();
    };

    const moveScratch = (e) => {
      if (!this.isDrawing || this.isCompleted) return;
      const pos = getPos(e);
      this.scratchLine(this.lastPoint, pos);
      this.lastPoint = pos;
      if (Math.random() < 0.3) this.playScratchSound();
      if (e.type === 'touchmove') e.preventDefault();
    };

    const endScratch = () => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this.lastPoint = null;
      this.checkProgress();
    };

    // Mouse events
    this.canvas.addEventListener('mousedown', startScratch);
    window.addEventListener('mousemove', moveScratch);
    window.addEventListener('mouseup', endScratch);

    // Touch events
    this.canvas.addEventListener('touchstart', startScratch, { passive: false });
    this.canvas.addEventListener('touchmove', moveScratch, { passive: false });
    this.canvas.addEventListener('touchend', endScratch);
  }

  scratchAt(x, y) {
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.options.scratchSize / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  scratchLine(p1, p2) {
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.lineWidth = this.options.scratchSize;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.stroke();
  }

  checkProgress() {
    if (this.isCompleted) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const totalSamplePoints = (width * height) / (this.sampleStep * this.sampleStep);
    let clearPoints = 0;

    for (let y = 0; y < height; y += this.sampleStep) {
      for (let x = 0; x < width; x += this.sampleStep) {
        const index = (y * width + x) * 4;
        if (data[index + 3] === 0) {
          clearPoints++;
        }
      }
    }

    const percentage = Math.round((clearPoints / totalSamplePoints) * 100);
    this.options.onScratchProgress(percentage);

    if (percentage >= this.options.revealThreshold) {
      this.completeReveal();
    }
  }

  completeReveal() {
    if (this.isCompleted) return;
    this.isCompleted = true;

    // Smoothly fade out remaining canvas
    this.canvas.style.transition = 'opacity 0.4s ease-out';
    this.canvas.style.opacity = '0';
    setTimeout(() => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas.style.display = 'none';
      this.options.onComplete();
    }, 400);
  }

  reset() {
    this.canvas.style.display = 'block';
    this.canvas.style.opacity = '1';
    this.canvas.style.transition = 'none';
    this.initCanvas();
  }
}

window.ScratchCard = ScratchCard;
