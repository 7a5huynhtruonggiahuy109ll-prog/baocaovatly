# PHYSICS.MED.AI — Vật lí trong chẩn đoán y học

Web học tập 3D: màn khởi động có robot PHY-BOT → trung tâm 4 cổng → 4 phòng (Ôn tập lý thuyết, Phòng thực nghiệm 3D, Ca học tập, Trò chơi cứu hộ).

## Cấu trúc
| Tệp | Việc của tệp |
|---|---|
| `index.html` | Khung trang, robot, trung tâm, 4 phòng |
| `css/app.css` | Giao diện mới: chữ, robot, trung tâm, chuyển cảnh, bố cục phòng thực nghiệm |
| `css/legacy.css`, `css/effects.css` | CSS gốc v2 (nút, bảng điều khiển, trò chơi, kính mờ, neon) |
| `js/app.js` | Điều hướng, chuyển cảnh, robot chỉ theo chuột, sắp xếp phòng thực nghiệm |
| `js/lab3d.js` | Mô hình 3D (Three.js), hạt năng lượng, kéo thả, trò chơi xe cứu thương |
| `js/lessons.js` | Bài thí nghiệm A–D, ca học tập |
| `js/extras.js` | Âm thanh, toàn màn hình, máy tính nhanh, điểm kỷ lục |
| `js/boot-check.js` | Cảnh báo khi thư viện 3D tải chậm |
| `js/loader.js` | Màn tải có tiến trình thật, khôi phục cài đặt giảm hiệu ứng |
| `js/perf.js` | Chỉ vẽ 3D khi đang ở đúng phòng (tiết kiệm GPU/pin) |
| `js/progress.js` | XP, cấp, huy hiệu, xóa dữ liệu, hộp hướng dẫn |
| `js/logbook.js` | Sổ ghi số liệu thí nghiệm, tải CSV |

## Chạy thử
Mở `index.html` bằng trình duyệt (cần Internet để tải Three.js và phông chữ).

## Đưa lên GitHub Pages
1. Tạo repository, tải toàn bộ các tệp trong thư mục này lên (giữ nguyên thư mục `css/`, `js/`).
2. Settings → Pages → Source: *Deploy from a branch* → nhánh `main`, thư mục `/ (root)`.
3. Chờ khoảng 1 phút, truy cập `https://<tên-bạn>.github.io/<tên-repo>/`.

Liên kết trực tiếp tới từng phòng: `#theory`, `#lab`, `#cases`, `#game`.
