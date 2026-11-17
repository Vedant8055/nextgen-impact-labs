(() => {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  const navLinks = nav ? nav.querySelectorAll('a') : [];

  if (menuToggle && nav) {
    const closeMenu = () => {
      nav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    };
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
    navLinks.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const header = document.querySelector('.site-header');
  if (header) {
    const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  const year = document.getElementById('current-year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Count-up animation is intentionally limited to the verified platform snapshot.
  const counters = document.querySelectorAll('.count-up[data-count]');
  const animateCounter = element => {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) return;
    const duration = 900;
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(target * eased)).padStart(2, '0');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.55 });
    counters.forEach(counter => counterObserver.observe(counter));
  }

  // Subtle reveal motion, with a graceful no-JS / reduced-motion fallback.
  const revealTargets = document.querySelectorAll('.mission-card, .snapshot-stat, .leader-card, .pillar-card, .project-card, .process-step, .resource-card, .press-card, .partner-card');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reveal-ready');
    revealTargets.forEach(item => item.classList.add('reveal'));
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(item => revealObserver.observe(item));
  }

  // Accessible project gallery lightbox.
  const galleryItems = Array.from(document.querySelectorAll('[data-gallery]'));
  const lightbox = document.querySelector('.lightbox');
  if (galleryItems.length && lightbox) {
    const lightboxImage = lightbox.querySelector('img');
    const caption = lightbox.querySelector('figcaption');
    const closeButton = lightbox.querySelector('.lightbox-close');
    const prevButton = lightbox.querySelector('.lightbox-prev');
    const nextButton = lightbox.querySelector('.lightbox-next');
    let currentIndex = 0;
    let previousFocus = null;
    const getItemContent = index => {
      const item = galleryItems[index];
      const img = item.querySelector('img');
      const title = item.querySelector('.gallery-caption strong')?.textContent || img.alt;
      const detail = item.querySelector('.gallery-caption small')?.textContent || '';
      return { src: img.currentSrc || img.src, alt: img.alt, caption: detail ? `${title} — ${detail}` : title };
    };
    const showItem = index => {
      currentIndex = (index + galleryItems.length) % galleryItems.length;
      const content = getItemContent(currentIndex);
      lightboxImage.src = content.src;
      lightboxImage.alt = content.alt;
      caption.textContent = content.caption;
    };
    const open = index => {
      previousFocus = document.activeElement;
      showItem(index);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeButton.focus();
    };
    const close = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    };
    galleryItems.forEach((item, index) => item.addEventListener('click', () => open(index)));
    closeButton.addEventListener('click', close);
    prevButton.addEventListener('click', () => showItem(currentIndex - 1));
    nextButton.addEventListener('click', () => showItem(currentIndex + 1));
    lightbox.addEventListener('click', event => { if (event.target === lightbox) close(); });
    document.addEventListener('keydown', event => {
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') showItem(currentIndex - 1);
      if (event.key === 'ArrowRight') showItem(currentIndex + 1);
    });
  }
})();
