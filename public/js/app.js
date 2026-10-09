// Customer Application Main Logic (Multi-Tenant Compatible)
document.addEventListener('DOMContentLoaded', async () => {
  let currentCustomer = null;
  let deviceFingerprint = null;
  let activeScratchInstance = null;
  let currentRating = 5;
  let selectedAiSuggestion = '';
  let currentBiz = null;

  const params = new URLSearchParams(window.location.search);
  const bizSlug = params.get('biz') || 'royal-spice';
  const tableNumber = params.get('table') || 'Table 4';

  // Elements
  const elTableBadge = document.getElementById('tableBadge');
  const elBizBrandName = document.getElementById('bizBrandName');
  const elBizBrandCategory = document.getElementById('bizBrandCategory');
  const elBizCategoryIcon = document.getElementById('bizCategoryIcon');
  const elBizFooterAddress = document.getElementById('bizFooterAddress');
  const elAdminLinkBtn = document.getElementById('adminLinkBtn');
  const elBizAdminFooterLink = document.getElementById('bizAdminFooterLink');
  const elRegModalTitle = document.getElementById('regModalTitle');
  const elScratchSection = document.getElementById('scratchSection');
  const elStampsSection = document.getElementById('stampsSection');
  const elReviewSection = document.getElementById('reviewSection');
  const elGoogleBoardSection = document.getElementById('googleBoardSection');
  const elGoogleBoardTitle = document.getElementById('googleBoardTitle');

  const elCustomerName = document.getElementById('customerName');
  const elCustomerMobile = document.getElementById('customerMobile');
  const elCustomerAvatar = document.getElementById('customerAvatar');
  const elStampProgressBar = document.getElementById('stampProgressBar');
  const elStampProgressText = document.getElementById('stampProgressText');
  const elStampGrid = document.getElementById('stampGrid');
  const elScratchCanvas = document.getElementById('scratchCanvas');
  const elScratchCardUnderlay = document.getElementById('scratchCardUnderlay');
  const elScratchInstruction = document.getElementById('scratchInstruction');
  const elScratchPercentBadge = document.getElementById('scratchPercentBadge');
  const elQuickRevealBtn = document.getElementById('quickRevealBtn');
  const elNextVisitBtn = document.getElementById('nextVisitBtn');
  const elNextVisitBtnText = document.getElementById('nextVisitBtnText');
  const elResetStampsBtn = document.getElementById('resetStampsBtn');
  const elCouponList = document.getElementById('couponList');
  const elMyCouponsCount = document.getElementById('myCouponsCount');
  const elRegModal = document.getElementById('registrationModal');
  const elRegForm = document.getElementById('registrationForm');
  const elAntiCheatAlert = document.getElementById('antiCheatAlert');
  const elAntiCheatText = document.getElementById('antiCheatText');
  const elDeviceStatusBadge = document.getElementById('deviceStatusBadge');
  const elReviewText = document.getElementById('reviewText');
  const elAiSuggestionsContainer = document.getElementById('aiSuggestionsContainer');
  const elPrivateFeedbackBox = document.getElementById('privateFeedbackBox');
  const elPrivateFeedbackText = document.getElementById('privateFeedbackText');
  const elSubmitReviewBtn = document.getElementById('submitReviewBtn');
  const elGoogleBoardReviews = document.getElementById('googleBoardReviews');
  const elGoogleAvgRating = document.getElementById('googleAvgRating');
  const elGoogleTotalReviews = document.getElementById('googleTotalReviews');
  const elMegaModal = document.getElementById('megaOfferModal');
  const elMegaCouponCode = document.getElementById('megaCouponCode');
  const elMegaDiscountText = document.getElementById('megaDiscountText');

  if (elTableBadge) {
    elTableBadge.textContent = `📍 ${tableNumber}`;
  }

  // 1. Fetch Business Profile Info
  await loadBusinessProfile();

  async function loadBusinessProfile() {
    try {
      const res = await fetch(`/api/businesses/${bizSlug}`);
      const data = await res.json();
      if (data.success && data.business) {
        currentBiz = data.business;
        if (elBizBrandName) elBizBrandName.textContent = currentBiz.name;
        if (elBizBrandCategory) elBizBrandCategory.textContent = currentBiz.categoryName || currentBiz.type;
        if (elBizFooterAddress) elBizFooterAddress.textContent = `${currentBiz.name} • ${currentBiz.city || currentBiz.address}`;
        if (elAdminLinkBtn) elAdminLinkBtn.href = `admin.html?biz=${currentBiz.slug}`;
        if (elBizAdminFooterLink) elBizAdminFooterLink.href = `admin.html?biz=${currentBiz.slug}`;
        if (elRegModalTitle) elRegModalTitle.textContent = `Welcome to ${currentBiz.name}!`;
        if (elGoogleBoardTitle) elGoogleBoardTitle.textContent = currentBiz.googlePlaceName || currentBiz.name;

        // Category icon
        if (elBizCategoryIcon) {
          const iconMap = {
            restaurant: 'fa-fire-burner',
            cafe: 'fa-mug-hot',
            hotel: 'fa-hotel',
            salon: 'fa-spa',
            retail: 'fa-bag-shopping',
            clinic: 'fa-stethoscope'
          };
          elBizCategoryIcon.className = `fa-solid ${iconMap[currentBiz.type] || 'fa-crown'} text-lg`;
        }

        // Apply Plan restrictions if business subscribed to single-feature plan
        if (currentBiz.plan === 'loyalty_only') {
          if (elReviewSection) elReviewSection.classList.add('hidden');
          if (elGoogleBoardSection) elGoogleBoardSection.classList.add('hidden');
        } else if (currentBiz.plan === 'review_only') {
          if (elScratchSection) elScratchSection.classList.add('hidden');
          if (elStampsSection) elStampsSection.classList.add('hidden');
        }
      }
    } catch (err) {
      console.warn('Could not load specific business profile, using defaults:', err);
    }
  }

  // 2. Initialize Device Fingerprint & Auto-Verify
  try {
    deviceFingerprint = await window.DeviceFingerprint.getFingerprint();
    if (elDeviceStatusBadge) {
      elDeviceStatusBadge.innerHTML = `<i class="fa-solid fa-shield-halved text-emerald-500"></i> Device Verified: <span class="font-mono">${deviceFingerprint.slice(0, 10)}...</span>`;
    }
  } catch (err) {
    console.error('Failed to get device fingerprint:', err);
    deviceFingerprint = 'fp_fallback_' + Date.now();
  }

  // 3. Check Device for Auto-Login
  async function checkDeviceAutoLogin() {
    try {
      const res = await fetch('/api/auth/verify-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceFingerprint, biz: bizSlug })
      });
      const data = await res.json();

      if (data.success && data.registered && data.customer) {
        currentCustomer = data.customer;
        onCustomerLoggedIn(true);
      } else {
        await setupScratchCard(true);
        showRegistrationModal();
      }
    } catch (err) {
      console.error('Verify device error:', err);
      await setupScratchCard(true);
      showRegistrationModal();
    }
  }

  function showRegistrationModal() {
    if (elRegModal) {
      elRegModal.classList.remove('hidden');
      elRegModal.classList.add('flex');
    }
  }

  function hideRegistrationModal() {
    if (elRegModal) {
      elRegModal.classList.add('hidden');
      elRegModal.classList.remove('flex');
    }
  }

  // Handle Customer Registration with Anti-Cheat
  if (elRegForm) {
    elRegForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const mobile = document.getElementById('regMobile').value.trim();
      const dob = document.getElementById('regDob').value;
      const address = document.getElementById('regAddress').value.trim();

      if (!name || !mobile) {
        showToast('Please fill Name and Mobile number.', 'error');
        return;
      }

      try {
        const btn = elRegForm.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Verifying Device...';

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            mobile,
            dob,
            address,
            deviceFingerprint,
            biz: bizSlug
          })
        });

        const data = await res.json();
        btn.disabled = false;
        btn.innerHTML = 'Enter & Unlock Scratch Card 🎁';

        if (res.status === 409 || data.antiCheatTriggered) {
          if (elAntiCheatAlert && elAntiCheatText) {
            elAntiCheatText.textContent = data.error;
            elAntiCheatAlert.classList.remove('hidden');
          }
          showToast(data.error, 'error', 6000);
          return;
        }

        if (data.success && data.customer) {
          currentCustomer = data.customer;
          hideRegistrationModal();
          showToast(data.message || 'Welcome! Device verified successfully.', 'success');
          onCustomerLoggedIn(false);
        } else {
          showToast(data.error || 'Registration failed.', 'error');
        }
      } catch (err) {
        console.error('Registration error:', err);
        showToast('Network error during registration.', 'error');
      }
    });
  }

  window.loginExistingAccount = async function() {
    const mobilePrompt = prompt('Enter your registered 10-digit mobile number:');
    if (!mobilePrompt) return;
    try {
      const res = await fetch('/api/auth/login-mobile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobilePrompt, deviceFingerprint, biz: bizSlug })
      });
      const data = await res.json();
      if (data.success && data.customer) {
        currentCustomer = data.customer;
        hideRegistrationModal();
        if (elAntiCheatAlert) elAntiCheatAlert.classList.add('hidden');
        showToast(`Welcome back, ${currentCustomer.name}!`, 'success');
        onCustomerLoggedIn(true);
      } else {
        showToast(data.error || 'Login failed.', 'error');
      }
    } catch (e) {
      showToast('Login request failed.', 'error');
    }
  };

  function onCustomerLoggedIn(isAutoLogin) {
    if (elCustomerName) elCustomerName.textContent = currentCustomer.name;
    if (elCustomerMobile) elCustomerMobile.textContent = `+91 ${currentCustomer.mobile}`;
    if (elCustomerAvatar) {
      elCustomerAvatar.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentCustomer.name)}`;
    }

    renderStamps(currentCustomer.stamps || 0);
    renderCoupons(currentCustomer.wonCoupons || []);
    setupScratchCard();
    loadAiSuggestions(5);
    loadGoogleReviewBoard();

    if (isAutoLogin) {
      showToast(`Welcome back, ${currentCustomer.name}! 🎉 Auto-logged in.`, 'success');
    }
  }

  // 4. Render 6-Stamp Card
  function renderStamps(stampsCount) {
    stampsCount = Math.min(6, stampsCount || 0);
    const percentage = Math.round((stampsCount / 6) * 100);

    if (elStampProgressBar) elStampProgressBar.style.width = `${percentage}%`;
    if (elStampProgressText) elStampProgressText.textContent = `${stampsCount} of 6 Stamps Collected`;

    if (!elStampGrid) return;
    elStampGrid.innerHTML = '';

    const stampBadges = [
      { step: 1, label: 'Visit 1', icon: 'fa-utensils', perk: 'Starter Perk' },
      { step: 2, label: 'Visit 2', icon: 'fa-glass-water', perk: 'Drink Perk' },
      { step: 3, label: 'Visit 3', icon: 'fa-ice-cream', perk: 'Dessert Perk' },
      { step: 4, label: 'Visit 4', icon: 'fa-pizza-slice', perk: 'Snack Perk' },
      { step: 5, label: 'Visit 5', icon: 'fa-crown', perk: 'VIP Perk' },
      { step: 6, label: 'Stamp 6', icon: 'fa-trophy', perk: '🏆 50% BUMPER', isMega: true }
    ];

    stampBadges.forEach((b) => {
      const isCompleted = stampsCount >= b.step;
      const isCurrent = stampsCount + 1 === b.step;

      const card = document.createElement('div');
      card.className = `relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all transform duration-300 ${
        isCompleted
          ? b.isMega
            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white border-yellow-300 shadow-lg shadow-amber-500/30 scale-105 stamp-active pulse-glow'
            : 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20 stamp-active'
          : isCurrent
          ? 'bg-amber-50 border-dashed border-amber-500 text-amber-800 animate-pulse'
          : 'bg-slate-50 border-dashed border-slate-200 text-slate-400'
      }`;

      card.innerHTML = `
        <div class="w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ${
          isCompleted
            ? 'bg-white/20'
            : isCurrent
            ? 'bg-amber-100 text-amber-600'
            : 'bg-slate-200 text-slate-400'
        }">
          <i class="fa-solid ${isCompleted ? 'fa-check' : b.icon} text-base"></i>
        </div>
        <span class="text-xs font-bold tracking-tight">${b.label}</span>
        <span class="text-[10px] opacity-90 truncate max-w-full font-medium">${b.perk}</span>
        ${
          b.isMega
            ? '<span class="absolute -top-2 -right-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-bounce shadow">Bumper</span>'
            : ''
        }
      `;
      elStampGrid.appendChild(card);
    });
  }

  // 5. Setup Interactive Scratch Card with Pre-Loaded Underlay & Dynamic Controls
  let currentPreparedReward = null;

  async function setupScratchCard(isDemo = false) {
    if (!elScratchCanvas || !elScratchCardUnderlay) return;

    try {
      // Pre-load the exact reward that sits underneath the golden scratch foil
      const apiUrl = currentCustomer && !isDemo
        ? `/api/customer/${currentCustomer.id}/scratch-card?biz=${bizSlug}`
        : `/api/public/demo-scratch?biz=${bizSlug}`;

      const res = await fetch(apiUrl);
      const data = await res.json();
      
      if (data.success && data.prepared) {
        currentPreparedReward = data.prepared;
      } else {
        currentPreparedReward = {
          isMega: false,
          nextStamp: currentCustomer ? Math.min(6, (currentCustomer.stamps || 0) + 1) : 1,
          stampsRemaining: currentCustomer ? Math.max(0, 6 - (currentCustomer.stamps || 0) - 1) : 5,
          reward: {
            title: 'Flat 15% OFF',
            badge: '🎉 Instant Discount',
            icon: 'fa-percent',
            description: 'Enjoy 15% off on your bill today!',
            code: 'ROYAL15-DEMO',
            isWaste: false
          }
        };
      }
    } catch (err) {
      console.warn('Could not pre-fetch scratch reward, using default:', err);
      currentPreparedReward = {
        isMega: false,
        nextStamp: 1,
        stampsRemaining: 5,
        reward: {
          title: 'Flat 15% OFF',
          badge: '🎉 Instant Discount',
          icon: 'fa-percent',
          description: 'Enjoy 15% off on your bill today!',
          code: 'ROYAL15-DEMO',
          isWaste: false
        }
      };
    }

    const prep = currentPreparedReward;
    const r = prep.reward;
    const isMega = prep.isMega;
    const isWaste = r.isWaste;

    // Render REAL Underlay Card Underneath Foil
    elScratchCardUnderlay.innerHTML = `
      <div class="h-full w-full flex flex-col items-center justify-center text-center p-3 sm:p-4 ${
        isMega
          ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-white'
          : isWaste
          ? 'bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 text-slate-800'
          : 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-slate-900'
      } rounded-2xl border-2 ${isMega ? 'border-yellow-300 shadow-lg' : 'border-amber-300'} relative overflow-hidden select-none">
        
        <div class="flex items-center space-x-1.5 mb-1">
          <span class="inline-block ${
            isMega ? 'bg-red-600 text-white animate-bounce' : isWaste ? 'bg-amber-200 text-amber-900' : 'bg-emerald-500 text-white'
          } text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs tracking-wider">
            ${r.badge || (isMega ? '🏆 50% GRAND BUMPER' : isWaste ? '🍀 VISIT STAMP +1' : '🎁 MYSTERY OFFER')}
          </span>
          <span class="text-[10px] font-bold ${isMega ? 'text-yellow-200' : 'text-slate-500'}">
            Visit #${prep.nextStamp}/6
          </span>
        </div>

        <div class="w-10 h-10 ${isMega ? 'bg-white/20 text-yellow-200' : isWaste ? 'bg-amber-100 text-amber-600' : 'bg-orange-100 text-orange-600'} rounded-2xl flex items-center justify-center mb-1 text-xl shadow-xs">
          <i class="fa-solid ${r.icon || (isMega ? 'fa-trophy' : isWaste ? 'fa-clover' : 'fa-gift')}"></i>
        </div>

        <h4 class="font-black text-sm sm:text-base tracking-tight leading-tight ${isMega ? 'text-white' : 'text-slate-900'}">
          ${r.title}
        </h4>
        
        <p class="text-[11px] ${isMega ? 'text-amber-100' : 'text-slate-500'} mt-0.5 line-clamp-1 max-w-xs">
          ${r.description}
        </p>

        ${r.code ? `
          <div class="mt-2 py-1 px-3.5 bg-white/95 rounded-xl border border-amber-300 text-amber-900 font-mono text-xs font-black tracking-widest shadow-xs flex items-center space-x-1.5">
            <i class="fa-solid fa-ticket text-amber-500 text-[10px]"></i>
            <span>${r.code}</span>
          </div>
        ` : `
          <div class="mt-1 text-[10px] ${isMega ? 'text-amber-200' : 'text-amber-800'} font-semibold">
            ${isWaste ? '🍀 Visit recorded! Collect all 5 stamps for 50% Off' : '✨ Offer unlocked & ready to claim!'}
          </div>
        `}
      </div>
    `;

    // Reset instruction & badge
    if (elScratchPercentBadge) elScratchPercentBadge.textContent = '0% Uncovered';
    if (elScratchInstruction) {
      elScratchInstruction.innerHTML = 'Scratch the golden card below with your finger or mouse! ✨';
    }

    if (elQuickRevealBtn) {
      elQuickRevealBtn.classList.remove('hidden');
      elQuickRevealBtn.classList.add('flex');
    }
    if (elNextVisitBtn) {
      elNextVisitBtn.classList.add('hidden');
      elNextVisitBtn.classList.remove('flex');
    }

    // Initialize or Reset Canvas Foil
    if (activeScratchInstance) {
      activeScratchInstance.reset();
    } else {
      activeScratchInstance = new ScratchCard(elScratchCanvas, {
        scratchSize: 38,
        revealThreshold: 35,
        onScratchProgress: (percent) => {
          if (elScratchPercentBadge) {
            elScratchPercentBadge.textContent = `${percent}% Uncovered`;
          }
          if (elScratchInstruction) {
            elScratchInstruction.innerHTML = `<span class="text-amber-700 font-bold">${percent}%</span> scratched! Keep going! ✨`;
          }
        },
        onComplete: async () => {
          await handleScratchComplete();
        }
      });
    }
  }

  async function handleScratchComplete() {
    if (!currentCustomer) {
      // Guest attempted scratch -> Invite to register and claim
      if (currentPreparedReward) {
        showToast(`🎁 You revealed ${currentPreparedReward.reward.title}! Register now to claim it.`, 'info', 5000);
      }
      showRegistrationModal();
      return;
    }

    try {
      const res = await fetch(`/api/customer/${currentCustomer.id}/scratch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceFingerprint, biz: bizSlug })
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.error || 'Scratch error', 'error');
        return;
      }

      currentCustomer.stamps = data.stamps;
      if (data.coupon) {
        if (!currentCustomer.wonCoupons) currentCustomer.wonCoupons = [];
        currentCustomer.wonCoupons.unshift(data.coupon);
      }

      renderStamps(data.stamps);
      renderCoupons(currentCustomer.wonCoupons || []);

      if (elScratchPercentBadge) elScratchPercentBadge.textContent = '100% Revealed 🎉';
      if (elQuickRevealBtn) elQuickRevealBtn.classList.add('hidden');
      if (elNextVisitBtn) {
        elNextVisitBtn.classList.remove('hidden');
        elNextVisitBtn.classList.add('flex');
        if (elNextVisitBtnText) {
          elNextVisitBtnText.textContent = data.stamps >= 6
            ? 'Start New 6-Stamp Cycle'
            : `Scratch Next Visit (Stamp #${data.stamps + 1})`;
        }
      }

      const reward = data.reward;

      if (data.isMega) {
        if (activeScratchInstance) activeScratchInstance.playWinChime();
        triggerConfetti(true);

        if (elScratchInstruction) {
          elScratchInstruction.innerHTML = '🎉 <span class="text-emerald-600 font-black">ALL 6 STAMPS COMPLETED! GRAND 50% BUMPER CLAIMED!</span>';
        }

        setTimeout(() => {
          showMegaOfferModal(data.reward);
        }, 500);

      } else if (reward.isWaste) {
        if (activeScratchInstance) activeScratchInstance.playRetrySound();
        if (elScratchInstruction) {
          elScratchInstruction.innerHTML = `🍀 Stamp #${data.stamps} added! <span class="font-bold text-amber-700">${data.stampsRemaining} more visits to 50% Grand Bumper!</span>`;
        }
        showToast(`Stamp #${data.stamps} added! Keep visiting for the 50% Grand Bumper!`, 'info');

      } else {
        if (activeScratchInstance) activeScratchInstance.playWinChime();
        triggerConfetti(false);

        if (elScratchInstruction) {
          elScratchInstruction.innerHTML = `🎁 <span class="text-emerald-600 font-bold">${reward.title}</span> claimed! Stamp #${data.stamps}/6 recorded!`;
        }
        showToast(`Congratulations! You claimed ${reward.title}!`, 'success');
      }

    } catch (err) {
      console.error('Scratch reveal failed:', err);
      showToast('Error claiming reward.', 'error');
    }
  }

  async function resetStampsCycle() {
    if (!currentCustomer) {
      await setupScratchCard(true);
      return;
    }
    try {
      const res = await fetch(`/api/customer/${currentCustomer.id}/reset-stamps?biz=${bizSlug}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        currentCustomer.stamps = 0;
        renderStamps(0);
        showToast('Stamps reset to 0! Ready for Visit #1 scratch card.', 'info');
        await setupScratchCard();
      }
    } catch (e) {
      showToast('Failed to reset stamps.', 'error');
    }
  }

  // Bind Scratch Action Buttons
  if (elQuickRevealBtn) {
    elQuickRevealBtn.addEventListener('click', () => {
      if (activeScratchInstance) {
        activeScratchInstance.reveal();
      }
    });
  }

  if (elNextVisitBtn) {
    elNextVisitBtn.addEventListener('click', async () => {
      if (currentCustomer && currentCustomer.stamps >= 6) {
        await resetStampsCycle();
      } else {
        await setupScratchCard();
      }
    });
  }

  if (elResetStampsBtn) {
    elResetStampsBtn.addEventListener('click', async () => {
      if (confirm('Reset stamps back to 0 for demo testing?')) {
        await resetStampsCycle();
      }
    });
  }

  function renderCoupons(coupons) {
    if (elMyCouponsCount) elMyCouponsCount.textContent = coupons.length;
    if (!elCouponList) return;

    if (!coupons || coupons.length === 0) {
      elCouponList.innerHTML = `
        <div class="text-center py-6 text-slate-400">
          <i class="fa-solid fa-ticket text-3xl mb-2 opacity-50"></i>
          <p class="text-xs">No coupons yet. Scratch above to win exciting offers!</p>
        </div>
      `;
      return;
    }

    elCouponList.innerHTML = coupons.map(c => `
      <div class="relative overflow-hidden p-3.5 rounded-2xl border ${
        c.isMega
          ? 'bg-gradient-to-r from-amber-50 to-yellow-100 border-amber-300 shadow-sm'
          : c.redeemed
          ? 'bg-slate-50 border-slate-200 opacity-60'
          : 'bg-white border-orange-200 shadow-sm'
      } transition-all">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center ${
              c.isMega
                ? 'bg-amber-500 text-white'
                : c.redeemed
                ? 'bg-slate-200 text-slate-500'
                : 'bg-orange-500 text-white'
            }">
              <i class="fa-solid ${c.isMega ? 'fa-crown' : 'fa-tag'}"></i>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h5 class="text-sm font-bold text-slate-800">${c.title}</h5>
                ${c.isMega ? '<span class="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">50% BUMPER</span>' : ''}
                ${c.redeemed ? '<span class="bg-slate-400 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">Used</span>' : ''}
              </div>
              <p class="text-[11px] text-slate-500">${c.description || 'Show code at the billing counter'}</p>
            </div>
          </div>
          <div class="text-right">
            <button onclick="copyCouponCode('${c.code}')" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-mono font-bold rounded-lg transition-transform flex items-center space-x-1">
              <span>${c.code}</span>
              <i class="fa-regular fa-copy text-[11px]"></i>
            </button>
            <span class="block text-[9px] text-slate-400 mt-1">${new Date(c.date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  window.copyCouponCode = function(code) {
    navigator.clipboard.writeText(code).then(() => {
      showToast(`Coupon code ${code} copied!`, 'success');
    }).catch(() => {
      prompt('Copy this coupon code:', code);
    });
  };

  function triggerConfetti(isSuper) {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: isSuper ? 120 : 60,
        spread: isSuper ? 90 : 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6']
      });
      if (isSuper) {
        setTimeout(() => {
          confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
          confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } });
        }, 300);
      }
    }
  }

  function showMegaOfferModal(reward) {
    if (!elMegaModal) return;
    if (elMegaCouponCode) elMegaCouponCode.textContent = reward.code;
    if (elMegaDiscountText) elMegaDiscountText.textContent = reward.discount || 'FLAT 50% OFF';
    elMegaModal.classList.remove('hidden');
    elMegaModal.classList.add('flex');
  }

  window.closeMegaModal = function() {
    if (elMegaModal) {
      elMegaModal.classList.add('hidden');
      elMegaModal.classList.remove('flex');
    }
  };

  // 6. AI-POWERED GOOGLE REVIEW ENGINE
  window.setRating = async function(rating) {
    currentRating = rating;

    const starBtns = document.querySelectorAll('.star-btn');
    starBtns.forEach((btn, idx) => {
      const starIcon = btn.querySelector('i');
      if (idx < rating) {
        starIcon.className = 'fa-solid fa-star text-amber-400 text-2xl transition-transform transform scale-110';
      } else {
        starIcon.className = 'fa-regular fa-star text-slate-300 text-2xl transition-transform';
      }
    });

    if (elPrivateFeedbackBox) {
      if (rating <= 3) {
        elPrivateFeedbackBox.classList.remove('hidden');
      } else {
        elPrivateFeedbackBox.classList.add('hidden');
      }
    }

    await loadAiSuggestions(rating);
  };

  async function loadAiSuggestions(rating) {
    if (!elAiSuggestionsContainer) return;
    elAiSuggestionsContainer.innerHTML = `
      <div class="col-span-full py-4 text-center text-slate-400">
        <i class="fa-solid fa-wand-magic-sparkles fa-spin text-amber-500 mr-2"></i> Generating personalized review ideas...
      </div>
    `;

    try {
      const res = await fetch('/api/reviews/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          customerName: currentCustomer ? currentCustomer.name : 'Guest',
          biz: bizSlug
        })
      });
      const data = await res.json();

      if (data.success && data.suggestions) {
        elAiSuggestionsContainer.innerHTML = '';
        data.suggestions.forEach((sug, idx) => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = `text-left p-3 rounded-xl border text-xs transition-all ${
            idx === 0
              ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
              : 'bg-white border-slate-200 text-slate-700 hover:border-amber-200 hover:bg-amber-50/50'
          }`;
          chip.innerHTML = `
            <div class="font-bold text-[11px] mb-1 text-amber-800 flex items-center justify-between">
              <span>${sug.title}</span>
              <span class="text-[9px] bg-amber-200/60 text-amber-900 px-1.5 py-0.5 rounded font-mono">${sug.tag}</span>
            </div>
            <p class="line-clamp-2 text-slate-600">${sug.text}</p>
          `;
          chip.addEventListener('click', () => {
            selectAiSuggestion(sug.text, chip);
          });
          elAiSuggestionsContainer.appendChild(chip);

          if (idx === 0) {
            selectAiSuggestion(sug.text, chip);
          }
        });
      }
    } catch (err) {
      console.error('AI suggestions fetch failed:', err);
    }
  }

  function selectAiSuggestion(text, chipElement) {
    selectedAiSuggestion = text;
    if (elReviewText) elReviewText.value = text;

    const allChips = elAiSuggestionsContainer.querySelectorAll('button');
    allChips.forEach(c => {
      c.classList.remove('bg-amber-50', 'border-amber-400', 'ring-2', 'ring-amber-300');
      c.classList.add('bg-white', 'border-slate-200');
    });
    if (chipElement) {
      chipElement.classList.add('bg-amber-50', 'border-amber-400', 'ring-2', 'ring-amber-300');
      chipElement.classList.remove('bg-white', 'border-slate-200');
    }
  }

  if (elSubmitReviewBtn) {
    elSubmitReviewBtn.addEventListener('click', async () => {
      const reviewText = elReviewText ? elReviewText.value.trim() : '';
      const privateFeedback = elPrivateFeedbackText ? elPrivateFeedbackText.value.trim() : '';
      const customerName = currentCustomer ? currentCustomer.name : 'Verified Diner';

      if (!reviewText) {
        showToast('Please select or write a short review text.', 'error');
        return;
      }

      try {
        elSubmitReviewBtn.disabled = true;
        elSubmitReviewBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Submitting & Opening Google...';

        try {
          await navigator.clipboard.writeText(reviewText);
        } catch (e) {
          console.warn('Clipboard write fallback');
        }

        const res = await fetch('/api/reviews/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName,
            rating: currentRating,
            reviewText,
            privateFeedback,
            biz: bizSlug
          })
        });

        const data = await res.json();
        elSubmitReviewBtn.disabled = false;
        elSubmitReviewBtn.innerHTML = '<i class="fa-brands fa-google mr-2 text-red-500"></i> Copied! Post on Google Maps';

        showToast('✨ Review copied to clipboard! Opening Google Review page...', 'success', 4000);
        loadGoogleReviewBoard();

        const targetUrl = data.googleReviewUrl || 'https://search.google.com/local/writereview';
        window.open(targetUrl, '_blank');

      } catch (err) {
        console.error('Submit review error:', err);
        showToast('Error submitting review.', 'error');
        elSubmitReviewBtn.disabled = false;
        elSubmitReviewBtn.innerHTML = '<i class="fa-brands fa-google mr-2 text-red-500"></i> Post on Google Review';
      }
    });
  }

  // 7. Google Review Profile Board Loader
  async function loadGoogleReviewBoard() {
    try {
      const res = await fetch(`/api/public/google-board?biz=${bizSlug}`);
      const data = await res.json();

      if (data.success) {
        if (elGoogleAvgRating) elGoogleAvgRating.textContent = data.rating;
        if (elGoogleTotalReviews) elGoogleTotalReviews.textContent = `${data.totalReviews.toLocaleString()} verified Google reviews`;

        if (elGoogleBoardReviews && data.recentReviews) {
          elGoogleBoardReviews.innerHTML = data.recentReviews.map(r => `
            <div class="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm transition hover:shadow-md">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2.5">
                  <img src="${r.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + encodeURIComponent(r.customerName)}" alt="${r.customerName}" class="w-8 h-8 rounded-full border border-amber-300">
                  <div>
                    <h6 class="text-xs font-bold text-slate-800 flex items-center">
                      ${r.customerName}
                      <i class="fa-solid fa-circle-check text-blue-500 text-[10px] ml-1" title="Verified Customer"></i>
                    </h6>
                    <span class="text-[10px] text-slate-400">${r.date || r.relativeTime || 'Recent'}</span>
                  </div>
                </div>
                <div class="flex text-amber-400 text-xs">
                  ${Array(r.rating || 5).fill('<i class="fa-solid fa-star"></i>').join('')}
                </div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">${r.text}</p>
            </div>
          `).join('');
        }
      }
    } catch (err) {
      console.error('Failed to load Google Review board:', err);
    }
  }

  function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col space-y-2 pointer-events-none w-11/12 max-w-md';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgClass = type === 'success'
      ? 'bg-emerald-600 text-white'
      : type === 'error'
      ? 'bg-rose-600 text-white'
      : 'bg-slate-900 text-white';

    toast.className = `${bgClass} pointer-events-auto shadow-xl rounded-2xl px-4 py-3 text-xs font-medium flex items-center justify-between transition-all transform duration-300 -translate-y-4 opacity-0 border border-white/20`;
    toast.innerHTML = `
      <div class="flex items-center space-x-2.5">
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-triangle-exclamation' : 'fa-bell'} text-sm"></i>
        <span>${message}</span>
      </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('-translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('-translate-y-4', 'opacity-0');
      setTimeout(() => toast.remove(), 350);
    }, duration);
  }

  checkDeviceAutoLogin();
});
