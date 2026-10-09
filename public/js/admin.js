// Restaurant & Business Admin Dashboard Controller
// Fully Integrated with 10-Layer Security Protocol Architecture
document.addEventListener('DOMContentLoaded', async () => {
  let adminStats = null;
  let allCustomers = [];
  let currentFilter = 'all';
  let cachedDeviceFingerprint = null;

  const params = new URLSearchParams(window.location.search);
  let currentBizSlug = params.get('biz') || 'royal-spice';

  // DOM Elements - Navigation & Headers
  const elBizHeaderName = document.getElementById('bizHeaderName');
  const elBizHeaderType = document.getElementById('bizHeaderType');
  const elBizSwitcherSelect = document.getElementById('bizSwitcherSelect');
  const elPreviewCustomerBtn = document.getElementById('previewCustomerBtn');
  const elAdminLockDeskBtn = document.getElementById('adminLockDeskBtn');
  const elStatTotalCustomers = document.getElementById('statTotalCustomers');
  const elStatTotalStamps = document.getElementById('statTotalStamps');
  const elStatMegaWinners = document.getElementById('statMegaWinners');
  const elStatCouponsRedeemed = document.getElementById('statCouponsRedeemed');
  const elAntiCheatBadge = document.getElementById('antiCheatBadge');

  // DOM Elements - Customers CRM
  const elCustomerTableBody = document.getElementById('customerTableBody');
  const elSearchInput = document.getElementById('customerSearch');

  // DOM Elements - Offers & Settings
  const elOffersList = document.getElementById('offersList');
  const elTableSelect = document.getElementById('qrTableSelect');
  const elQrCodeImg = document.getElementById('qrCodeImg');
  const elQrTargetUrl = document.getElementById('qrTargetUrl');
  const elQrStandeeRestaurant = document.getElementById('qrStandeeRestaurant');
  const elQrStandeeTable = document.getElementById('qrStandeeTable');
  const elSettingsForm = document.getElementById('settingsForm');
  const elMegaForm = document.getElementById('megaOfferForm');
  const elAddOfferForm = document.getElementById('addOfferForm');

  // DOM Elements - 10-Layer Passcode Security Vault
  const elPasscodeVaultModal = document.getElementById('passcodeVaultModal');
  const elVaultPasscodeForm = document.getElementById('vaultPasscodeForm');
  const elVaultPasscodeInput = document.getElementById('vaultPasscodeInput');
  const elVaultAlertBanner = document.getElementById('vaultAlertBanner');
  const elVaultAlertMessage = document.getElementById('vaultAlertMessage');
  const elVaultBizName = document.getElementById('vaultBizName');
  const elVaultSubmitBtn = document.getElementById('vaultSubmitBtn');
  const elVaultCustomerAppLaunch = document.getElementById('vaultCustomerAppLaunch');
  const elChangePasscodeForm = document.getElementById('changePasscodeForm');

  // ==========================================
  // SECURITY LAYER UTILITIES
  // ==========================================

  async function getDeviceFingerprint() {
    if (cachedDeviceFingerprint) return cachedDeviceFingerprint;
    try {
      if (window.DeviceFingerprint && typeof window.DeviceFingerprint.getFingerprint === 'function') {
        cachedDeviceFingerprint = await window.DeviceFingerprint.getFingerprint();
      } else {
        cachedDeviceFingerprint = 'dev_fp_fallback_' + (localStorage.getItem('__resto_device_uuid') || '0');
      }
    } catch (e) {
      cachedDeviceFingerprint = 'dev_fp_fallback_' + Date.now();
    }
    return cachedDeviceFingerprint;
  }

  function getTokenKey(slug) {
    return `__revloyal_admin_session_${slug || currentBizSlug}`;
  }

  function getAdminToken(slug) {
    return sessionStorage.getItem(getTokenKey(slug));
  }

  function setAdminToken(token, slug) {
    sessionStorage.setItem(getTokenKey(slug), token);
  }

  function clearAdminToken(slug) {
    sessionStorage.removeItem(getTokenKey(slug));
  }

  // Authenticated Fetch Wrapper injecting Layer 4 & Layer 6 Headers
  async function authFetch(url, options = {}) {
    const token = getAdminToken();
    const fp = await getDeviceFingerprint();

    const headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${token || ''}`,
      'x-device-fingerprint': fp
    };

    const res = await fetch(url, { ...options, headers });

    // Handle 401 Unauthorized (Expired token or wrong credentials)
    if (res.status === 401) {
      const data = await res.clone().json().catch(() => ({}));
      clearAdminToken();
      showVaultModal(data.error || '🔒 Session expired or authentication required. Please enter passcode.');
      throw new Error(data.error || 'Authentication required');
    }

    // Handle 403 Forbidden (Layer 9 Tenant boundary violation)
    if (res.status === 403) {
      const data = await res.clone().json().catch(() => ({}));
      clearAdminToken();
      showVaultModal(data.error || '🛑 Access denied: Business isolation boundary violation.');
      throw new Error(data.error || 'Forbidden');
    }

    return res;
  }

  // Show Vault Modal (Lock state)
  function showVaultModal(errorMessage = null) {
    if (!elPasscodeVaultModal) return;
    elPasscodeVaultModal.classList.remove('hidden');
    elPasscodeVaultModal.classList.add('flex');

    if (elVaultBizName) {
      const selectedOption = elBizSwitcherSelect ? elBizSwitcherSelect.options[elBizSwitcherSelect.selectedIndex] : null;
      elVaultBizName.textContent = selectedOption ? selectedOption.text : currentBizSlug;
    }

    if (elVaultCustomerAppLaunch) {
      elVaultCustomerAppLaunch.href = `/customer.html?biz=${currentBizSlug}`;
    }

    if (errorMessage && elVaultAlertBanner && elVaultAlertMessage) {
      elVaultAlertMessage.textContent = errorMessage;
      elVaultAlertBanner.classList.remove('hidden');
    } else if (elVaultAlertBanner) {
      elVaultAlertBanner.classList.add('hidden');
    }

    if (elVaultPasscodeInput) {
      elVaultPasscodeInput.value = '';
      setTimeout(() => elVaultPasscodeInput.focus(), 150);
    }
  }

  // Hide Vault Modal (Unlocked state)
  function hideVaultModal() {
    if (!elPasscodeVaultModal) return;
    elPasscodeVaultModal.classList.add('hidden');
    elPasscodeVaultModal.classList.remove('flex');
    if (elVaultAlertBanner) {
      elVaultAlertBanner.classList.add('hidden');
    }
  }

  // Verify Session on Load or Switch
  async function verifyActiveSession() {
    const token = getAdminToken();
    if (!token) {
      showVaultModal();
      return false;
    }

    try {
      const fp = await getDeviceFingerprint();
      const res = await fetch(`/api/auth/admin/verify-session?biz=${currentBizSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-device-fingerprint': fp
        }
      });
      const data = await res.json();
      if (data.success && data.valid) {
        hideVaultModal();
        return true;
      } else {
        clearAdminToken();
        showVaultModal(data.error || 'Session expired. Please enter passcode.');
        return false;
      }
    } catch (e) {
      clearAdminToken();
      showVaultModal();
      return false;
    }
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  await init();

  async function init() {
    await populateBusinessSwitcher();
    setupEventListeners();

    const isAuthenticated = await verifyActiveSession();
    if (isAuthenticated) {
      await loadDashboardData();
    }
  }

  // Populate Business Switcher
  async function populateBusinessSwitcher() {
    if (!elBizSwitcherSelect) return;
    try {
      const res = await fetch('/api/businesses');
      const data = await res.json();
      if (data.success && data.businesses) {
        elBizSwitcherSelect.innerHTML = data.businesses.map(b => `
          <option value="${b.slug}" ${b.slug === currentBizSlug ? 'selected' : ''}>
            ${b.name} (${b.categoryName || b.type})
          </option>
        `).join('');

        const curr = data.businesses.find(b => b.slug === currentBizSlug);
        if (curr && elVaultBizName) {
          elVaultBizName.textContent = curr.name;
        }

        elBizSwitcherSelect.addEventListener('change', async (e) => {
          currentBizSlug = e.target.value;
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('biz', currentBizSlug);
          window.history.pushState({}, '', newUrl);

          const selBiz = data.businesses.find(b => b.slug === currentBizSlug);
          if (selBiz && elVaultBizName) {
            elVaultBizName.textContent = selBiz.name;
          }

          // Strict tenant check: verify if we have an active session for the new business
          const isAuthed = await verifyActiveSession();
          if (isAuthed) {
            loadDashboardData();
          }
        });
      }
    } catch (e) {
      console.warn('Could not populate business switcher:', e);
    }
  }

  // Load Dashboard Data (Guarded by authFetch)
  async function loadDashboardData() {
    try {
      const [statsRes, custRes] = await Promise.all([
        authFetch(`/api/admin/stats?biz=${currentBizSlug}`).then(r => r.json()),
        authFetch(`/api/admin/customers?biz=${currentBizSlug}`).then(r => r.json())
      ]);

      if (statsRes.success) {
        adminStats = statsRes;
        if (elBizHeaderName && statsRes.business) {
          elBizHeaderName.textContent = statsRes.business.name;
        }
        if (elBizHeaderType && statsRes.business) {
          elBizHeaderType.textContent = `${statsRes.business.categoryName || statsRes.business.type} • Management Portal`;
        }
        if (elPreviewCustomerBtn && statsRes.business) {
          elPreviewCustomerBtn.href = `/customer.html?biz=${statsRes.business.slug}`;
        }
        updateStatCards(statsRes.stats);
        populateSettings(statsRes.settings);
        populateMegaOffer(statsRes.megaOffer);
        renderOffers(statsRes.offers);
      }

      if (custRes.success) {
        allCustomers = custRes.customers;
        renderCustomers();
      }

      generateQrCode('Table 1');
    } catch (err) {
      console.warn('Dashboard load paused for authentication:', err.message);
    }
  }

  function updateStatCards(stats) {
    if (elStatTotalCustomers) elStatTotalCustomers.textContent = stats.totalCustomers;
    if (elStatTotalStamps) elStatTotalStamps.textContent = stats.totalStampsIssued;
    if (elStatMegaWinners) elStatMegaWinners.textContent = stats.megaWinners;
    if (elStatCouponsRedeemed) elStatCouponsRedeemed.textContent = `${stats.totalCouponsRedeemed} / ${stats.totalCouponsWon}`;
    if (elAntiCheatBadge) elAntiCheatBadge.textContent = stats.antiCheatStatus;
  }

  function renderCustomers() {
    if (!elCustomerTableBody) return;

    let filtered = [...allCustomers];
    const searchTerm = elSearchInput ? elSearchInput.value.toLowerCase().trim() : '';

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm) ||
        c.mobile.includes(searchTerm) ||
        (c.address && c.address.toLowerCase().includes(searchTerm))
      );
    }

    if (currentFilter === 'mega') {
      filtered = filtered.filter(c => c.stamps >= 6);
    } else if (currentFilter === 'near_mega') {
      filtered = filtered.filter(c => c.stamps >= 4 && c.stamps < 6);
    }

    if (filtered.length === 0) {
      elCustomerTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8 text-slate-400">
            <i class="fa-solid fa-users-slash text-2xl mb-2 block"></i>
            No customer records found for this business.
          </td>
        </tr>
      `;
      return;
    }

    elCustomerTableBody.innerHTML = filtered.map(c => {
      const isMegaWinner = c.stamps >= 6;
      const coupons = c.wonCoupons || [];

      return `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100">
          <td class="py-3.5 px-4">
            <div class="flex items-center space-x-3">
              <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(c.name)}" class="w-9 h-9 rounded-full border border-amber-300">
              <div>
                <span class="font-bold text-slate-800 text-sm block">${c.name}</span>
                <span class="text-xs text-slate-500 font-mono">+91 ${c.mobile}</span>
              </div>
            </div>
          </td>
          <td class="py-3.5 px-4 text-xs text-slate-600">
            <div>${c.address || 'Not specified'}</div>
            <div class="text-[11px] text-slate-400">DOB: ${c.dob || 'N/A'}</div>
          </td>
          <td class="py-3.5 px-4">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200" title="${c.deviceFingerprint}">
              <i class="fa-solid fa-mobile-screen-button text-[10px] mr-1 text-slate-400"></i>
              ${c.deviceFingerprint ? c.deviceFingerprint.slice(0, 10) + '...' : 'Unknown'}
            </span>
          </td>
          <td class="py-3.5 px-4">
            <div class="flex items-center space-x-2">
              <div class="flex space-x-1">
                ${[1, 2, 3, 4, 5, 6].map(i => `
                  <span class="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    c.stamps >= i
                      ? i === 6
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }">${i}</span>
                `).join('')}
              </div>
              <span class="text-xs font-bold ${isMegaWinner ? 'text-amber-600' : 'text-slate-700'}">
                (${c.stamps}/6)
              </span>
            </div>
            ${isMegaWinner ? '<span class="inline-block mt-1 text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">🏆 50% Unlocked</span>' : ''}
          </td>
          <td class="py-3.5 px-4">
            <div class="flex flex-col space-y-1">
              ${coupons.length === 0 ? '<span class="text-xs text-slate-400">No coupons</span>' : ''}
              ${coupons.slice(0, 2).map(cp => `
                <div class="inline-flex items-center space-x-1 text-xs">
                  <span class="font-mono font-bold ${cp.redeemed ? 'text-slate-400 line-through' : 'text-amber-700'}">${cp.code}</span>
                  ${cp.redeemed
                    ? '<span class="text-[9px] bg-slate-200 text-slate-500 px-1 rounded">Redeemed</span>'
                    : `<button onclick="redeemCoupon('${c.id}', '${cp.code}')" class="text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white px-1.5 py-0.5 rounded font-bold transition">Redeem</button>`
                  }
                </div>
              `).join('')}
              ${coupons.length > 2 ? `<span class="text-[10px] text-slate-400">+${coupons.length - 2} more</span>` : ''}
            </div>
          </td>
          <td class="py-3.5 px-4 text-xs text-slate-500">
            ${c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : 'Today'}
          </td>
          <td class="py-3.5 px-4 text-right">
            <div class="flex items-center justify-end space-x-1.5">
              <button onclick="adjustStamp('${c.id}', 1)" class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition flex items-center justify-center font-bold text-xs" title="Add 1 Stamp">
                +1
              </button>
              <button onclick="adjustStamp('${c.id}', -1)" class="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition flex items-center justify-center font-bold text-xs" title="Remove 1 Stamp">
                -1
              </button>
              <button onclick="resetCustomerStamps('${c.id}')" class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition flex items-center justify-center text-xs" title="Reset Cycle">
                <i class="fa-solid fa-rotate-left"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.adjustStamp = async function(customerId, delta) {
    try {
      const res = await authFetch(`/api/admin/customers/${customerId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'adjust_stamps', stampDelta: delta, biz: currentBizSlug })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Stamps updated for customer!`, 'success');
        loadDashboardData();
      }
    } catch (e) {
      showToast('Action failed', 'error');
    }
  };

  window.redeemCoupon = async function(customerId, code) {
    if (!confirm(`Mark coupon ${code} as REDEEMED for billing?`)) return;
    try {
      const res = await authFetch(`/api/admin/customers/${customerId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'redeem_coupon', couponCode: code, biz: currentBizSlug })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Coupon ${code} marked as redeemed!`, 'success');
        loadDashboardData();
      }
    } catch (e) {
      showToast('Redemption failed', 'error');
    }
  };

  window.resetCustomerStamps = async function(customerId) {
    if (!confirm('Reset stamps for this customer to 0 to start a new 6-stamp reward cycle?')) return;
    try {
      const res = await authFetch(`/api/customer/${customerId}/reset-stamps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ biz: currentBizSlug })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Stamps reset! Fresh cycle started.', 'success');
        loadDashboardData();
      }
    } catch (e) {
      showToast('Reset failed', 'error');
    }
  };

  function renderOffers(offers) {
    if (!elOffersList) return;
    elOffersList.innerHTML = offers.map((off, idx) => `
      <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div class="flex items-center space-x-3.5">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center ${
            off.type === 'waste'
              ? 'bg-slate-100 text-slate-500'
              : off.type === 'freebie'
              ? 'bg-purple-100 text-purple-600'
              : 'bg-amber-100 text-amber-600'
          }">
            <i class="fa-solid ${off.icon || 'fa-tag'}"></i>
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h5 class="text-sm font-bold text-slate-800">${off.title}</h5>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full ${
                off.type === 'waste' ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-800 font-bold'
              }">${off.code}</span>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">${off.description}</p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <div class="text-right">
            <span class="text-xs font-bold text-slate-700 block">${off.probability}% Chance</span>
            <span class="text-[10px] text-slate-400 capitalize">${off.type}</span>
          </div>
          <button onclick="toggleOfferActive(${idx})" class="w-8 h-8 rounded-lg ${
            off.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-400'
          } flex items-center justify-center transition" title="${off.active ? 'Active' : 'Inactive'}">
            <i class="fa-solid ${off.active ? 'fa-check' : 'fa-ban'}"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  window.toggleOfferActive = async function(idx) {
    if (!adminStats || !adminStats.offers) return;
    adminStats.offers[idx].active = !adminStats.offers[idx].active;
    try {
      const res = await authFetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offers: adminStats.offers, biz: currentBizSlug })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Offer status updated!', 'success');
        renderOffers(adminStats.offers);
      }
    } catch (e) {
      showToast('Error updating offer', 'error');
    }
  };

  if (elAddOfferForm) {
    elAddOfferForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('newOfferTitle').value.trim();
      const code = document.getElementById('newOfferCode').value.trim().toUpperCase();
      const type = document.getElementById('newOfferType').value;
      const prob = parseInt(document.getElementById('newOfferProb').value, 10) || 15;
      const desc = document.getElementById('newOfferDesc').value.trim();

      const newOffer = {
        id: `off-${Date.now()}`,
        title,
        code,
        type,
        probability: prob,
        description: desc,
        badge: title,
        icon: type === 'freebie' ? 'fa-gift' : type === 'cashback' ? 'fa-tags' : type === 'waste' ? 'fa-clover' : 'fa-percent',
        active: true
      };

      const updated = [...(adminStats.offers || []), newOffer];
      try {
        const res = await authFetch('/api/admin/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offers: updated, biz: currentBizSlug })
        });
        const data = await res.json();
        if (data.success) {
          showToast('New offer added successfully!', 'success');
          elAddOfferForm.reset();
          loadDashboardData();
        }
      } catch (err) {
        showToast('Failed to add offer.', 'error');
      }
    });
  }

  function populateMegaOffer(mega) {
    if (!mega) return;
    document.getElementById('megaTitle').value = mega.title || '';
    document.getElementById('megaDiscount').value = mega.discount || '';
    document.getElementById('megaCode').value = mega.code || '';
    document.getElementById('megaValidDays').value = mega.validDays || 30;
    document.getElementById('megaTerms').value = mega.terms || '';
  }

  if (elMegaForm) {
    elMegaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        title: document.getElementById('megaTitle').value.trim(),
        discount: document.getElementById('megaDiscount').value.trim(),
        code: document.getElementById('megaCode').value.trim().toUpperCase(),
        validDays: parseInt(document.getElementById('megaValidDays').value, 10) || 30,
        terms: document.getElementById('megaTerms').value.trim(),
        description: `Congratulations on completing all 5 visits! Enjoy your grand bumper offer on your next visit.`,
        biz: currentBizSlug
      };

      try {
        const res = await authFetch('/api/admin/mega-offer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const resData = await res.json();
        if (resData.success) {
          showToast('6th Stamp Mega Bumper Offer updated!', 'success');
        }
      } catch (err) {
        showToast('Update failed.', 'error');
      }
    });
  }

  function populateSettings(settings) {
    if (!settings) return;
    document.getElementById('settingRestaurantName').value = settings.restaurantName || '';
    document.getElementById('settingTagline').value = settings.tagline || '';
    document.getElementById('settingPhone').value = settings.phone || '';
    document.getElementById('settingAddress').value = settings.address || '';
    document.getElementById('settingGoogleUrl').value = settings.googleReviewUrl || '';
    document.getElementById('settingGoogleRating').value = settings.googleRating || '4.9';
    document.getElementById('settingAntiCheat').checked = !!settings.antiCheatEnabled;
  }

  if (elSettingsForm) {
    elSettingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        restaurantName: document.getElementById('settingRestaurantName').value.trim(),
        tagline: document.getElementById('settingTagline').value.trim(),
        phone: document.getElementById('settingPhone').value.trim(),
        address: document.getElementById('settingAddress').value.trim(),
        googleReviewUrl: document.getElementById('settingGoogleUrl').value.trim(),
        googleRating: document.getElementById('settingGoogleRating').value.trim(),
        antiCheatEnabled: document.getElementById('settingAntiCheat').checked,
        biz: currentBizSlug
      };

      try {
        const res = await authFetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const resData = await res.json();
        if (resData.success) {
          showToast('Settings saved!', 'success');
          loadDashboardData();
        }
      } catch (err) {
        showToast('Failed to save settings.', 'error');
      }
    });
  }

  async function generateQrCode(table) {
    try {
      const res = await fetch(`/api/qr/generate?biz=${currentBizSlug}&table=${encodeURIComponent(table)}`);
      const data = await res.json();

      if (data.success) {
        if (elQrCodeImg) elQrCodeImg.src = data.qrDataUrl;
        if (elQrTargetUrl) elQrTargetUrl.textContent = data.targetUrl;
        if (elQrStandeeRestaurant) elQrStandeeRestaurant.textContent = data.restaurantName;
        if (elQrStandeeTable) elQrStandeeTable.textContent = table;
      }
    } catch (err) {
      console.error('QR generation failed:', err);
    }
  }

  if (elTableSelect) {
    elTableSelect.addEventListener('change', (e) => {
      generateQrCode(e.target.value);
    });
  }

  window.printStandee = function() {
    window.print();
  };

  // ==========================================
  // EVENT LISTENERS & 10-LAYER AUTH ACTIONS
  // ==========================================

  function setupEventListeners() {
    // Search input in CRM
    if (elSearchInput) {
      elSearchInput.addEventListener('input', renderCustomers);
    }

    // Customer filters
    const filterBtns = document.querySelectorAll('.cust-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('bg-amber-500', 'text-white');
          b.classList.add('bg-white', 'text-slate-600');
        });
        btn.classList.add('bg-amber-500', 'text-white');
        btn.classList.remove('bg-white', 'text-slate-600');
        currentFilter = btn.dataset.filter;
        renderCustomers();
      });
    });

    // Vault Passcode Verification Submission
    if (elVaultPasscodeForm) {
      elVaultPasscodeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const passcode = elVaultPasscodeInput.value.trim();
        if (!passcode) return;

        if (elVaultSubmitBtn) {
          elVaultSubmitBtn.disabled = true;
          elVaultSubmitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Verifying 10-Layer Shield...</span>`;
        }

        try {
          const fp = await getDeviceFingerprint();
          const clientTimestamp = Date.now();
          const clientNonce = 'n_' + Math.random().toString(36).substring(2) + Date.now().toString(36);

          const res = await fetch(`/api/auth/admin/verify-passcode?biz=${currentBizSlug}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              passcode,
              deviceFingerprint: fp,
              clientTimestamp,
              clientNonce
            })
          });

          const data = await res.json();

          if (data.success && data.token) {
            setAdminToken(data.token);
            hideVaultModal();
            showToast(data.message || 'Passcode Verified! Desk unlocked.', 'success');
            await loadDashboardData();
          } else {
            showVaultModal(data.error || 'Access Denied: Invalid Passcode.');
            if (elVaultPasscodeInput) {
              elVaultPasscodeInput.value = '';
              elVaultPasscodeInput.focus();
            }
          }
        } catch (err) {
          showVaultModal('Connection error while contacting security vault.');
        } finally {
          if (elVaultSubmitBtn) {
            elVaultSubmitBtn.disabled = false;
            elVaultSubmitBtn.innerHTML = `<i class="fa-solid fa-unlock-keyhole"></i> <span>Verify Passcode & Unlock Desk</span>`;
          }
        }
      });
    }

    // Topbar Lock Desk Button
    if (elAdminLockDeskBtn) {
      elAdminLockDeskBtn.addEventListener('click', async () => {
        try {
          await authFetch(`/api/auth/admin/logout?biz=${currentBizSlug}`, { method: 'POST' });
        } catch (e) {
          // Ignore network errors on logout
        }
        clearAdminToken();
        showVaultModal();
        showToast('Management desk locked securely.', 'info');
      });
    }

    // Passcode Change Form
    if (elChangePasscodeForm) {
      elChangePasscodeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPasscode = document.getElementById('currentPasscodeInput').value.trim();
        const newPasscode = document.getElementById('newPasscodeInput').value.trim();
        const confirmPasscode = document.getElementById('confirmPasscodeInput').value.trim();

        if (newPasscode !== confirmPasscode) {
          showToast('New passcodes do not match!', 'error');
          return;
        }

        if (newPasscode.length < 4) {
          showToast('Passcode must be at least 4 characters!', 'error');
          return;
        }

        try {
          const res = await authFetch(`/api/auth/admin/change-passcode?biz=${currentBizSlug}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPasscode, newPasscode })
          });
          const data = await res.json();
          if (data.success) {
            showToast(data.message || 'Passcode re-encrypted and updated!', 'success');
            elChangePasscodeForm.reset();
          } else {
            showToast(data.error || 'Failed to change passcode.', 'error');
          }
        } catch (e) {
          showToast('Passcode change failed.', 'error');
        }
      });
    }
  }

  // ==========================================
  // LAYER 10 AUDIT LOG VIEWER
  // ==========================================
  window.loadAuditLogs = async function() {
    const elContent = document.getElementById('auditLogContent');
    if (!elContent) return;

    elContent.innerHTML = `
      <div class="text-center py-6 text-slate-400">
        <i class="fa-solid fa-circle-notch fa-spin text-lg mb-2 block"></i>
        Retrieving immutable tamper-evident security ledger...
      </div>
    `;

    try {
      const res = await authFetch(`/api/auth/admin/audit-logs?biz=${currentBizSlug}`);
      const data = await res.json();

      if (data.success && data.logs) {
        if (data.logs.length === 0) {
          elContent.innerHTML = `<div class="text-center py-6 text-slate-400">No security events recorded yet.</div>`;
          return;
        }

        const badgeMap = {
          LOGIN_SUCCESS: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: 'fa-circle-check' },
          AUTH_FAILURE: { bg: 'bg-rose-100 text-rose-800 border-rose-300', icon: 'fa-triangle-exclamation' },
          BRUTE_FORCE_LOCKOUT_ENFORCED: { bg: 'bg-red-200 text-red-900 border-red-400', icon: 'fa-hand' },
          TENANT_BOUNDARY_VIOLATION: { bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: 'fa-shield-halved' },
          PASSCODE_CHANGED: { bg: 'bg-purple-100 text-purple-800 border-purple-300', icon: 'fa-key' },
          LOGOUT: { bg: 'bg-slate-100 text-slate-700 border-slate-300', icon: 'fa-right-from-bracket' },
          REPLAY_ATTACK_BLOCKED: { bg: 'bg-rose-200 text-rose-900 border-rose-400', icon: 'fa-ban' }
        };

        elContent.innerHTML = data.logs.slice().reverse().map(log => {
          const evType = log.eventType || log.event;
          const cfg = badgeMap[evType] || { bg: 'bg-slate-100 text-slate-700 border-slate-300', icon: 'fa-circle-info' };
          const dateStr = new Date(log.timestamp).toLocaleString();
          const fpShort = log.maskedFingerprint || (log.deviceFingerprint ? log.deviceFingerprint.slice(0, 10) + '...' : 'Unknown');

          return `
            <div class="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 transition">
              <div class="flex items-center space-x-2.5">
                <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border ${cfg.bg}">
                  <i class="fa-solid ${cfg.icon}"></i>
                  <span>${evType}</span>
                </span>
                <span class="font-mono text-[11px] text-slate-600">${log.ip || '127.0.0.1'}</span>
                <span class="text-[10px] text-slate-400 hidden sm:inline" title="${log.deviceFingerprint}">Device: ${fpShort}</span>
              </div>
              <div class="text-[10px] text-slate-400 font-mono sm:text-right">
                ${dateStr}
              </div>
            </div>
          `;
        }).join('');
      } else {
        elContent.innerHTML = `<div class="text-center py-6 text-rose-500">Failed to load audit logs.</div>`;
      }
    } catch (e) {
      elContent.innerHTML = `<div class="text-center py-6 text-rose-500">Error: ${e.message}</div>`;
    }
  };

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-slate-900';
    toast.className = `fixed bottom-5 right-5 ${bg} text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center space-x-2 z-50 animate-bounce`;
    toast.innerHTML = `<i class="fa-solid fa-check"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
});
