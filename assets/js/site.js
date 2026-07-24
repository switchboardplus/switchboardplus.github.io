(() => {
  'use strict';

  // Mobile navigation toggle
  const btn = document.querySelector('button[aria-controls="mobile-navigation"]');
  const panel = document.getElementById('mobile-menu-panel');
  if (btn && panel) {
    const iconMenu = btn.querySelector('.lucide-menu');
    const iconX = btn.querySelector('.lucide-x');
    const setOpen = (open) => {
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      iconMenu.classList.toggle('hidden', open);
      iconX.classList.toggle('hidden', !open);
    };
    btn.addEventListener('click', () => setOpen(panel.hidden));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) {
        setOpen(false);
        btn.focus();
      }
    });
    panel.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });
  }

  // Scroll-reveal for [data-motion] sections
  const motionEls = document.querySelectorAll('[data-motion]');
  if (
    motionEls.length &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    'IntersectionObserver' in window
  ) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -7% 0px' });
    motionEls.forEach((el) => io.observe(el));
  } else {
    motionEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Quote form: compose an email draft
  const form = document.querySelector('form[aria-describedby="quote-form-note"]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const subject = 'Switchboard Plus quote request';
      const lines = [
        'Name: ' + (d.get('name') || ''),
        'Business: ' + (d.get('business') || ''),
        'Phone: ' + (d.get('phone') || ''),
        'Email: ' + (d.get('email') || ''),
        '',
        'What should work better: ' + (d.get('message') || '')
      ];
      window.location.href = 'mailto:connect@switchboard-plus.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
    });
  }
})();
