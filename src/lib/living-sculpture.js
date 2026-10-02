/** A single decorative canvas. Native scrolling remains completely untouched. */
export function mountLivingSculpture(scene, variant = 'nard') {
  const canvas = scene.querySelector('canvas');
  const ctx = canvas?.getContext('2d', { alpha: true });
  if (!ctx) return () => {};
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const compactQuery = matchMedia('(max-width: 760px)');
  const chapters = [...scene.querySelectorAll('[data-living-chapter]')];
  let compact = compactQuery.matches, reduced = motion.matches;
  let points = [], width = 1, height = 1, safeTop = 0, offsets = [0, 1, 2];
  let top = 0, raf = 0, visible = false, disposed = false, previous = 0;
  let progress = 0, target = 0, elapsed = 0, lastTime = 0;
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => { n = clamp(n); return n * n * (3 - 2 * n); };
  let seed = 417;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
  const line = (a, b, t) => ({ x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, z: 0 });
  const rect = (x, y, w, h) => [[[x,y],[x+w,y]],[[x+w,y],[x+w,y+h]],[[x+w,y+h],[x,y+h]],[[x,y+h],[x,y]]];
  const sampleLines = segments => {
    const lengths = segments.map(s => Math.hypot(s[1][0]-s[0][0],s[1][1]-s[0][1]));
    let distance = random() * lengths.reduce((a,b) => a+b,0), index = 0;
    while (index < lengths.length-1 && distance > lengths[index]) distance -= lengths[index++];
    const p = line(segments[index][0], segments[index][1], distance / lengths[index]);
    p.x += (random()-.5)*.018; p.y += (random()-.5)*.018; p.z = (random()-.5)*.12; return p;
  };
  const bottle = [...rect(-.23,-.95,.46,.24),...rect(-.17,-.71,.34,.16),
    [[-.17,-.55],[-.58,-.35]],[[-.58,-.35],[-.58,.81]],[[-.58,.81],[.58,.81]],
    [[.58,.81],[.58,-.35]],[[.58,-.35],[.17,-.55]],...rect(-.36,-.1,.72,.55),[[-.58,.7],[.58,.7]]];
  const nr = [[[-.3,-.44],[-.3,.44]],[[-.3,-.44],[.02,.44]],[[.02,-.44],[.02,.44]],
    [[.02,-.44],[.28,-.44]],[[.28,-.44],[.36,-.36]],[[.36,-.36],[.36,-.18]],[[.36,-.18],[.28,-.1]],[[.28,-.1],[.02,-.1]],[[.16,-.1],[.34,.44]]];
  const layout = [...rect(-.9,-.64,1.8,1.28),[[-.9,-.4],[.9,-.4]],...rect(-.73,-.23,.52,.62),
    ...rect(-.04,-.23,.73,.24),[[-.04,.19],[.69,.19]],[[-.04,.34],[.5,.34]]];
  const nPolygon = [[-.7,.65],[-.7,-.65],[-.3,-.65],[.3,.15],[.3,-.65],[.7,-.65],[.7,.65],[.3,.65],[-.3,-.15],[-.3,.65]];
  const inPolygon = (x,y) => {
    let inside = false;
    for (let i=0,j=nPolygon.length-1;i<nPolygon.length;j=i++) {
      const a=nPolygon[i],b=nPolygon[j];
      if ((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) inside=!inside;
    }
    return inside;
  };
  const prism = [[0,-.94,.05],[-.78,-.3,.05],[.65,-.38,-.35],[.77,.43,.1],[0,.92,.03],[-.73,.41,-.3],[0,0,.7]];
  const faces = [[0,1,6],[0,6,2],[1,5,6],[5,4,6],[4,3,6],[3,2,6]];
  function populate() {
    seed=417; points=[];
    const count=compact?1200:2300;
    for (let i=0;i<count;i++) {
      const u=i/count, theta=u*Math.PI*6;
      let first, second, third;
      if (variant==='nard') {
        const ribbon=(random()-.5)*.27, r=.52+.12*Math.sin(theta*1.5);
        first={x:(r+ribbon)*Math.sin(theta)+.14*Math.sin(theta*.5),y:(u-.5)*1.72,z:(r+ribbon)*Math.cos(theta)};
        second=sampleLines(bottle);
        if(i%3===0) { const a=random()*Math.PI*2; third={x:Math.cos(a)*.91,y:Math.sin(a)*.91,z:0}; }
        else third=sampleLines(nr);
      } else {
        const face=faces[i%faces.length], a=prism[face[0]],b=prism[face[1]],c=prism[face[2]];
        const v=Math.sqrt(random()),w=random();
        first={x:(1-v)*a[0]+v*(1-w)*b[0]+v*w*c[0],y:(1-v)*a[1]+v*(1-w)*b[1]+v*w*c[1],z:(1-v)*a[2]+v*(1-w)*b[2]+v*w*c[2]};
        second=sampleLines(layout);
        let x,y; do { x=random()*1.4-.7;y=random()*1.3-.65; } while(!inPolygon(x,y));
        third={x,y,z:(random()-.5)*.1};
      }
      points.push({positions:[first,second,third],phase:random()*Math.PI*2,size:.65+random()*.95,alpha:.32+random()*.65,color:i%7===0?(variant==='nard'?'#bdd0b2':'#b5e4fb'):(variant==='nard'?'#efd0a0':'#bdf1d7')});
    }
  }
  function readProgress() {
    const distance=scrollY-top, part=distance<offsets[1]?0:1;
    return part+ease(((distance-offsets[part])/Math.max(1,offsets[part+1]-offsets[part])-.12)/.76);
  }
  function draw() {
    const p=reduced?0:progress, part=p<1?0:1, blend=ease(p-part), time=reduced?0:elapsed;
    const x=compact?width*.5:width*(part===0?.75-.5*blend:.25+.5*blend);
    const available=Math.max(80,height-safeTop-48);
    const y=compact?safeTop+available*.5:height*.5;
    const scale=compact?Math.min(width*.39,available*.43):Math.min(width*.213,height*.37);
    ctx.clearRect(0,0,width,height);
    const glow=ctx.createRadialGradient(x,y,0,x,y,scale*1.4);
    glow.addColorStop(0,variant==='nard'?'#ad794128':'#568d7a30');glow.addColorStop(1,'#080c0a00');
    ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    const breath=1+Math.sin(time*.65)*.035, drift=Math.sin(time*.42)*.035;
    for (const point of points) {
      const a=point.positions[part],b=point.positions[part+1];
      const px=a.x+(b.x-a.x)*blend,py=a.y+(b.y-a.y)*blend,pz=a.z+(b.z-a.z)*blend;
      const intensity=p<1?1-.64*blend:.36;
      const wave=Math.sin(time*.9+py*3.4+point.phase*.17)*.05*intensity;
      const dx=x+(px*breath+wave+drift+pz*Math.sin(time*.38)*.13)*scale;
      const dy=y+(py*breath+Math.cos(time*.72+px*3+point.phase*.13)*.032*intensity)*scale;
      const size=point.size*(compact?.75:1)*(variant==='nard'?1.35:1.5), shimmer=.87+Math.sin(time*.8+point.phase)*.13;
      ctx.globalAlpha=Math.min(1,point.alpha*1.35)*shimmer*(1-Math.sin(blend*Math.PI)*.18);ctx.fillStyle=point.color;
      ctx.beginPath();ctx.moveTo(dx,dy-size);ctx.lineTo(dx+size*.86,dy+size*.5);ctx.lineTo(dx-size*.86,dy+size*.5);ctx.closePath();ctx.fill();
    }
    ctx.globalAlpha=1;scene.dataset.livingReady='true';scene.dataset.livingStage=String(Math.round(p));canvas.dataset.progress=p.toFixed(3);
  }
  function frame(now) {
    raf=0;if(disposed||!visible||document.hidden)return;
    if(now-previous>=1000/(compact?30:40)) {
      elapsed+=Math.min(64,now-lastTime)/1000;lastTime=now;previous=now;
      target=reduced?0:readProgress();progress+=(target-progress)*.23;
      if(Math.abs(target-progress)<.001)progress=target;
      draw();
    }
    if(!reduced)raf=requestAnimationFrame(frame);
  }
  function start() {
    if(!raf&&!disposed&&visible&&!document.hidden){lastTime=performance.now();raf=requestAnimationFrame(frame);}
  }
  function stop(){cancelAnimationFrame(raf);raf=0;}
  function resize() {
    const next=compactQuery.matches;if(next!==compact){compact=next;populate();}
    const box=canvas.getBoundingClientRect();width=Math.max(1,box.width);height=Math.max(1,box.height);
    const header=document.querySelector('.site-header');const nav=header?Math.min(140,header.getBoundingClientRect().height):0;
    scene.style.setProperty('--living-nav',`${nav}px`);
    top=scene.getBoundingClientRect().top+scrollY-nav;offsets=chapters.map(c=>c.offsetTop);
    const tallest=Math.max(0,...chapters.map(c=>c.querySelector('.living-copy')?.offsetHeight||0));
    scene.style.setProperty('--living-min-height',`${compact?Math.max(640,tallest+320):650}px`);
    safeTop=compact?Math.max(height*.43,tallest+86):0;
    const dpr=Math.min(devicePixelRatio||1,compact?1.25:1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    target=reduced?0:readProgress();progress=target;draw();start();
  }
  function onScroll(){if(visible&&!reduced){target=readProgress();start();}}
  function onVisibility(){if(document.hidden)stop();else start();}
  function onMotion(){reduced=motion.matches;stop();progress=reduced?0:readProgress();draw();start();}
  populate();
  const sizes=new ResizeObserver(resize);sizes.observe(canvas);chapters.forEach(c=>{const copy=c.querySelector('.living-copy');if(copy)sizes.observe(copy);});
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible){progress=reduced?0:readProgress();draw();start();}else stop();});observer.observe(canvas);
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',onVisibility);motion.addEventListener('change',onMotion);resize();
  return ()=>{disposed=true;stop();sizes.disconnect();observer.disconnect();window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',onVisibility);motion.removeEventListener('change',onMotion);delete scene.dataset.livingReady;};
}
