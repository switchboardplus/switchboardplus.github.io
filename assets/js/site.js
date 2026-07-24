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

  // Quote form: submit to the Switchboard Plus form handler
  const form = document.querySelector('form[aria-describedby="quote-form-note"]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const status = document.getElementById('quote-form-status');
      btn.disabled = true;
      fetch(form.action, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams(new FormData(form))
      }).then(() => {
        form.reset();
        status.textContent = 'Thank you, We have received your message.';
        status.classList.remove('hidden');
      }).catch(() => {
        status.textContent = 'Something went wrong sending your message. Please call 845 444 8273 or email connect@switchboard-plus.com.';
        status.classList.remove('hidden');
        btn.disabled = false;
      });
    });
  }
})();
