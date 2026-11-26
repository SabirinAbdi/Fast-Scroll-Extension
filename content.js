(function () {
  var panelId = 'xbdj-panel';
  if (document.getElementById(panelId)) return;

  var style = document.createElement('style');
  style.textContent = [
    '#xbdj-panel{position:fixed;z-index:2147483647;top:90px;right:16px;width:250px;',
    'color-scheme:dark;background:#0f0f0f;color:#e7e9ea;border:1px solid #38444d;',
    'border-radius:12px;padding:12px;font:13px/1.4 -apple-system,BlinkMacSystemFont,',
    '"Segoe UI",Roboto,Helvetica,Arial,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.5)}',
    '#xbdj-panel .h{display:flex;justify-content:space-between;align-items:center;',
    'font-weight:700;margin-bottom:10px;cursor:move;user-select:none}',
    '#xbdj-panel .x{cursor:pointer;color:#71767b;font-weight:700;padding:0 2px}',
    '#xbdj-panel button{width:100%;background:#1d9bf0;color:#fff;border:0;border-radius:10px;',
    'padding:12px 4px;font-size:15px;font-weight:800;cursor:pointer}',
    '#xbdj-panel button.stop{background:#f4212e}',
    '#xbdj-panel button:hover{filter:brightness(1.15)}',
    '#xbdj-status{margin-top:10px;font-size:11px;color:#71767b;min-height:14px;text-align:center}'
  ].join('');
  (document.head || document.documentElement).appendChild(style);

  var panel = document.createElement('div');
  panel.id = panelId;
  panel.innerHTML =
    '<div class="h"><span>History Fast Scroll</span><span class="x" id="xbdj-close">✕</span></div>' +
    '<button id="xbdj-scroll">Scroll ↓</button>' +
    '<div id="xbdj-status">Open your X History page.</div>';
  (document.body || document.documentElement).appendChild(panel);

  var scrolling = false;
  var btn = document.getElementById('xbdj-scroll');

  function setStatus(msg) {
    document.getElementById('xbdj-status').textContent = msg;
  }

  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  function posts() {
    return Array.prototype.filter.call(
      document.querySelectorAll('article'),
      function (a) { return a.querySelector('[datetime]'); }
    );
  }

  function onHistoryPage() {
    return /bookmark|history/i.test(location.href);
  }

  function navLink() {
    return document.querySelector('a[href="/i/history"]') ||
           document.querySelector('a[href="/i/bookmarks"]');
  }

  var scroller = null;

  function findScroller() {
    var list = posts();
    for (var i = 0; i < list.length; i++) {
      var el = list[i].parentElement;
      while (el && el !== document.documentElement) {
        if (el.scrollHeight > el.clientHeight + 50 && el.clientHeight > 150) {
          return { el: el, win: false };
        }
        el = el.parentElement;
      }
    }
    var best = null;
    var boxes = Array.prototype.filter.call(
      document.querySelectorAll('div,main,section,ul,ol'),
      function (el) {
        return el.scrollHeight > el.clientHeight + 50 && el.clientHeight > 150;
      }
    );
    for (var j = 0; j < boxes.length; j++) {
      if (boxes[j].querySelector('article')) {
        if (!best || boxes[j].scrollHeight < best.scrollHeight) best = boxes[j];
      }
    }
    if (best) return { el: best, win: false };
    return { el: null, win: true };
  }

  function getScroller() {
    if (!scroller) scroller = findScroller();
    return scroller;
  }

  function top(sc) {
    return sc.win ? window.scrollY : sc.el.scrollTop;
  }

  function height(sc) {
    return sc.win ? window.innerHeight : sc.el.clientHeight;
  }

  function scrollTo(sc, y) {
    if (sc.win) window.scrollTo(0, y);
    else sc.el.scrollTop = y;
  }

  function moveDown(dist) {
    var sc = getScroller();
    var before = top(sc);
    scrollTo(sc, before + dist);
    if (top(sc) !== before) return true;

    if (!sc.win) {
      var b = window.scrollY;
      window.scrollBy(0, dist);
      if (window.scrollY !== b) {
        scroller = { el: null, win: true };
        return true;
      }
    }

    var boxes = Array.prototype.filter.call(
      document.querySelectorAll('div,main,section,ul,ol'),
      function (el) {
        return el.scrollHeight > el.clientHeight + 50 && el.clientHeight > 150;
      }
    );
    for (var i = 0; i < boxes.length; i++) {
      if (boxes[i] === sc.el) continue;
      var old = boxes[i].scrollTop;
      boxes[i].scrollTop = old + dist;
      if (boxes[i].scrollTop !== old) {
        scroller = { el: boxes[i], win: false };
        return true;
      }
    }
    return false;
  }

  function newestDate() {
    var sc = getScroller();
    var ref = sc.win ? null : sc.el.getBoundingClientRect();
    var h = height(sc);
    var best = null;
    var list = posts();
    for (var i = 0; i < list.length; i++) {
      var r = list[i].getBoundingClientRect();
      var t = sc.win ? r.top : r.top - ref.top;
      if (t > h * 0.5) continue;
      if (!best || t < best.t) {
        var dt = list[i].querySelector('[datetime]').getAttribute('datetime');
        best = { t: t, date: new Date(dt) };
      }
    }
    return best;
  }

  function fmt(d) {
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function updateBtn() {
    btn.textContent = scrolling ? 'Stop' : 'Scroll ↓';
    btn.classList.toggle('stop', scrolling);
  }

  async function start() {
    scrolling = true;
    updateBtn();
    scroller = null;
    getScroller();
    await sleep(300);
    setStatus('Scrolling — press Stop to halt.');

    var stall = 0;
    while (scrolling) {
      if (!onHistoryPage()) {
        scrolling = false;
        updateBtn();
        setStatus('Left the History page — scroll stopped.');
        break;
      }

      var sc = getScroller();
      var dist = Math.max(height(sc) * 3.5, 2600);
      var moved = moveDown(dist);

      if (moved) {
        stall = 0;
        await sleep(150);
        var topPost = newestDate();
        if (topPost && topPost.date) setStatus('Scrolling… newest: ' + fmt(topPost.date));
      } else {
        stall++;
        if (stall >= 60) {
          scrolling = false;
          updateBtn();
          setStatus('No more posts could be loaded after a long wait — stopped.');
          break;
        }
        setStatus('Loading more posts… keep scrolling (' + stall + ')');
        await sleep(550);
        moveDown(120);
      }
    }
    updateBtn();
  }

  document.getElementById('xbdj-close').addEventListener('click', function () {
    scrolling = false;
    updateBtn();
    panel.remove();
  });

  var head = panel.querySelector('.h');
  var drag = null;
  head.addEventListener('mousedown', function (e) {
    if (e.target.id === 'xbdj-close') return;
    drag = { x: e.clientX, y: e.clientY, l: panel.offsetLeft, t: panel.offsetTop };
    e.preventDefault();
  });
  window.addEventListener('mousemove', function (e) {
    if (!drag) return;
    panel.style.left = drag.l + e.clientX - drag.x + 'px';
    panel.style.top = drag.t + e.clientY - drag.y + 'px';
  });
  window.addEventListener('mouseup', function () { drag = null; });

  btn.addEventListener('click', function () {
    if (scrolling) {
      scrolling = false;
      updateBtn();
      setStatus('Stopped.');
      return;
    }
    if (!onHistoryPage()) {
      setStatus('Opening your History page…');
      var link = navLink();
      if (link) {
        link.click();
        var waiter = setInterval(function () {
          if (onHistoryPage()) {
            clearInterval(waiter);
            start();
          }
        }, 400);
      } else {
        location.href = location.hostname.replace('mobile.', '') + '/i/history';
      }
    } else {
      start();
    }
  });
})();
