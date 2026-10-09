/**
 * RevLoyal AI — High-Performance HTML5 Canvas Scratch Card Component
 * Features:
 * - Unified Pointer Events (Touch, Mouse, Pen, Stylus) with Pointer Capture
 * - Crisp High-DPI (Retina / Mobile) Rendering
 * - Smooth stroke interpolation (zero gaps during fast swipe)
 * - Real-time throttled scratch percentage tracking (<128 alpha)
 * - Soft auto-reveal threshold (~35%) with smooth fade
 * - Programmatic .reveal() method
 * - User-gesture safe Web Audio API sound synthesis
 */

class ScratchCard {
  constructor(canvasElement, options = {}) {
    if (!canvasElement) {
      throw new Error('ScratchCard: canvasElement is required');
    }

    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    
    this.options = Object.assign({
      scratchSize: 38,
      revealThreshold: 35, // percent
      coverColor: '#D97706',
      accentColor: '#F59E0B',
      onScratchProgress: () => {},
      onComplete: () => {}
    }, options);

    this.isDrawing = false;
    this.isCompleted = false;
    this.lastPoint = null;
    this.audioCtx = null;
    this.sampleStep = 8;
    this.progressCheckPending = false;
    this.currentPercentage = 0;

    this.initCanvas();
    this.bindEvents();
  }

  // Safe Web Audio initialization (strictly on user interaction)
  ensureAudio() {
    if (!this.audioCtx) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      } catch (e) {
        // Audio not available, ignore
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  playScratchSound() {
    try {
      this.ensureAudio();
      if (!this.audioCtx || this.audioCtx.state !== 'running') return;
      
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120 + Math.random() * 100, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.06);
    } catch (e) {}
  }

  playWinChime() {
    try {
      this.ensureAudio();
      if (!this.audioCtx || this.audioCtx.state !== 'running') return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        const start = this.audioCtx.currentTime + idx * 0.09;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.42);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(start);
        osc.stop(start + 0.45);
      });
    } catch (e) {}
  }

  playRetrySound() {
    try {
      this.ensureAudio();
      if (!this.audioCtx || this.audioCtx.state !== 'running') return;

      const notes = [440, 392]; // A4, G4
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        const start = this.audioCtx.currentTime + idx * 0.14;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(start);
        osc.stop(start + 0.32);
      });
    } catch (e) {}
  }

  initCanvas() {
    const parent = this.canvas.parentElement;
    const rect = this.canvas.getBoundingClientRect();
    
    // Physical CSS display dimensions
    this.cssWidth = Math.max(280, Math.floor(rect.width || (parent ? parent.clientWidth : 340) || 340));
    this.cssHeight = Math.max(160, Math.floor(rect.height || (parent ? parent.clientHeight : 185) || 185));

    // Crisp High-DPI handling
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.cssWidth * this.dpr);
    this.canvas.height = Math.floor(this.cssHeight * this.dpr);

    // Reset styles
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.opacity = '1';
    this.canvas.style.display = 'block';
    this.canvas.style.transition = 'none';

    // Scale context to match CSS logical pixels
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.globalCompositeOperation = 'source-over';

    const w = this.cssWidth;
    const h = this.cssHeight;

    // Draw rich metallic golden-amber scratch cover
    const gradient = this.ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#F59E0B');
    gradient.addColorStop(0.25, '#FCD34D');
    gradient.addColorStop(0.5, '#F59E0B');
    gradient.addColorStop(0.75, '#D97706');
    gradient.addColorStop(1, '#92400E');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, w, h);

    // Luxurious patterned sparkle overlay
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    for (let x = 12; x < w; x += 22) {
      for (let y = 12; y < h; y += 22) {
        if ((x + y) % 44 === 0) {
          this.ctx.beginPath();
          this.ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    // Golden embossed border
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = '#FEF08A';
    this.ctx.strokeRect(3, 3, w - 6, h - 6);

    // Subtle inner hairline
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.strokeRect(8, 8, w - 16, h - 16);

    // Center Badge / Foil Text
    this.ctx.fillStyle = '#78350F';
    this.ctx.font = 'bold 15px Inter, system-ui, -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
    this.ctx.shadowBlur = 4;
    this.ctx.fillText('✨ SCRATCH HERE TO REVEAL ✨', w / 2, h / 2 - 14);

    this.ctx.shadowBlur = 0;
    this.ctx.font = 'bold 12px Inter, system-ui, -apple-system, sans-serif';
    this.ctx.fillStyle = '#92400E';
    this.ctx.fillText('🎁 Swipe with finger or drag mouse', w / 2, h / 2 + 14);

    this.isCompleted = false;
    this.isDrawing = false;
    this.currentPercentage = 0;
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    const scaleX = rect.width > 0 ? this.cssWidth / rect.width : 1;
    const scaleY = rect.height > 0 ? this.cssHeight / rect.height : 1;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  bindEvents() {
    // 1. Modern Pointer Events (Unifies touch, mouse, stylus with pointer capture)
    if (window.PointerEvent) {
      this.canvas.addEventListener('pointerdown', (e) => {
        if (this.isCompleted) return;
        this.ensureAudio();
        this.isDrawing = true;
        try {
          this.canvas.setPointerCapture(e.pointerId);
        } catch (err) {}

        const pos = this.getPointerPos(e);
        this.lastPoint = pos;
        this.scratchPoint(pos.x, pos.y);
        this.playScratchSound();
        e.preventDefault();
      });

      this.canvas.addEventListener('pointermove', (e) => {
        if (!this.isDrawing || this.isCompleted) return;
        const pos = this.getPointerPos(e);
        if (this.lastPoint) {
          this.scratchBetween(this.lastPoint, pos);
        } else {
          this.scratchPoint(pos.x, pos.y);
        }
        this.lastPoint = pos;

        if (Math.random() < 0.28) {
          this.playScratchSound();
        }
        this.requestProgressCheck();
        e.preventDefault();
      });

      const handlePointerUp = (e) => {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.lastPoint = null;
        try {
          if (e && e.pointerId) this.canvas.releasePointerCapture(e.pointerId);
        } catch (err) {}
        this.checkProgressImmediate();
      };

      this.canvas.addEventListener('pointerup', handlePointerUp);
      this.canvas.addEventListener('pointercancel', handlePointerUp);

    } else {
      // 2. Legacy Touch & Mouse Fallback
      const getTouchPos = (e) => {
        const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
        if (!touch) return { x: 0, y: 0 };
        return this.getPointerPos(touch);
      };

      this.canvas.addEventListener('touchstart', (e) => {
        if (this.isCompleted) return;
        this.ensureAudio();
        this.isDrawing = true;
        const pos = getTouchPos(e);
        this.lastPoint = pos;
        this.scratchPoint(pos.x, pos.y);
        this.playScratchSound();
        e.preventDefault();
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (!this.isDrawing || this.isCompleted) return;
        const pos = getTouchPos(e);
        if (this.lastPoint) {
          this.scratchBetween(this.lastPoint, pos);
        }
        this.lastPoint = pos;
        if (Math.random() < 0.3) this.playScratchSound();
        this.requestProgressCheck();
        e.preventDefault();
      }, { passive: false });

      const endTouch = () => {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.lastPoint = null;
        this.checkProgressImmediate();
      };

      window.addEventListener('touchend', endTouch);
      window.addEventListener('touchcancel', endTouch);

      // Mouse
      this.canvas.addEventListener('mousedown', (e) => {
        if (this.isCompleted) return;
        this.ensureAudio();
        this.isDrawing = true;
        const pos = this.getPointerPos(e);
        this.lastPoint = pos;
        this.scratchPoint(pos.x, pos.y);
        this.playScratchSound();
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDrawing || this.isCompleted) return;
        const pos = this.getPointerPos(e);
        if (this.lastPoint) {
          this.scratchBetween(this.lastPoint, pos);
        }
        this.lastPoint = pos;
        if (Math.random() < 0.25) this.playScratchSound();
        this.requestProgressCheck();
      });

      window.addEventListener('mouseup', () => {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.lastPoint = null;
        this.checkProgressImmediate();
      });
    }

    // Auto resize handling
    window.addEventListener('resize', () => {
      if (!this.isCompleted && this.canvas.offsetWidth > 0) {
        const rect = this.canvas.getBoundingClientRect();
        if (Math.abs(rect.width - this.cssWidth) > 30) {
          this.initCanvas();
        }
      }
    });
  }

  scratchPoint(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.options.scratchSize / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  scratchBetween(p1, p2) {
    if (!Number.isFinite(p1.x) || !Number.isFinite(p1.y) || !Number.isFinite(p2.x) || !Number.isFinite(p2.y)) return;
    
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.lineWidth = this.options.scratchSize;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.stroke();

    // Interpolate circles along line for ultra-smooth scratch outline
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.min(10, Math.max(1, Math.floor(dist / 12)));

    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      this.ctx.beginPath();
      this.ctx.arc(p1.x + dx * t, p1.y + dy * t, this.options.scratchSize / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  requestProgressCheck() {
    if (this.progressCheckPending || this.isCompleted) return;
    this.progressCheckPending = true;
    requestAnimationFrame(() => {
      this.checkProgressImmediate();
      this.progressCheckPending = false;
    });
  }

  checkProgressImmediate() {
    if (this.isCompleted) return;

    try {
      const w = this.canvas.width;
      const h = this.canvas.height;
      if (w <= 0 || h <= 0) return;

      const imageData = this.ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const step = Math.max(4, Math.floor(this.sampleStep * this.dpr));
      
      let clearPoints = 0;
      let totalSamplePoints = 0;

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          totalSamplePoints++;
          const index = (y * w + x) * 4;
          // Alpha < 128 is considered cleared / scratched
          if (data[index + 3] < 128) {
            clearPoints++;
          }
        }
      }

      if (totalSamplePoints > 0) {
        const percentage = Math.min(100, Math.round((clearPoints / totalSamplePoints) * 100));
        this.currentPercentage = percentage;
        this.options.onScratchProgress(percentage);

        if (percentage >= this.options.revealThreshold) {
          this.completeReveal();
        }
      }
    } catch (err) {
      console.warn('Scratch progress check error:', err);
    }
  }

  completeReveal() {
    if (this.isCompleted) return;
    this.isCompleted = true;
    this.isDrawing = false;

    // Smooth celebratory fade-out
    this.canvas.style.transition = 'opacity 0.45s ease-out, transform 0.45s ease-out';
    this.canvas.style.opacity = '0';
    this.canvas.style.transform = 'scale(1.02)';

    setTimeout(() => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas.style.display = 'none';
      if (typeof this.options.onComplete === 'function') {
        this.options.onComplete();
      }
    }, 450);
  }

  // Programmatic reveal (triggered by "Reveal Now" button or auto-actions)
  reveal() {
    if (this.isCompleted) return;
    this.ensureAudio();
    this.completeReveal();
  }

  reset() {
    this.canvas.style.display = 'block';
    this.canvas.style.opacity = '1';
    this.canvas.style.transform = 'scale(1)';
    this.canvas.style.transition = 'none';
    this.initCanvas();
  }
}

window.ScratchCard = ScratchCard;
