/* Sổ ghi số liệu thí nghiệm: ghi các thông số đang hiển thị → bảng → tải CSV (có BOM để Excel đọc tiếng Việt) */
(() => {
  const wrap = document.querySelector('.viewport-wrap');
  if (!wrap) return;
  const NAMES = {xray: 'X-quang', ct: 'CT', us: 'Siêu âm', mri: 'MRI'}, rows = [];
  const d = document.createElement('details');
  d.className = 'logbook';
  d.innerHTML = '<summary>Sổ ghi số liệu (<span id="logN">0</span> dòng)</summary><div class="log-act"><button class="btn inline-btn primary" id="logAdd" type="button">Ghi số liệu hiện tại</button><button class="btn inline-btn" id="logCsv" type="button">Tải CSV</button><button class="btn inline-btn" id="logClr" type="button">Xóa sổ</button></div><div class="log-scroll"><table><thead><tr><th>Giờ</th><th>Thiết bị</th><th>Đại lượng</th><th>Giá trị</th></tr></thead><tbody></tbody></table></div>';
  wrap.appendChild(d);
  const body = d.querySelector('tbody'), clean = n => n.textContent.trim().replace(/\s+/g, ' ');
  const sync = () => { document.getElementById('logN').textContent = rows.length; };
  document.getElementById('logAdd').addEventListener('click', () => {
    const tab = document.querySelector('.tab.active'), m = tab && tab.dataset.machine, panel = m && document.getElementById(m + 'Controls');
    if (!panel) return;
    const now = new Date().toLocaleTimeString('vi-VN'), pairs = [];
    panel.querySelectorAll('.control-label').forEach(l => { const s = l.querySelector('span'), o = l.querySelector('output'); if (s && o) pairs.push([clean(s), clean(o)]); });
    panel.querySelectorAll('.metric').forEach(l => { const s = l.querySelector('span'), v = l.querySelector('strong'); if (s && v) pairs.push([clean(s), clean(v)]); });
    pairs.forEach(([q, v]) => { const r = [now, NAMES[m], q, v]; rows.push(r); body.insertAdjacentHTML('beforeend', '<tr>' + r.map(c => `<td>${c.replace(/</g, '&lt;')}</td>`).join('') + '</tr>'); });
    sync();
  });
  document.getElementById('logClr').addEventListener('click', () => { rows.length = 0; body.innerHTML = ''; sync(); });
  document.getElementById('logCsv').addEventListener('click', () => {
    if (!rows.length) { const t = document.getElementById('toast'); t.textContent = 'Sổ trống: hãy bấm "Ghi số liệu hiện tại" trước.'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2400); return; }
    const csv = '\ufeff' + [['Giờ', 'Thiết bị', 'Đại lượng', 'Giá trị'], ...rows].map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'}));
    a.download = 'so-lieu-thi-nghiem.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
})();
