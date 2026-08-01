// Partners page: renders every partner logo in a static grid (no marquee loop
// needed here), reusing the same width/scale data script.js builds the
// homepage marquee from so both places stay visually consistent.

(function () {
  const grid = document.getElementById('partners-grid-full');
  if (!grid || typeof PARTNER_LOGO_NAMES === 'undefined') return;

  grid.innerHTML = PARTNER_LOGO_NAMES.map(
    (n) =>
      `<div class="partner-tile">
        <img src="assets/img/partners/logo-${n}.webp" alt="" loading="lazy"
             width="${PARTNER_LOGO_WIDTHS[n]}" height="110"
             style="transform:scale(${PARTNER_LOGO_SCALES[n]})">
      </div>`
  ).join('');
})();
