/* Báo "đang tải thư viện 3D" nếu mạng/CDN chậm */
        window.__physics3dStarted = false;
        setTimeout(() => {if (!window.__physics3dStarted) {for (const id of ['labFallback', 'gameFallback']) {const el = document.getElementById(id); if (el) {el.style.display = 'flex'; el.textContent = 'Đang tải thư viện 3D… Nếu quá lâu, kiểm tra Internet/CDN, thử tải lại hoặc mở bằng VS Code Live Server.';} } } }, 12000);
