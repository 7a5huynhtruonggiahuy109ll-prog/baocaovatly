/* Âm thanh, dock toàn màn hình, máy tính ở phòng lý thuyết, điểm kỷ lục */
(()=>{
const $=id=>document.getElementById(id),Q=s=>document.querySelectorAll(s);
const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const n=v=>isFinite(v)?(+v.toPrecision(4)).toLocaleString('vi-VN'):'—';
const toast=m=>{const t=$('toast');if(!t)return;t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800)};

/* 1. Kính mờ + viền neon động */
Q('.lab-shell,.theory-card,.quiz-box').forEach(el=>{if(getComputedStyle(el).position==='static')el.style.position='relative';const i=document.createElement('i');i.className='neon';el.prepend(i)});

/* 2. Âm thanh Web Audio (không cần file ngoài) */
let ac=null,muted=store.get('pmai_mute')==='1';
const actx=()=>{if(!ac){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ac=new A()}if(ac.state==='suspended')ac.resume();return ac};
function tone(f,d=.09,type='sine',v=.05,t0=0,f2){if(muted)return;const a=actx();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+t0;o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02)}
const sfx={click:()=>tone(1320,.06,'square',.025,0,880),ok:()=>{tone(660,.1,'sine',.06);tone(990,.16,'sine',.06,.09)},bad:()=>tone(160,.28,'sawtooth',.06,0,90),go:()=>tone(220,.5,'triangle',.06,0,880),rec:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.14,'sine',.06,i*.1))};
document.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,.tab'))sfx.click()},true);
$('startGame')?.addEventListener('click',sfx.go);
const go=$('gameOptions');
if(go)new MutationObserver(()=>{if(go.querySelector('.wrong'))sfx.bad();else if(go.querySelector('.correct'))sfx.ok()}).observe(go,{attributes:true,attributeFilter:['class'],subtree:true});

/* 3. Floating dock + chế độ toàn màn hình */
const vp=$('labViewport');
if(vp){
  const d=document.createElement('div');d.className='dock';
  d.innerHTML=[['xray','X-QUANG'],['ct','CT'],['us','SIÊU ÂM'],['mri','MRI']].map(([m,t])=>`<button data-m="${m}">${t}</button>`).join('')+'<i class="sep"></i><button id="fsBtn" title="Toàn màn hình" aria-label="Toàn màn hình">⛶</button><button id="sndBtn" aria-label="Bật/tắt âm thanh"></button>';
  vp.appendChild(d);
  const tab=m=>document.querySelector(`.tab[data-machine="${m}"]`);
  d.addEventListener('click',e=>{const b=e.target.closest('button[data-m]');if(b)tab(b.dataset.m)?.click()});
  const sync=()=>d.querySelectorAll('[data-m]').forEach(b=>b.classList.toggle('on',!!tab(b.dataset.m)?.classList.contains('active')));
  sync();const lt=document.querySelector('.lab-tabs');if(lt)new MutationObserver(sync).observe(lt,{attributes:true,attributeFilter:['class'],subtree:true});
  $('fsBtn').onclick=()=>{const cur=document.fullscreenElement||document.webkitFullscreenElement;if(cur)(document.exitFullscreen||document.webkitExitFullscreen).call(document);else(vp.requestFullscreen||vp.webkitRequestFullscreen)?.call(vp)};
  ['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,()=>setTimeout(()=>window.dispatchEvent(new Event('resize')),120)));
  const sb=$('sndBtn'),paint=()=>sb.textContent=muted?'🔇':'🔊';paint();
  sb.onclick=()=>{muted=!muted;store.set('pmai_mute',muted?'1':'0');paint();if(!muted)sfx.ok()};
}

/* 4. Máy tính mô phỏng ngay trong mục Kiến thức */
function plot(cv,[i0,m,d]){const g=cv.getContext('2d'),W=cv.width,H=cv.height,xm=Math.max(d*1.6,1),y=x=>H-14-(H-30)*Math.exp(-m*x);g.clearRect(0,0,W,H);g.shadowBlur=0;g.strokeStyle='rgba(148,190,218,.25)';g.beginPath();g.moveTo(30,6);g.lineTo(30,H-14);g.lineTo(W-6,H-14);g.stroke();g.shadowColor='#4de8f3';g.shadowBlur=10;g.strokeStyle='#4de8f3';g.lineWidth=2;g.beginPath();for(let k=0;k<=100;k++){const px=30+(W-36)*k/100,py=y(k/100*xm);k?g.lineTo(px,py):g.moveTo(px,py)}g.stroke();g.fillStyle='#ff6f91';g.beginPath();g.arc(30+(W-36)*d/xm,y(d),5,0,7);g.fill();g.shadowBlur=0;g.fillStyle='#94a9bd';g.font='11px JetBrains Mono, monospace';g.fillText('d (cm) →',W-72,H-2);g.fillText('I/I₀',4,14)}
const CALCS=[
 {t:'Máy tính suy giảm tia X',f:'I = I₀·e^(−μd)',inp:[['I₀ (đơn vị bất kỳ)',100],['μ (cm⁻¹)',0.5],['d (cm)',3]],plot:1,
  run:([i0,m,d])=>`I = ${n(i0*Math.exp(-m*d))}\nCòn lại: ${n(100*Math.exp(-m*d))}%\nLớp bán hấp thụ: ${m>0?n(Math.LN2/m)+' cm':'∞'}`},
 {t:'Máy tính số HU (CT)',f:'HU = 1000·(μ − μ_nước)/μ_nước',inp:[['μ mô (cm⁻¹)',0.4],['μ nước (cm⁻¹)',0.19]],
  run:([m,w])=>{const h=1000*(m-w)/w;return `HU = ${n(h)}\nGần với: ${h<-700?'không khí / phổi':h<-30?'mỡ':h<20?'nước / dịch':h<80?'mô mềm / máu':h<300?'mô đặc / xương xốp':'xương đặc'}`}},
 {t:'Máy tính tần số Larmor (MRI)',f:'f₀ = (γ/2π)·B₀ , γ/2π ≈ 42,58 MHz/T',inp:[['B₀ (T)',1.5]],
  run:([b])=>`f₀ = ${n(42.58*b)} MHz`},
 {t:'Máy tính phản xạ siêu âm',f:'R = [(Z₂ − Z₁)/(Z₂ + Z₁)]²',inp:[['Z₁ (MRayl)',0.0004],['Z₂ (MRayl)',1.63]],
  run:([a,b])=>{const r=((b-a)/(b+a))**2;return `R = ${n(100*r)}% phản xạ\nTruyền qua: ${n(100*(1-r))}%`}}
];
const grid=document.querySelector('#theory .theory-grid');
if(grid){
  const wrap=document.createElement('div');wrap.className='calc-wrap';
  CALCS.forEach(c=>{
    const el=document.createElement('article');el.className='calc-card';
    el.innerHTML=`<h3>${c.t}</h3><div class="formula">${c.f}</div><div class="calc-row">${c.inp.map(([l,v])=>`<label>${l}<input type="number" step="any" value="${v}"></label>`).join('')}</div><div class="calc-out"></div>${c.plot?'<canvas width="480" height="150"></canvas>':''}`;
    const out=el.querySelector('.calc-out'),cv=el.querySelector('canvas'),ins=[...el.querySelectorAll('input')];
    const upd=()=>{const v=ins.map(x=>x.value===''?NaN:+x.value);if(v.some(isNaN)){out.textContent='Nhập đủ các giá trị để tính.';return}out.textContent=c.run(v);if(cv)plot(cv,v)};
    ins.forEach(x=>x.addEventListener('input',upd));upd();wrap.appendChild(el);
    const i=document.createElement('i');i.className='neon';el.prepend(i);
  });
  grid.after(wrap);
}

/* 5. Điểm kỷ lục (localStorage) */
const sc=$('gameScore'),gr=$('gameResult');
if(sc&&gr){
  let best=+store.get('pmai_best')||0,start=best,rec=false;
  const tag=document.createElement('small');tag.style.cssText='display:block;color:var(--green);font-size:10px';sc.parentNode.appendChild(tag);
  const show=()=>tag.textContent='Kỷ lục: '+String(best).padStart(4,'0');show();
  new MutationObserver(()=>{const s=parseInt(sc.textContent,10)||0;if(s===0){start=best;rec=false}if(s>best){best=s;rec=s>start;store.set('pmai_best',best);show()}}).observe(sc,{childList:true,characterData:true,subtree:true});
  new MutationObserver(()=>{if(gr.classList.contains('show')&&rec){rec=false;sfx.rec();toast('🏆 Kỷ lục mới: '+String(best).padStart(4,'0'))}}).observe(gr,{attributes:true,attributeFilter:['class']});
}
})();
