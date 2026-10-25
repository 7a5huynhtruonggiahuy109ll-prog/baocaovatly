/* Màn tải với tiến trình THẬT: DOM + phông chữ + toàn trang + thư viện 3D (cờ __physics3dStarted từ lab3d.js) */
(() => {
  const $ = id => document.getElementById(id), L = $('loader'), t0 = performance.now();
  const ls = {get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }};
  const st = {dom: 1, fonts: 0, page: document.readyState === 'complete' ? 1 : 0, gl: window.__physics3dStarted ? 1 : 0};
  const W = {dom: 15, fonts: 25, page: 25, gl: 35}, MSG = {fonts: 'Đang tải phông chữ…', page: 'Đang tải giao diện…', gl: 'Đang tải thư viện 3D…'};
  let shown = 0, finished = false;
  if (document.fonts) document.fonts.ready.then(() => { st.fonts = 1; });
  setTimeout(() => { st.fonts = 1; }, 4000); // phông lỗi cũng không chặn
  addEventListener('load', () => { st.page = 1; });
  function finish() {
    if (finished) return; finished = true; clearInterval(iv);
    const saved = ls.get('pmai_motion');
    if (st.gl && (saved === '1' || (saved === null && matchMedia('(prefers-reduced-motion:reduce)').matches))) $('motionBtn').click();
    $('ldBar').style.width = '100%'; L.classList.add('done'); document.body.classList.add('booted');
    setTimeout(() => new MutationObserver(() => ls.set('pmai_motion', document.body.classList.contains('reduce-motion') ? '1' : '0')).observe(document.body, {attributes: true, attributeFilter: ['class']}), 50);
    setTimeout(() => L.remove(), 800);
  }
  const iv = setInterval(() => {
    if (window.__physics3dStarted) st.gl = 1;
    const target = Object.keys(W).reduce((a, k) => a + W[k] * st[k], 0), el = performance.now() - t0;
    shown += (target - shown) * .25;
    $('ldBar').style.width = shown + '%'; $('ldPct').textContent = Math.round(shown) + '%';
    const wait = Object.keys(MSG).find(k => !st[k]);
    $('ldTxt').textContent = wait ? MSG[wait] : 'Sẵn sàng';
    if (target >= 100 && shown > 97 && el > 700) finish();
    else if (el > 12000 && !st.gl) { $('ldTxt').textContent = 'Không tải được thư viện 3D (mạng hoặc CDN). Lý thuyết và ca học tập vẫn dùng được.'; $('ldSkip').hidden = false; }
  }, 80);
  $('ldSkip').addEventListener('click', finish);
})();
