/* Davonium V44 immersive world: real-time Three.js scenes, no external model assets. */
(() => {
  'use strict';
  if (window.__dvnmWorldV44) return; window.__dvnmWorldV44 = true;
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPower = matchMedia('(max-width: 700px)').matches || Number(navigator.hardwareConcurrency || 4) <= 4;
  const themes = { dark: document.documentElement.dataset.theme === 'dark' };
  let THREE, loading;
  const states = new Map();
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const safeSession = {get(k){try{return sessionStorage.getItem(k)}catch(_){return null}},set(k,v){try{sessionStorage.setItem(k,v)}catch(_){}}};
  function pageKind(){
    const b=document.body;
    if(b.classList.contains('demo-biz') || /demos\/business/.test(location.pathname))return 'biz';
    if(b.classList.contains('demo-market') || /demos\/shop/.test(location.pathname))return 'market';
    if(b.classList.contains('demo-creative') || /demos\/portfolio/.test(location.pathname))return 'creative';
    if(b.classList.contains('demo-skills') || /demos\/learning/.test(location.pathname))return 'skills';
    if(b.classList.contains('demo-digital') || /demos\/technology/.test(location.pathname))return 'digital';
    if(b.dataset.page==='home' || location.pathname==='/' || location.pathname==='/index.html')return 'home';
    if(/products/.test(location.pathname))return 'market';
    if(/work/.test(location.pathname))return 'creative';
    if(/services|about|contact/.test(location.pathname))return 'biz';
    return 'digital';
  }
  const kind = pageKind();
  function revealPage(){
    document.documentElement.classList.add('dvnm-motion-ready');
    $$('main > section, .demo-section').forEach((section,i)=>{
      if(i===0) return;
      section.classList.add('dvnm-reveal');
    });
    if(!reduceMotion && 'IntersectionObserver' in window){
      const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('dvnm-revealed');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -35px 0px'});
      $$('.dvnm-reveal').forEach(el=>io.observe(el));
    }else $$('.dvnm-reveal').forEach(el=>el.classList.add('dvnm-revealed'));
  }
  function typeHeadline(){
    if(reduceMotion) return;
    const h=$('main h1'); if(!h || h.dataset.dvnmTyped) return;
    h.dataset.dvnmTyped='true';
    const full=h.textContent.replace(/\s+/g,' ').trim();
    if(full.length>120) return;
    h.setAttribute('aria-label',full); h.classList.add('dvnm-type-headline');
    let index=0;
    function walk(node){
      if(node.nodeType===Node.TEXT_NODE){
        const value=node.nodeValue; const frag=document.createDocumentFragment();
        const parts=value.split(/(\s+)/);
        for(const part of parts){
          if(!part)continue;
          if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(part));continue;}
          const word=document.createElement('span');word.className='dvnm-type-word';word.setAttribute('aria-hidden','true');
          for(const ch of part){const letter=document.createElement('span');letter.className='dvnm-type-char';letter.style.setProperty('--dvnm-char-delay',`${index++*17}ms`);letter.textContent=ch;word.appendChild(letter)}
          frag.appendChild(word);
        }
        node.replaceWith(frag);
      } else if(node.nodeType===Node.ELEMENT_NODE && !node.matches('script,style')) [...node.childNodes].forEach(walk);
    }
    [...h.childNodes].forEach(walk);
    h.style.setProperty('--dvnm-type-duration',`${Math.min(1500,index*17)}ms`);
  }
  // A small synthesized two-note hello. Sound is configured on by default, but browsers require a user gesture.
  let soundOn=true, audioCtx=null, soundUnlocked=false;
  function note(freq,delay=0,duration=.075,volume=.018){
    if(!soundOn || !audioCtx || audioCtx.state!=='running')return;
    try{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,audioCtx.currentTime+delay);gain.gain.setValueAtTime(.0001,audioCtx.currentTime+delay);gain.gain.exponentialRampToValueAtTime(volume,audioCtx.currentTime+delay+.012);gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+delay+duration);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(audioCtx.currentTime+delay);osc.stop(audioCtx.currentTime+delay+duration+.01)}catch(_){}
  }
  function unlockSound(){
    if(!soundOn || soundUnlocked)return;
    try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;audioCtx ||= new C();audioCtx.resume().then(()=>{soundUnlocked=true;note(523,0,.075,.012);note(659,.085,.095,.010)}).catch(()=>{})}catch(_){}
  }
  function soundControl(host){
    if(!host || $('.dvnm-sound-toggle',host))return;
    const button=document.createElement('button');button.type='button';button.className='dvnm-sound-toggle';button.textContent='♪ Sound on';button.setAttribute('aria-pressed','true');button.setAttribute('aria-label','Toggle subtle interface sound');
    button.addEventListener('click',()=>{soundOn=!soundOn;button.textContent=soundOn?'♪ Sound on':'♪ Sound off';button.setAttribute('aria-pressed',String(soundOn));if(soundOn)unlockSound();else if(audioCtx)audioCtx.suspend().catch(()=>{})});
    host.appendChild(button);
  }
  function entryPrelude(){
    if(kind!=='home' || safeSession.get('dvnm-v44-intro'))return;
    safeSession.set('dvnm-v44-intro','1');
    const pre=document.createElement('div');pre.className='dvnm-prelude';pre.setAttribute('role','presentation');
    pre.innerHTML='<div class="dvnm-prelude-orb"><i></i><b></b></div><div class="dvnm-prelude-word" aria-label="Davonium Technologies">DAVONIUM<span>TECHNOLOGIES</span></div><div class="dvnm-prelude-caption">Useful technology, built with care</div><div class="dvnm-prelude-progress"><i></i></div><div class="dvnm-prelude-dots"><i></i><i></i><i></i></div>';
    // Write the company mark letter-by-letter; audio remains gesture-gated by browser autoplay policy.
    const mark=$('.dvnm-prelude-word',pre);let letterIndex=0;
    const animateTextNode=node=>{const frag=document.createDocumentFragment();for(const ch of node.nodeValue){const letter=document.createElement('span');letter.className='dvnm-prelude-letter';letter.textContent=ch;letter.style.setProperty('--dvnm-prelude-delay',`${letterIndex++*28}ms`);letter.setAttribute('aria-hidden','true');frag.appendChild(letter)}node.replaceWith(frag)};
    [...mark.childNodes].forEach(node=>{if(node.nodeType===Node.TEXT_NODE)animateTextNode(node);else if(node.nodeType===Node.ELEMENT_NODE)[...node.childNodes].forEach(child=>{if(child.nodeType===Node.TEXT_NODE)animateTextNode(child)})});
    document.body.appendChild(pre);
    const remove=()=>{pre.classList.add('is-leaving');setTimeout(()=>pre.remove(),420)};
    pre.addEventListener('pointerdown',remove,{once:true});setTimeout(remove,920);
  }
  function installHeroTools(stage){
    if(!stage)return; soundControl(stage);
    if(kind==='creative' || kind==='skills'){
      const tools=document.createElement('div');tools.className='dvnm-world-tools';tools.setAttribute('role','group');tools.setAttribute('aria-label',kind==='creative'?'Interactive motion states':'Learning scene modes');
      const controls=kind==='creative'?[['orbit','Orbit'],['focus','Focus'],['prism','Prism']]:[['explore','Explore'],['focus','Focus mode'],['path','Learning path']];
      controls.forEach(([mode,label],i)=>{const b=document.createElement('button');b.type='button';b.dataset.dvnmMotion=mode;b.textContent=label;b.setAttribute('aria-pressed',i===0?'true':'false');if(i===0)stage.dataset.motionState=mode;b.addEventListener('click',()=>{tools.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));stage.dataset.motionState=mode;window.dispatchEvent(new CustomEvent('dvnm:scene-state',{detail:{mode,kind}}));if(kind==='skills')learningState(mode)});tools.appendChild(b)});
      stage.appendChild(tools);
    }
  }
  function learningState(mode){
    const acc=$$('.demo-accordion');if(!acc.length)return;
    acc.forEach((d,i)=>{if(mode==='focus')d.open=i===0;else if(mode==='path')d.open=i<2;else d.open=false});
    let status=$('[data-dvnm-learning-status]');if(!status){status=document.createElement('p');status.dataset.dvnmLearningStatus='';status.className='dvnm-live-status';const first=$('#learning-path .wrap');if(first)first.appendChild(status)}
    if(status)status.textContent=mode==='focus'?'Focus mode selected: one lesson is open at a time.':mode==='path'?'Learning path selected: the first two steps are open.':'Explore mode selected: choose any topic to inspect it.';
  }
  function findStage(){
    let target=null;
    if(kind==='home') target=$('.v36-hero-stage') || $('.hero .art');
    if(kind.startsWith('demo')||['biz','market','creative','skills','digital'].includes(kind) && document.body.classList.contains('demo-page')) target=$('.demo-hero-art');
    if(!target) target=$('main > .hero') || $('main .page-hero') || $('main > section:first-of-type') || $('main');
    if(!target)return null;
    target.classList.add('dvnm-world-host');
    if($('.dvnm-world-stage',target))return $('.dvnm-world-stage',target);
    const stage=document.createElement('div');stage.className='dvnm-world-stage';stage.dataset.dvnmWorld=kind;stage.setAttribute('aria-hidden','true');
    const canvas=document.createElement('canvas');canvas.className='dvnm-world-canvas';canvas.setAttribute('aria-hidden','true');canvas.setAttribute('role','presentation');stage.appendChild(canvas);target.appendChild(stage);
    if(target.matches('.demo-hero-art'))target.classList.add('dvnm-world-replaces-art');
    installHeroTools(stage);
    return stage;
  }
  const stage=findStage();
  function mat(color,rough=.3,metal=.65,extra={}){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,...extra})}
  function makeLine(points,color,opacity=.35){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));return new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity}))}
  function object(scene,geometry,material,position,scale=[1,1,1]){const m=new THREE.Mesh(geometry,material);m.position.set(...position);m.scale.set(...scale);m.castShadow=false;m.receiveShadow=false;scene.add(m);return m}
  function createScene(host){
    const canvas=$('.dvnm-world-canvas',host);if(!canvas||states.has(canvas))return;
    const mobile=lowPower;
    let renderer;
    try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!mobile,powerPreference:'low-power',stencil:false,depth:true});}catch(_){host.classList.add('dvnm-world-fallback');return}
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1:1.45));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(33,1,.1,70);camera.position.set(0,0,7.7);
    scene.add(new THREE.HemisphereLight(0xe8f6ff,0x202033,2.1));const key=new THREE.DirectionalLight(0xffffff,3.0);key.position.set(-3,4,5);scene.add(key);const rim=new THREE.PointLight(0x25dbea,30,14,2);rim.position.set(2.8,1.6,-1);scene.add(rim);const violet=new THREE.PointLight(0x7858ff,17,13,2);violet.position.set(-3,-1,1);scene.add(violet);
    const palette={home:[0x16ddec,0x8b75ff,0xf3f4ff],biz:[0x54d9c6,0x5d70e8,0xf5efe2],market:[0xffbd66,0xf06d56,0x5cdbcf],creative:[0x83f4e1,0xff83cf,0x9484ff],skills:[0x68d9ff,0xb39cff,0xa4efcf],digital:[0x39e5f3,0x8d7aff,0xf4f7ff]}[kind]||[0x37ddec,0x8b75ff,0xffffff];
    const metal=mat(palette[2],.22,.75),accent=mat(palette[0],.22,.52,{emissive:palette[0],emissiveIntensity:.28}),vio=mat(palette[1],.24,.6,{emissive:palette[1],emissiveIntensity:.18});
    const root=new THREE.Group();scene.add(root);const movers=[], rings=[];
    // The centrepiece is different for each demo: business architecture, product podiums, a creative sculpture, a learning graph, or a digital portal.
    if(kind==='biz'){
      const base=object(root,new THREE.CylinderGeometry(1.75,1.9,.12,64),mat(0x314c61,.4,.7),[0,-1.13,0],[1,1,.55]);
      for(let i=0;i<8;i++){
        const x=-1.55+(i%4)*1.03, z=(i<4?-.25:.45),h=.75+(i*37%9)*.115,w=.54+(i%2)*.12;
        const b=object(root,new THREE.BoxGeometry(w,h,.45),i%3===0?accent:metal,[x,-.55+h/2,z]);
        const wire=object(root,new THREE.BoxGeometry(w+.025,h+.025,.475),mat(0x6bdedc,.25,.3,{wireframe:true,transparent:true,opacity:.5}),[x,-.55+h/2,z]);
        for(let row=0;row<Math.min(5,Math.floor(h/.18));row++) for(let col=0;col<2;col++) object(root,new THREE.BoxGeometry(.055,.045,.012),mat(0xb8fffd,.3,.1,{emissive:0x19cad9,emissiveIntensity:.35}),[x+(col-.5)*w*.45,-.55+h/2-h*.28+row*.14,z+.233]);
        movers.push({mesh:b,phase:i*.4,axis:'y',amplitude:.035});movers.push({mesh:wire,phase:i*.4,axis:'y',amplitude:.035});
      }
      const ring=object(root,new THREE.TorusGeometry(1.85,.009,6,90),accent,[0,-.25,-.28],[1,.7,1]);ring.rotation.x=.78;rings.push(ring);
    } else if(kind==='market'){
      const podiums=[[-1.45,-.72,.7],[0,-.8,.9],[1.42,-.73,.72]];
      podiums.forEach(([x,y,h],i)=>{object(root,new THREE.CylinderGeometry(.49,.55,.19,48),mat(0x2c3545,.32,.72),[x,y-.26,.05]);const body=i===0?new THREE.BoxGeometry(.48,h,.39):i===1?new THREE.CylinderGeometry(.25,.31,h,32):new THREE.DodecahedronGeometry(.38,1);const m=object(root,body,[accent,vio,metal][i],[x,y+h/2-.18,.05]);movers.push({mesh:m,phase:i*1.8,axis:'y',amplitude:.075});if(i===1){object(root,new THREE.TorusGeometry(.34,.025,8,42),metal,[x,y+h-.12,.08]);}if(i===2){const orb=object(root,new THREE.SphereGeometry(.09,18,12),accent,[x+.32,y+h/2,.2]);movers.push({mesh:orb,phase:i,axis:'x',amplitude:.16})}});
      const ring=object(root,new THREE.TorusGeometry(2.2,.008,5,100),vio,[0,-.25,-.2],[1,.65,1]);ring.rotation.x=.8;rings.push(ring);
    } else if(kind==='creative'){
      const knot=object(root,new THREE.TorusKnotGeometry(.88,.19,120,16,2,3),accent,[0,.05,0]);knot.scale.set(1.08,1.08,.8);movers.push({mesh:knot,phase:0,axis:'y',amplitude:.32});
      const shell=object(root,new THREE.IcosahedronGeometry(.65,1),vio,[.72,.12,-.4]);const wire=object(root,new THREE.IcosahedronGeometry(.79,1),mat(0xf5f3ff,.18,.2,{wireframe:true,transparent:true,opacity:.5}),[.72,.12,-.4]);movers.push({mesh:shell,phase:1,axis:'x',amplitude:.22});movers.push({mesh:wire,phase:1,axis:'y',amplitude:.35});
      for(let i=0;i<5;i++){const r=.4+i*.19;const tor=object(root,new THREE.TorusGeometry(r,.009,5,72),i%2?accent:vio,[0,0,-.3],[1,.66,1]);tor.rotation.set(.35+i*.22,i*.5,.4);rings.push(tor)}
    } else if(kind==='skills'){
      const nodes=[];for(let i=0;i<9;i++){const a=i*Math.PI*2/9,y=Math.sin(i*2.3)*.58,x=Math.cos(a)*1.45,z=Math.sin(a)*.65-.15;const ball=object(root,new THREE.IcosahedronGeometry(i===0?.27:.16,1),i%3===0?metal:i%3===1?accent:vio,[x,y,z]);movers.push({mesh:ball,phase:i*.8,axis:'y',amplitude:.15});nodes.push([x,y,z]);}
      nodes.forEach((p,i)=>{root.add(makeLine([p,nodes[(i+1)%nodes.length]],palette[i%2],.52));if(i%2===0)root.add(makeLine([p,nodes[(i+3)%nodes.length]],palette[1],.2))});
      const ring=object(root,new THREE.TorusGeometry(1.55,.012,6,90),vio,[0,0,-.35],[1,.78,1]);ring.rotation.x=.92;rings.push(ring);
      object(root,new THREE.OctahedronGeometry(.42,1),metal,[0,0,0]);
    } else {
      const portal=object(root,new THREE.TorusGeometry(1.37,.065,12,100),accent,[.25,.12,-.48],[.9,1.15,1]);portal.rotation.y=-.22;portal.rotation.x=.13;rings.push(portal);
      const core=object(root,new THREE.IcosahedronGeometry(.77,2),metal,[.25,.12,-.55]);movers.push({mesh:core,phase:0,axis:'y',amplitude:.42});
      const wire=object(root,new THREE.IcosahedronGeometry(.91,1),mat(0x80efff,.12,.2,{wireframe:true,transparent:true,opacity:.42}),[.25,.12,-.55]);movers.push({mesh:wire,phase:1,axis:'x',amplitude:.3});
      for(let i=0;i<10;i++){const x=-2.4+i*.53,h=.48+(i*7%8)*.13;const b=object(root,new THREE.BoxGeometry(.19,h,.21),i%3===0?vio:metal,[x,-1.15+h/2,-.6+(i%3)*.12]);movers.push({mesh:b,phase:i*.3,axis:'y',amplitude:.02});for(let n=0;n<Math.floor(h/.2);n++)object(root,new THREE.BoxGeometry(.05,.035,.013),accent,[x,-1.15+n*.2+.08,-.48+(i%3)*.12]);}
    }
    // Shared orbital choreography and a sparse particle field add depth without video textures or model downloads.
    const orbitA=object(root,new THREE.TorusGeometry(2.15,.007,5,120),accent,[0,0,-.65],[1.15,.75,1]);orbitA.rotation.set(.52,.18,.45);rings.push(orbitA);
    const orbitB=object(root,new THREE.TorusGeometry(2.42,.005,5,120),vio,[0,.05,-.8],[.82,1.02,1]);orbitB.rotation.set(-.7,.25,-.4);rings.push(orbitB);
    const satGeo=new THREE.IcosahedronGeometry(.085,1);for(let i=0;i<(mobile?8:15);i++){const a=i*2.39996,r=1.75+(i%3)*.22;const m=object(root,satGeo,i%2?accent:vio,[Math.cos(a)*r,Math.sin(a*1.7)*.95,Math.sin(a)*.35-.45]);movers.push({mesh:m,phase:a,axis:'z',amplitude:.35,r,angle:a});}
    const stars=[];const starCount=mobile?80:170;const pos=new Float32Array(starCount*3);for(let i=0;i<starCount;i++){pos[i*3]=(Math.random()-.5)*8;pos[i*3+1]=(Math.random()-.5)*5;pos[i*3+2]=(Math.random()-.5)*4-1}const pgeo=new THREE.BufferGeometry();pgeo.setAttribute('position',new THREE.BufferAttribute(pos,3));const points=new THREE.Points(pgeo,new THREE.PointsMaterial({color:palette[0],size:mobile?.018:.024,transparent:true,opacity:.58,sizeAttenuation:true}));scene.add(points);stars.push(points);
    const state={canvas,host,renderer,scene,camera,root,movers,rings,stars,active:false,started:performance.now(),pointerX:0,pointerY:0,disposed:false};states.set(canvas,state);
    function resize(){const b=host.getBoundingClientRect();if(b.width<5||b.height<5)return;const w=Math.max(1,Math.round(b.width)),h=Math.max(1,Math.round(b.height));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
    const ro=new ResizeObserver(resize);ro.observe(host);state.resize=resize;resize();
    host.classList.add('dvnm-world-ready');host.querySelector('.dvnm-world-loader')?.remove();
    host.addEventListener('pointermove',e=>{const b=host.getBoundingClientRect();state.pointerX=((e.clientX-b.left)/Math.max(1,b.width)-.5)*2;state.pointerY=((e.clientY-b.top)/Math.max(1,b.height)-.5)*2},{passive:true});
    window.addEventListener('dvnm:scene-state',e=>{if(e.detail?.kind!==kind)return;state.mode=e.detail.mode;const colors={orbit:[0x83f4e1,0xff83cf,0x9484ff],focus:[0x51a6ff,0x7d7aff,0xeff6ff],prism:[0xff65ce,0x69f0ff,0xf7e66b],explore:[0x68d9ff,0xb39cff,0xa4efcf],path:[0x45ddbe,0x89a4ff,0xd2f5ff]};const pal=colors[state.mode];if(pal){accent.color.setHex(pal[0]);accent.emissive.setHex(pal[0]);vio.color.setHex(pal[1]);metal.color.setHex(pal[2]);rim.color.setHex(pal[0]);violet.color.setHex(pal[1]);state.pal=pal;}});
    state.resize=resize;state.ro=ro;state.themeObserver=new MutationObserver(()=>{const dark=document.documentElement.dataset.theme==='dark';themes.dark=dark;renderer.toneMappingExposure=dark?1.13:1.03;key.intensity=dark?3.2:2.4;rim.intensity=dark?30:13;renderer.setClearColor(0x000000,0)});state.themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  }
  function step(state,now){const t=(now-state.started)/1000;state.root.rotation.y=(reduceMotion?0:Math.sin(t*.19)*.08)+state.pointerX*.12;state.root.rotation.x=(reduceMotion?0:Math.sin(t*.25)*.035)-state.pointerY*.06;for(const m of state.movers){if(reduceMotion)continue;if(m.mesh.userData.baseY===undefined)m.mesh.userData.baseY=m.mesh.position.y;if(m.axis==='y')m.mesh.position.y=m.mesh.userData.baseY+Math.sin(t*.72+m.phase)*m.amplitude;if(m.axis==='x')m.mesh.rotation.x=Math.sin(t*.46+m.phase)*m.amplitude;if(m.axis==='z')m.mesh.rotation.z=Math.sin(t*.42+m.phase)*m.amplitude;else if(m.axis==='y')m.mesh.rotation.y+=.002+(m.phase%3)*.0005;}state.rings.forEach((r,i)=>{if(!reduceMotion){r.rotation.z+=.0007*(i%2?1:-1);r.rotation.y+=.0004}});state.stars.forEach(x=>{if(!reduceMotion)x.rotation.z=t*.002});state.camera.position.x+=(state.pointerX*.18-state.camera.position.x)*.025;state.camera.position.y+=(-state.pointerY*.12-state.camera.position.y)*.025;state.camera.lookAt(0,0,0);state.renderer.render(state.scene,state.camera)}
  let raf=0;function frame(now){raf=0;if(document.visibilityState==='hidden')return;let running=false;for(const s of states.values()){if(!s.active)continue;running=true;try{s.resize();step(s,now)}catch(_){s.host.classList.add('dvnm-world-fallback');s.active=false}}if(running)raf=requestAnimationFrame(frame)}function schedule(){if(!raf&&document.visibilityState!=='hidden')raf=requestAnimationFrame(frame)}
  function begin(s){if(!s)return;s.active=true;s.started=performance.now();schedule()}function pause(s){if(s)s.active=false}
  async function start(){
    if(!stage || kind==='home')return; // Home's robot renderer owns its world; avoiding a second WebGL context keeps phones cooler.
    try{loading ||= import(THREE_URL).then(m=>(THREE=m,true));await loading;createScene(stage);const s=states.get($('.dvnm-world-canvas',stage));if(s)begin(s)}catch(_){stage.classList.add('dvnm-world-fallback');}
  }
  // For home, the robot's own Three.js scene supplies the full 3D foreground. This module still enhances its typography, movement and page transitions.
  if(stage && kind!=='home'){
    const canvas=$('.dvnm-world-canvas',stage);if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{const s=states.get(e.target);if(e.isIntersecting){if(s)begin(s);else start()}else pause(s)}),{rootMargin:'150px 0px',threshold:.01});io.observe(canvas)}else start();
  }
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){states.forEach(pause);if(raf)cancelAnimationFrame(raf);raf=0}else states.forEach(s=>{if(s.active)schedule()})});
  // Tiny 3D parallax cards. Subtle enough for touch devices and respects reduced-motion.
  if(!reduceMotion && matchMedia('(hover:hover) and (pointer:fine)').matches){
    $$('.card, .demo-card, .dvnm-demo-card, .product-card, .work-card, .doc-card').forEach(card=>{
      if(card.dataset.dvnmTilt)return;card.dataset.dvnmTilt='true';card.classList.add('dvnm-depth-card');
      card.addEventListener('pointermove',e=>{const b=card.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;card.style.setProperty('--dvnm-tilt-x',`${(-y*3.5).toFixed(2)}deg`);card.style.setProperty('--dvnm-tilt-y',`${(x*4.2).toFixed(2)}deg`);card.style.setProperty('--dvnm-light-x',`${(x+0.5)*100}%`);card.style.setProperty('--dvnm-light-y',`${(y+0.5)*100}%`)},{passive:true});
      card.addEventListener('pointerleave',()=>{card.style.setProperty('--dvnm-tilt-x','0deg');card.style.setProperty('--dvnm-tilt-y','0deg')},{passive:true});
    });
  }
  // Interactive product-family filters for the EPIC-inspired Market catalogue.
  if(kind==='market' && document.body.classList.contains('demo-page')){
    const grid=$('#products .demo-cards');if(grid){const cards=$$('.demo-card',grid);const bar=document.createElement('div');bar.className='dvnm-market-filters';bar.setAttribute('role','group');bar.setAttribute('aria-label','Filter sample products');[['all','All items'],['desk','Desk'],['home','Home'],['carry','Carry']].forEach(([cat,label],i)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.marketFilter=cat;b.setAttribute('aria-pressed',i===0?'true':'false');b.addEventListener('click',()=>{bar.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));cards.forEach((card,j)=>{const c=['desk','home','carry'][j]||'all';card.hidden=cat!=='all'&&cat!==c})});bar.appendChild(b)});grid.before(bar)}
  }
  revealPage();typeHeadline();entryPrelude();
  document.addEventListener('pointerdown',unlockSound,{once:true,capture:true});document.addEventListener('keydown',unlockSound,{once:true,capture:true});
})();
