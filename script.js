/* =============================================
   LATAWA REAL ESTATE — script.js (v3)
   - Native scroll (no Lenis = no lag)
   - Default system cursor
   - Lightweight animations
   - Hero intro now animates pre-existing markup
     (fixes headline rendering twice after preload)
   ============================================= */

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_MOBILE = window.innerWidth <= 768;

/* =============================================
   1. PRELOADER
   ============================================= */
function initPreloader() {
  return new Promise((resolve) => {
    const preloader = document.getElementById('preloader');
    const fill = document.getElementById('preloaderFill');
    let progress = 0;

    const step = () => {
      progress += Math.random() * 20 + 8;
      if (progress >= 100) {
        progress = 100;
        fill.style.width = '100%';
        gsap.to(preloader, {
          opacity: 0, duration: 0.6, delay: 0.2,
          onComplete: () => { preloader.style.display = 'none'; resolve(); }
        });
        return;
      }
      fill.style.width = progress + '%';
      setTimeout(step, 120);
    };
    step();
  });
}

/* =============================================
   2. SMOOTH ANCHOR LINKS (native, no Lenis)
   ============================================= */
function initSmoothLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const offset = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: offset, behavior: 'smooth' });
          closeMobileMenu();
        }
      }
    });
  });
}

/* =============================================
   3. NAVBAR
   ============================================= */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* =============================================
   4. MOBILE MENU
   ============================================= */
function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  if (!menu) return;
  menu.classList.remove('open');
  hamburger.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => { menu.style.display = 'none'; }, 400);
}

function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!hamburger || !menu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = menu.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      menu.style.display = 'flex';
      requestAnimationFrame(() => menu.classList.add('open'));
      hamburger.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    const spans = hamburger.querySelectorAll('span');
    if (!menu.classList.contains('open')) {
      gsap.to(spans[0], { rotate: 45, y: 6.5, duration: 0.3 });
      gsap.to(spans[1], { opacity: 0, duration: 0.2 });
      gsap.to(spans[2], { rotate: -45, y: -6.5, duration: 0.3 });
    } else {
      gsap.to(spans[0], { rotate: 0, y: 0, duration: 0.3 });
      gsap.to(spans[1], { opacity: 1, duration: 0.2 });
      gsap.to(spans[2], { rotate: 0, y: 0, duration: 0.3 });
    }
  });
}

/* =============================================
   5. HERO INTRO
   ============================================= */
function initHeroIntro() {
  // Markup already contains .hero-line > .hero-line-inner (see index.html).
  // CSS hides .hero-line-inner by default (opacity:0, translateY(105%))
  // so there is no flash of unanimated text before GSAP takes over.
  // Previously this function rewrote .innerHTML at runtime to inject the
  // wrapper span, which left the raw text visible at full opacity for a
  // moment right after the preloader faded — reading as if the headline
  // rendered twice. Animating the pre-built markup removes that flash.
  if (PREFERS_REDUCED) {
    gsap.set('.hero-line-inner', { opacity: 1, y: 0 });
    gsap.set('.hero-eyebrow, .hero-sub, .hero-btns', { opacity: 1, y: 0 });
    return;
  }

  const tl = gsap.timeline({ delay: 0.2 });
  tl.to('.hero-line-inner', {
    y: '0%', opacity: 1, duration: 1, ease: 'power4.out', stagger: 0.12
  })
  .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.15)
  .to('.hero-sub', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
  .to('.hero-btns', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4');
}

/* =============================================
   6. HERO PARTICLES (lightweight)
   ============================================= */
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container || PREFERS_REDUCED || IS_MOBILE) return;
  const count = 20;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 2.5 + 1;
    Object.assign(p.style, {
      position: 'absolute',
      width: size + 'px', height: size + 'px',
      borderRadius: '50%',
      background: `rgba(255,255,255,${Math.random() * 0.25 + 0.06})`,
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      pointerEvents: 'none'
    });
    container.appendChild(p);
    gsap.to(p, {
      y: (Math.random() - 0.5) * 80,
      x: (Math.random() - 0.5) * 40,
      duration: Math.random() * 10 + 8,
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: Math.random() * 4
    });
  }
}

/* =============================================
   7. THREE.JS — LIGHTWEIGHT (fewer particles)
   ============================================= */
function initHeroThree() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || PREFERS_REDUCED || IS_MOBILE || typeof THREE === 'undefined') return;

  const hero = document.querySelector('.hero');
  let W = hero.clientWidth, H = hero.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 500);
  camera.position.z = 25;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setSize(W, H);
  renderer.setPixelRatio(1); // always 1 for perf

  const count = 300;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 70;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 45;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.35 });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / W - 0.5) * 1.5;
    mouseY = (e.clientY / H - 0.5) * 1.5;
  }, { passive: true });

  let raf;
  function animate() {
    raf = requestAnimationFrame(animate);
    points.rotation.y += 0.0004;
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();

  // Pause when hero not visible
  const heroObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { if (!raf) animate(); }
      else { cancelAnimationFrame(raf); raf = null; }
    });
  });
  heroObs.observe(hero);

  window.addEventListener('resize', () => {
    W = hero.clientWidth; H = hero.clientHeight;
    camera.aspect = W / H; camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  }, { passive: true });
}

/* =============================================
   8. COUNT-UP STATS
   ============================================= */
function initCountUp() {
  document.querySelectorAll('.trust-num').forEach((el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    let triggered = false;
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => {
        if (triggered) return; triggered = true;
        let current = 0;
        const duration = 1600;
        const step = 16;
        const increment = target / (duration / step);
        const timer = setInterval(() => {
          current = Math.min(current + increment, target);
          el.textContent = Math.floor(current);
          if (current >= target) clearInterval(timer);
        }, step);
      }
    });
  });
}

/* =============================================
   9. MARQUEE PAUSE
   ============================================= */
function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  const wrap = track.closest('.marquee-wrap');
  wrap.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  wrap.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
}

/* =============================================
   10. SPLIT HEADING REVEALS
   ============================================= */
function initSplitHeadings() {
  if (PREFERS_REDUCED || typeof SplitType === 'undefined') return;
  document.querySelectorAll('.split-heading').forEach((heading) => {
    try {
      const split = new SplitType(heading, { types: 'lines', lineClass: 'split-line' });
      split.lines.forEach((line) => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'overflow:hidden;display:block;';
        line.parentNode.insertBefore(wrap, line);
        wrap.appendChild(line);
        gsap.set(line, { y: '100%', display: 'block' });
      });
      gsap.to(split.lines, {
        y: '0%', duration: 0.9, ease: 'power4.out', stagger: 0.08,
        scrollTrigger: { trigger: heading, start: 'top 88%', toggleActions: 'play none none none' }
      });
    } catch (e) { /* fallback: heading visible as-is */ }
  });
}

/* =============================================
   11. SCROLL REVEALS — batched, throttled
   ============================================= */
function initScrollReveals() {
  // Eyebrow + desc
  document.querySelectorAll('.section-eyebrow, .section-desc, .about-para, .contact-item, .cta-sub, .footer-brand, .footer-col').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 91%', toggleActions: 'play none none none' } }
    );
  });

  // Staggered grids
  const staggerGroups = [
    { sel: '.prop-card', stagger: 0.08 },
    { sel: '.service-card', stagger: 0.07 },
    { sel: '.trust-card', stagger: 0.07 },
    { sel: '.process-step', stagger: 0.1 },
    { sel: '.gallery-item', stagger: 0.06 },
  ];
  staggerGroups.forEach(({ sel, stagger }) => {
    const items = document.querySelectorAll(sel);
    if (!items.length) return;
    gsap.fromTo(items,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger,
        scrollTrigger: { trigger: items[0].parentElement, start: 'top 85%', toggleActions: 'play none none none' } }
    );
  });

  // About float card
  gsap.fromTo('.about-float-card',
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.4)',
      scrollTrigger: { trigger: '.about-image-wrap', start: 'top 80%' } }
  );

  // Contact form
  gsap.fromTo('.contact-form-wrap',
    { opacity: 0, y: 28 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact-form-wrap', start: 'top 86%' } }
  );

  // About tags + btn
  gsap.fromTo('.about-tags, .btn-outline',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: '.about-content', start: 'top 82%' } }
  );
}

/* =============================================
   12. ABOUT PARALLAX (scrub=2 = smoother)
   ============================================= */
function initParallax() {
  if (IS_MOBILE || PREFERS_REDUCED) return;
  gsap.to('.parallax-img', {
    yPercent: 10, ease: 'none',
    scrollTrigger: {
      trigger: '.about-img-frame',
      start: 'top bottom', end: 'bottom top',
      scrub: 2
    }
  });
  gsap.to('.hero-img', {
    yPercent: 12, ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top', end: 'bottom top',
      scrub: 2
    }
  });
}

/* =============================================
   13. PROCESS LINE
   ============================================= */
function initProcessLine() {
  const fill = document.getElementById('processLineFill');
  if (!fill) return;
  gsap.to(fill, {
    width: '100%', ease: 'none',
    scrollTrigger: {
      trigger: '.process-timeline',
      start: 'top 72%', end: 'bottom 60%',
      scrub: 1.5
    }
  });
}

/* =============================================
   14. TESTIMONIALS SLIDER
   ============================================= */
function initTestimonials() {
  const track = document.getElementById('testiTrack');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  const dotsWrap = document.getElementById('testiDots');
  if (!track) return;

  const cards = Array.from(track.children);
  let perView = window.innerWidth <= 768 ? 1 : 3;
  let index = 0;
  const maxIdx = () => Math.max(0, cards.length - perView);

  const buildDots = () => {
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIdx(); i++) {
      const d = document.createElement('button');
      d.className = 'testi-dot' + (i === index ? ' active' : '');
      d.setAttribute('aria-label', `Go to ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  };

  const update = () => {
    const cw = cards[0].getBoundingClientRect().width;
    gsap.to(track, { x: -(index * (cw + 18)), duration: 0.5, ease: 'power3.out' });
    Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('active', i === index));
  };

  const goTo = (i) => { index = Math.min(Math.max(i, 0), maxIdx()); update(); };
  prevBtn?.addEventListener('click', () => goTo(index - 1));
  nextBtn?.addEventListener('click', () => goTo(index + 1));

  let autoplay = setInterval(() => goTo(index >= maxIdx() ? 0 : index + 1), 5000);
  track.closest('.testimonials-slider').addEventListener('mouseenter', () => clearInterval(autoplay));
  track.closest('.testimonials-slider').addEventListener('mouseleave', () => {
    autoplay = setInterval(() => goTo(index >= maxIdx() ? 0 : index + 1), 5000);
  });

  window.addEventListener('resize', () => {
    const nv = window.innerWidth <= 768 ? 1 : 3;
    if (nv !== perView) { perView = nv; index = 0; buildDots(); }
    update();
  }, { passive: true });

  buildDots(); update();
}

/* =============================================
   15. FORM HANDLER
   ============================================= */
function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const btn = form.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  const name = form.elements['name']?.value.trim();
  const phone = form.elements['phone']?.value.trim();
  if (!name || !phone) {
    btn.textContent = 'Please fill required fields';
    setTimeout(() => { btn.textContent = orig; }, 2200);
    return;
  }
  btn.textContent = 'Sending...';
  btn.style.pointerEvents = 'none';
  setTimeout(() => {
    btn.textContent = 'Message Sent ✓';
    form.reset();
    setTimeout(() => { btn.textContent = orig; btn.style.pointerEvents = ''; }, 2500);
  }, 900);
}
window.handleFormSubmit = handleFormSubmit;

/* =============================================
   16. REFRESH
   ============================================= */
window.addEventListener('load', () => ScrollTrigger.refresh(), { passive: true });

/* =============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader().then(() => {
    initHeroIntro();
    initHeroParticles();
    initHeroThree();
  });
  initSmoothLinks();
  initNavbar();
  initMobileMenu();
  initMarquee();
  initCountUp();
  initSplitHeadings();
  initScrollReveals();
  initParallax();
  initProcessLine();
  initTestimonials();

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
});