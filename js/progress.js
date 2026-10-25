/* Tiến độ học tập (localStorage): XP, cấp, huy hiệu, nút xóa dữ liệu, hộp hướng dẫn */
(() => {
  const $ = id => document.getElementById(id), KEY = 'pmai_v3';
  const ls = {get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }};
  const S = {rooms: [], machines: [], cases: 0, stations: 0};
  try { Object.assign(S, JSON.parse(ls.get(KEY) || '{}')); } catch (e) {}
  const BADGES = [
    ['🧭', 'Nhà thám hiểm', 'Ghé cả 4 phòng', s => s.rooms.length >= 4],
    ['🔬', 'Kỹ thuật viên', 'Thử cả 4 thiết bị 3D', s => s.machines.length >= 4],
    ['🩺', 'Bác sĩ chẩn đoán', 'Giải đúng 4/4 ca học tập', s => s.cases >= 4],
    ['🚑', 'Đội cấp cứu', 'Qua đủ 6 trạm kiến thức', s => s.stations >= 6]];
  const best = () => +ls.get('pmai_best') || 0;
  const xp = () => S.rooms.length * 10 + S.machines.length * 15 + S.cases * 25 + S.stations * 10 + (best() > 0 ? 20 : 0);
  const owned = new Set(BADGES.filter(b => b[3](S)).map(b => b[1]));
  const toast = m => { const t = $('toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2800); };
  function render() {
    const x = xp();
    ls.set(KEY, JSON.stringify(S));
    $('lvl').textContent = 'Cấp ' + (Math.floor(x / 60) + 1);
    $('xpTxt').textContent = x + ' XP';
    $('xpBar').style.width = (x % 60) / 60 * 100 + '%';
    $('badges').innerHTML = BADGES.map(b => `<span class="badge${b[3](S) ? ' on' : ''}" title="${b[1]}: ${b[2]}" aria-label="${b[1]}: ${b[2]}">${b[0]}</span>`).join('');
    BADGES.forEach(b => { if (b[3](S) && !owned.has(b[1])) { owned.add(b[1]); toast(`${b[0]} Huy hiệu mới: ${b[1]}`); } });
  }
  const add = (arr, v) => { if (!S[arr].includes(v)) { S[arr].push(v); render(); } };
  document.addEventListener('pmai:room', e => { if (['theory', 'lab', 'cases', 'game'].includes(e.detail)) { add('rooms', e.detail); if (e.detail === 'lab') add('machines', 'xray'); render(); } });
  document.querySelectorAll('.tab[data-machine]').forEach(b => b.addEventListener('click', () => add('machines', b.dataset.machine)));
  const watch = (id, re, key) => { const el = $(id); if (el) new MutationObserver(() => { const m = re.exec(el.textContent); if (m) { S[key] = Math.max(S[key], +m[1]); render(); } }).observe(el, {childList: true, characterData: true, subtree: true}); };
  watch('caseScore', /(\d+)\s*\/\s*4/, 'cases'); watch('gameProgress', /(\d+)\s*\/\s*6/, 'stations');
  const gr = $('gameResult'); if (gr) new MutationObserver(render).observe(gr, {attributes: true, attributeFilter: ['class']});
  $('helpBtn').addEventListener('click', () => $('help').showModal());
  $('helpClose').addEventListener('click', () => $('help').close());
  $('help').addEventListener('click', e => { if (e.target === $('help')) $('help').close(); });
  $('resetProg').addEventListener('click', () => {
    if (!confirm('Xóa toàn bộ tiến độ, điểm kỷ lục và cài đặt đã lưu trên máy này?')) return;
    try { Object.keys(localStorage).filter(k => k.startsWith('pmai_')).forEach(k => localStorage.removeItem(k)); } catch (e) {}
    location.hash = ''; location.reload();
  });
  render();
})();
