/* ==========================================================
   app.js — điều hướng & hoạt ảnh (không đụng tới logic 3D)
   1. Dữ liệu phòng  2. Chuyển màn hình  3. Chuyển cảnh
   4. Cổng 3D ở trung tâm  5. Robot PHY-BOT  6. Sắp xếp phòng thực nghiệm
   ========================================================== */
(() => {
  'use strict';
  const $ = id => document.getElementById(id), B = document.body;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const quiet = () => matchMedia('(prefers-reduced-motion:reduce)').matches || B.classList.contains('reduce-motion');

  /* 1. DỮ LIỆU PHÒNG */
  const ROOMS = {
    theory: {t: 'Ôn tập lý thuyết', c: '#b69aff', log: ['> nạp công thức: I = I₀e^(−μd), R, f₀…', '> mở máy tính mô phỏng nhanh', '> sẵn sàng ôn tập']},
    lab: {t: 'Phòng thực nghiệm 3D', c: '#4de8f3', log: ['> khởi tạo bộ dựng hình WebGL…', '> nạp X-quang · CT · siêu âm · MRI', '> hiệu chuẩn thiết bị ảo… sẵn sàng']},
    cases: {t: 'Ca học tập', c: '#50e3a4', log: ['> mở hồ sơ ca bệnh mô phỏng…', '> nạp 4 tình huống chẩn đoán', '> sẵn sàng suy luận']},
    game: {t: 'Trò chơi cứu hộ', c: '#ff6f91', log: ['> khởi động xe cứu thương 3D…', '> nạp 6 trạm kiến thức', '> đội cấp cứu sẵn sàng']}
  };
  const HUB = {t: 'Trung tâm điều khiển', c: '#4de8f3', log: ['> thoát phòng hiện tại…', '> quay về trung tâm', '> sẵn sàng']};
  const HELLO = 'Xin chào, mình là PHY-BOT! Hãy di chuột, mình sẽ chỉ đường cho bạn.', PICK = 'Chọn một phòng để bắt đầu nhé.';
  const say = t => { $('say').textContent = t; };
  const cur = () => location.hash.slice(1);

  /* 2. CHUYỂN MÀN HÌNH (intro → hub → phòng) */
  function show(name) {
    const room = ROOMS[name];
    B.dataset.stage = room ? 'room' : name === 'hub' ? 'hub' : 'intro';
    B.dataset.room = room ? name : ''; // perf.js dùng để chỉ vẽ 3D đúng phòng
    document.dispatchEvent(new CustomEvent('pmai:room', {detail: name})); // progress.js ghi nhận tiến độ
    document.querySelectorAll('.room').forEach(s => s.classList.toggle('on', s.dataset.room === name));
    if (room) {
      B.style.setProperty('--rc', room.c);
      $('roomTitle').textContent = room.t;
      document.querySelectorAll('#roomNav button').forEach(b => b.classList.toggle('on', b.dataset.go === name));
      window.scrollTo({top: 0, behavior: 'instant'});
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize'))); // để WebGL tính lại kích thước
    }
    say(B.dataset.stage === 'hub' ? PICK : HELLO);
  }
  let busy = false;
  async function go(name, x, y, fast) {
    if (busy || name === cur() || (name === 'intro' && !cur())) return;
    const apply = () => { history.pushState(null, '', '#' + name); show(name); };
    if (name === 'hub' && B.dataset.stage === 'intro') return apply(); // bấm "Khởi động": robot thu nhỏ về góc
    busy = true;
    const info = ROOMS[name] || HUB;
    info.icon = (document.querySelector(`.portal[data-go="${name}"] .p-ico`) || {}).outerHTML || '';
    await warp(info, x, y, fast, apply);
    busy = false;
  }
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-go]');
    if (!el) return;
    e.preventDefault();
    const r = el.getBoundingClientRect();
    $('mobileNav').style.display = 'none';
    go(el.dataset.go, e.detail ? e.clientX : r.left + r.width / 2, e.detail ? e.clientY : r.top + r.height / 2, !!el.closest('.room-bar'));
  });
  addEventListener('hashchange', () => show(cur()));

  /* 3. CHUYỂN CẢNH: vòng sáng loang ra từ điểm nhấn, thanh nạp, 3 dòng log */
  function warp(info, x, y, fast, mid) {
    return new Promise(done => {
      const w = $('warp'), q = quiet(), f = fast || q;
      w.style.cssText = `--c:${info.c};--x:${x}px;--y:${y}px;--dur:${f ? .35 : 1}s`;
      $('warpTitle').textContent = info.t;
      $('warpIcon').innerHTML = info.icon || '';
      $('warpLog').innerHTML = info.log.map(l => `<li>${l}</li>`).join('');
      w.className = 'warp in' + (f ? ' fast' : '');
      setTimeout(() => {
        mid();
        w.className = 'warp out';
        setTimeout(() => { w.className = 'warp'; done(); }, 650);
      }, q ? 150 : fast ? 700 : 1750);
    });
  }

  /* 4. CỔNG Ở TRUNG TÂM: nghiêng 3D + đèn rọi theo chuột + robot nói */
  document.querySelectorAll('.portal').forEach(p => {
    p.addEventListener('pointermove', e => {
      const r = p.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      p.style.setProperty('--mx', x * 100 + '%');
      p.style.setProperty('--my', y * 100 + '%');
      if (!quiet()) p.style.transform = `perspective(900px) rotateY(${(x - .5) * 14}deg) rotateX(${(.5 - y) * 14}deg) translateZ(10px)`;
    });
    p.addEventListener('pointerenter', () => say(p.dataset.say));
    p.addEventListener('pointerleave', () => { p.style.transform = ''; say(PICK); });
  });

  /* 5. ROBOT: mỗi cánh tay là xương 2 khớp (IK). Tay gần con trỏ hơn sẽ chỉ tới đó. */
  const U = 62, F = 58, svg = $('robotSvg'), ret = $('reticle'), beam = $('beamLine');
  const arms = [...svg.querySelectorAll('[data-arm]')].map(g => {
    const [sx, sy] = g.dataset.s.split(',').map(Number), side = +g.dataset.side;
    return {g, sx, sy, side, up: g.querySelector('.up'), fo: g.querySelector('.fo'), tip: g.querySelector('.tip'), cur: {x: sx + side * 40, y: sy + 96}};
  }); // arms[0] = tay trái màn hình, arms[1] = tay phải
  const pupils = [...svg.querySelectorAll('.pupil')], head = $('hd');
  const P = {x: innerWidth / 2, y: innerHeight / 2, t: -1e5};
  addEventListener('pointermove', e => {
    P.x = e.clientX; P.y = e.clientY; P.t = performance.now();
    ret.classList.toggle('big', !!e.target.closest('a,button,input,select'));
  }, {passive: true});

  function frame(t) {
    requestAnimationFrame(frame);
    const r = svg.getBoundingClientRect();
    if (B.dataset.stage === 'room' || !r.width) return;
    const idle = t - P.t > 4000; // không có chuột (điện thoại) → robot tự quét quanh
    const px = idle ? innerWidth * (.5 + .38 * Math.sin(t / 1900)) : P.x, py = idle ? innerHeight * (.42 + .22 * Math.sin(t / 1400)) : P.y;
    const cx = r.left + r.width / 2, act = px >= cx ? 1 : 0;
    arms.forEach((a, i) => {
      let tx, ty;
      if (i === act) { // đổi toạ độ con trỏ về hệ toạ độ của robot
        const p = svg.createSVGPoint(); p.x = px; p.y = py;
        const q = p.matrixTransform(a.g.getScreenCTM().inverse()); tx = q.x; ty = q.y;
      } else { tx = a.sx + a.side * 34; ty = a.sy + 98 + Math.sin(t / 800 + i * 2) * 5; } // tay còn lại buông thả
      a.cur.x += (tx - a.cur.x) * .16; a.cur.y += (ty - a.cur.y) * .16;
      const dx = a.cur.x - a.sx, dy = a.cur.y - a.sy, ang = Math.atan2(dy, dx);
      const d = clamp(Math.hypot(dx, dy), 28, U + F - .5);
      const s = Math.acos(clamp((U * U + d * d - F * F) / (2 * U * d), -1, 1)), th1 = ang + a.side * s;
      const ex = U * Math.cos(th1), ey = U * Math.sin(th1), th2 = Math.atan2(d * Math.sin(ang) - ey, d * Math.cos(ang) - ex);
      a.up.setAttribute('transform', `translate(${a.sx} ${a.sy}) rotate(${th1 * 57.2958})`);
      a.fo.setAttribute('transform', `translate(${U} 0) rotate(${(th2 - th1) * 57.2958})`);
    });
    const hx = clamp((px - cx) / (innerWidth * .35), -1, 1), hy = clamp((py - (r.top + r.height * .27)) / (innerHeight * .35), -1, 1);
    head.setAttribute('transform', `rotate(${hx * 9} 0 46)`);
    pupils.forEach(p => p.setAttribute('transform', `translate(${hx * 5} ${hy * 4})`));
    const tp = arms[act].tip.getBoundingClientRect();
    beam.setAttribute('x1', tp.left + tp.width / 2); beam.setAttribute('y1', tp.top + tp.height / 2);
    beam.setAttribute('x2', px); beam.setAttribute('y2', py);
    beam.style.opacity = idle ? 0 : .9;
    ret.style.opacity = idle ? 0 : 1;
    ret.style.transform = `translate(${px}px,${py}px)`;
  }
  requestAnimationFrame(frame);

  /* 6. PHÒNG THỰC NGHIỆM: gọn lại — quan sát nằm dưới khung 3D, điều khiển chia 2 tab */
  const col = document.querySelector('.control-column'), wrap = document.querySelector('.viewport-wrap');
  if (col && wrap) {
    const ex = col.querySelector('.explanation');
    if (ex) wrap.appendChild(ex);
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.innerHTML = '<button type="button" data-v="params" class="on">Điều khiển</button><button type="button" data-v="lesson">Thí nghiệm &amp; bài tập</button>';
    col.prepend(seg);
    col.dataset.view = 'params';
    seg.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      col.dataset.view = b.dataset.v;
      seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      col.scrollTop = 0;
    });
  }

  /* 7. PHÍM TẮT: 1–4 chuyển phòng · H về trung tâm · ? hướng dẫn */
  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName) || $('help').open) return;
    const map = {1: 'theory', 2: 'lab', 3: 'cases', 4: 'game'}, cx = innerWidth / 2, cy = innerHeight / 2;
    if (map[e.key]) go(map[e.key], cx, cy, true);
    else if ((e.key === 'h' || e.key === 'H') && B.dataset.stage === 'room') go('hub', cx, cy, true);
    else if (e.key === '?') $('help').showModal();
  });

  show(cur()); // mở thẳng phòng nếu link có #lab, #game…
})();
