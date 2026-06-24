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
   5. ROTATING "TODAY'S SPECIAL" SECTION
================================================================ */
function initTodaysSpecial() {
  const specialCard  = document.getElementById('specialCard');
  const specialImgWrap = document.getElementById('specialImgWrap');
  const specialImg   = document.getElementById('specialImg');
  const specialName  = document.getElementById('specialName');
  const specialDesc  = document.getElementById('specialDesc');
  const specialPrice = document.getElementById('specialPrice');
  const dotsContainer = document.getElementById('specialDots');

  if (!specialCard) return;

  // Define the rotating specials — image paths match files in /images/
  const specials = [
    {
      image: 'images/jollof-rice-chicken.jpg',
      imageAlt: 'Jollof Rice and Fried Chicken',
      name: 'Jollof Rice & Fried Chicken',
      desc: 'Our signature smoky jollof rice paired with golden, crispy fried chicken. A camp classic loved by all.',
      price: '₦1,500'
    },
    {
      image: 'images/rice-stew-plantain-salad.jpg',
      imageAlt: 'Rice, Stew, Fried Plantain and Salad',
      name: 'Rice & Stew + Fried Plantain + Salad',
      desc: 'Soft rice with rich tomato stew, caramelized sweet plantain, and a fresh coleslaw salad. A full, balanced plate.',
      price: '₦1,800'
    },
    {
      image: 'images/egusi-eba.jpg',
      imageAlt: 'Egusi Soup with Eba',
      name: 'Egusi Soup & Eba',
      desc: 'Thick, aromatic egusi soup loaded with proteins and leafy greens, served with smooth, firm eba. The ultimate combo.',
      price: '₦1,500'
    },
    {
      image: 'images/indomie-egg.jpg',
      imageAlt: 'Indomie Noodles with Boiled Egg',
      name: 'Indomie & Boiled Egg',
      desc: 'Stir-fried noodles with vegetables and seasoning, served with a perfectly boiled egg. Quick, tasty, and filling.',
      price: '₦800'
    },
    {
      image: 'images/porridge-beans-beef.jpg',
      imageAlt: 'Porridge Beans with Fried Beef',
      name: 'Porridge Beans & Fried Beef',
      desc: 'Creamy, well-seasoned bean porridge paired with crispy fried beef. Protein-rich and deeply satisfying.',
      price: '₦1,200'
    }
  ];

  let currentIndex = 0;
  let autoRotateTimer = null;
  const ROTATE_INTERVAL = 4500; // ms between rotations

  // Build dot indicators
  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    specials.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('special-dot');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `View special: ${specials[i].name}`);
      if (i === 0) {
        dot.classList.add('active');
        dot.setAttribute('aria-selected', 'true');
      } else {
        dot.setAttribute('aria-selected', 'false');
      }
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

  // Transition to a specific meal
  function goToSpecial(index) {
    if (index === currentIndex) return;

    // Animate out
    specialCard.classList.add('transitioning');

    setTimeout(() => {
      currentIndex = index;
      const meal = specials[currentIndex];

      // Update image
      if (specialImg) {
        specialImg.src = meal.image;
        specialImg.alt = meal.imageAlt;
        // Reset fallback class so onerror can fire again
        if (specialImgWrap) specialImgWrap.classList.remove('special-img--fallback');
      }
      specialName.textContent  = meal.name;
      specialDesc.textContent  = meal.desc;
      specialPrice.textContent = meal.price;

      updateDots(currentIndex);

      // Animate in
      specialCard.classList.remove('transitioning');
    }, 500); // matches CSS transition duration
  }

  // Advance to next meal
  function nextSpecial() {
    const next = (currentIndex + 1) % specials.length;
    goToSpecial(next);
  }

  // Reset the auto-rotation timer
  function resetTimer() {
    clearInterval(autoRotateTimer);
    autoRotateTimer = setInterval(nextSpecial, ROTATE_INTERVAL);
  }

  // Pause rotation when user is hovering
  specialCard.addEventListener('mouseenter', () => clearInterval(autoRotateTimer));
  specialCard.addEventListener('mouseleave', resetTimer);

  // Initialise
  buildDots();
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

  // Kitchen's WhatsApp number — replace with the real number (same one used
  // for the footer/contact WhatsApp links, kept in sync with those).
  const KITCHEN_WHATSAPP_NUMBER = '2348000000000';

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
  const orderNotes          = document.getElementById('orderNotes');
  const orderError          = document.getElementById('orderError');

  const currency = n => `₦${n.toLocaleString('en-NG')}`;

  /* --- Quantity steppers --- */
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

  /* --- Render the order summary panel from current item quantities --- */
  function renderSummary() {
    const selected = [];
    let total = 0;

    orderItems.forEach(item => {
      const qty = parseInt(item.querySelector('.qty-value').textContent, 10) || 0;
      if (qty > 0) {
        const price = parseInt(item.dataset.price, 10) || 0;
        const lineTotal = price * qty;
        total += lineTotal;
        selected.push({ name: item.dataset.name, qty, price, lineTotal });
      }
    });

    summaryList.innerHTML = '';

    if (!selected.length) {
      summaryEmpty.hidden = false;
      summaryList.appendChild(summaryEmpty);
    } else {
      summaryEmpty.hidden = true;
      selected.forEach(line => {
        const row = document.createElement('div');
        row.className = 'order-summary-row';
        row.innerHTML = `<span>${line.qty} × ${line.name}</span><strong>${currency(line.lineTotal)}</strong>`;
        summaryList.appendChild(row);
      });
    }

    totalEl.textContent = currency(total);
    return { selected, total };
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
      const original = copyAccountBtn.textContent;
      copyAccountBtn.textContent = 'Copied!';
      copyAccountBtn.classList.add('copied');
      setTimeout(() => {
        copyAccountBtn.textContent = original;
        copyAccountBtn.classList.remove('copied');
      }, 1800);
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

    const { selected, total } = renderSummary();

    if (!selected.length) {
      showError('Please select at least one item before placing your order.');
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

    // Build the message
    const lines = [];
    lines.push('Hello SAED Kitchen! I\'d like to place an order.');
    lines.push('');
    lines.push('*Order:*');
    selected.forEach(line => {
      lines.push(`• ${line.qty} × ${line.name} — ${currency(line.lineTotal)}`);
    });
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
      lines.push(`*Notes:* ${notes}`);
    }

    const message = lines.join('\n');
    const url = `https://wa.me/${KITCHEN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  });

  // Initial render (in case of pre-filled state on page refresh)
  renderSummary();
}
