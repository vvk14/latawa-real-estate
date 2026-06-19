/* =============================================
   LATAWA REAL ESTATE — script.js
   Drives: preloader, cursor, Lenis smooth scroll,
   navbar, mobile menu, hero intro, particles, Three.js
   depth layer, count-up stats, marquee, split-heading
   reveals, parallax, card reveals, horizontal showcase,
   process timeline, testimonials slider, magnetic
   buttons, and the contact form handler.
   ============================================= */

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* Respect reduced-motion preference globally */
const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_TOUCH = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const IS_MOBILE = window.innerWidth <= 768;

/* =============================================
   1. PRELOADER
   ============================================= */
function initPreloader() {
  return new Promise((resolve) => {
    const preloader = document.getElementById('preloader');
    const fill = document.getElementById('preloaderFill');
    let progress = 0;
    const targetTime = PREFERS_REDUCED_MOTION ? 200 : 1400;
    const step = () => {
      progress += Math.random() * 18 + 6;
      if (progress >= 100) {
        progress = 100;
        fill.style.width = '100%';
        gsap.to(preloader, {
          opacity: 0,
          duration: 0.7,
          delay: 0.25,
          ease: 'power2.inOut',
          onComplete: () => {
            preloader.style.display = 'none';
            resolve();
          }
        });
        return;
      }
      fill.style.width = progress + '%';
      setTimeout(step, targetTime / 8);
    };
    step();
  });
}

/* =============================================
   2. CURSOR FOLLOWER
   ============================================= */
function initCursor() {
  if (IS_TOUCH) return;
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0, ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  gsap.ticker.add(() => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursor.style.left = ringX + 'px';
    cursor.style.top = ringY + 'px';
  });

  const hoverTargets = 'a, button, .magnetic, .prop-card, .service-card, .testi-btn, input, textarea, select';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor-hover');
  });

  document.addEventListener('mouseleave', () => {
    gsap.to([cursor, dot], { opacity: 0, duration: 0.3 });
  });
  document.addEventListener('mouseenter', () => {
    gsap.to([cursor, dot], { opacity: 1, duration: 0.3 });
  });
}

/* =============================================
   3. LENIS SMOOTH SCROLL + SCROLLTRIGGER BRIDGE
   ============================================= */
let lenis;
function initLenis() {
  if (typeof Lenis === 'undefined') {
    console.warn('Lenis is unavailable — falling back to native smooth scrolling.');
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id.length > 1) {
          const target = document.querySelector(id);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            closeMobileMenu();
          }
        }
      });
    });
    return;
  }

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  /* Smooth anchor links */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -80, duration: 1.3 });
          closeMobileMenu();
        }
      }
    });
  });
}

/* =============================================
   4. NAVBAR SCROLL STATE
   ============================================= */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  ScrollTrigger.create({
    start: 'top -60',
    onUpdate: (self) => {
      navbar.classList.toggle('scrolled', self.scroll() > 60);
    }
  });
}

/* =============================================
   5. MOBILE MENU
   ============================================= */
function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const hamburger = document.getElementById('hamburger');
  menu.classList.remove('open');
  hamburger.classList.remove('active');
  document.body.style.overflow = '';
  setTimeout(() => { menu.style.display = 'none'; }, 400);
}

function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');

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
  });

  /* Hamburger -> X animation */
  const spans = hamburger.querySelectorAll('span');
  hamburger.addEventListener('click', () => {
    const active = hamburger.classList.contains('active');
    if (active) {
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
   6. MAGNETIC BUTTONS
   ============================================= */
function initMagnetic() {
  if (IS_TOUCH) return;
  document.querySelectorAll('.magnetic').forEach((el) => {
    const strength = 0.35;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* =============================================
   7. HERO INTRO TIMELINE
   ============================================= */
function initHeroIntro() {
  const lines = document.querySelectorAll('.hero-line');

  /* Wrap each line's text for a clip reveal */
  lines.forEach((line) => {
    const text = line.textContent;
    line.innerHTML = `<span class="hero-line-inner" style="display:inline-block; transform: translateY(110%);">${text}</span>`;
  });

  const tl = gsap.timeline({ delay: 0.2 });

  tl.to(lines, {
      duration: 0,
    })
    .to('.hero-line-inner', {
      y: '0%',
      duration: 1,
      ease: 'power4.out',
      stagger: 0.12,
    })
    .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0.1)
    .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
    .to('.hero-btns', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');
}

/* =============================================
   8. HERO PARTICLES
   ============================================= */
function initHeroParticles() {
  const container = document.getElementById('heroParticles');
  if (!container || PREFERS_REDUCED_MOTION) return;
  const count = IS_MOBILE ? 18 : 36;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 3 + 1;
    p.style.position = 'absolute';
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.borderRadius = '50%';
    p.style.background = 'rgba(255,255,255,' + (Math.random() * 0.3 + 0.08) + ')';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    container.appendChild(p);

    gsap.to(p, {
      y: (Math.random() - 0.5) * 120,
      x: (Math.random() - 0.5) * 60,
      duration: Math.random() * 8 + 6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: Math.random() * 3,
    });
    gsap.to(p, {
      opacity: Math.random() * 0.5 + 0.2,
      duration: Math.random() * 3 + 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }
}

/* =============================================
   9. THREE.JS HERO DEPTH LAYER
   ============================================= */
function initHeroThree() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || PREFERS_REDUCED_MOTION || typeof THREE === 'undefined') return;

  const hero = document.querySelector('.hero');
  let width = hero.clientWidth;
  let height = hero.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const particleCount = IS_MOBILE ? 200 : 500;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.18,
    transparent: true,
    opacity: 0.45,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);
    points.rotation.y += 0.0006;
    points.rotation.x += 0.0002;
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    width = hero.clientWidth;
    height = hero.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

/* =============================================
   10. SCROLL-TRIGGERED COUNT-UP STATS
   ============================================= */
function initCountUp() {
  document.querySelectorAll('.trust-num').forEach((el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          innerText: target,
          duration: 1.8,
          ease: 'power2.out',
          snap: { innerText: 1 },
          onUpdate: function () {
            el.textContent = Math.floor(this.targets()[0].innerText);
          }
        });
      }
    });
  });
}

/* =============================================
   11. MARQUEE — pause on hover
   ============================================= */
function initMarquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  const wrap = track.closest('.marquee-wrap');
  wrap.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
  wrap.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
}

/* =============================================
   12. SPLIT HEADING REVEALS
   ============================================= */
function initSplitHeadings() {
  const headings = document.querySelectorAll('.split-heading');
  headings.forEach((heading) => {
    let split;
    try {
      split = new SplitType(heading, { types: 'lines', lineClass: 'split-line' });
    } catch (e) {
      return;
    }
    split.lines.forEach((line) => {
      const wrapper = document.createElement('span');
      wrapper.style.display = 'block';
      wrapper.style.overflow = 'hidden';
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
      line.style.display = 'block';
      line.style.transform = 'translateY(100%)';
    });

    gsap.to(split.lines, {
      y: '0%',
      duration: 1,
      ease: 'power4.out',
      stagger: 0.08,
      scrollTrigger: {
        trigger: heading,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });
  });
}

/* =============================================
   13. GENERIC REVEAL-ON-SCROLL (eyebrows, descs, cards, etc.)
   ============================================= */
function initScrollReveals() {
  const fadeUpSelectors = [
    '.section-eyebrow', '.section-desc', '.about-para', '.about-tags',
    '.btn-outline', '.contact-item', '.form-title', '.cta-sub'
  ];
  fadeUpSelectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el) => {
      gsap.set(el, { opacity: 0, y: 30 });
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
      });
    });
  });

  /* Staggered card groups */
  const groups = [
    '.trust-grid > .trust-card',
    '.prop-card',
    '.service-card',
    '.process-step',
    '.testi-card',
    '.about-float-card',
  ];
  groups.forEach((sel) => {
    const items = document.querySelectorAll(sel);
    if (!items.length) return;
    gsap.set(items, { opacity: 0, y: 40 });
    gsap.to(items, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: items[0].closest('section, .container, .testimonials-slider'), start: 'top 80%', toggleActions: 'play none none none' }
    });
  });

  /* Glass-card group fallback for items not already covered */
  gsap.set('.contact-form-wrap', { opacity: 0, y: 30 });
  gsap.to('.contact-form-wrap', {
    opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact-form-wrap', start: 'top 85%', toggleActions: 'play none none none' }
  });
}

/* =============================================
   14. ABOUT IMAGE PARALLAX
   ============================================= */
function initParallax() {
  document.querySelectorAll('.parallax-img').forEach((img) => {
    gsap.to(img, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: img.closest('.about-img-frame') || img,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  });

  /* Hero background subtle parallax */
  gsap.to('.hero-img', {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  });
}

/* =============================================
   15. HORIZONTAL SHOWCASE SCROLL
   ============================================= */
function initShowcase() {
  const pin = document.getElementById('showcasePin');
  const track = document.getElementById('showcaseTrack');
  if (!pin || !track) return;

  function build() {
    ScrollTrigger.getById('showcaseScroll')?.kill();
    const scrollAmount = track.scrollWidth - window.innerWidth;
    if (scrollAmount <= 0) return;

    gsap.to(track, {
      x: -scrollAmount,
      ease: 'none',
      scrollTrigger: {
        id: 'showcaseScroll',
        trigger: pin,
        start: 'top top',
        end: () => '+=' + scrollAmount,
        scrub: true,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });
  }
  build();
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  });
}

/* =============================================
   16. PROCESS TIMELINE LINE FILL
   ============================================= */
function initProcessLine() {
  const fill = document.getElementById('processLineFill');
  if (!fill) return;
  gsap.to(fill, {
    width: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: '.process-timeline',
      start: 'top 70%',
      end: 'bottom 60%',
      scrub: true,
    }
  });
}

/* =============================================
   17. TESTIMONIALS SLIDER
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

  function maxIndex() {
    return Math.max(0, cards.length - perView);
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const dotCount = maxIndex() + 1;
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'testi-dot' + (i === index ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to testimonial group ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function update() {
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 24;
    const offset = index * (cardWidth + gap);
    gsap.to(track, { x: -offset, duration: 0.6, ease: 'power3.out' });
    Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function goTo(i) {
    index = Math.min(Math.max(i, 0), maxIndex());
    update();
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));

  window.addEventListener('resize', () => {
    const newPerView = window.innerWidth <= 768 ? 1 : 3;
    if (newPerView !== perView) {
      perView = newPerView;
      index = 0;
      buildDots();
      update();
    }
  });

  /* Autoplay */
  let autoplay;
  function startAutoplay() {
    if (PREFERS_REDUCED_MOTION) return;
    autoplay = setInterval(() => {
      index = index >= maxIndex() ? 0 : index + 1;
      update();
    }, 5500);
  }
  function stopAutoplay() { clearInterval(autoplay); }

  track.closest('.testimonials-slider').addEventListener('mouseenter', stopAutoplay);
  track.closest('.testimonials-slider').addEventListener('mouseleave', startAutoplay);

  buildDots();
  update();
  startAutoplay();
}

/* =============================================
   18. CTA MESH — gentle pointer-reactive drift
   ============================================= */
function initCtaMesh() {
  const mesh = document.getElementById('ctaMesh');
  if (!mesh || IS_TOUCH || PREFERS_REDUCED_MOTION) return;
  const section = mesh.closest('.cta-section');
  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    gsap.to(mesh, { x, y, duration: 1.2, ease: 'power2.out' });
  });
}

/* =============================================
   19. TRUST NUMBER ANIMATION FOR INNERTEXT TWEEN
   GSAP needs the CSS plugin behavior for innerText;
   this small helper ensures the tween works without
   the premium plugin by overriding via onUpdate above.
   (No additional code required — handled in initCountUp)
   ============================================= */

/* =============================================
   20. CONTACT FORM HANDLER
   ============================================= */
function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;

  const name = form.elements['name'].value.trim();
  const phone = form.elements['phone'].value.trim();

  if (!name || !phone) {
    submitBtn.textContent = 'Please fill required fields';
    setTimeout(() => { submitBtn.textContent = originalText; }, 2200);
    return;
  }

  submitBtn.textContent = 'Sending...';
  submitBtn.style.pointerEvents = 'none';

  /* Simulated send — replace with real endpoint (fetch/EmailJS/Formspree) when ready */
  setTimeout(() => {
    submitBtn.textContent = 'Message Sent ✓';
    form.reset();
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.style.pointerEvents = '';
    }, 2500);
  }, 900);
}
/* Expose globally since index.html calls this via inline onsubmit */
window.handleFormSubmit = handleFormSubmit;

/* =============================================
   21. REFRESH SCROLLTRIGGER AFTER FONTS/IMAGES LOAD
   ============================================= */
function refreshOnLoad() {
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}

/* =============================================
   INIT — ORDER MATTERS
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  initPreloader().then(() => {
    initHeroIntro();
    initHeroParticles();
    initHeroThree();
  });

  initCursor();
  initLenis();
  initNavbar();
  initMobileMenu();
  initMagnetic();
  initMarquee();
  initCountUp();
  initSplitHeadings();
  initScrollReveals();
  initParallax();
  initShowcase();
  initProcessLine();
  initTestimonials();
  initCtaMesh();
  refreshOnLoad();
});