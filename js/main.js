/**
 * Eneritz Burgoa — Portfolio
 * Lógica de interfaz: preloader, reloj, rotación de palabra y forma,
 * progreso de scroll, revelado, cursor personalizado, hover magnético
 * y contadores.
 *
 * Sin dependencias. Se carga con `defer`, por lo que el DOM ya existe.
 */

(function () {
  'use strict';

  /* ======================================================================
     Constantes de configuración
     ====================================================================== */

  /** Palabras que rotan en el titular del hero. */
  const CYCLE_WORDS = ['CÓDIGO', 'MARCA', 'TIPO', 'COLOR'];

  /** Siluetas y colores flúor de la forma orgánica del hero. */
  const SHAPE_STATES = [
    { borderRadius: '38% 62% 63% 37% / 41% 44% 56% 59%', color: 'var(--shape-green)' },
    { borderRadius: '63% 37% 54% 46% / 30% 63% 37% 70%', color: 'var(--shape-pink)' },
    { borderRadius: '20% 80% 65% 35% / 60% 25% 75% 40%', color: 'var(--shape-orange)' },
    { borderRadius: '75% 25% 35% 65% / 35% 70% 30% 65%', color: 'var(--shape-cyan)' },
    { borderRadius: '45% 55% 75% 25% / 65% 35% 65% 35%', color: 'var(--shape-purple)' }
  ];

  const CYCLE_INTERVAL_MS = 2600;   // ritmo compartido palabra + forma
  const CLOCK_INTERVAL_MS = 15000;
  const PRELOADER_STEP_MS = 45;
  const PRELOADER_EXIT_MS = 350;
  const COUNTER_DURATION_MS = 1200;
  const CURSOR_EASING = 0.18;
  const MAGNETIC_STRENGTH = 0.3;
  const REVEAL_THRESHOLD = 0.15;
  const COUNTER_THRESHOLD = 0.6;
  const TIME_ZONE = 'Europe/Madrid';

  /* ======================================================================
     Utilidades
     ====================================================================== */

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(pointer:fine)').matches;
  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));

  /**
   * Observa elementos y ejecuta un callback la primera vez que son visibles.
   * Si no hay IntersectionObserver o se pide movimiento reducido, actúa al instante.
   */
  function observeOnce(elements, threshold, onEnter) {
    if (!elements.length) return;

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      elements.forEach(onEnter);
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        onEnter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: threshold });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ======================================================================
     Preloader
     ====================================================================== */

  function initPreloader() {
    const preloader = $('[data-preloader]');
    const output = $('[data-preloader-pct]');
    if (!preloader) return;

    const hide = function () {
      preloader.classList.add('is-hidden');
      preloader.setAttribute('aria-hidden', 'true');
    };

    if (prefersReducedMotion) {
      if (output) output.textContent = '100%';
      hide();
      return;
    }

    let pct = 0;
    const tick = function () {
      pct = Math.min(100, pct + Math.ceil(Math.random() * 10) + 4);
      if (output) output.textContent = pct + '%';
      if (pct < 100) {
        window.setTimeout(tick, PRELOADER_STEP_MS);
      } else {
        window.setTimeout(hide, PRELOADER_EXIT_MS);
      }
    };

    tick();
  }

  /* ======================================================================
     Reloj local de Bilbao
     ====================================================================== */

  function initClock() {
    const outputs = $$('[data-clock]');
    if (!outputs.length) return;

    const formatter = new Intl.DateTimeFormat('es-ES', {
      timeZone: TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit'
    });

    const update = function () {
      const label = 'Bilbao — ' + formatter.format(new Date());
      outputs.forEach(function (el) { el.textContent = label; });
    };

    update();
    window.setInterval(update, CLOCK_INTERVAL_MS);
  }

  /* ======================================================================
     Palabra rotatoria + forma orgánica (mismo ritmo)
     ====================================================================== */

  function initCycle() {
    const word = $('[data-cycle-word]');
    const shape = $('[data-hero-shape]');
    if (prefersReducedMotion || (!word && !shape)) return;

    let index = 0;

    window.setInterval(function () {
      index += 1;
      if (word) {
        word.textContent = CYCLE_WORDS[index % CYCLE_WORDS.length];
      }
      if (shape) {
        const state = SHAPE_STATES[index % SHAPE_STATES.length];
        shape.style.borderRadius = state.borderRadius;
        shape.style.background = state.color;
      }
    }, CYCLE_INTERVAL_MS);
  }

  /* ======================================================================
     Barra de progreso de scroll
     ====================================================================== */

  function initScrollProgress() {
    const bar = $('[data-scroll-progress]');
    if (!bar) return;

    const update = function () {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      bar.style.width = pct + '%';
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ======================================================================
     Revelado al hacer scroll
     ====================================================================== */

  function initReveal() {
    observeOnce($$('.reveal'), REVEAL_THRESHOLD, function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ======================================================================
     Contadores numéricos
     ====================================================================== */

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-counter'), 10) || 0;

    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString('es-ES');
      return;
    }

    let startTime = null;
    const step = function (timestamp) {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / COUNTER_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString('es-ES');
      if (progress < 1) window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  }

  function initCounters() {
    observeOnce($$('[data-counter]'), COUNTER_THRESHOLD, animateCounter);
  }

  /* ======================================================================
     Navegación
     ====================================================================== */

  function initNavigation() {
    const toggle = $('[data-nav-toggle]');
    const panel = $('[data-nav-panel]');

    const closePanel = function () {
      if (!toggle || !panel) return;
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    };

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        const isOpen = panel.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closePanel();
      });
    }

    // Scroll suave para los enlaces internos
    $$('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        closePanel();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    });
  }

  /* ======================================================================
     Cursor personalizado
     ====================================================================== */

  function initCursor() {
    const cursor = $('[data-cursor]');
    if (!cursor) return;

    if (!hasFinePointer || prefersReducedMotion) {
      cursor.style.display = 'none';
      return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;

    window.addEventListener('mousemove', function (event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
    });

    const render = function () {
      currentX += (mouseX - currentX) * CURSOR_EASING;
      currentY += (mouseY - currentY) * CURSOR_EASING;
      cursor.style.left = currentX + 'px';
      cursor.style.top = currentY + 'px';
      window.requestAnimationFrame(render);
    };
    render();

    // Aumenta de tamaño sobre elementos clicables
    $$('a, button, [role="button"]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hovering'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hovering'); });
    });
  }

  /* ======================================================================
     Hover magnético
     ====================================================================== */

  function initMagnetic() {
    if (!hasFinePointer || prefersReducedMotion) return;

    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (event) {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * MAGNETIC_STRENGTH;
        const y = (event.clientY - rect.top - rect.height / 2) * MAGNETIC_STRENGTH;
        el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });

      el.addEventListener('mouseleave', function () {
        el.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ======================================================================
     Etiqueta "Ver proyecto" que sigue al puntero
     ====================================================================== */

  function initProjectLabels() {
    if (!hasFinePointer || prefersReducedMotion) return;

    $$('.project').forEach(function (card) {
      const label = $('.project__follow', card);
      if (!label) return;

      card.addEventListener('mousemove', function (event) {
        const rect = card.getBoundingClientRect();
        label.style.left = (event.clientX - rect.left) + 'px';
        label.style.top = (event.clientY - rect.top) + 'px';
        label.style.opacity = '1';
        label.style.transform = 'translate(-50%,-50%) scale(1)';
      });

      card.addEventListener('mouseleave', function () {
        label.style.opacity = '0';
        label.style.transform = 'translate(-50%,-50%) scale(.6)';
      });
    });
  }

  /* ======================================================================
     Sustituto para imágenes remotas que no cargan
     ====================================================================== */

  function initImageFallbacks() {
    $$('.project__img').forEach(function (img) {
      img.addEventListener('error', function () {
        const media = img.closest('.project__media');
        if (!media) return;

        const fallback = document.createElement('span');
        fallback.className = 'project__fallback';
        fallback.setAttribute('aria-hidden', 'true');
        fallback.textContent = img.getAttribute('data-initial') || '?';

        media.appendChild(fallback);
        img.remove();
      });
    });
  }

  /* ======================================================================
     Arranque
     ====================================================================== */

  initPreloader();
  initClock();
  initCycle();
  initScrollProgress();
  initReveal();
  initCounters();
  initNavigation();
  initCursor();
  initMagnetic();
  initProjectLabels();
  initImageFallbacks();
})();
