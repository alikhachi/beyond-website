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
    '01': 391, '02': 82, '03': 128, '04': 163, '05': 108, '06': 212, '07': 478, '08': 218,
    '09': 236, '10': 62, '11': 395, '12': 124, '13': 324, '14': 143, '15': 130, '16': 188,
    '17': 82, '18': 126, '19': 353, '20': 266, '21': 186, '22': 87, '23': 94, '24': 358,
    '25': 186, '26': 130, '27': 110, '28': 366, '29': 300, '30': 218, '31': 76, '32': 199,
    '33': 406, '34': 258, '35': 384, '36': 156, '37': 84, '38': 116, '39': 97, '40': 424,
    '41': 98, '42': 100, '43': 91, '44': 500, '45': 111, '46': 166, '47': 131, '48': 540,
    '49': 194, '50': 211, '51': 350, '52': 175, '53': 137, '54': 494, '55': 222, '56': 90,
    '57': 110, '58': 110,
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
