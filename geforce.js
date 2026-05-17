/* ═══════════════════════════════════════════
   GeForce RTX — JavaScript
   ═══════════════════════════════════════════ */
'use strict';

/* ── 1. Dual Cursor ───────────────────────── */
const cursorDot  = document.getElementById('cursor-glow');
const cursorRing = document.getElementById('cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
});

// Ring follows with slight lag
(function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
})();

// Hover state on interactive elements
document.querySelectorAll('a, button, .feature-card, .hw-card, .gallery-item, .faq-q').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* ── 2. Particle Canvas ───────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function mkParticle() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2 + .2,
      vx: (Math.random() - .5) * .35,
      vy: (Math.random() - .5) * .35,
      alpha: Math.random() * .45 + .05,
    };
  }
  for (let i = 0; i < 120; i++) particles.push(mkParticle());

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(118,185,0,${p.alpha})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── 3. Navbar scroll + active link ──────── */
const navbar   = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}, { passive: true });

/* ── 4. Scroll Reveal ─────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal-card').forEach(el => revealObserver.observe(el));

/* ── 5. Stat counters ─────────────────────── */
let counted = false;
function animateCount(el) {
  const target = parseInt(el.dataset.target);
  const start  = performance.now();
  const dur    = 1600;
  (function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(e * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  })(start);
}
new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    document.querySelectorAll('.stat-num').forEach(animateCount);
  }
}, { threshold: 0.4 }).observe(document.getElementById('hero'));

/* ── 6. GPU 3D tilt ───────────────────────── */
const gpuImg    = document.getElementById('gpu-img');
const heroVis   = document.querySelector('.hero-visual');
if (heroVis && gpuImg) {
  heroVis.addEventListener('mousemove', (e) => {
    const r  = heroVis.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
    const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
    gpuImg.style.transform = `perspective(700px) rotateY(${dx*12}deg) rotateX(${-dy*9}deg)`;
  });
  heroVis.addEventListener('mouseleave', () => gpuImg.style.transform = '');
}

/* ── 7. Performance bars ─────────────────── */
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.perf-bars').forEach(el => barObserver.observe(el));

/* ── 8. FAQ accordion ─────────────────────── */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });

    // Open clicked if it was closed
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ── 9. Gallery lightbox ─────────────────── */
(function initLightbox() {
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  overlay.style.cssText = `
    display:none; position:fixed; inset:0; z-index:2000;
    background:rgba(0,0,0,.92); align-items:center; justify-content:center;
    cursor:zoom-out;
  `;
  const img = document.createElement('img');
  img.style.cssText = 'max-width:90vw; max-height:88vh; border:2px solid #76b900; box-shadow:0 0 60px rgba(118,185,0,.3);';
  overlay.appendChild(img);
  document.body.appendChild(overlay);

  document.querySelectorAll('.gallery-item img').forEach(src => {
    src.style.cursor = 'zoom-in';
    src.addEventListener('click', () => {
      img.src = src.src;
      overlay.style.display = 'flex';
    });
  });
  overlay.addEventListener('click', () => overlay.style.display = 'none');
  document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.style.display = 'none'; });
})();

/* ── 10. Form validation + EmailJS ──────── */
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';

(function() {
  const s  = document.createElement('script');
  s.src    = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  s.onload = () => emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  document.head.appendChild(s);
})();

const form      = document.getElementById('contact-form');
const formMsg   = document.getElementById('form-msg');
const btnText   = document.getElementById('btn-text');
const btnLoader = document.getElementById('btn-loader');
const submitBtn = document.getElementById('submit-btn');

function showErr(id, errId, msg) {
  document.getElementById(id).classList.add('invalid');
  document.getElementById(errId).textContent = msg;
}
function clearErr(id, errId) {
  document.getElementById(id).classList.remove('invalid');
  document.getElementById(errId).textContent = '';
}
function validate() {
  let ok = true;
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const msg   = document.getElementById('message').value.trim();
  clearErr('name','name-err'); clearErr('email','email-err'); clearErr('message','msg-err');
  if (!name)  { showErr('name','name-err','Name is required.'); ok = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('email','email-err','Enter a valid email.'); ok = false; }
  if (!msg || msg.length < 10) { showErr('message','msg-err','Message needs 10+ characters.'); ok = false; }
  return ok;
}
['name','email','message'].forEach(id => {
  const errMap = { name:'name-err', email:'email-err', message:'msg-err' };
  document.getElementById(id)?.addEventListener('input', () => clearErr(id, errMap[id]));
});

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validate()) return;
  if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
    formMsg.className = 'form-msg error';
    formMsg.textContent = '⚠ Configure EmailJS credentials in geforce.js to send emails.';
    formMsg.style.display = 'block';
    return;
  }
  btnText.style.display = 'none'; btnLoader.style.display = 'inline';
  submitBtn.disabled = true; formMsg.style.display = 'none';

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    from_name:  document.getElementById('name').value.trim(),
    from_email: document.getElementById('email').value.trim(),
    subject:    document.getElementById('subject')?.value.trim() || 'GeForce Inquiry',
    message:    document.getElementById('message').value.trim(),
  }).then(() => {
    btnText.style.display = 'inline'; btnLoader.style.display = 'none';
    submitBtn.disabled = false; form.reset();
    formMsg.className = 'form-msg success';
    formMsg.textContent = '✔ Message sent! We\'ll get back to you shortly.';
    formMsg.style.display = 'block';
    setTimeout(() => formMsg.style.display = 'none', 6000);
  }).catch(err => {
    btnText.style.display = 'inline'; btnLoader.style.display = 'none';
    submitBtn.disabled = false;
    formMsg.className = 'form-msg error';
    formMsg.textContent = '✖ Send failed. Please try again.';
    formMsg.style.display = 'block';
    console.error('EmailJS:', err);
  });
});

/* ── 11. Smooth scroll ──────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior:'smooth', block:'start' }); }
  });
});
