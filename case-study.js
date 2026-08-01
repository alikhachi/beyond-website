// Case study detail page: reads ?id= from the URL, looks up CASE_STUDIES data,
// and populates the page in the current language. Re-renders on language change.

(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const data = CASE_STUDIES[id];

  if (!data) {
    window.location.href = 'work.html';
    return;
  }

  const currentIndex = CASE_ORDER.indexOf(id);
  const prevId = CASE_ORDER[(currentIndex - 1 + CASE_ORDER.length) % CASE_ORDER.length];
  const nextId = CASE_ORDER[(currentIndex + 1) % CASE_ORDER.length];

  function render() {
    const lang = (typeof getLang === 'function') ? getLang() : 'ar';
    const t = data[lang] || data.ar;

    document.title = `${t.title} | Beyond Marketing Agency`;

    document.getElementById('case-tag').textContent = t.tag;
    document.getElementById('case-title').textContent = t.title;
    document.getElementById('case-subtitle').textContent = t.subtitle;

    const heroImg = document.getElementById('case-hero-img');
    heroImg.src = data.hero;
    heroImg.alt = t.title;

    document.getElementById('case-challenge').textContent = t.challenge;
    document.getElementById('case-goal').textContent = t.goal;

    const resultsList = document.getElementById('case-results');
    resultsList.innerHTML = t.results
      .map((r, i) => `<li class="reveal" style="transition-delay:${i * 0.08}s">${r}</li>`)
      .join('');

    const statsSection = document.getElementById('case-stats-section');
    const statsGrid = document.getElementById('case-stats');
    if (data.stats && data.stats.length) {
      statsSection.style.display = '';
      statsGrid.innerHTML = data.stats
        .map(
          (s) => `<div class="kpi"><span class="kpi-num">${s.value}</span><span class="kpi-label">${s[lang] || s.ar}</span></div>`
        )
        .join('');
    } else {
      statsSection.style.display = 'none';
    }

    const gallerySection = document.getElementById('case-gallery-section');
    const galleryGrid = document.getElementById('case-gallery');
    if (data.gallery && data.gallery.length) {
      gallerySection.style.display = '';
      galleryGrid.innerHTML = data.gallery
        .map(
          (src, i) =>
            `<div class="case-gallery-item reveal" style="transition-delay:${(i % 3) * 0.1}s"><img src="${src}" alt="${t.title} ${i + 2}" loading="lazy"></div>`
        )
        .join('');
    } else {
      gallerySection.style.display = 'none';
    }

    const prevData = CASE_STUDIES[prevId];
    const nextData = CASE_STUDIES[nextId];
    document.getElementById('case-prev').href = `case-study.html?id=${prevId}`;
    document.getElementById('case-next').href = `case-study.html?id=${nextId}`;
    document.getElementById('case-prev-title').textContent = (prevData[lang] || prevData.ar).title;
    document.getElementById('case-next-title').textContent = (nextData[lang] || nextData.ar).title;

    // Re-apply reveal state to freshly-injected nodes (results list, gallery)
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        el.classList.add('is-visible');
      }
    });
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
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => observer.observe(el));
    }

    setupLightbox();
  }

  function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');

    document.querySelectorAll('.case-gallery-item img').forEach((img) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
      });
    });

    const close = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
    };
    closeBtn.onclick = close;
    lightbox.onclick = (e) => {
      if (e.target === lightbox) close();
    };
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  document.addEventListener('DOMContentLoaded', render);
  window.addEventListener('beyondlangchange', render);
})();
