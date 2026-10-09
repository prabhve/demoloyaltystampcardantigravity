/**
 * RevLoyal AI — Interactive Visual Effects & Cursor Animation Engine
 * Features:
 * 1. Ambient Golden Mesh & Interactive Particle Canvas
 * 2. Mouse Cursor Glow Spotlight & Floating Magnetic Aura
 * 3. Click Sparkle / Confetti Micro-Burst
 * 4. 3D Card Tilt & Dynamic Gloss Sheen
 * 5. Scroll Entrance & Staggered Reveal Engine
 * 6. Animated Numeric Counters
 * 7. Mobile-Optimized Performance (Zero Battery Drain)
 */

(function () {
  'use strict';

  // Check if user prefers reduced motion or is on low-end touch device
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initAmbientCanvas();
    if (!isTouchDevice && !prefersReducedMotion) {
      initCursorAura();
      initCard3DTilt();
    }
    initScrollRevealEngine();
    initAnimatedCounters();
  }

  // ========================================================
  // 1. AMBIENT GOLDEN MESH & INTERACTIVE PARTICLE CANVAS
  // ========================================================
  function initAmbientCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'ambientInteractiveCanvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
      opacity: 0.85;
      transition: opacity 0.5s ease;
    `;
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with smooth lerping
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      active: false,
      radius: isTouchDevice ? 100 : 180
    };

    // Track mouse / pointer movement
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    // Resize handler with debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 150);
    }, { passive: true });

    // Particle Generation
    const particleCount = isTouchDevice ? 22 : 48;
    const particles = [];

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.baseSize = Math.random() * 2.2 + 0.8;
        this.size = this.baseSize;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = -(Math.random() * 0.45 + 0.15);
        this.alpha = Math.random() * 0.5 + 0.2;
        this.pulseSpeed = Math.random() * 0.02 + 0.008;
        this.pulse = Math.random() * Math.PI;
        // Warm golden/amber palette
        const colors = [
          '245, 158, 11',  // amber-500
          '251, 191, 36',  // amber-400
          '255, 107, 53',  // coral
          '234, 88, 12'    // orange-600
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.pulse += this.pulseSpeed;
        this.size = this.baseSize + Math.sin(this.pulse) * 0.6;

        this.x += this.vx;
        this.y += this.vy;

        // Mouse interaction (Repulsion / Attraction balance)
        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force * 2.2;
            this.y -= Math.sin(angle) * force * 2.2;
          }
        }

        // Loop boundaries
        if (this.y < -20 || this.x < -20 || this.x > width + 20) {
          this.reset(false);
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.2, this.size), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${this.color}, 0.6)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Click sparkle burst emitter
    const clickBursts = [];

    class ClickSpark {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.size = Math.random() * 3 + 1.5;
        this.life = 1.0;
        this.decay = Math.random() * 0.035 + 0.025;
        this.color = Math.random() > 0.4 ? '245, 158, 11' : '255, 107, 53';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.08; // subtle gravity
        this.life -= this.decay;
        this.size *= 0.96;
      }

      draw() {
        if (this.life <= 0) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.life})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${this.color}, 0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    window.addEventListener('click', (e) => {
      // Don't burst if clicking directly inside input fields
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const count = isTouchDevice ? 8 : 16;
      for (let i = 0; i < count; i++) {
        clickBursts.push(new ClickSpark(e.clientX, e.clientY));
      }
    }, { passive: true });

    // Animation loop (60 FPS)
    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      // Draw mouse ambient spotlight glow
      if (mouse.active && !isTouchDevice) {
        const glowRadius = 260;
        const gradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, glowRadius
        );
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.085)');
        gradient.addColorStop(0.5, 'rgba(255, 107, 53, 0.035)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(mouse.x - glowRadius, mouse.y - glowRadius, glowRadius * 2, glowRadius * 2);
      }

      // Draw particle connections (constellation lines)
      const maxConnectDist = 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const lineAlpha = (1 - dist / maxConnectDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(245, 158, 11, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update & draw particles
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Update & draw click sparkles
      for (let i = clickBursts.length - 1; i >= 0; i--) {
        const spark = clickBursts[i];
        spark.update();
        spark.draw();
        if (spark.life <= 0) {
          clickBursts.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  // ========================================================
  // 2. MOUSE CURSOR GLOW SPOTLIGHT & MAGNETIC AURA (DESKTOP)
  // ========================================================
  function initCursorAura() {
    const aura = document.createElement('div');
    aura.id = 'cursorAura';
    aura.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      border: 1.5px solid rgba(245, 158, 11, 0.45);
      background: radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(255, 107, 53, 0.02) 70%, transparent 100%);
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.25);
      transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                  height 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                  border-color 0.3s ease, 
                  background 0.3s ease,
                  opacity 0.25s ease;
      opacity: 0;
      backdrop-filter: blur(1px);
    `;

    const dot = document.createElement('div');
    dot.id = 'cursorDot';
    dot.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 6px;
      height: 6px;
      background: #F59E0B;
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 10px #F59E0B;
      transition: opacity 0.2s ease, transform 0.15s ease;
      opacity: 0;
    `;

    document.body.appendChild(aura);
    document.body.appendChild(dot);

    let mouseX = -100;
    let mouseY = -100;
    let auraX = -100;
    let auraY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      aura.style.opacity = '1';
      dot.style.opacity = '1';
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      aura.style.opacity = '0';
      dot.style.opacity = '0';
    });

    // Smooth aura trailing lerp
    function renderAura() {
      auraX += (mouseX - auraX) * 0.18;
      auraY += (mouseY - auraY) * 0.18;
      aura.style.transform = `translate(${auraX - 22}px, ${auraY - 22}px)`;
      requestAnimationFrame(renderAura);
    }
    requestAnimationFrame(renderAura);

    // Dynamic hover scaling over interactive targets
    const interactiveSelectors = 'a, button, input, select, textarea, [role="button"], .tilt-card, .interactive-badge, .scratch-canvas';
    
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(interactiveSelectors);
      if (target) {
        aura.style.width = '64px';
        aura.style.height = '64px';
        aura.style.borderColor = 'rgba(245, 158, 11, 0.85)';
        aura.style.background = 'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(255, 107, 53, 0.08) 70%, transparent 100%)';
        aura.style.boxShadow = '0 0 30px rgba(245, 158, 11, 0.45)';
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest(interactiveSelectors);
      if (target) {
        aura.style.width = '44px';
        aura.style.height = '44px';
        aura.style.borderColor = 'rgba(245, 158, 11, 0.45)';
        aura.style.background = 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(255, 107, 53, 0.02) 70%, transparent 100%)';
        aura.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.25)';
      }
    });

    document.addEventListener('mousedown', () => {
      aura.style.transform = `translate(${auraX - 22}px, ${auraY - 22}px) scale(0.85)`;
    });

    document.addEventListener('mouseup', () => {
      aura.style.transform = `translate(${auraX - 22}px, ${auraY - 22}px) scale(1)`;
    });
  }

  // ========================================================
  // 3. 3D CARD TILT & DYNAMIC GLOSS SHEEN
  // ========================================================
  function initCard3DTilt() {
    const tiltCards = document.querySelectorAll('.tilt-card, .hover-tilt, #pricing .pricing-card');

    tiltCards.forEach(card => {
      card.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease';
      card.style.transformStyle = 'preserve-3d';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5.5; // Max 5.5 deg tilt
        const rotateY = ((x - centerX) / centerX) * 5.5;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // ========================================================
  // 4. SCROLL ENTRANCE & STAGGERED REVEAL ENGINE
  // ========================================================
  function initScrollRevealEngine() {
    // Select elements to reveal on scroll
    const revealTargets = document.querySelectorAll(`
      .reveal-on-scroll,
      section > .max-w-7xl,
      #howItWorks .grid > div,
      #solutions .grid > div,
      #pricing .grid > div,
      #competitorAnalysis table,
      #liveDemos .grid > div,
      #faq .space-y-4 > div
    `);

    if (revealTargets.length === 0) return;

    revealTargets.forEach((el, index) => {
      if (!el.classList.contains('reveal-init')) {
        el.classList.add('reveal-init');
        // Add subtle staggered delay for siblings inside grids
        const siblingIndex = Array.from(el.parentNode.children).indexOf(el);
        if (siblingIndex > 0 && siblingIndex <= 6) {
          el.style.transitionDelay = `${(siblingIndex * 0.08).toFixed(2)}s`;
        }
      }
    });

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealTargets.forEach(el => observer.observe(el));
  }

  // ========================================================
  // 5. ANIMATED NUMERIC COUNTERS
  // ========================================================
  function initAnimatedCounters() {
    const counterElements = document.querySelectorAll('[data-counter]');
    if (counterElements.length === 0) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetNum = parseFloat(el.getAttribute('data-counter'));
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
          const duration = 1600; // ms

          animateValue(el, 0, targetNum, duration, decimals, prefix, suffix);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    counterElements.forEach(el => observer.observe(el));
  }

  function animateValue(obj, start, end, duration, decimals, prefix, suffix) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;
      obj.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.textContent = `${prefix}${end.toFixed(decimals)}${suffix}`;
      }
    };
    window.requestAnimationFrame(step);
  }

})();
