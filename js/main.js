
;(function(){
'use strict';

const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); }
  });
},{threshold:0.12, rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

const bar = document.querySelector('.bb-progress__bar');
function updateProgress(){
  const h = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0%';
}
window.addEventListener('scroll', updateProgress, {passive:true});
updateProgress();

document.querySelectorAll('[role="tablist"]').forEach(list=>{
  const tabs = list.querySelectorAll('[role="tab"]');
  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      const panelId = tab.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      if(!panel) return;

      tabs.forEach(t=>{
        t.classList.remove('is-active');
        t.setAttribute('aria-selected','false');
        t.setAttribute('tabindex','-1');
      });
      list.closest('section, .bb-screen, .bb-tabpanel, div')
        ?.querySelectorAll('[role="tabpanel"]')
        ?.forEach(p=>{ p.classList.remove('is-active'); p.hidden = true; });

      const parent = panel.parentElement;
      if(parent){
        parent.querySelectorAll(':scope > [role="tabpanel"]').forEach(p=>{
          p.classList.remove('is-active'); p.hidden = true;
        });
      }

      tab.classList.add('is-active');
      tab.setAttribute('aria-selected','true');
      tab.removeAttribute('tabindex');
      panel.classList.add('is-active');
      panel.hidden = false;
    });
  });
});

const counterIO = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.counter);
    if(isNaN(target)) return;
    counterIO.unobserve(el);
    const decimals = (el.dataset.counter.includes('.')) ? 1 : 0;
    const suffix = el.dataset.counterSuffix || '';
    const dur = 1200;
    const t0 = performance.now();
    function tick(now){
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const v = (ease * target).toFixed(decimals);
      el.textContent = (decimals ? v.replace('.', ',') : v) + suffix;
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
},{threshold:0.5});
document.querySelectorAll('[data-counter]').forEach(el=>counterIO.observe(el));

const toast = document.getElementById('bb-toast');
const toastCode = document.getElementById('bb-toast-code');
let toastTimer;
document.querySelectorAll('[data-copy]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const val = btn.dataset.copy;
    navigator.clipboard.writeText(val).then(()=>{
      if(toastCode) toastCode.textContent = val;
      if(toast){
        toast.classList.add('is-show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(()=> toast.classList.remove('is-show'), 2200);
      }
    });
  });
});

function openModal(modal){
  if(!modal) return;
  modal.classList.add('is-open');
  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModal(modal){
  if(!modal) return;
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}
function closeAllModals(){
  document.querySelectorAll('.bb-modal.is-open').forEach(m=> closeModal(m));
}
function buildDetailSlider(modal, slides, alt){
  const media = modal && modal.querySelector('.bb-mat__media');
  if(!media) return;
  const safeAlt = alt || 'Подробное изображение';
  const imgsHtml = slides.map((src,i)=>
    `<img class="bb-mat__photo${i===0?' is-active':''}" src="${src}" alt="${safeAlt}" loading="lazy" data-slide="${i}">`
  ).join('');
  const dotsHtml = slides.map((_,i)=>
    `<button type="button" class="bb-mat__dot${i===0?' is-active':''}" data-slide-to="${i}" aria-label="Слайд ${i+1}"></button>`
  ).join('');
  media.classList.add('bb-mat__slider');
  media.innerHTML = imgsHtml +
    `<button type="button" class="bb-mat__nav bb-mat__nav--prev" data-detail-prev aria-label="Предыдущее изображение">‹</button>` +
    `<button type="button" class="bb-mat__nav bb-mat__nav--next" data-detail-next aria-label="Следующее изображение">›</button>` +
    `<span class="bb-mat__dots">${dotsHtml}</span>`;

  const imgs = media.querySelectorAll('.bb-mat__photo');
  const dots = media.querySelectorAll('.bb-mat__dot');
  let idx = 0;
  function go(i){
    idx = (i + imgs.length) % imgs.length;
    imgs.forEach((im,n)=> im.classList.toggle('is-active', n === idx));
    dots.forEach((d,n)=> d.classList.toggle('is-active', n === idx));
  }
  media.querySelector('[data-detail-prev]').addEventListener('click', e=>{ e.preventDefault(); go(idx - 1); });
  media.querySelector('[data-detail-next]').addEventListener('click', e=>{ e.preventDefault(); go(idx + 1); });
  dots.forEach((dot,n)=>{
    dot.addEventListener('click', e=>{ e.preventDefault(); go(n); });
  });
}

function setDetailSingle(modal, src, alt){
  const media = modal && modal.querySelector('.bb-mat__media');
  if(!media) return;
  media.classList.remove('bb-mat__slider');
  media.innerHTML = `<img class="bb-mat__photo" src="${src}" alt="${alt || 'Подробное изображение'}" loading="lazy">`;
}

document.querySelectorAll('[data-modal-open]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const key = btn.dataset.modalOpen;
    const id = 'modal-' + key;
    const modal = document.getElementById(id);
    if(key === 'mat-detail' || key === 'mat-mockup'){
      const slidesAttr = btn.dataset.detailSlides;
      const overrideSrc = btn.dataset.detailSrc;
      const overrideAlt = btn.dataset.detailAlt;
      if(slidesAttr){
        const slides = slidesAttr.split(',').map(s=> s.trim()).filter(Boolean);
        buildDetailSlider(modal, slides, overrideAlt);
      } else if(overrideSrc){
        setDetailSingle(modal, overrideSrc, overrideAlt);
      } else {
        const section = btn.closest('.bb-mat');
        const srcImg = section && section.querySelector('.bb-mat__photo');
        if(srcImg){
          setDetailSingle(modal, srcImg.src, srcImg.alt);
        }
      }
    }
    openModal(modal);
  });
});
document.querySelectorAll('[data-modal-close]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    closeModal(btn.closest('.bb-modal'));
  });
});
document.querySelectorAll('.bb-modal').forEach(modal=>{
  modal.addEventListener('click', e=>{
    if(e.target === modal) closeModal(modal);
  });
});
document.addEventListener('keydown', e=>{
  if(e.key === 'Escape') closeAllModals();
});

const chips = document.querySelectorAll('.bb-nav__chip');
const numEl = document.querySelector('[data-current-num] b');
const nameEl = document.querySelector('[data-current-name]');
const allScreens = document.querySelectorAll('.bb-screen, .bb-chap-opener');

function updateCurrentScreen(){
  const targetY = window.innerHeight * 0.35;
  let current = null;
  allScreens.forEach(s=>{
    if(s.getBoundingClientRect().top <= targetY) current = s;
  });
  if(!current) return;
  const label = current.dataset.screenLabel || '';
  const num = label.match(/^(\d+)/);
  if(numEl && num) numEl.textContent = num[1].padStart(2,'0');
  if(nameEl){
    const name = label.replace(/^\d+\s*/, '');
    nameEl.innerHTML = '<em>·</em>' + (name || label);
  }
  chips.forEach(chip=>{
    const range = (chip.dataset.range || '').split(',');
    const sid = current.id;
    if(sid && range.includes(sid)){
      chips.forEach(c=> c.classList.remove('is-active'));
      chip.classList.add('is-active');
      const dots = chip.querySelectorAll('.bb-nav__chip-dots s');
      const idx = range.indexOf(sid);
      dots.forEach((d,i)=> d.classList.toggle('is-past', i <= idx));
    }
  });
}
window.addEventListener('scroll', updateCurrentScreen, {passive:true});
updateCurrentScreen();

const toggle = document.querySelector('.bb-nav__toggle');
const mobileNav = document.getElementById('bb-mobile-nav');
if(toggle && mobileNav){
  toggle.addEventListener('click', ()=>{
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !open);
    mobileNav.hidden = open;
  });
  mobileNav.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=>{
      toggle.setAttribute('aria-expanded','false');
      mobileNav.hidden = true;
    });
  });
}

document.querySelectorAll('.bb-acc details').forEach(det=>{
  det.querySelector('summary')?.addEventListener('click', e=>{

  });
});

const setCap = document.getElementById('bb-set-caption');
document.querySelectorAll('.bb-set__obj').forEach(obj=>{
  obj.addEventListener('mouseenter', ()=>{
    const role = obj.dataset.role;
    if(setCap && role){
      setCap.innerHTML = '<span class="bb-eyebrow bb-eyebrow--red">'+
        (obj.querySelector('.bb-set__lbl b')?.textContent || '') +
        '</span><p>'+ role +'</p>';
    }
  });
  obj.addEventListener('mouseleave', ()=>{
    if(setCap) setCap.innerHTML = '<span class="bb-eyebrow">Раскладка</span><p>Наведите курсор на\u00a0любой объект — здесь появится его роль в\u00a0комплекте.</p>';
  });
});

document.querySelectorAll('[data-slider]').forEach(slider=>{
  const slides = slider.querySelectorAll('[data-slide]');
  const dots = slider.querySelectorAll('[data-slide-to]');
  const prev = slider.querySelector('[data-slider-prev]');
  const next = slider.querySelector('[data-slider-next]');
  if(!slides.length) return;
  let index = 0;
  function go(i){
    index = (i + slides.length) % slides.length;
    slides.forEach((s,n)=> s.classList.toggle('is-active', n === index));
    dots.forEach((d,n)=> d.classList.toggle('is-active', n === index));
  }
  function stop(e){ e.preventDefault(); e.stopPropagation(); }
  prev?.addEventListener('click', e=>{ stop(e); go(index - 1); });
  next?.addEventListener('click', e=>{ stop(e); go(index + 1); });
  dots.forEach((dot,n)=>{
    dot.addEventListener('click', e=>{ stop(e); go(n); });
  });
});

document.querySelectorAll('[data-tilt]').forEach(el=>{
  el.addEventListener('mousemove', e=>{
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = 'perspective(600px) rotateY('+x*6+'deg) rotateX('+(-y*6)+'deg) scale(1.02)';
  });
  el.addEventListener('mouseleave', ()=>{
    el.style.transform = '';
  });
});

})();
