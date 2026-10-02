// Local, optional motion preference. No network or analytics.
function isMotionReduced() {
  return document.documentElement.dataset.reduceMotion === 'true' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function installMotionPreference(container = document.querySelector('footer')) {
  const root = document.documentElement;
  const key = 'site-motion-reduced';
  try { root.dataset.reduceMotion = localStorage.getItem(key) === 'true' ? 'true' : 'false'; } catch { root.dataset.reduceMotion = 'false'; }
  const style = document.createElement('style');
  style.textContent = `html[data-reduce-motion="true"] { scroll-behavior:auto!important; }
html[data-reduce-motion="true"] *, html[data-reduce-motion="true"] *::before, html[data-reduce-motion="true"] *::after { animation:none!important; transition:none!important; scroll-behavior:auto!important; }
.motion-preference { display:inline-flex; align-items:center; gap:8px; min-height:44px; padding:8px 12px; margin:12px 0; border:1px solid currentColor; border-radius:6px; background:transparent; color:inherit; font:inherit; font-size:12px; cursor:pointer; opacity:.8; }
.motion-preference:hover { opacity:1; }
.motion-preference:focus-visible { outline:2px solid currentColor; outline-offset:4px; }
.motion-preference[aria-pressed="true"]::before { content:'✓'; }`;
  document.head.append(style);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'motion-preference';
  button.textContent = ({tr:'Hareketleri azalt',en:'Reduce motion',de:'Bewegung reduzieren',fr:'Réduire les animations'})[root.lang] || 'Hareketleri azalt';
  const sync = () => button.setAttribute('aria-pressed', root.dataset.reduceMotion === 'true' ? 'true' : 'false');
  const broadcast = () => window.dispatchEvent(new CustomEvent('motionpreferencechange'));
  const click = () => {
    root.dataset.reduceMotion = root.dataset.reduceMotion === 'true' ? 'false' : 'true';
    try { localStorage.setItem(key, root.dataset.reduceMotion); } catch { /* Restricted storage still permits a session preference. */ }
    sync(); broadcast();
  };
  button.addEventListener('click', click);
  sync();
  if (container) container.append(button);
  broadcast();
  return () => { button.removeEventListener('click', click); button.remove(); style.remove(); };
}

/** Opt-in, local-only measurement. RAF cadence is not a GPU/presentation FPS claim. */
function startFrameProbe(root = document.documentElement) {
  if (new URLSearchParams(location.search).get('perf') !== '1') return () => {};
  let frame = 0, last = 0, samples = [], started = performance.now();
  const finish = () => {
    const sorted = [...samples].sort((a, b) => a - b);
    if (!sorted.length) return;
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    root.dataset.v5Perf = JSON.stringify({
      metric: 'requestAnimationFrame cadence, not presented GPU frames',
      samples: samples.length, elapsedMs: +(performance.now() - started).toFixed(1),
      rafHz: +(1000 / mean).toFixed(1), medianFrameMs: +sorted[Math.floor(sorted.length * .5)].toFixed(2),
      p95FrameMs: +sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * .95))].toFixed(2),
      over25msPercent: +(samples.filter(n => n > 25).length / samples.length * 100).toFixed(1),
      viewport: [innerWidth, innerHeight], dpr: devicePixelRatio,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      visibility: document.visibilityState, userAgent: navigator.userAgent
    });
  };
  const tick = now => {
    if (!document.hidden) {
      if (last && now - last < 500) samples.push(now - last);
      last = now;
      if (samples.length % 60 === 0) finish();
    } else last = 0;
    if (samples.length < 360) frame = requestAnimationFrame(tick); else finish();
  };
  frame = requestAnimationFrame(tick);
  return () => { cancelAnimationFrame(frame); finish(); };
}

// Native scrolling; only visible media moves. No continuous JavaScript render loop.
function mountEditorialMotion(scene) {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const removePreference=installMotionPreference(document.querySelector('footer')); 
  let frame=0, visible=false;
  const update=()=>{frame=0;const active=visible&&!document.hidden&&!isMotionReduced();scene.dataset.motion=active?'running':'still';
    const p=active?Math.max(0,Math.min(1,-scene.getBoundingClientRect().top/Math.max(1,scene.offsetHeight))):0;
    scene.style.setProperty('--scene-progress',p.toFixed(4));
    scene.style.setProperty('--scene-shift',`${(p*40).toFixed(2)}px`);
    scene.style.setProperty('--scene-scale',(1+p*.065).toFixed(4));};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();});observer.observe(scene);
  const onScroll=()=>{if(visible&&!isMotionReduced()&&!document.hidden)schedule();};
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',schedule,{passive:true});
  const onVisibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;update();}else schedule();};
  document.addEventListener('visibilitychange',onVisibility);motion.addEventListener('change',schedule);window.addEventListener('motionpreferencechange',schedule);schedule();
  const stopProbe=startFrameProbe();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();stopProbe();removePreference();window.removeEventListener('motionpreferencechange',schedule);window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',schedule);document.removeEventListener('visibilitychange',onVisibility);motion.removeEventListener('change',schedule);};
}

export { mountEditorialMotion };
