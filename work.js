// "Our Work" listing page: renders every case study from CASE_STUDIES/CASE_ORDER
// as a large image tile with a tag pill and a bottom caption overlay. Re-renders
// on language change since each case's tag/title/subtitle is bilingual.

(function () {
  const grid = document.getElementById('work-grid-full');
  if (!grid) return;

  function render() {
    const lang = (typeof getLang === 'function') ? getLang() : 'ar';

    grid.innerHTML = CASE_ORDER.map((id) => {
      const c = CASE_STUDIES[id];
      const t = c[lang] || c.ar;
      return `
        <a class="ourwork-tile reveal" href="case-study.html?id=${id}">
          <div class="ourwork-img"><img src="${c.hero}" alt="${t.title}" loading="lazy"></div>
          <span class="ourwork-pill">${t.tag}</span>
          <div class="ourwork-caption">
            <strong>${t.title}</strong>
            <span>${t.subtitle}</span>
          </div>
        </a>`;
    }).join('');

    observeTiles();
  }

  function observeTiles() {
    const tiles = Array.from(grid.querySelectorAll('.reveal:not(.is-visible)'));
    tiles.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 0.08}s`;
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
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      tiles.forEach((el) => observer.observe(el));
    } else {
      tiles.forEach((el) => el.classList.add('is-visible'));
    }
  }

  document.addEventListener('DOMContentLoaded', render);
  window.addEventListener('beyondlangchange', render);
})();
