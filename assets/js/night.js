/* One night, several clocks.
   Without JavaScript (and on phones) the marks are a readable vertical list.
   On wider screens this places each mark on an 8 PM–7 AM axis and lets the reader select one. */
(function () {
  var clock = document.querySelector('.clock');
  if (!clock) return;
  var marksList = clock.querySelector('.marks');
  var marks = Array.prototype.slice.call(clock.querySelectorAll('.mark'));
  var axis = clock.querySelector('.clock-axis');
  var panel = document.getElementById('night-panel');
  var kindButtons = Array.prototype.slice.call(document.querySelectorAll('.kind'));
  var startH = 20, hours = 11, span = hours * 60;

  function minutes(t) {
    var p = t.split(':'), m = (+p[0]) * 60 + (+p[1]);
    if (m < startH * 60) m += 1440;
    return m - startH * 60;
  }
  function frac(t) { return minutes(t) / span; }
  function label(h) { var hh = h % 24; return (hh % 12 || 12) + (hh < 12 ? ' AM' : ' PM'); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function pct(f) { return (f * 100).toFixed(3) + '%'; }

  // Axis furniture (decorative; the same facts are in the text below the clock)
  axis.appendChild(el('div', 'base'));
  for (var h = 0; h <= hours; h++) {
    var t = el('div', 'tick'); t.style.left = pct(h / hours);
    t.appendChild(el('span', '', label(startH + h))); axis.appendChild(t);
  }
  var sunset = el('div', 'sun'); sunset.style.left = pct(frac('21:20')); sunset.appendChild(el('span', '', 'sunset')); axis.appendChild(sunset);
  var sunrise = el('div', 'sun'); sunrise.style.left = pct(frac('04:45')); sunrise.appendChild(el('span', '', 'sunrise')); axis.appendChild(sunrise);
  var dl = el('div', 'dateline'); dl.style.left = pct(frac('00:00'));
  dl.appendChild(el('span', 'l', 'Inquest: July 2')); dl.appendChild(el('span', 'r', 'Gravestone: July 3')); axis.appendChild(dl);

  // Place marks and turn each heading into a button
  var pairs = {}, parts = [];
  var wideMQ = window.matchMedia('(min-width: 900px)');
  marks.forEach(function (m, i) {
    m.style.setProperty('--x', frac(m.dataset.t));
    m.style.setProperty('--row', m.dataset.row || 0);
    if (m.dataset.end) {
      m.style.setProperty('--w', frac(m.dataset.end) - frac(m.dataset.t));
      m.insertBefore(el('span', 'bar'), m.firstChild);
    }
    if (m.dataset.pair) (pairs[m.dataset.pair] = pairs[m.dataset.pair] || []).push(m);
    var head = m.querySelector('.mk-head');
    var btn = el('button', 'mk-btn');
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-controls', 'night-panel');
    var sym = el('span', 'sym'); sym.setAttribute('aria-hidden', 'true');
    var txt = el('span', 'txt');
    while (head.firstChild) txt.appendChild(head.firstChild);
    btn.appendChild(sym);
    btn.addEventListener('click', function () { select(m); });
    parts.push({ head: head, btn: btn, txt: txt });
  });
  // The marks are buttons only where the horizontal clock and its panel exist;
  // on phones the details are printed under each time, so plain text is honest.
  function setMode() {
    var wide = wideMQ.matches;
    parts.forEach(function (p) {
      if (wide) { p.btn.appendChild(p.txt); p.head.appendChild(p.btn); }
      else { p.head.appendChild(p.txt); if (p.btn.parentNode) p.btn.parentNode.removeChild(p.btn); }
    });
  }
  var pairText = { fitter: 'one witness, two times', cottage: 'one household, two times' };
  Object.keys(pairs).forEach(function (k) {
    var a = pairs[k][0], b = pairs[k][1];
    var line = el('div', 'pairline');
    var x0 = frac(a.dataset.t), x1 = frac(b.dataset.t);
    line.style.left = pct(x0); line.style.width = pct(x1 - x0);
    line.style.top = (58 + (+a.dataset.row) * 84 + 14 + 52) + 'px';
    line.appendChild(el('span', '', pairText[k] || ''));
    axis.appendChild(line);
  });

  function select(m) {
    marks.forEach(function (x) { parts[marks.indexOf(x)].btn.setAttribute('aria-pressed', x === m ? 'true' : 'false'); });
    panel.innerHTML = '';
    var left = el('div');
    left.appendChild(el('p', 'p-time', m.querySelector('time').textContent));
    left.appendChild(el('p', 'p-label', m.querySelector('.mk-label').textContent));
    panel.appendChild(left);
    panel.appendChild(m.querySelector('.mk-detail').cloneNode(true));
    panel.classList.toggle('author-sel', m.classList.contains('reading'));
    panel.hidden = false;
  }

  // Highlight one kind of source
  kindButtons.forEach(function (b) {
    b.addEventListener('click', function () {
      var on = b.getAttribute('aria-pressed') !== 'true';
      kindButtons.forEach(function (x) { x.setAttribute('aria-pressed', x === b && on ? 'true' : 'false'); });
      marks.forEach(function (m) { m.classList.toggle('dim', on && !m.classList.contains(b.dataset.kind)); });
    });
  });

  // Arrow keys move along the night
  marksList.addEventListener('keydown', function (e) {
    if (!wideMQ.matches) return;
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var order = marks.slice().sort(function (a, b) { return minutes(a.dataset.t) - minutes(b.dataset.t); });
    var cur = order.indexOf(document.activeElement && document.activeElement.closest ? document.activeElement.closest('.mark') : null);
    if (cur < 0) return;
    var next = order[Math.max(0, Math.min(order.length - 1, cur + (e.key === 'ArrowRight' ? 1 : -1)))];
    parts[marks.indexOf(next)].btn.focus(); select(next); e.preventDefault();
  });

  setMode();
  if (wideMQ.addEventListener) wideMQ.addEventListener('change', setMode); else if (wideMQ.addListener) wideMQ.addListener(setMode);

  // Start on the time in the inquest record
  var first = marks.filter(function (m) { return m.dataset.t === '23:30'; })[0] || marks[0];
  select(first);

  // A single, quiet reveal the first time the clock is seen
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    clock.classList.add('reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { clock.classList.add('in'); io.disconnect(); } });
    }, { threshold: 0.2 });
    io.observe(clock);
  }
})();
