/* Bài thí nghiệm A–D, thang HU, phản xạ siêu âm, góc lật MRI, ca học tập */
        (function () {
            'use strict';
            const $ = id => document.getElementById(id);
            const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
            const fmt = (v, d = 1) => Number(v).toLocaleString('vi-VN', {minimumFractionDigits: d, maximumFractionDigits: d});
            function setText(id, value) {const el = $(id); if (el) el.textContent = value;}

            // X-ray: simplified effective-attenuation model; values teach trends, not patient dose.
            function updateXrayLesson() {
                const kv = +$('kv').value, d = +$('xrayThickness').value, al = +$('xrayAl').value;
                setText('xrayThicknessOut', fmt(d, 1) + ' cm'); setText('xrayAlOut', fmt(al, 1) + ' mm Al');
                // Higher tube potential generally hardens the spectrum. These coefficients are illustrative.
                const muSoft = .22 * Math.pow(100 / kv, 1.15) / (1 + .055 * al);
                const muBone = .72 * Math.pow(100 / kv, 1.12) / (1 + .045 * al);
                const soft = Math.exp(-muSoft * d), bone = Math.exp(-muBone * d);
                setText('xraySoftTransmission', fmt(soft * 100, 1) + '%'); setText('xrayBoneTransmission', fmt(bone * 100, 1) + '%');
                setText('xrayContrast', fmt(Math.max(0, soft - bone) * 100, 1) + ' điểm %');
                setText('xrayBeamQuality', al === 0 ? 'Chưa lọc thêm' : al < 2 ? 'Lọc nhẹ · I qua lọc ≈ ' + fmt(Math.exp(-.12 * al) * 100, 0) + '%' : 'Lọc mạnh hơn · I qua lọc ≈ ' + fmt(Math.exp(-.12 * al) * 100, 0) + '%; phổ cứng hơn');
                const fb = $('xrayLessonFeedback'); if (fb) {
                    fb.className = 'lesson-feedback';
                    if (d >= 7) {fb.classList.add('warn'); fb.textContent = 'Bề dày lớn làm tín hiệu truyền qua giảm mạnh. Trong mô hình, tăng kV làm hệ số suy giảm hiệu dụng giảm; tuy nhiên ảnh tốt còn phụ thuộc tương phản, nhiễu và tối ưu liều, không thể chỉ “tăng kV càng cao càng tốt”.';}
                    else if (al >= 3) {fb.classList.add('good'); fb.textContent = 'Lọc nhôm loại bớt photon năng lượng thấp, vốn dễ bị hấp thụ ở bề mặt. Chùm tia trung bình cứng hơn; điều này không có nghĩa lớp lọc làm mọi photon mạnh lên hoặc luôn tăng độ tương phản.';}
                    else fb.textContent = 'Theo Lambert–Beer, I/I₀ = e^(−μd). Với cùng vật liệu và phổ tia gần như cố định, tăng d hoặc μ khiến cường độ giảm theo hàm mũ. Xương có μ hiệu dụng lớn hơn mô mềm nên tạo tương phản.';
                }
                drawXrayPlot(kv, al, d);
            }
            function drawXrayPlot(kv, al, d) {
                const c = $('xrayPlot'); if (!c) return; const x = c.getContext('2d'), w = c.width, h = c.height; x.clearRect(0, 0, w, h); x.fillStyle = '#050c16'; x.fillRect(0, 0, w, h); const L = 36, R = 10, T = 14, B = 25, pw = w - L - R, ph = h - T - B;
                x.strokeStyle = '#23394d'; x.lineWidth = 1; for (let i = 0; i <= 4; i++) {let yy = T + ph * i / 4; x.beginPath(); x.moveTo(L, yy); x.lineTo(w - R, yy); x.stroke();}
                x.fillStyle = '#89a9bd'; x.font = '11px monospace'; x.fillText('I/I₀', 5, 12); x.fillText('0 cm', L - 3, h - 7); x.fillText('10 cm', w - 55, h - 7);
                const mus = [.22 * Math.pow(100 / kv, 1.15) / (1 + .055 * al), .72 * Math.pow(100 / kv, 1.12) / (1 + .045 * al)]; const colors = ['#4de8f3', '#b69aff'];
                mus.forEach((mu, j) => {x.strokeStyle = colors[j]; x.lineWidth = 2.6; x.beginPath(); for (let i = 0; i <= 100; i++) {const xx = 10 * i / 100, yy = Math.exp(-mu * xx), X = L + pw * i / 100, Y = T + ph * (1 - yy); i ? x.lineTo(X, Y) : x.moveTo(X, Y);} x.stroke();});
                const X = L + pw * d / 10; x.strokeStyle = '#f6bd60'; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(X, T); x.lineTo(X, T + ph); x.stroke(); x.setLineDash([]); x.fillStyle = '#f6bd60'; x.fillText('d hiện tại', clamp(X - 22, L, w - 72), T + 12);
                x.fillStyle = '#4de8f3'; x.fillRect(w - 148, 6, 8, 8); x.fillStyle = '#b8cfdf'; x.fillText('Mô mềm', w - 135, 14); x.fillStyle = '#b69aff'; x.fillRect(w - 73, 6, 8, 8); x.fillStyle = '#b8cfdf'; x.fillText('Xương', w - 60, 14);
            }
            ['kv', 'xrayThickness', 'xrayAl'].forEach(id => $(id)?.addEventListener('input', updateXrayLesson));
            function xrayChallengeValues(kv, al, d = 5) {const muS = .22 * Math.pow(100 / kv, 1.15) / (1 + .055 * al), muB = .72 * Math.pow(100 / kv, 1.12) / (1 + .045 * al), soft = Math.exp(-muS * d), bone = Math.exp(-muB * d); return {soft, bone, contrast: soft - bone, pass: bone >= .10 && (soft - bone) >= .10};}
            $('xrayChallengeStart')?.addEventListener('click', () => {$('xrayThickness').value = 5; updateXrayLesson(); setText('xrayChallengeFeedback', 'Thử thách đã bắt đầu: d = 5 cm. Hãy tìm kV thấp nhất sao cho tín hiệu qua xương ≥ 10% và chênh lệch mô mềm–xương ≥ 10 điểm phần trăm.'); $('xrayChallengeFeedback').className = 'lesson-feedback';});
            $('xrayChallengeCheck')?.addEventListener('click', () => {const d = +$('xrayThickness').value, kv = +$('kv').value, al = +$('xrayAl').value, fb = $('xrayChallengeFeedback'); fb.className = 'lesson-feedback'; if (Math.abs(d - 5) > .01) {fb.classList.add('warn'); fb.textContent = 'Đưa bề dày mô hình về 5,0 cm trước khi kiểm tra, vì đó là điều kiện cố định của thử thách.'; return;} const cur = xrayChallengeValues(kv, al); let min = Infinity; for (let k = 50; k <= 200; k++) {if (xrayChallengeValues(k, al).pass) {min = k; break;} } if (cur.pass) {fb.classList.add('good'); fb.textContent = 'Đạt cả hai điều kiện của bài tập ở ' + kv + ' kV: qua xương ' + fmt(cur.bone * 100, 1) + '%, chênh lệch mô mềm–xương ' + fmt(cur.contrast * 100, 1) + ' điểm %. Với mức lọc bạn chọn, kV thấp nhất theo mô hình là ' + min + ' kV. Hãy thử hạ xuống gần mức này để kiểm tra vì sao điện áp quá thấp không đáp ứng điều kiện.';} else {fb.classList.add('warn'); fb.textContent = 'Chưa đạt: qua xương ' + fmt(cur.bone * 100, 1) + '%, chênh lệch mô mềm–xương ' + fmt(cur.contrast * 100, 1) + ' điểm %. Tăng kV từng bước, quan sát hai điều kiện và không chỉ tối ưu độ xuyên. Đây là tiêu chí trò chơi, không phải khuyến cáo lâm sàng.';} });

            // CT HU table and simple conceptual matrix (not a real reconstruction algorithm).
            const huData = {air: {range: '−1000 HU', meaning: 'Rất ít suy giảm', desc: 'Không khí nằm ở cực âm của thang HU.'}, fat: {range: '−100 đến −50 HU', meaning: 'Thấp hơn nước', desc: 'Mỡ thường có HU âm, nhưng giá trị đổi theo thành phần và điều kiện đo.'}, water: {range: '0 HU', meaning: 'Mốc chuẩn', desc: 'Thang Hounsfield quy ước nước tinh khiết gần 0 HU.'}, soft: {range: '+20 đến +50 HU', meaning: 'Suy giảm trung bình', desc: 'Mô mềm có nhiều giá trị khác nhau; đây là khoảng minh họa, không phải mọi cơ quan đều giống nhau.'}, bone: {range: '+700 đến +1000 HU', meaning: 'Suy giảm cao', desc: 'Xương đặc thường có HU dương cao; xương xốp hay vùng khác có thể thấp hơn.'}};
            function updateHU() {const key = $('huTissue')?.value || 'soft', d = huData[key]; setText('huValue', d.range); setText('huMeaning', d.meaning); setText('huFeedback', d.desc + ' Giá trị HU được ước lượng so với nước và không phải kết quả đo của một bệnh nhân.'); setText('ctHU', d.range); setText('ctPreviewTitle', ($('ctRegion')?.textContent || 'Vùng lát cắt') + ' · mô chọn: ' + d.range);}
            $('huTissue')?.addEventListener('change', updateHU);
            function drawCTMatrix() {
                const c = $('ctMatrix'); if (!c) return; const ctx = c.getContext('2d'), w = c.width, h = c.height, angle = +$('ctAngle').value * Math.PI / 180; setText('ctAngleOut', Math.round(angle * 180 / Math.PI) + '°'); ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#050c16'; ctx.fillRect(0, 0, w, h); const n = 22, cell = 6.3, gap = 1.1, size = n * (cell + gap), sx = 14, sy = 20;
                // Rotate the sampling coordinates with the angle, then render a synthetic attenuation map.
                for (let r = 0; r < n; r++)for (let col = 0; col < n; col++) {
                    const xx = (col - (n - 1) / 2) / (n / 2), yy = (r - (n - 1) / 2) / (n / 2); const rx = xx * Math.cos(angle) - yy * Math.sin(angle), ry = xx * Math.sin(angle) + yy * Math.cos(angle); let val = 10;
                    const head = rx * rx / (.82 * .82) + ry * ry / (.91 * .91) < 1; const brain = rx * rx / (.68 * .68) + ry * ry / (.74 * .74) < 1; const bone = rx * rx / (.76 * .76) + ry * ry / (.83 * .83) > .73;
                    if (head) val = brain ? 112 : bone ? 225 : 65; const vent = ((rx + .20) ** 2 + (ry + .06) ** 2 < .035) || ((rx - .20) ** 2 + (ry + .06) ** 2 < .035); if (vent && brain) val = 25;
                    const cc = Math.round(val); ctx.fillStyle = `rgb(${cc},${Math.min(255, cc + 5)},${Math.min(255, cc + 13)})`; ctx.fillRect(sx + col * (cell + gap), sy + r * (cell + gap), cell, cell);
                }
                const barX = 220, barY = 32; ctx.strokeStyle = '#4de8f3'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(barX, barY); ctx.lineTo(barX + 105, barY); ctx.stroke(); ctx.fillStyle = '#c5dbe8'; ctx.font = '11px monospace'; ctx.fillText('Góc ' + Math.round(angle * 180 / Math.PI) + '°', barX, barY + 21); ctx.fillText('phép chiếu', barX, barY + 40); ctx.fillText('→', barX + 42, barY + 58); ctx.fillText('ma trận', barX, barY + 76); ctx.fillStyle = '#9ab1c3'; ctx.font = '10px sans-serif'; ctx.fillText('Pixel giả lập', barX, barY + 97);
                setText('ctMatrixCaption', 'Ở góc ' + Math.round(angle * 180 / Math.PI) + '°, hình chiếu lấy mẫu theo hướng khác. CT thực thu nhiều góc, xử lí dữ liệu suy giảm và tái tạo ảnh; ma trận này chỉ mô tả khái niệm.');
            }
            $('ctAngle')?.addEventListener('input', drawCTMatrix);

            // Ultrasound impedance and depth trade-off.
            function updateUSLesson() {
                const f = +$('freq').value, gel = $('gelBtn')?.getAttribute('aria-pressed') === 'true'; const zAir = .0004, zSkin = 1.5, zGel = 1.48; const rAir = Math.pow((zSkin - zAir) / (zSkin + zAir), 2) * 100; const rGel = Math.pow((zSkin - zGel) / (zSkin + zGel), 2) * 100; const alpha = .5, depth20 = 20 / (2 * alpha * f), loss5 = 2 * alpha * f * 5;
                setText('usRAir', fmt(rAir, 2) + '%'); setText('usRGel', fmt(rGel, 4) + '%'); setText('usDepthCm', fmt(depth20, 1) + ' cm'); setText('usLossDb', fmt(loss5, 1) + ' dB');
                const fb = $('usLessonFeedback'); if (fb) {fb.className = 'lesson-feedback'; if (!gel) {fb.classList.add('warn'); fb.textContent = 'Gel đang tắt: với Z không khí ≈ 0,0004 MRayl và Z da ≈ 1,5 MRayl, phản xạ cường độ tại mặt phân cách xấp xỉ 99,9%. Tín hiệu vào cơ thể vì vậy giảm rất mạnh. Giá trị thực phụ thuộc góc tới và bề mặt tiếp xúc.';} else if (f >= 12) {fb.classList.add('good'); fb.textContent = 'Tần số cao rút ngắn bước sóng và có lợi cho phân giải các cấu trúc nông. Nhưng mô hình suy giảm gần đúng cho thấy 20 dB đạt sau khoảng ' + fmt(depth20, 1) + ' cm ở ' + fmt(f, 1) + ' MHz; không nên chọn tần số cao để khảo sát cấu trúc sâu.';} else fb.textContent = 'Tần số ' + fmt(f, 1) + ' MHz cho độ sâu ước tính ' + fmt(depth20, 1) + ' cm nếu tính đường đi hai chiều của echo với α ≈ 0,5 dB/(cm·MHz). Đây là mô hình mô mềm lý tưởng, không phải giới hạn thiết bị hay kết quả siêu âm thực.';}
            }
            ['freq'].forEach(id => $(id)?.addEventListener('input', updateUSLesson));
            $('gelBtn')?.addEventListener('click', () => setTimeout(updateUSLesson, 0));

            // MRI: conceptual magnetization-vector drawing and Larmor frequency live readout.
            let flipAngle = 90; window.__mriFlipAngle = flipAngle;
            function drawMRIVector() {
                window.__mriFlipAngle = flipAngle; const c = $('mriVectorCanvas'); if (!c) return; const ctx = c.getContext('2d'), w = c.width, h = c.height; ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#050d18'; ctx.fillRect(0, 0, w, h); const cx = w * .5, cy = h * .75, len = 54; ctx.strokeStyle = '#526c82'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx, cy + 12); ctx.lineTo(cx, 18); ctx.moveTo(cx - 98, cy); ctx.lineTo(cx + 98, cy); ctx.stroke(); ctx.fillStyle = '#9db5c7'; ctx.font = '11px monospace'; ctx.fillText('B₀ / trục dọc', 8, 15); ctx.fillText('mặt phẳng ngang', w - 112, cy - 8);
                // A 0° vector is vertical; 90° is transverse; 180° points down.
                const rad = flipAngle * Math.PI / 180, dx = Math.sin(rad) * len, dy = -Math.cos(rad) * len; ctx.strokeStyle = '#4de8f3'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + dx, cy + dy); ctx.stroke(); ctx.fillStyle = '#4de8f3'; ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#c7e9f1'; ctx.font = '12px monospace'; ctx.fillText(flipAngle + '°', cx + dx + 9, cy + dy - 4);
                setText('flipAngleReadout', flipAngle + '°'); setText('flipMeaning', flipAngle === 90 ? 'Từ hóa ngang' : 'Đảo chiều dọc'); setText('rfBtn', 'ϟ Phát xung RF ' + flipAngle + '°');
                const a = $('flip90'), b = $('flip180'); if (a) {a.classList.toggle('primary', flipAngle === 90); a.setAttribute('aria-pressed', String(flipAngle === 90));} if (b) {b.classList.toggle('primary', flipAngle === 180); b.setAttribute('aria-pressed', String(flipAngle === 180));}
                setText('mriLessonFeedback', flipAngle === 90 ? 'Góc 90°: vectơ tổng hợp nằm trong mặt phẳng ngang; thành phần từ hóa ngang có thể tạo tín hiệu nhận được.' : 'Góc 180°: vectơ tổng hợp đảo hướng theo trục dọc trong mô hình. Không nên hiểu đây là một “ảnh tốt hơn” trong mọi tình huống; tương phản ảnh MRI phụ thuộc chuỗi xung và nhiều thông số.');
            }
            $('flip90')?.addEventListener('click', () => {flipAngle = 90; drawMRIVector();}); $('flip180')?.addEventListener('click', () => {flipAngle = 180; drawMRIVector();});
            $('rfBtn')?.addEventListener('click', () => {drawMRIVector(); const b = +$('field').value; setText('mriLessonFeedback', 'Đã phát xung RF mô phỏng ở góc ' + flipAngle + '°. Với B₀ = ' + fmt(b, 1) + ' T, tần số Larmor là ' + fmt(42.58 * b, 2) + ' MHz. Xung chỉ tạo đáp ứng mong muốn khi tần số phù hợp với điều kiện cộng hưởng; mô hình không mô phỏng đầy đủ động lực học spin.');});
            $('field')?.addEventListener('input', () => {setText('larmor', fmt(42.58 * (+$('field').value), 2) + ' MHz');});

            // Clinical-inquiry mode: the feedback explains the reasoning, including what a wrong choice misses.
            const cases = [
                {title: 'Khối nhỏ nằm nông ở tuyến giáp', prompt: 'Bác sĩ muốn khảo sát một cấu trúc nông, nhỏ ở vùng cổ. Cần phân giải không gian tốt ở độ sâu thấp.', best: 'us', freqMin: 12, setting: 'high', reason: 'Siêu âm tần số cao (khoảng 12–15 MHz trong bài học) phù hợp để minh họa khảo sát cấu trúc nông: bước sóng ngắn giúp phân giải tốt hơn, đổi lại độ xuyên giảm. Trong thực tế bác sĩ chọn đầu dò và thông số theo thiết bị, cơ địa và câu hỏi lâm sàng.', hint: 'Hãy chú ý chữ “nông” và “nhỏ”: độ phân giải quan trọng hơn khả năng xuyên rất sâu.'},
                {title: 'Chấn thương sọ não cấp, nghi xuất huyết', prompt: 'Một người bị va đập đầu mạnh. Tình huống bài học giả định cần đánh giá nhanh tổn thương nội sọ cấp, đặc biệt xuất huyết.', best: 'ct', setting: 'noncontrast', reason: 'Trong nhiều tình huống chấn thương đầu cấp cần khảo sát xuất huyết, CT sọ não không tiêm cản quang thường được ưu tiên vì nhanh và nhạy với xuất huyết cấp. MRI có vai trò ở các câu hỏi khác nhưng không phải lúc nào cũng phù hợp nhất ban đầu. Quyết định thật phụ thuộc đánh giá y tế và hướng dẫn chuyên môn.', hint: 'Đừng chọn chỉ vì MRI tạo ảnh mô mềm tốt; yếu tố thời gian và câu hỏi cấp cứu cũng quan trọng.'},
                {title: 'Nghi gãy xương cẳng tay', prompt: 'Sau té ngã, người bệnh đau khu trú ở cẳng tay. Bài học yêu cầu đánh giá xương và vị trí nghi gãy.', best: 'xray', setting: 'two_views', reason: 'X-quang thường là bước thăm dò ban đầu phù hợp khi nghi gãy xương. Xương hấp thụ tia X khác mô mềm nên tạo tương phản. Thực hành chụp cần đúng tư thế, vùng khảo sát và tối ưu liều; lựa chọn cụ thể thuộc nhân viên y tế.', hint: 'Hãy ghép mục tiêu quan sát cấu trúc xương với khả năng tạo ảnh chiếu của tia X.'},
                {title: 'Đánh giá mô mềm sau giai đoạn cấp', prompt: 'Sau khi đã đánh giá ban đầu, câu hỏi học tập là quan sát mô mềm/dây chằng sâu hơn mà X-quang thường thể hiện hạn chế.', best: 'mri', setting: 'soft_tissue', reason: 'MRI có độ tương phản mô mềm tốt và không dùng bức xạ ion hóa. Tuy nhiên, nó không phải lựa chọn duy nhất cho mọi tổn thương và có yêu cầu sàng lọc kim loại/thiết bị cấy ghép. Quy trình thật cần đánh giá của chuyên gia.', hint: 'Mục tiêu lúc này là mô mềm, không phải chỉ nhìn xương hay lựa chọn phương thức nhanh nhất trong mọi hoàn cảnh.'}
            ];
            const settingOptions = {
                us: [['high', 'Đầu dò tần số cao cho cấu trúc nông'], ['low', 'Tần số thấp ưu tiên xuyên sâu'], ['nogel', 'Không dùng gel truyền âm']],
                ct: [['noncontrast', 'CT sọ não không tiêm cản quang (bài học)'], ['mri_first', 'Chờ MRI trước dù cần đánh giá nhanh'], ['ultrasound', 'Siêu âm xuyên hộp sọ như lựa chọn mặc định']],
                xray: [['two_views', 'Ảnh X-quang theo tư thế phù hợp để đánh giá xương'], ['single_screen', 'Chỉ một ảnh tùy góc bất kỳ'], ['raise_dose', 'Tăng liều tối đa để ảnh sáng']],
                mri: [['soft_tissue', 'Ưu tiên tương phản mô mềm; sàng lọc MRI trước chụp'], ['metal_ok', 'Bỏ qua sàng lọc vật kim loại'], ['ionizing', 'MRI sử dụng bức xạ ion hóa']]
            };
            let caseIndex = 0, caseSolved = new Set();
            function renderCase() {const c = cases[caseIndex]; setText('caseCounter', 'CA ' + (caseIndex + 1) + ' / ' + cases.length); setText('caseTitle', c.title); setText('casePrompt', c.prompt); const select = $('caseSetting'); select.innerHTML = ''; (settingOptions[$('caseModality').value] || []).forEach(item => {const op = document.createElement('option'); op.value = item[0]; op.textContent = item[1]; select.appendChild(op);}); $('caseResult').className = 'case-result'; setText('caseResult', 'Chọn phương thức và cấu hình rồi nhấn “Kiểm tra lập luận”.'); $('caseFrequencyWrap').style.display = $('caseModality').value === 'us' ? 'block' : 'none'; setText('caseScore', caseSolved.size + ' / ' + cases.length);}
            function isCaseCorrect(c, modality, setting) {if (modality !== c.best) return false; if (c.best === 'us') return setting === 'high' && +$('caseFrequency').value >= 12; if (c.best === 'ct') return setting === 'noncontrast'; if (c.best === 'xray') return setting === 'two_views'; if (c.best === 'mri') return setting === 'soft_tissue'; return false;}
            $('caseSelect')?.addEventListener('change', renderCase);
            $('caseModality')?.addEventListener('change', () => {renderCase();});
            $('caseFrequency')?.addEventListener('input', () => setText('caseFrequencyOut', fmt(+$('caseFrequency').value, 1) + ' MHz'));
            $('checkCase')?.addEventListener('click', () => {
                const c = cases[caseIndex], modality = $('caseModality').value, setting = $('caseSetting').value, good = isCaseCorrect(c, modality, setting), r = $('caseResult'); r.className = 'case-result ' + (good ? 'correct' : 'incorrect');
                if (good) {caseSolved.add(caseIndex); r.textContent = 'LẬP LUẬN PHÙ HỢP. ' + c.reason;} else {let why = 'Lựa chọn hiện tại chưa giải quyết tốt câu hỏi trong tình huống. '; if (modality !== c.best) why += 'Hãy cân nhắc xem mô cần khảo sát, độ sâu và mức độ khẩn cấp có phù hợp với phương thức này không. '; else if (c.best === 'us' && +$('caseFrequency').value < 12) why += 'Tần số đang chọn còn thấp so với cấu trúc nông, nhỏ; tăng tần số cải thiện phân giải nhưng làm giảm độ xuyên. '; else why += 'Thông số hoặc nguyên tắc an toàn chưa phù hợp. '; r.textContent = 'HÃY THỬ LẠI. ' + why + c.hint + ' ' + c.reason;}
                setText('caseScore', caseSolved.size + ' / ' + cases.length);
            });
            $('casePrev')?.addEventListener('click', () => {caseIndex = (caseIndex + cases.length - 1) % cases.length; renderCase();});
            $('caseNext')?.addEventListener('click', () => {caseIndex = (caseIndex + 1) % cases.length; renderCase();});
            $('caseResetScore')?.addEventListener('click', () => {caseSolved.clear(); setText('caseScore', '0 / ' + cases.length); setText('caseResult', 'Điểm đã được đặt lại. Chọn lại phương thức và cấu hình để giải các ca.'); $('caseResult').className = 'case-result';});

            // Independent navigation and reset actions also work if Three.js/CDN fails.
            document.querySelectorAll('.tab[data-machine]').forEach(btn => btn.addEventListener('click', () => {const type = btn.dataset.machine; window.__activeEduMachine = type; document.querySelectorAll('.tab[data-machine]').forEach(t => t.classList.toggle('active', t === btn));['xray', 'ct', 'us', 'mri'].forEach(k => {const panel = $(k + 'Controls'); if (panel) panel.style.display = k === type ? 'block' : 'none';}); if ($('ctPreviewRow')) $('ctPreviewRow').style.display = type === 'ct' ? 'flex' : 'none'; if (type === 'ct') {updateHU(); drawCTMatrix();} if (type === 'xray') updateXrayLesson(); if (type === 'us') updateUSLesson(); if (type === 'mri') drawMRIVector();}));
            $('resetXray')?.addEventListener('click', () => {if (!window.__physics3dStarted) {$('kv').value = 100; $('ma').value = 50; $('xrayThickness').value = 5; $('xrayAl').value = 1;} setTimeout(updateXrayLesson, 0);});
            $('resetCT')?.addEventListener('click', () => {if (!window.__physics3dStarted) $('slice').value = 50; setTimeout(() => {updateHU(); drawCTMatrix();}, 0);});
            $('resetUS')?.addEventListener('click', () => {if (!window.__physics3dStarted) {$('freq').value = 5; $('probePos').value = 0; $('gelBtn').setAttribute('aria-pressed', 'true'); $('gelBtn').classList.add('on'); $('gelBtn').textContent = '● Gel truyền âm: ĐANG BẬT';} setTimeout(updateUSLesson, 0);});
            $('gelBtn')?.addEventListener('click', () => {if (!window.__physics3dStarted) {const current = $('gelBtn').getAttribute('aria-pressed') === 'true'; $('gelBtn').setAttribute('aria-pressed', String(!current)); $('gelBtn').classList.toggle('on', !current); $('gelBtn').textContent = !current ? '● Gel truyền âm: ĐANG BẬT' : '○ Gel truyền âm: ĐANG TẮT'; updateUSLesson();} });
            $('resetMRI')?.addEventListener('click', () => {if (!window.__physics3dStarted) $('field').value = 1.5; flipAngle = 90; setTimeout(drawMRIVector, 0);});
            updateXrayLesson(); updateHU(); drawCTMatrix(); updateUSLesson(); drawMRIVector(); setText('caseFrequencyOut', '5 MHz'); renderCase();
        })();
