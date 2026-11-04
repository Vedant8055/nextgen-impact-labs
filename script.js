const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

// Current year and scroll progress
$('#year').textContent = new Date().getFullYear();
const progress = $('#scrollProgress');
const header = $('.site-header');
const updateScroll = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  header.classList.toggle('scrolled', window.scrollY > 12);
};
window.addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

// Mobile navigation
const menuToggle = $('#menuToggle');
const mobileMenu = $('#mobileMenu');
menuToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuToggle.classList.toggle('active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
$$('#mobileMenu a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  menuToggle.classList.remove('active');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

// Desktop nav oval active state
const desktopNavLinks = $$('.desktop-nav a');
const setActiveNav = (link) => {
  desktopNavLinks.forEach(a => a.classList.toggle('is-active', a === link));
};
desktopNavLinks.forEach(link => {
  link.addEventListener('click', () => setActiveNav(link));
});
const syncNavFromHash = () => {
  const hash = location.hash;
  if (!hash) return;
  const match = desktopNavLinks.find(a => a.getAttribute('href') === hash);
  if (match) setActiveNav(match);
};
window.addEventListener('hashchange', syncNavFromHash);
syncNavFromHash();

// Scroll reveals
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => revealObserver.observe(el));

// Information modal for focus areas and idea cards
const pillarDetails = {
  education: {
    kicker: 'PILLAR 01 · LEARN', title: 'Education & digital empowerment',
    body: 'Learning opens doors. This focus area explores ways to support digital literacy, STEM curiosity, practical skills and more inclusive learning opportunities. Specific programmes will be shaped with educators and community partners.',
    tags: ['Digital literacy', 'STEM awareness', 'Mentorship', 'Future-ready skills', 'Responsible technology']
  },
  environment: {
    kicker: 'PILLAR 02 · PROTECT', title: 'Environment & climate action',
    body: 'A healthier future depends on how we care for the resources around us. This focus area explores environmental awareness, water conservation, waste reduction, tree care and sustainable everyday choices.',
    tags: ['Water conservation', 'Waste awareness', 'Tree care', 'Climate education', 'Sustainable living']
  },
  health: {
    kicker: 'PILLAR 03 · WELLBEING', title: 'Health & community wellbeing',
    body: 'Wellbeing grows when people can access useful information and supportive communities. This focus area may include age-appropriate awareness around preventive health, hygiene, inclusion and community wellbeing.',
    tags: ['Health awareness', 'Hygiene', 'Inclusion', 'Preventive education', 'Community wellbeing']
  },
  innovation: {
    kicker: 'PILLAR 04 · IMAGINE', title: 'Youth innovation & social entrepreneurship',
    body: 'Young people can help frame problems and explore fresh approaches. This focus area creates room for ideation, mentorship, prototypes, community problem-solving and responsible social entrepreneurship.',
    tags: ['Innovation challenges', 'Social entrepreneurship', 'Prototyping', 'Mentorship', 'Community solutions']
  },
  learning: {
    kicker: 'IDEA EXPLORER · LEARNING', title: 'Digital confidence for a changing world',
    body: 'An area to explore how young people can build confidence with digital tools, learn to evaluate information and discover future-facing skills. This is a possible programme theme, not a completed NextGen project.',
    tags: ['Digital literacy', 'Online safety', 'STEM activities', 'Creative problem-solving']
  },
  planet: {
    kicker: 'IDEA EXPLORER · PLANET', title: 'Small actions for a healthier planet',
    body: 'A possible focus on practical environmental learning: understanding water, reducing waste, caring for green spaces and encouraging sustainable habits with communities.',
    tags: ['Water awareness', 'Waste reduction', 'Tree care', 'Sustainable habits']
  },
  wellbeing: {
    kicker: 'IDEA EXPLORER · WELLBEING', title: 'Knowledge that supports wellbeing',
    body: 'A possible focus on clear, age-appropriate information about health, hygiene, inclusion and everyday wellbeing, delivered with qualified and responsible partners where required.',
    tags: ['Health information', 'Hygiene awareness', 'Inclusion', 'Community support']
  }
};
const modal = $('#infoModal');
function openModal(key) {
  const data = pillarDetails[key];
  if (!data) return;
  $('#modalKicker').textContent = data.kicker;
  $('#modalTitle').textContent = data.title;
  $('#modalBody').textContent = data.body;
  $('#modalList').innerHTML = data.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('#modalClose').focus();
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
$$('[data-open-pillar]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.openPillar)));
$$('[data-story]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.story)));
$('#modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
$('#modalAction').addEventListener('click', () => { closeModal(); location.hash = '#contact'; });

// Theme filters
$$('.filter-btn').forEach(button => button.addEventListener('click', () => {
  $$('.filter-btn').forEach(btn => btn.classList.toggle('active', btn === button));
  const filter = button.dataset.filter;
  $$('.story-card').forEach(card => card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter));
}));

// Involvement actions pre-select the enquiry topic
$$('[data-open-form]').forEach(button => button.addEventListener('click', () => {
  const wanted = button.dataset.openForm;
  const select = $('select[name="interest"]');
  const map = { 'Volunteer':'Volunteering', 'Mentor':'Mentorship', 'Partner':'Institutional partnership', 'Share an idea':'Sharing an idea' };
  select.value = map[wanted] || '';
  $('#contactForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => $('input[name="name"]').focus({ preventScroll: true }), 500);
  showToast(`${wanted}: tell us a little more in the enquiry form.`);
}));

// Prototype-only contact form: deliberately does not transmit personal data
$('#contactForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  $('#formSuccess').classList.add('visible');
  form.reset();
  showToast('Demo interaction complete — no email was sent.');
});

let toastTimer;
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3300);
}

// Graceful image fallback: keep each card visually rich if a remote image is unavailable.
$$('.pillar-image, .story-image, .hero-photo, .region-visual-bg').forEach(el => {
  const image = getComputedStyle(el).backgroundImage;
  const match = image.match(/url\(["']?(.*?)["']?\)/);
  if (!match) return;
  const probe = new Image();
  probe.onerror = () => el.classList.add('image-fallback');
  probe.src = match[1];
});
