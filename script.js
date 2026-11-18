(() => {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  const header = document.querySelector('.site-header');

  const closeMenu = () => {
    if (!nav || !menuToggle) return;
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  };

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', event => {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(event.target) || menuToggle.contains(event.target)) return;
      closeMenu();
    });
  }

  if (header) {
    const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  // Nav pill active state: click + document-order scroll spy.
  const sectionNavLinks = Array.from(document.querySelectorAll('.nav-links > a[href^="#"]'));
  let navLockUntil = 0;

  const setActiveNavLink = link => {
    sectionNavLinks.forEach(item => {
      const isActive = item === link;
      item.classList.toggle('is-active', isActive);
      if (isActive) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    });
  };

  if (sectionNavLinks.length) {
    const navSections = sectionNavLinks
      .map(link => {
        const id = link.getAttribute('href').slice(1);
        const section = document.getElementById(id);
        return section ? { link, section } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.section.offsetTop - b.section.offsetTop);

    sectionNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        setActiveNavLink(link);
        navLockUntil = performance.now() + 900;
      });
    });

    const syncActiveFromScroll = () => {
      if (performance.now() < navLockUntil) return;
      const marker = (header?.getBoundingClientRect().height || 118) + 28;
      let current = navSections[0];
      for (const entry of navSections) {
        if (entry.section.getBoundingClientRect().top <= marker) current = entry;
      }
      if (window.scrollY < 40 && navSections[0]) current = navSections[0];
      if (current) setActiveNavLink(current.link);
    };

    const hashLink = sectionNavLinks.find(link => link.getAttribute('href') === window.location.hash);
    if (hashLink) setActiveNavLink(hashLink);
    else syncActiveFromScroll();

    window.addEventListener('scroll', syncActiveFromScroll, { passive: true });
    window.addEventListener('hashchange', () => {
      const link = sectionNavLinks.find(item => item.getAttribute('href') === window.location.hash);
      if (link) {
        setActiveNavLink(link);
        navLockUntil = performance.now() + 900;
      }
    });
  }

  const year = document.getElementById('current-year');
  if (year) year.textContent = String(new Date().getFullYear());

  const counters = document.querySelectorAll('.count-up[data-count]');
  const animateCounter = element => {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target)) return;
    const suffix = element.dataset.suffix || '';
    const duration = 2400;
    const start = performance.now();
    const formatValue = value => {
      const rounded = Math.round(value);
      const formatted = target >= 1000 ? rounded.toLocaleString('en-IN') : String(rounded);
      return `${formatted}${suffix}`;
    };
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = formatValue(target * eased);
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
    }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });
    counters.forEach(counter => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  // Reveal motion — skip hero ticker stats; mark visible reliably.
  const revealTargets = document.querySelectorAll(
    '.mission-card, .leader-card, .pillar-card, .focus-card, .project-card, .process-step, .resource-card, .press-card, .partner-card'
  );
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    document.documentElement.classList.add('reveal-ready');
    revealTargets.forEach(item => item.classList.add('reveal'));
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    revealTargets.forEach(item => revealObserver.observe(item));
    // Safety pass for anything already on-screen after layout.
    requestAnimationFrame(() => {
      revealTargets.forEach(item => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
          item.classList.add('is-visible');
          revealObserver.unobserve(item);
        }
      });
    });
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
