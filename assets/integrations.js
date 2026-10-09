(() => {
  'use strict';

  const root = document.documentElement;
  const section = document.querySelector('.sb-integrations');
  if (!section) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tabs = Array.from(section.querySelectorAll('[role="tab"]'));
  const panel = section.querySelector('#integration-panel');
  const indicator = section.querySelector('.sb-tab-indicator');
  const platformList = section.querySelector('#platform-list');
  const toggle = section.querySelector('.sb-motion-toggle');
  let paused = false;
  let selected = 'crm';

  const categories = {
    crm: {
      kicker: 'Customer relationship management',
      title: 'Customer history, ready at pickup.',
      description: 'Keep the next conversation in context.',
      platforms: [['Salesforce', 'salesforce'], ['HubSpot', 'hubspot'], ['Pipedrive', 'pipedrive']]
    },
    erp: {
      kicker: 'Enterprise resource planning',
      title: 'Account context follows the route.',
      description: 'Bring the right account details into view.',
      platforms: [['SAP', 'sap'], ['NetSuite', 'netsuite'], ['Dynamics 365', 'dynamics365']]
    },
    pms: {
      kicker: 'Property management systems',
      title: 'Availability stays in view.',
      description: 'Keep property context close to the conversation.',
      platforms: [['AppFolio', 'appfolio'], ['Buildium', 'buildium'], ['RealPage', 'realpage']]
    },
    emr: {
      kicker: 'Electronic medical records',
      title: 'Protected context stays protected.',
      description: 'A thoughtful handoff for sensitive conversations.',
      platforms: [['Epic', 'epic'], ['Oracle Health', 'oracle'], ['athenahealth', 'athenahealth']]
    }
  };

  // Preload original marks so user-triggered transitions never reveal broken placeholders.
  Object.values(categories).forEach(category => {
    category.platforms.forEach(([, file]) => {
      const image = new Image();
      image.src = `assets/providers/${file}.svg`;
    });
  });

  function createPlatform(name, file, animate) {
    const item = document.createElement('div');
    item.className = 'sb-platform' + (animate ? ' sb-logo-enter' : '');
    const icon = document.createElement('span');
    icon.className = 'sb-platform-icon';
    const image = document.createElement('img');
    image.src = `assets/providers/${file}.svg`;
    image.alt = '';
    image.width = 48;
    image.height = 48;
    icon.append(image);
    const label = document.createElement('span');
    label.textContent = name;
    item.append(icon, label);
    if (animate) item.addEventListener('animationend', () => item.classList.remove('sb-logo-enter'), { once: true });
    return item;
  }

  function selectCategory(key, focus = false) {
    const category = categories[key];
    if (!category || (key === selected && !focus)) return;
    selected = key;
    let index = 0;
    tabs.forEach((tab, i) => {
      const active = tab.dataset.category === key;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active) {
        index = i;
        panel.setAttribute('aria-labelledby', tab.id);
        if (focus) tab.focus({ preventScroll: true });
      }
    });
    indicator.style.transform = `translateX(${index * 100}%)`;
    section.querySelector('#category-kicker').textContent = category.kicker;
    section.querySelector('#category-title').textContent = category.title;
    section.querySelector('#category-description').textContent = category.description;
    const animate = !reducedMotion.matches && !paused;
    platformList.replaceChildren(...category.platforms.map(([name, file]) => createPlatform(name, file, animate)));
    panel.classList.remove('sb-panel-enter');
    if (animate) {
      // Cancel a running category animation when users switch quickly, then animate new content.
      if (panel.animate) {
        panel.getAnimations().forEach(animation => animation.cancel());
        panel.animate([
          { opacity: 0, transform: 'translateY(9px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 350, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
      } else {
        panel.classList.add('sb-panel-enter');
      }
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectCategory(tab.dataset.category));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectCategory(tabs[next].dataset.category, true);
      }
    });
  });

  function updateMotion() {
    section.classList.toggle('sb-paused', paused || reducedMotion.matches);
    root.classList.toggle('sb-motion-paused', paused);
    toggle.disabled = reducedMotion.matches;
    toggle.setAttribute('aria-pressed', String(paused || reducedMotion.matches));
    toggle.querySelector('span').textContent = reducedMotion.matches ? 'Reduced motion' : (paused ? 'Resume motion' : 'Pause motion');
    toggle.querySelector('svg').innerHTML = paused && !reducedMotion.matches
      ? '<path d="m5 3 7 5-7 5Z" fill="currentColor"/>'
      : '<path d="M5 3v10M11 3v10" stroke="currentColor" stroke-width="2"/>';
    if (paused || reducedMotion.matches) {
      panel.getAnimations?.().forEach(animation => animation.finish());
      document.querySelectorAll('[data-reveal]').forEach(element => element.classList.add('sb-revealed'));
    }
  }
  toggle.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reducedMotion.addEventListener('change', updateMotion);
  updateMotion();

  if ('IntersectionObserver' in window) {
    root.classList.add('sb-js');
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('sb-revealed');
        if (entry.target.classList.contains('sb-workspace-wrap') && !reducedMotion.matches && !paused) {
          platformList.querySelectorAll('.sb-platform').forEach(item => {
            item.classList.add('sb-logo-enter');
            item.addEventListener('animationend', () => item.classList.remove('sb-logo-enter'), { once: true });
          });
        }
        reveal.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(element => reveal.observe(element));

    const visibility = new IntersectionObserver(entries => {
      section.classList.toggle('sb-offscreen', !entries[0].isIntersecting);
    }, { threshold: 0.05 });
    visibility.observe(section);
  }

  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('sb-page-hidden', document.hidden);
  });

  // One requestAnimationFrame per scroll frame; decorative progress never shifts layout.
  const progress = document.querySelector('.sb-scroll-progress');
  let ticking = false;
  function updateProgress() {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = available > 0 ? Math.min(1, window.scrollY / available) : 0;
    if (progress) progress.style.transform = `scaleX(${fraction})`;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  const channel = section.querySelector('.sb-channel');
  const measureChannel = () => channel.style.setProperty('--sb-travel', `${Math.max(0, channel.clientWidth - 7)}px`);
  measureChannel();
  if ('ResizeObserver' in window) {
    new ResizeObserver(measureChannel).observe(channel);
  } else {
    window.addEventListener('resize', measureChannel);
  }

})();
