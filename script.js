// Header shrinks + gains a shadow after scrolling past the hero edge
const header = document.querySelector('.site-header');
if (header) {
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Partners marquee: build one strip of all logos, duplicated once for a seamless loop.
// Each logo's display width (at the fixed 110px height set in CSS) is precomputed here
// so every <img> occupies its final size from the very first paint, before the file has
// even loaded. Without this, the track's total width creeps up as images arrive
// asynchronously, which breaks the "-50%" loop math in the CSS animation and shows up
// as a blank gap right at the seam where it should loop seamlessly.
const partnersTrack = document.getElementById('partners-track');
if (partnersTrack) {
  const LOGO_WIDTHS = {
    '01': 59, '02': 118, '03': 160, '04': 134, '05': 161, '06': 134, '07': 74, '08': 114,
    '09': 139, '10': 108, '11': 75, '12': 76, '13': 96, '14': 88, '15': 137, '16': 90,
    '17': 148, '18': 130, '19': 114, '20': 52, '21': 68, '22': 72, '23': 80, '24': 118,
    '25': 112, '26': 146, '27': 91, '28': 165, '29': 108, '30': 112, '31': 139, '32': 130,
    '33': 176, '34': 134, '35': 99, '36': 121, '37': 74, '38': 112, '39': 170, '40': 130,
    '41': 154, '42': 116, '43': 87, '44': 124, '45': 160, '46': 116, '47': 75, '48': 74,
    '49': 140, '50': 131, '51': 104, '52': 94, '53': 96, '54': 136, '55': 95, '56': 70,
    '57': 212, '58': 134,
  };
  // Not Object.keys(LOGO_WIDTHS): JS enumerates canonical-integer-looking keys
  // ("10".."58") in numeric order before plain string keys ("01".."09"),
  // which would scramble the intended left-to-right logo sequence.
  const names = Array.from({ length: 58 }, (_, i) => String(i + 1).padStart(2, '0'));
  const buildSet = () =>
    names
      .map(
        (n) =>
          `<img src="assets/img/partners/logo-${n}.webp" alt="" width="${LOGO_WIDTHS[n]}" height="110">`
      )
      .join('');
  partnersTrack.innerHTML = buildSet() + buildSet();
}

// Subtle scroll parallax on the hero pattern layer
// (the hero mark already has its own CSS float animation, so it's left alone here
// to avoid two transforms fighting on the same element)
const heroDotGrid = document.querySelector('.hero .dot-grid');
if (heroDotGrid) {
  const onParallax = () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroDotGrid.style.transform = `translateY(${y * 0.08}px)`;
    }
  };
  window.addEventListener('scroll', onParallax, { passive: true });
}

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Scroll reveal animations
// Belt-and-suspenders: IntersectionObserver drives the normal case, but a manual
// scroll/resize check backs it up so content never gets stuck invisible if the
// observer misses a fast or programmatic scroll.
const revealEls = document.querySelectorAll('.reveal');

const revealIfInView = (el) => {
  const rect = el.getBoundingClientRect();
  const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
  if (inView) el.classList.add('is-visible');
  return inView;
};

if (revealEls.length) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  let fallbackTicking = false;
  const runFallback = () => {
    fallbackTicking = false;
    revealEls.forEach((el) => {
      if (!el.classList.contains('is-visible')) revealIfInView(el);
    });
  };
  const queueFallback = () => {
    if (fallbackTicking) return;
    fallbackTicking = true;
    requestAnimationFrame(runFallback);
  };

  window.addEventListener('scroll', queueFallback, { passive: true });
  window.addEventListener('resize', queueFallback);
  queueFallback();

  // Last-resort net: some environments deliver neither IntersectionObserver
  // callbacks nor scroll events for programmatic scrolling. Poll briefly so
  // content can never get permanently stuck invisible.
  const pollId = setInterval(() => {
    let remaining = false;
    revealEls.forEach((el) => {
      if (!el.classList.contains('is-visible')) {
        if (!revealIfInView(el)) remaining = true;
      }
    });
    if (!remaining) clearInterval(pollId);
  }, 350);
}

// Count-up animation for stat / KPI numbers
const countEls = document.querySelectorAll('.countup');
if ('IntersectionObserver' in window && countEls.length) {
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.target);
    const duration = 1400;
    const tick = 30;
    const start = Date.now();
    const plain = el.dataset.plain === 'true';

    // Driven by setInterval (wall-clock time) rather than requestAnimationFrame:
    // rAF is throttled to near-zero or fully paused in background/hidden tabs,
    // which would otherwise freeze the counter indefinitely.
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(target * eased);
      el.textContent = plain ? String(value) : value.toLocaleString('en-US');
      if (progress >= 1) {
        el.textContent = plain ? String(target) : target.toLocaleString('en-US');
        clearInterval(timer);
      }
    }, tick);
  };

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  countEls.forEach((el) => countObserver.observe(el));
} else {
  countEls.forEach((el) => {
    const target = parseFloat(el.dataset.target);
    el.textContent = el.dataset.plain === 'true' ? String(target) : target.toLocaleString('en-US');
  });
}

// Split-line text reveal for hero/case titles: wraps each line (as delimited by
// <br> in the translated string) in a masked span that slides up on load, and
// re-runs whenever the language swap rewrites the title's innerHTML.
function initSplitReveal() {
  document.querySelectorAll('.split-reveal').forEach((el) => {
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = lines
      .map(
        (line, i) =>
          `<span class="split-line"><span class="split-line-inner" style="transition-delay:${i * 120}ms">${line}</span></span>`
      )
      .join('');
    el.classList.remove('split-active');
    // Force a reflow so the class removal above actually resets the transform
    // before we re-add it, otherwise the browser may coalesce the two states.
    void el.offsetWidth;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => el.classList.add('split-active'));
    });
  });
}
initSplitReveal();
window.addEventListener('beyondlangchange', initSplitReveal);

// Fade-out transition when leaving the page via an internal link, so
// navigation between index and case-study pages feels like one continuous site
// rather than a hard page cut. Falls back silently if the link is external,
// opens a new tab, or is a plain in-page anchor.
// Delegated at the document level (rather than bound per-link at load) so it
// still works for links like the case-study prev/next nav, whose real href is
// only set after this script runs.
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href === '#' || href.startsWith('#') || link.target === '_blank') return;
  if (/^(mailto:|tel:)/i.test(href)) return;
  if (/^https?:\/\//i.test(href) && !href.includes(window.location.host)) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let modified clicks (new tab) through

  e.preventDefault();
  document.body.classList.add('page-exit');
  setTimeout(() => {
    window.location.href = href;
  }, 220);
});

// Contact form: client-side only, opens mail client with prefilled message
const form = document.getElementById('contact-form');
const formNote = document.getElementById('form-note');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      formNote.textContent = 'الرجاء تعبئة جميع الحقول.';
      return;
    }

    const subject = encodeURIComponent(`طلب تواصل من ${name} - موقع Beyond`);
    const body = encodeURIComponent(`الاسم: ${name}\nالبريد الإلكتروني: ${email}\n\nالرسالة:\n${message}`);
    window.location.href = `mailto:info@beyond4m.com?subject=${subject}&body=${body}`;

    formNote.textContent = 'جارٍ فتح برنامج البريد الإلكتروني لإرسال رسالتك...';
    form.reset();
  });
}
