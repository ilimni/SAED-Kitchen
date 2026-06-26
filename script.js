/* ================================================================
   SAED KITCHEN – MAIN JAVASCRIPT
   Features:
     1. Mobile Menu Toggle
     2. Sticky Navbar Effect
     3. Smooth Scrolling (polyfill support)
     4. Menu Category Filtering
     5. Rotating Today's Special
     6. Active Navigation Highlighting (IntersectionObserver)
     7. Back-to-Top Button
     8. Scroll Fade-in Animations
     9. Footer Year
    10. Order Form (Cart + WhatsApp Checkout)
================================================================ */

'use strict';

/* ================================================================
   0. THEME TOGGLE (Light / Dark Mode)
================================================================ */
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const STORAGE_KEY = 'saed-kitchen-theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Load saved preference, or fall back to system preference
  const saved = localStorage.getItem(STORAGE_KEY);
  const isDark = saved ? saved === 'dark' : prefersDark;

  applyTheme(isDark);

  btn.addEventListener('click', () => {
    const currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(!currentlyDark);
    localStorage.setItem(STORAGE_KEY, !currentlyDark ? 'dark' : 'light');
  });

  function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title',      dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
}


/* ================================================================
   UTILITY: Run after DOM is fully loaded
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileMenu();
  initStickyNav();
  initSmoothScrolling();
  initMenuFilter();
  initTodaysSpecial();
  initActiveNavHighlight();
  initBackToTop();
  initFadeInAnimations();
  initFooterYear();
  initOrderForm();
});


/* ================================================================
   1. MOBILE MENU TOGGLE
================================================================ */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');

  if (!hamburger || !navLinks || !navOverlay) return;

  function openMenu() {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    navOverlay.classList.add('visible');
    navOverlay.removeAttribute('aria-hidden');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    navOverlay.classList.remove('visible');
    navOverlay.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isOpen = navLinks.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  }

  // Toggle on hamburger click
  hamburger.addEventListener('click', toggleMenu);

  // Close when a nav link is clicked
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close when overlay is clicked
  navOverlay.addEventListener('click', closeMenu);

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });
}


/* ================================================================
   2. STICKY NAVBAR EFFECT
================================================================ */
function initStickyNav() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function handleScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Run on load in case page is already scrolled
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
}


/* ================================================================
   3. SMOOTH SCROLLING (polyfill for older browsers)
================================================================ */
function initSmoothScrolling() {
  // Native CSS scroll-behavior: smooth handles this in modern browsers.
  // This adds JS-based smooth scrolling for any anchor <a href="#id"> links,
  // which also ensures the navbar height offset is respected.

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return; // Skip bare # links

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = document.getElementById('navbar')?.offsetHeight ?? 72;
      const targetTop = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    });
  });
}


/* ================================================================
   4. MENU CATEGORY FILTERING
================================================================ */
function initMenuFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuCards  = document.querySelectorAll('.menu-card');

  if (!filterBtns.length || !menuCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const filter = this.dataset.filter;

      // Update active button state
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      // Filter menu cards with a small stagger animation
      let visibleIndex = 0;
      menuCards.forEach(card => {
        const category = card.dataset.category;
        const matches = filter === 'all' || category === filter;

        if (matches) {
          card.classList.remove('hidden');
          // Reset and trigger fade-in with stagger
          card.style.opacity = '0';
          card.style.transform = 'translateY(16px)';
          const delay = visibleIndex * 40; // ms stagger
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, delay);
          visibleIndex++;
        } else {
          card.classList.add('hidden');
          card.style.opacity = '';
          card.style.transform = '';
          card.style.transition = '';
        }
      });
    });
  });
}


/* ================================================================
   5. TODAY'S SPECIAL — WEEKLY MEAL + SWIPE CAROUSEL
================================================================ */
function initTodaysSpecial() {
  const specialCard    = document.getElementById('specialCard');
  const specialImgWrap = document.getElementById('specialImgWrap');
  const specialImg     = document.getElementById('specialImg');
  const specialName    = document.getElementById('specialName');
  const specialDesc    = document.getElementById('specialDesc');
  const specialPrice   = document.getElementById('specialPrice');
  const dotsContainer  = document.getElementById('specialDots');

  if (!specialCard) return;

  // One featured meal per day of the week (index 0 = Monday … 6 = Sunday)
  const specials = [
    {
      day: 'Monday',
      image: 'images/rice-stew-salad-plantain-beef.webp',
      imageAlt: 'Rice, Stew, Salad and Fried Plantain with Beef',
      name: 'Rice, Stew, Salad &amp; Fried Plantain with Beef',
      desc: 'A full, balanced plate — soft rice with rich tomato stew, fresh salad, caramelized plantain, and tender beef.',
      price: '₦1,500'
    },
    {
      day: 'Tuesday',
      image: 'images/jollof-rice-chicken.webp',
      imageAlt: 'Jollof Rice with Chicken',
      name: 'Jollof Rice with Chicken',
      desc: 'Our signature smoky jollof rice paired with golden, crispy fried chicken. A camp classic loved by all.',
      price: '₦1,500'
    },
    {
      day: 'Wednesday',
      image: 'images/porridge-beans-beef.webp',
      imageAlt: 'Porridge Beans with Beef',
      name: 'Porridge Beans with Beef',
      desc: 'Creamy, well-seasoned bean porridge paired with tender fried beef. Hearty and deeply satisfying.',
      price: '₦1,000'
    },
    {
      day: 'Thursday',
      image: 'images/fried-rice-beef.webp',
      imageAlt: 'Fried Rice with Beef',
      name: 'Fried Rice with Beef',
      desc: 'Colourful, well-seasoned fried rice loaded with vegetables and served with tender, juicy beef.',
      price: '₦1,000'
    },
    {
      day: 'Friday',
      image: 'images/egusi-fufu.webp',
      imageAlt: 'Egusi Soup with Fufu',
      name: 'Egusi &amp; Fufu',
      desc: 'Rich, thick egusi soup packed with leafy vegetables, served with soft, smooth cassava fufu.',
      price: '₦1,000'
    },
    {
      day: 'Saturday',
      image: 'images/fried-indomie-egg.webp',
      imageAlt: 'Fried Indomie with Egg',
      name: 'Fried Indomie with Egg',
      desc: 'Stir-fried noodles with vegetables and egg, well seasoned. The quick-fix camp favourite.',
      price: '₦1,000'
    },
    {
      day: 'Sunday',
      image: 'images/oha-soup-fufu.webp',
      imageAlt: 'Oha Soup with Fufu',
      name: 'Oha Soup &amp; Fufu',
      desc: 'An Igbo delicacy made with tender oha leaves and rich palm oil, served with soft, smooth fufu.',
      price: '₦1,000'
    }
  ];

  // JS getDay(): Sunday = 0 … Saturday = 6. Convert to Monday-first index (0-6).
  const jsDay = new Date().getDay();
  const todayIndex = (jsDay + 6) % 7;

  let currentIndex = todayIndex;
  let autoRotateTimer = null;
  const ROTATE_INTERVAL = 6000; // ms — auto-advance every 6 seconds, per spec

  // Build dot indicators
  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    specials.forEach((meal, i) => {
      const dot = document.createElement('button');
      dot.classList.add('special-dot');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `${meal.day}: ${meal.name.replace(/&amp;/g, '&')}`);
      dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
      if (i === currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goToSpecial(i);
        resetTimer();
      });
      dotsContainer.appendChild(dot);
    });
  }

  // Update dot states
  function updateDots(index) {
    if (!dotsContainer) return;
    dotsContainer.querySelectorAll('.special-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
  }

  // Render a meal into the card, with a fade transition
  function renderSpecial(index, animate) {
    const meal = specials[index];

    function applyContent() {
      currentIndex = index;
      if (specialImg) {
        specialImg.src = meal.image;
        specialImg.alt = meal.imageAlt;
        if (specialImgWrap) specialImgWrap.classList.remove('special-img--fallback');
      }
      specialName.innerHTML  = meal.name;
      specialDesc.textContent = meal.desc;
      specialPrice.textContent = meal.price;
      updateDots(currentIndex);
      specialCard.classList.remove('transitioning');
    }

    if (!animate) {
      applyContent();
      return;
    }

    specialCard.classList.add('transitioning');
    setTimeout(applyContent, 500); // matches CSS transition duration
  }

  // Go to a specific meal (used by dots)
  function goToSpecial(index) {
    if (index === currentIndex) return;
    renderSpecial(index, true);
  }

  // Advance to next meal (wraps around the week)
  function nextSpecial() {
    renderSpecial((currentIndex + 1) % specials.length, true);
  }

  // Go to previous meal (wraps around the week)
  function prevSpecial() {
    renderSpecial((currentIndex - 1 + specials.length) % specials.length, true);
  }

  // Reset the auto-rotation timer
  function resetTimer() {
    clearInterval(autoRotateTimer);
    autoRotateTimer = setInterval(nextSpecial, ROTATE_INTERVAL);
  }

  // Pause rotation when user is hovering (desktop)
  specialCard.addEventListener('mouseenter', () => clearInterval(autoRotateTimer));
  specialCard.addEventListener('mouseleave', resetTimer);

  // --- Swipe gestures (mobile) ---
  let touchStartX = 0;
  let touchStartY = 0;

  specialCard.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    clearInterval(autoRotateTimer);
  }, { passive: true });

  specialCard.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const SWIPE_THRESHOLD = 40;

    // Only treat as a swipe if horizontal movement dominates (avoids hijacking vertical scroll)
    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        nextSpecial(); // swipe left -> next
      } else {
        prevSpecial(); // swipe right -> previous
      }
    }
    resetTimer();
  }, { passive: true });

  // Initialise — show today's meal first (no fade on first paint)
  buildDots();
  renderSpecial(todayIndex, false);
  resetTimer();
}


/* ================================================================
   6. ACTIVE NAVIGATION HIGHLIGHTING (while scrolling)
================================================================ */
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: `-${document.getElementById('navbar')?.offsetHeight ?? 72}px 0px -60% 0px`,
    threshold: 0
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');

        navLinks.forEach(link => {
          const linkHref = link.getAttribute('href');
          if (linkHref === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}


/* ================================================================
   7. BACK TO TOP BUTTON
================================================================ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const SHOW_THRESHOLD = 400; // px scrolled before button appears

  function handleScroll() {
    if (window.scrollY > SHOW_THRESHOLD) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // check on load
}


/* ================================================================
   8. SCROLL FADE-IN ANIMATIONS (IntersectionObserver)
================================================================ */
function initFadeInAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in');
  if (!fadeElements.length) return;

  // If browser doesn't support IntersectionObserver, show everything
  if (!('IntersectionObserver' in window)) {
    fadeElements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target); // animate only once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  fadeElements.forEach(el => observer.observe(el));
}


/* ================================================================
   9. FOOTER YEAR (auto-update)
================================================================ */
function initFooterYear() {
  const yearEl = document.getElementById('footerYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}


/* ================================================================
   10. ORDER FORM (Cart + WhatsApp Checkout)
================================================================ */
function initOrderForm() {
  const orderBuilder   = document.getElementById('orderBuilder');
  const sendOrderBtn   = document.getElementById('sendOrderBtn');

  if (!orderBuilder || !sendOrderBtn) return; // Order section not on this page

  // Kitchen's WhatsApp number — kept in sync with the footer/contact WhatsApp links.
  const KITCHEN_WHATSAPP_NUMBER = '2347061208062';

  const orderItems          = document.querySelectorAll('.order-item');
  const summaryList         = document.getElementById('orderSummaryList');
  const summaryEmpty        = document.getElementById('orderSummaryEmpty');
  const totalEl             = document.getElementById('orderTotal');
  const fulfillmentPickup   = document.getElementById('fulfillmentPickup');
  const fulfillmentDelivery = document.getElementById('fulfillmentDelivery');
  const deliveryGroup       = document.getElementById('deliveryLocationGroup');
  const deliverySelect      = document.getElementById('deliveryLocation');
  const customerName        = document.getElementById('customerName');
  const customerPhone       = document.getElementById('customerPhone');
  const customerStateCode   = document.getElementById('customerStateCode');
  const paymentCash         = document.getElementById('paymentCash');
  const paymentTransfer     = document.getElementById('paymentTransfer');
  const bankDetailsCard     = document.getElementById('bankDetailsCard');
  const copyAccountBtn      = document.getElementById('copyAccountBtn');
  const bankAccountNumber   = document.getElementById('bankAccountNumber');
  const copyConfirm         = document.getElementById('copyConfirm');
  const orderNotes          = document.getElementById('orderNotes');
  const orderError          = document.getElementById('orderError');

  const currency = n => `₦${n.toLocaleString('en-NG')}`;

  /* --- Quantity steppers (works for both meals and extras) --- */
  orderItems.forEach(item => {
    const minusBtn = item.querySelector('.qty-minus');
    const plusBtn  = item.querySelector('.qty-plus');
    const qtyEl    = item.querySelector('.qty-value');

    function setQty(qty) {
      qty = Math.max(0, qty);
      qtyEl.textContent = qty;
      item.classList.toggle('has-qty', qty > 0);
      renderSummary();
    }

    plusBtn.addEventListener('click', () => setQty(parseInt(qtyEl.textContent, 10) + 1));
    minusBtn.addEventListener('click', () => setQty(parseInt(qtyEl.textContent, 10) - 1));
  });

  /* --- Render the live order summary (meals + extras + drinks), update total instantly --- */
  function renderSummary() {
    const meals  = [];
    const extras = [];
    const drinks = [];
    let total = 0;

    orderItems.forEach(item => {
      const qty = parseInt(item.querySelector('.qty-value').textContent, 10) || 0;
      if (qty > 0) {
        const price = parseInt(item.dataset.price, 10) || 0;
        const lineTotal = price * qty;
        total += lineTotal;
        const line = { name: item.dataset.name, qty, price, lineTotal };
        if (item.dataset.extra === 'true') {
          extras.push(line);
        } else if (item.dataset.drink === 'true') {
          drinks.push(line);
        } else {
          meals.push(line);
        }
      }
    });

    summaryList.innerHTML = '';

    if (!meals.length && !extras.length && !drinks.length) {
      summaryEmpty.hidden = false;
      summaryList.appendChild(summaryEmpty);
    } else {
      summaryEmpty.hidden = true;

      meals.forEach(line => {
        const row = document.createElement('div');
        row.className = 'order-summary-row';
        row.innerHTML = `<span>${line.qty} × ${line.name}</span><strong>${currency(line.lineTotal)}</strong>`;
        summaryList.appendChild(row);
      });

      extras.forEach(line => {
        const row = document.createElement('div');
        row.className = 'order-summary-row';
        row.innerHTML = `<span>+ ${line.qty} × ${line.name} <em>(extra)</em></span><strong>${currency(line.lineTotal)}</strong>`;
        summaryList.appendChild(row);
      });

      drinks.forEach(line => {
        const row = document.createElement('div');
        row.className = 'order-summary-row';
        row.innerHTML = `<span>+ ${line.qty} × ${line.name} <em>(drink)</em></span><strong>${currency(line.lineTotal)}</strong>`;
        summaryList.appendChild(row);
      });
    }

    totalEl.textContent = currency(total);
    return { meals, extras, drinks, total };
  }

  /* --- Fulfillment type: show/hide delivery location picker --- */
  function updateFulfillmentUI() {
    deliveryGroup.hidden = !fulfillmentDelivery.checked;
  }
  fulfillmentPickup.addEventListener('change', updateFulfillmentUI);
  fulfillmentDelivery.addEventListener('change', updateFulfillmentUI);

  /* --- Payment method: show/hide bank transfer details --- */
  function updatePaymentUI() {
    bankDetailsCard.hidden = !paymentTransfer.checked;
  }
  paymentCash.addEventListener('change', updatePaymentUI);
  paymentTransfer.addEventListener('change', updatePaymentUI);

  /* --- Copy bank account number --- */
  if (copyAccountBtn && bankAccountNumber) {
    copyAccountBtn.addEventListener('click', async () => {
      const number = bankAccountNumber.textContent.trim();
      try {
        await navigator.clipboard.writeText(number);
      } catch {
        // Clipboard API unavailable — fall back silently, number is still visible to copy manually
      }
      if (copyConfirm) {
        copyConfirm.textContent = 'Account number copied.';
        copyConfirm.hidden = false;
        clearTimeout(copyAccountBtn._copyTimer);
        copyAccountBtn._copyTimer = setTimeout(() => {
          copyConfirm.hidden = true;
        }, 2200);
      }
    });
  }

  /* --- Helper: show a validation error inline --- */
  function showError(message, focusEl) {
    orderError.textContent = message;
    orderError.hidden = false;
    if (focusEl) focusEl.focus();
  }
  function clearError() {
    orderError.hidden = true;
    orderError.textContent = '';
  }

  /* --- Build & send the WhatsApp order --- */
  sendOrderBtn.addEventListener('click', () => {
    clearError();

    const { meals, extras, drinks, total } = renderSummary();

    if (!meals.length && !extras.length && !drinks.length) {
      showError('Please select at least one meal before placing your order.');
      orderBuilder.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!meals.length) {
      showError('Please select at least one complete meal (extras and drinks alone can\'t be ordered).');
      orderBuilder.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const name      = customerName.value.trim();
    const phone     = customerPhone.value.trim();
    const stateCode = customerStateCode.value.trim();

    if (!name) {
      showError('Please enter your name.', customerName);
      return;
    }
    if (!phone) {
      showError('Please enter your phone number.', customerPhone);
      return;
    }
    if (!stateCode) {
      showError('Please enter your NYSC state code.', customerStateCode);
      return;
    }

    const isDelivery = fulfillmentDelivery.checked;
    const location   = deliverySelect.value;

    if (isDelivery && !location) {
      showError('Please select a delivery location.', deliverySelect);
      return;
    }

    const paymentMethod = paymentTransfer.checked
      ? paymentTransfer.value
      : paymentCash.value;

    const notes = orderNotes.value.trim();

    // Build the WhatsApp message
    const lines = [];
    lines.push('Hello SAED Kitchen! I\'d like to place an order.');
    lines.push('');
    lines.push('*Selected Meals:*');
    meals.forEach(line => {
      lines.push(`• ${line.qty} × ${line.name} — ${currency(line.lineTotal)}`);
    });
    if (extras.length) {
      lines.push('');
      lines.push('*Extras:*');
      extras.forEach(line => {
        lines.push(`• ${line.qty} × ${line.name} — ${currency(line.lineTotal)}`);
      });
    }
    if (drinks.length) {
      lines.push('');
      lines.push('*Drinks:*');
      drinks.forEach(line => {
        lines.push(`• ${line.qty} × ${line.name} — ${currency(line.lineTotal)}`);
      });
    }
    lines.push('');
    lines.push(`*Estimated Total:* ${currency(total)} (to be confirmed)`);
    lines.push('');
    lines.push(`*Fulfillment:* ${isDelivery ? 'Delivery' : 'Pickup'}`);
    if (isDelivery) {
      lines.push(`*Delivery Location:* ${location}`);
    }
    lines.push(`*Payment:* ${paymentMethod}`);
    lines.push('');
    lines.push(`*Name:* ${name}`);
    lines.push(`*State Code:* ${stateCode}`);
    lines.push(`*Phone:* ${phone}`);
    if (notes) {
      lines.push(`*Additional Notes:* ${notes}`);
    }

    const message = lines.join('\n');
    const url = `https://wa.me/${KITCHEN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  });

  // Initial render (in case of pre-filled state on page refresh)
  renderSummary();
}
