/* Hiệu năng: chỉ vẽ 3D khi đang ở đúng phòng và tab đang hiển thị (rời phòng = GPU nghỉ).
   Chạy TRƯỚC lab3d.js; nhận diện vòng lặp theo tên hàm labFrame / upg / gameLoop. */
(() => {
  const raf = window.requestAnimationFrame.bind(window), caf = window.cancelAnimationFrame.bind(window);
  const GATE = {labFrame: 'lab', upg: 'lab', gameLoop: 'game'}, dead = new Set();
  window.requestAnimationFrame = cb => {
    const room = GATE[cb.name];
    if (!room) return raf(cb);
    const id = raf(function tick(t) {
      if (dead.has(id)) return;
      if (document.body.dataset.room === room && !document.hidden) cb(t);
      else setTimeout(() => { if (!dead.has(id)) raf(tick); }, 250); // chờ nhẹ, không vẽ
    });
    return id;
  };
  window.cancelAnimationFrame = id => { dead.add(id); caf(id); };
})();
