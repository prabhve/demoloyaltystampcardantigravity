// High-reliability Device Fingerprint & Anti-Cheat Module
const DeviceFingerprint = {
  getFingerprint: async function () {
    // 1. Check if an existing persistent device token is already stored
    let persistentToken = localStorage.getItem('__resto_device_uuid');
    if (!persistentToken) {
      persistentToken = 'dev_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
      localStorage.setItem('__resto_device_uuid', persistentToken);
    }

    // 2. Gather hardware & browser attributes
    const nav = window.navigator;
    const scr = window.screen;

    const components = [
      persistentToken,
      nav.userAgent || '',
      nav.language || '',
      scr.width + 'x' + scr.height,
      scr.colorDepth || '',
      new Date().getTimezoneOffset(),
      nav.hardwareConcurrency || 4,
      nav.platform || '',
      this.getCanvasFingerprint(),
      this.getWebGLFingerprint()
    ];

    const rawString = components.join('||');
    const hash = await this.sha256(rawString);
    return 'fp_' + hash.substring(0, 24);
  },

  getCanvasFingerprint: function () {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('RestaurantLoyaltySecure2026', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('RestaurantLoyaltySecure2026', 4, 17);
      return canvas.toDataURL().slice(-64);
    } catch (e) {
      return 'canvas_fallback';
    }
  },

  getWebGLFingerprint: function () {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no_webgl';
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return 'webgl_generic';
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
      return (vendor + '~' + renderer).substring(0, 48);
    } catch (e) {
      return 'webgl_fallback';
    }
  },

  sha256: async function (message) {
    // Web Crypto API hash
    if (window.crypto && window.crypto.subtle) {
      try {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        // fallback
      }
    }
    // Fallback simple hash
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }
};

window.DeviceFingerprint = DeviceFingerprint;
