/* =============================================================
   КлубПаук · Brand Book — Main JS
   Reveal, Tabs, Progress, Counters, Copy, Modals, Nav, Accordion
   ============================================================= */
;(function(){
'use strict';

/* ─── REVEAL on scroll ─── */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); }
  });
},{threshold:0.12, rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ─── PROGRESS BAR ─── */
const bar = document.querySelector('.bb-progress__bar');
function updateProgress(){
  const h = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0%';
}
window.addEventListener('scroll', updateProgress, {passive:true});
updateProgress();

/* ─── TABS ─── */
document.querySelectorAll('[role="tablist"]').forEach(list=>{
  const tabs = list.querySelectorAll('[role="tab"]');
  tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
      const panelId = tab.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      if(!panel) return;
      // deactivate siblings
      tabs.forEach(t=>{
        t.classList.remove('is-active');
        t.setAttribute('aria-selected','false');
        t.setAttribute('tabindex','-1');
      });
      list.closest('section, .bb-screen, .bb-tabpanel, div')
        ?.querySelectorAll('[role="tabpanel"]')
        ?.forEach(p=>{ p.classList.remove('is-active'); p.hidden = true; });
      // also check siblings at same level
      const parent = panel.parentElement;
      if(parent){
        parent.querySelectorAll(':scope > [role="tabpanel"]').forEach(p=>{
          p.classList.remove('is-active'); p.hidden = true;
        });
      }
      // activate
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected','true');
      tab.removeAttribute('tabindex');
      panel.classList.add('is-active');
      panel.hidden = false;
    });
  });
});

/* ─── COUNTER ANIMATION ─── */
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

/* ─── COPY COLOR CODES ─── */
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

/* ─── MODALS ─── */
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
document.querySelectorAll('[data-modal-open]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const id = 'modal-' + btn.dataset.modalOpen;
    openModal(document.getElementById(id));
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

/* ─── NAV: active chapter tracking ─── */
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

/* ─── MOBILE NAV toggle ─── */
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

/* ─── ACCORDION ─── */
document.querySelectorAll('.bb-acc details').forEach(det=>{
  det.querySelector('summary')?.addEventListener('click', e=>{
    // allow default toggle
  });
});

/* ─── SET CAPTION (screen 69) ─── */
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

/* ─── TILT on hover (persona moodboard) ─── */
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
