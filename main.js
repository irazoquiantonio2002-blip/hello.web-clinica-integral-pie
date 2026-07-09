/* ================================================================
   FISIOTERAPIA Y REHABILITACIÓN EMERA — main.js
   100% Vanilla JavaScript — Sin librerías externas
   Big Tech Level Animations
   ================================================================ */

'use strict';

/* ── Utilidades ── */
const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ================================================================
   1. LOADER PREMIUM
   ================================================================ */
(function initLoader() {
  const loader  = qs('#page-loader');
  const bar     = qs('#loader-bar');
  if (!loader) return;

  /* Inyectar gradiente SVG para el ring */
  loader.insertAdjacentHTML('afterbegin', `
    <svg width="0" height="0" style="position:absolute">
      <defs>
        <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#2451a0"/>
          <stop offset="100%" stop-color="#4cc44c"/>
        </linearGradient>
      </defs>
    </svg>`);

  /* Simular progreso de carga */
  let progress = 0;
  const tick = setInterval(() => {
    progress += Math.random() * 18 + 4;
    if (progress >= 100) { progress = 100; clearInterval(tick); }
    if (bar) bar.style.width = progress + '%';
  }, 80);

  /* Ocultar loader cuando la página termina de cargar */
  const hide = () => {
    if (bar) bar.style.width = '100%';
    setTimeout(() => {
      loader.classList.add('loader-hidden');
      /* Lanzar animaciones del hero tras el loader */
      setTimeout(revealHero, 200);
    }, 500);
  };

  if (document.readyState === 'complete') {
    setTimeout(hide, 800);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 600));
  }
})();

/* ================================================================
   2. CANVAS DE PARTÍCULAS — hero section
   ================================================================ */
(function initParticles() {
  const canvas = qs('#hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles;
  let raf;

  const COLORS = [
    'rgba(76, 196, 76, 0.55)',
    'rgba(255,255,255, 0.35)',
    'rgba(36, 81, 160, 0.45)',
    'rgba(76, 196, 76, 0.30)',
  ];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    const count = Math.min(Math.floor(W / 12), 90);
    particles = Array.from({ length: count }, () => ({
      x:    Math.random() * W,
      y:    Math.random() * H,
      r:    Math.random() * 2.2 + 0.6,
      dx:   (Math.random() - 0.5) * 0.45,
      dy:   (Math.random() - 0.5) * 0.35 - 0.15,
      alpha: Math.random() * 0.7 + 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.025 + 0.008,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.pulse += p.pulseSpeed;
      const a = p.alpha * (0.65 + 0.35 * Math.sin(p.pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color.replace(/[\d.]+\)$/, a + ')');
      ctx.fill();

      /* Mover */
      p.x += p.dx;
      p.y += p.dy;

      /* Wrap around */
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    });
    raf = requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  /* Parar canvas cuando no está visible (performance) */
  const heroObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(draw); }
      else { cancelAnimationFrame(raf); raf = null; }
    });
  });
  heroObserver.observe(canvas.closest('section'));

  const ro = new ResizeObserver(() => {
    resize();
    createParticles();
  });
  ro.observe(canvas);
})();

/* ================================================================
   3. HERO ENTRY ANIMATION — secuencia tipo Stripe/Apple
   ================================================================ */
function revealHero() {
  const elements = qsa('.hero-el');
  elements.forEach(el => el.classList.add('is-visible'));
}

/* ================================================================
   4. PARALLAX — mouse y scroll
   ================================================================ */
(function initParallax() {
  const heroBg  = qs('#hero-bg-img');
  const heroContent = qs('#hero-content');
  const orbs    = qsa('.orb');
  let mx = 0, my = 0;
  let cx = 0, cy = 0;

  /* Mouse parallax suave con lerp */
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  });

  let rafId;
  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    cx = lerp(cx, mx, 0.06);
    cy = lerp(cy, my, 0.06);

    if (heroBg) {
      heroBg.style.transform = `scale(1.08) translate(${cx * 18}px, ${cy * 12}px)`;
    }

    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 8;
      orb.style.transform =
        `translate(${cx * factor}px, ${cy * factor * 0.7}px)`;
    });

    rafId = requestAnimationFrame(tick);
  }
  tick();

  /* Scroll parallax — contenido del hero se desvanece */
  const hero = qs('#inicio');
  window.addEventListener('scroll', () => {
    if (!hero || !heroContent) return;
    const scrollY = window.scrollY;
    const limit   = window.innerHeight * 0.75;
    if (scrollY < limit) {
      const ratio = scrollY / limit;
      heroContent.style.transform = `translateY(${scrollY * 0.22}px)`;
      heroContent.style.opacity   = `${1 - ratio * 1.1}`;
    }
  }, { passive: true });

  /* Detener tick cuando sale del viewport */
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { tick(); }
    else { cancelAnimationFrame(rafId); }
  });
  if (hero) obs.observe(hero);
})();

/* ================================================================
   5. NAVBAR SCROLL
   ================================================================ */
(function initNavbar() {
  const navbar = qs('#navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  /* Burger */
  const burger = qs('#burger');
  const menu   = qs('#mobile-menu');
  burger?.addEventListener('click', () => {
    const open = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', open);
  });
  qsa('a', menu).forEach(a => a.addEventListener('click', () => menu.classList.add('hidden')));
})();

/* ================================================================
   6. LUCIDE ICONS INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});

/* ================================================================
   7. SCROLL REVEAL — secciones inferiores
   ================================================================ */
(function initScrollReveal() {
  const targets = [
    '.section-header',
    '.service-card',
    '.benefit-item',
    '.info-card',
    '.process-step',
    '.about-image-wrapper',
    '.about-image-wrapper + div > *',
  ];

  targets.forEach(sel => {
    qsa(sel).forEach(el => el.classList.add('animate-on-scroll'));
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      /* Calcular delay basado en posición entre hermanos */
      const siblings = qsa('.animate-on-scroll', target.parentElement);
      const idx = siblings.indexOf(target);
      const delay = idx * 75;
      setTimeout(() => target.classList.add('visible'), delay);
      io.unobserve(target);
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

  qsa('.animate-on-scroll').forEach(el => io.observe(el));
})();

/* ================================================================
   8. TILT 3D SUAVE EN STAT CARDS (mouse hover)
   ================================================================ */
(function initCardTilt() {
  qsa('.stat-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 16;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -16;
      card.style.transform = `translateY(-6px) scale(1.02) rotateX(${y}deg) rotateY(${x}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ================================================================
   9. CONTADOR ANIMADO para stats del hero
   ================================================================ */
(function initCounters() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      const nums = qsa('[data-target]', target);
      nums.forEach(el => {
        const end    = +el.dataset.target;
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        let start = 0;
        const duration = 1200;
        const step = timestamp => {
          if (!step.startTime) step.startTime = timestamp;
          const elapsed = timestamp - step.startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(ease * end);
          el.textContent = prefix + current + suffix;
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      io.unobserve(target);
    });
  }, { threshold: 0.5 });

  const heroCards = qs('#hero-cards') || qs('.hero-el--cards');
  if (heroCards) io.observe(heroCards);
})();

/* ================================================================
   10. SERVICE CARDS STAGGER reveal
   ================================================================ */
(function initServicesReveal() {
  const grid = qs('.services-grid');
  if (!grid) return;

  qsa('.service-card', grid).forEach(c => {
    c.style.opacity   = '0';
    c.style.transform = 'translateY(40px)';
    c.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)';
  });

  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    qsa('.service-card', grid).forEach((card, i) => {
      setTimeout(() => {
        card.style.opacity   = '1';
        card.style.transform = 'translateY(0)';
      }, i * 90);
    });
    io.unobserve(grid);
  }, { threshold: 0.08 });

  io.observe(grid);
})();

/* ================================================================
   11. PROCESS STEPS reveal
   ================================================================ */
(function initProcessReveal() {
  const steps = qsa('.process-step');
  steps.forEach(s => {
    s.style.opacity   = '0';
    s.style.transform = 'translateY(50px) scale(0.96)';
    s.style.transition = 'opacity 0.7s cubic-bezier(0.34,1.56,0.64,1), transform 0.7s cubic-bezier(0.34,1.56,0.64,1)';
  });

  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    steps.forEach((s, i) => {
      setTimeout(() => {
        s.style.opacity   = '1';
        s.style.transform = 'translateY(0) scale(1)';
      }, i * 130);
    });
    io.unobserve(entry.target);
  }, { threshold: 0.15 });

  const container = qs('.process-steps');
  if (container) io.observe(container);
})();

/* ================================================================
   12. SMOOTH SCROLL para anclas
   ================================================================ */
qsa('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = qs(href);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 70,
      behavior: 'smooth',
    });
  });
});

/* ================================================================
   13. WHATSAPP BUTTON — entrada retardada
   ================================================================ */
(function initWAButton() {
  const btn = qs('#whatsapp-float');
  if (!btn) return;
  btn.style.transform = 'scale(0)';
  btn.style.opacity   = '0';
  btn.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease';
  setTimeout(() => {
    btn.style.transform = 'scale(1)';
    btn.style.opacity   = '1';
  }, 2000);
})();

/* ================================================================
   14. FORMULARIO → WHATSAPP
   ================================================================ */
window.handleForm = function(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('button[type="submit"]');
  const originalHTML = btn.innerHTML;

  const nombre   = form.querySelector('input[type="text"]').value.trim();
  const telefono = form.querySelector('input[type="tel"]').value.trim();
  const correo   = form.querySelector('input[type="email"]').value.trim();
  const servicio = form.querySelector('select').value;
  const mensaje  = form.querySelector('textarea').value.trim();

  let waMsg = `¡Hola! Me comunico desde la página web de Fisioterapia y Rehabilitación EMERA.\n\n`;
  waMsg += `👤 *Nombre:* ${nombre}\n`;
  waMsg += `📞 *Teléfono:* ${telefono}\n`;
  if (correo)   waMsg += `📧 *Correo:* ${correo}\n`;
  if (servicio) waMsg += `🦶 *Servicio de interés:* ${servicio}\n`;
  if (mensaje)  waMsg += `\n💬 *Mensaje:* ${mensaje}\n`;
  waMsg += `\nMe gustaría agendar una cita. ¡Gracias!`;

  btn.innerHTML = `<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
  </svg> Enviando...`;
  btn.disabled = true;

  setTimeout(() => {
    window.open(`https://wa.me/5215535226093?text=${encodeURIComponent(waMsg)}`, '_blank');
    btn.innerHTML = originalHTML;
    btn.disabled  = false;
    form.reset();
    if (window.lucide) lucide.createIcons();

    const toast = qs('#toast');
    toast?.classList.remove('hidden');
    toast?.classList.add('show');
    setTimeout(() => {
      toast?.classList.remove('show');
      setTimeout(() => toast?.classList.add('hidden'), 350);
    }, 3500);
  }, 900);
};
