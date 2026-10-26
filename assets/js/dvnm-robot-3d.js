/* Davonium Technologies V44 — faceted hard-surface procedural 3D DVNM Bot.
 * Three.js and RoundedBoxGeometry are lazy-imported only when a canvas becomes visible.
 * No visitor data, external model files, or audio are transmitted by this renderer.
 */
(() => {
  'use strict';
  if (window.__dvnmThreeRobotLoader) return;
  window.__dvnmThreeRobotLoader = true;

  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js';
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const lowPower = Number(navigator.hardwareConcurrency || 4) <= 4 || /Android|iPhone|iPad/i.test(navigator.userAgent);
  const rendererState = new Map();
  let THREE = null, importPromise = null;

  const loadThree = () => {
    if (!importPromise) importPromise = import(THREE_URL).then(three => { THREE = three; return true; });
    return importPromise;
  };

  function setFallback(host) {
    host.dataset.threeFailed = 'true';
    host.setAttribute('data-three-failed','true');
    host.querySelector('.dvnm-three-loading')?.remove();
  }
  function material(color, metalness=.34, roughness=.3, extra={}) {
    return new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra });
  }
  function makeRobot(canvas, host) {
    if (!canvas || rendererState.has(canvas) || !canvas.isConnected) return;
    if (!window.WebGLRenderingContext) { setFallback(host); return; }
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:!lowPower, powerPreference:'low-power', depth:true, stencil:false, premultipliedAlpha:true });
    } catch (_) { setFallback(host); return; }

    const mini = canvas.dataset.robotSize === 'mini';
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(mini ? 34 : 31, 1, .1, 80);
    camera.position.set(0, 1.57, mini ? 6.8 : 5.65);
    camera.lookAt(0,1.45,0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.7));
    renderer.setClearColor(0x000000,0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;

    scene.add(new THREE.HemisphereLight(0xe1f5ff,0x28314f,2.05));
    const keyLight = new THREE.DirectionalLight(0xf3f7ff,3.4); keyLight.position.set(-3.4,5.2,5); scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x24d7ef,18,9,2); rimLight.position.set(2.8,2.8,-1.3); scene.add(rimLight);
    const violet = new THREE.PointLight(0x7967ff,9,8,2); violet.position.set(-3.2,1.8,2); scene.add(violet);

    const robot = new THREE.Group(); scene.add(robot);
    const cyan = material(0x37e2ed,.35,.24,{ emissive:0x0bb8da, emissiveIntensity:1.25, metalness:.3 });
    const cyanDark = material(0x087b9d,.55,.28,{ emissive:0x063e63, emissiveIntensity:.65 });
    const jointMat = material(0x313d52,.68,.31);
    const trimMat = material(0x9aa8bd,.62,.25);
    const black = material(0x091421,.52,.18,{ metalness:.56 });
    const warmShell = material(0xe1e9f4,.44,.26);
    const darkShell = material(0x243246,.58,.27);
    const accent = material(0xb6f8ff,.22,.2,{ emissive:0x39dff5, emissiveIntensity:1.2 });
    const shell = warmShell;

    const rounded = (w,h,d,r=.08,mat=shell) => {
      // Bevelled extruded rounded-rectangle: smooth corners without downloading a second geometry library.
      const bevel=Math.max(.002,Math.min(r,Math.min(w,h,d)*.24));
      const sw=Math.max(.012,w-2*bevel), sh=Math.max(.012,h-2*bevel), sr=Math.min(Math.max(.004,r-bevel*.48),sw*.48,sh*.48);
      const shape=new THREE.Shape();
      shape.moveTo(-sw/2+sr,-sh/2); shape.lineTo(sw/2-sr,-sh/2); shape.quadraticCurveTo(sw/2,-sh/2,sw/2,-sh/2+sr);
      shape.lineTo(sw/2,sh/2-sr); shape.quadraticCurveTo(sw/2,sh/2,sw/2-sr,sh/2); shape.lineTo(-sw/2+sr,sh/2);
      shape.quadraticCurveTo(-sw/2,sh/2,-sw/2,sh/2-sr); shape.lineTo(-sw/2,-sh/2+sr); shape.quadraticCurveTo(-sw/2,-sh/2,-sw/2+sr,-sh/2);
      const g=new THREE.ExtrudeGeometry(shape,{depth:Math.max(.004,d-2*bevel),bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:bevel*.45,bevelThickness:bevel,curveSegments:5});
      g.center(); const mesh=new THREE.Mesh(g,mat); mesh.castShadow=false; mesh.receiveShadow=false; return mesh;
    };
    const sphere = (x,y,z,sx,sy,sz,mat) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, lowPower?18:28, lowPower?12:20),mat);
      mesh.position.set(x,y,z); mesh.scale.set(sx,sy,sz); mesh.castShadow=false; return mesh;
    };
    const cylinder = (rt,rb,h,mat,rad=20) => new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,rad),mat);
    const capsule = (x,y,z,r,len,mat) => {
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r,len,4,lowPower?8:12),mat);
      mesh.position.set(x,y,z); return mesh;
    };
    const add = (parent,mesh,x=0,y=0,z=0) => { mesh.position.x += x; mesh.position.y += y; mesh.position.z += z; parent.add(mesh); return mesh; };

    // Ground glow and a precision ring under the character.
    const ground = new THREE.Mesh(new THREE.CircleGeometry(1.05,64),new THREE.MeshBasicMaterial({color:0x16a9cd,transparent:true,opacity:.09,depthWrite:false}));
    ground.rotation.x=-Math.PI/2; ground.position.y=.025; ground.scale.set(1.15,.65,1); scene.add(ground);
    const floorRing = new THREE.Mesh(new THREE.TorusGeometry(.7,.012,8,72),material(0x36d9ef,.35,.24,{emissive:0x0e9ac4,emissiveIntensity:.8}));
    floorRing.rotation.x=Math.PI/2; floorRing.position.y=.04; floorRing.scale.set(1.35,.7,1); scene.add(floorRing);
    const halo = new THREE.Group(); halo.position.set(0,1.58,-.48); halo.rotation.y=-.18; scene.add(halo);
    const haloRing = new THREE.Mesh(new THREE.TorusGeometry(1.18,.008,6,100),material(0x26b9ec,.3,.35,{emissive:0x167ec5,emissiveIntensity:.8}));
    haloRing.scale.set(.76,1.14,1); halo.add(haloRing);
    const haloRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.37,.005,5,100),material(0x8973ff,.2,.4,{emissive:0x5c43d8,emissiveIntensity:.65}));
    haloRing2.scale.set(.68,1.05,1); haloRing2.rotation.z=.38; halo.add(haloRing2);
    // Architectural depth layer: glassy orbital markers, fine 3D rings and floating precision forms.
    const worldObjects=[];
    const worldMatA=material(0x23d9e8,.68,.22,{transparent:true,opacity:.72,emissive:0x087eac,emissiveIntensity:.5});
    const worldMatB=material(0x8e7bff,.58,.24,{transparent:true,opacity:.68,emissive:0x4f35c0,emissiveIntensity:.55,wireframe:true});
    for(let i=0;i<(lowPower?5:9);i++){
      const form=i%3===0?new THREE.IcosahedronGeometry(.11+(i%2)*.035,0):i%3===1?new THREE.BoxGeometry(.12,.12,.12):new THREE.TorusGeometry(.10,.009,5,20);
      const obj=new THREE.Mesh(form,i%2?worldMatA:worldMatB); const a=i*2.399963;
      obj.position.set(Math.cos(a)*(1.48+(i%3)*.14),.55+(i%5)*.47,Math.sin(a)*.48-.42);
      obj.rotation.set(a*.3,a,a*.7); scene.add(obj); worldObjects.push({mesh:obj,phase:a,r:1.48+(i%3)*.14});
    }
    const worldArc=new THREE.Mesh(new THREE.TorusGeometry(1.65,.006,5,100),material(0x33c9e9,.25,.3,{emissive:0x176eab,emissiveIntensity:.65}));
    worldArc.position.set(0,1.65,-.58); worldArc.rotation.set(.3,.42,.65); worldArc.scale.set(1.05,.72,1); scene.add(worldArc);

    // Feet, legs and hip assembly.
    const hip = add(robot,rounded(.64,.28,.4,.11,jointMat),0,1.1,0);
    const legs=[];
    for (const side of [-1,1]) {
      const leg = new THREE.Group(); leg.position.set(side*.205,1.03,0); robot.add(leg);
      add(leg,sphere(0,0,0,.16,.16,.17,trimMat));
      add(leg,rounded(.28,.46,.31,.1,shell),0,-.22,0);
      add(leg,sphere(0,-.45,.015,.125,.12,.13,jointMat));
      add(leg,rounded(.235,.43,.27,.085,side<0?darkShell:shell),0,-.69,.005);
      add(leg,rounded(.29,.12,.18,.045,cyanDark),0,-.68,.145);
      const ankle=add(leg,cylinder(.092,.105,.12,jointMat,18),0,-.91,.015); ankle.rotation.x=.06;
      const foot=add(leg,rounded(.34,.17,.48,.075,darkShell),0,-1.0,.13);
      add(leg,rounded(.2,.035,.12,.015,cyan),0,-1.015,.345);
      legs.push(leg);
    }
    // Torso is layered so it reads as machined hardware, not a flat cartoon.
    add(robot,rounded(.78,.78,.48,.15,shell),0,1.66,0);
    add(robot,rounded(.69,.62,.045,.08,darkShell),0,1.67,.242);
    add(robot,rounded(.59,.5,.035,.07,jointMat),0,1.68,.27);
    add(robot,rounded(.5,.43,.022,.055,shell),0,1.68,.294);
    // chest core: rings, inner lens, and a small animated light.
    const core = new THREE.Group(); core.position.set(0,1.68,.335); robot.add(core);
    const coreRing = new THREE.Mesh(new THREE.TorusGeometry(.145,.018,8,48),accent); core.add(coreRing);
    const coreInner = sphere(0,0,.005,.096,.096,.035,cyan); core.add(coreInner);
    const corePin = sphere(0,0,.038,.037,.037,.014,accent); core.add(corePin);
    for (const side of [-1,1]) {
      add(robot,rounded(.08,.38,.05,.02,cyanDark),side*.275,1.67,.306);
      add(robot,sphere(side*.235,1.92,.27,.033,.033,.02,accent));
    }
    add(robot,rounded(.35,.09,.16,.04,jointMat),0,2.085,0);
    const neck = cylinder(.12,.15,.16,jointMat,24); add(robot,neck,0,2.16,0);
    add(robot,cylinder(.075,.075,.08,cyanDark,20),0,2.2,.01);

    // Articulated shoulders / arms; the speaking gesture is animated at each joint.
    const arms=[];
    for (const side of [-1,1]) {
      const shoulder = new THREE.Group(); shoulder.position.set(side*.47,1.97,0); robot.add(shoulder);
      add(shoulder,sphere(0,0,0,.19,.19,.19,trimMat));
      add(shoulder,sphere(0,0,.07,.14,.14,.12,cyanDark));
      const upper = rounded(.25,.42,.27,.09,shell); add(shoulder,upper,side*.035,-.24,.005); upper.rotation.z=side*-.12;
      const elbow = add(shoulder,sphere(side*.035,-.46,.01,.115,.115,.12,jointMat));
      const forearmPivot = new THREE.Group(); forearmPivot.position.set(side*.035,-.47,.005); shoulder.add(forearmPivot);
      const forearm = rounded(.23,.36,.235,.075,darkShell); add(forearmPivot,forearm,side*.01,-.18,.005); forearm.rotation.z=side*.1;
      add(forearmPivot,rounded(.17,.12,.06,.025,cyanDark),side*.01,-.17,.128);
      const wrist=add(forearmPivot,sphere(0,-.37,.01,.09,.085,.09,trimMat));
      const hand=add(forearmPivot,rounded(.19,.18,.18,.06,shell),0,-.48,.03);
      add(forearmPivot,rounded(.095,.04,.11,.02,cyan),0,-.48,.125);
      arms.push({side,shoulder,forearmPivot,hand});
    }
    // Head pivots separately for attention, eye contact, blinking and speech. It is a faceted, hard-surface helmet—not a sphere.
    const head = new THREE.Group(); head.position.set(0,2.48,.005); robot.add(head);
    const helmetShape = new THREE.Shape();
    helmetShape.moveTo(-.285,-.305); helmetShape.lineTo(.285,-.305);
    helmetShape.lineTo(.382,-.205); helmetShape.lineTo(.392,.105);
    helmetShape.lineTo(.274,.292); helmetShape.lineTo(-.274,.292);
    helmetShape.lineTo(-.392,.105); helmetShape.lineTo(-.382,-.205); helmetShape.closePath();
    const helmetGeo = new THREE.ExtrudeGeometry(helmetShape,{depth:.48,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:2});
    helmetGeo.center();
    const helmetShell = new THREE.Mesh(helmetGeo,shell); head.add(helmetShell);
    // Raised brow, angular visor surround, and separate dark glass faceplate define a purposeful robotic silhouette.
    add(head,rounded(.52,.105,.14,.035,darkShell),0,.222,.235);
    add(head,rounded(.67,.365,.105,.065,darkShell),0,-.018,.263);
    add(head,rounded(.575,.275,.065,.045,black),0,-.012,.322);
    add(head,rounded(.47,.018,.025,.008,trimMat),0,.118,.362);
    // Machined cheek guards, side sensors, and tapered ear armour.
    for (const side of [-1,1]) {
      const cheek=add(head,rounded(.115,.225,.14,.025,cyanDark),side*.344,-.055,.295);
      cheek.rotation.z=side*-.09;
      add(head,rounded(.075,.19,.12,.018,trimMat),side*.408,-.02,.025);
      add(head,rounded(.042,.105,.048,.014,accent),side*.41,-.022,.087);
      add(head,rounded(.12,.04,.09,.012,jointMat),side*.255,-.245,.265);
    }
    const eyes=[];
    for (const side of [-1,1]) {
      add(head,rounded(.115,.095,.032,.022,cyanDark),side*.137,.035,.363);
      const eye = add(head,rounded(.078,.057,.025,.018,accent),side*.137,.035,.385);
      add(head,rounded(.027,.033,.012,.008,material(0xffffff,.1,.18,{emissive:0x68f5ff,emissiveIntensity:1.2})),side*.143,.041,.402);
      eyes.push(eye);
    }
    add(head,rounded(.18,.016,.018,.006,trimMat),0,-.066,.389);
    const mouthCavity = add(head,rounded(.17,.047,.026,.009,black),0,-.132,.386);
    add(head,rounded(.19,.028,.055,.008,jointMat),0,-.207,.335);
    const mouthGlow = add(head,rounded(.105,.012,.012,.004,cyan),0,-.132,.405);
    const jaw = add(head,rounded(.31,.086,.14,.025,shell),0,-.245,.25);
    add(head,rounded(.21,.022,.025,.006,cyanDark),0,-.252,.325);
    // A low-profile sensor bar and paired light pipes replace the balloon-like antenna.
    add(head,rounded(.31,.055,.13,.018,darkShell),0,.307,.035);
    const antennaStem=cylinder(.012,.019,.095,trimMat,8); add(head,antennaStem,0,.362,.025);
    const antennaHalo=new THREE.Mesh(new THREE.TorusGeometry(.047,.007,6,20),accent); antennaHalo.position.set(0,.41,.025); antennaHalo.scale.set(1,.55,1); head.add(antennaHalo);
    const antennaTip=add(head,sphere(0,.412,.027,.023,.023,.023,accent));

    // Floating data motes use instanced, tiny geometry to keep draw calls low.
    const moteGeo = new THREE.SphereGeometry(.018,8,6);
    const moteMat = new THREE.MeshBasicMaterial({color:0x36daee,transparent:true,opacity:.8});
    const motes=[];
    for (let i=0;i<(lowPower?10:20);i++) {
      const mote=new THREE.Mesh(moteGeo,moteMat); const a=i*2.399963;
      mote.position.set(Math.cos(a)*(1.15+(i%3)*.08),.38+(i%7)*.37,Math.sin(a)*.34-.35);
      mote.scale.setScalar(.6+(i%4)*.22); scene.add(mote); motes.push({mesh:mote,phase:i*.7,r:1.15+(i%3)*.08});
    }

    const hostBox = host.getBoundingClientRect();
    const state={canvas,host,renderer,scene,camera,robot,head,arms,legs,core,coreRing,coreInner,antennaTip,antennaHalo,eyes,mouthCavity,mouthGlow,jaw,halo,haloRing2,motes,worldObjects,worldArc,
      active:false,disposed:false,started:performance.now(),lastBlink:performance.now()+1300+Math.random()*1600,blinkEnd:0,pointerX:0,pointerY:0,theme:'dark',size:{w:Math.max(1,hostBox.width),h:Math.max(1,hostBox.height)}};
    rendererState.set(canvas,state);

    function updateTheme() {
      state.theme=document.documentElement.dataset.theme || 'light';
      const dark=state.theme==='dark';
      shell.color.setHex(dark?0xe8f0fb:0x40526b);
      darkShell.color.setHex(dark?0x293b50:0x16273e);
      cyan.color.setHex(dark?0x3fe5f3:0x17bad0);
      cyan.emissive.setHex(dark?0x0bb8da:0x0786ad);
      keyLight.intensity=dark?3.2:2.9;
      rimLight.intensity=dark?18:14;
    }
    updateTheme();
    const resize=()=>{
      if(state.disposed) return;
      const box=host.getBoundingClientRect();
      if(box.width<2 || box.height<2) return;
      const w=Math.round(box.width),h=Math.round(box.height);
      if(w===state.size.w && h===state.size.h && renderer.getSize(new THREE.Vector2()).x===w) return;
      state.size={w,h}; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
    };
    state.resize=resize; resize();
    const interactionHost=host.closest('.art') || host.closest('.dvnm-stage') || host;
    const onPointerMove=event=>{
      if(!event.isPrimary) return;
      const b=interactionHost.getBoundingClientRect();
      state.pointerX=Math.max(-1,Math.min(1,((event.clientX-b.left)/Math.max(1,b.width)-.5)*2));
      state.pointerY=Math.max(-1,Math.min(1,((event.clientY-b.top)/Math.max(1,b.height)-.5)*2));
    };
    interactionHost.addEventListener('pointermove',onPointerMove,{passive:true});
    const onClick=()=>{ state.waveUntil=performance.now()+1150; };
    interactionHost.addEventListener('click',onClick,{passive:true});
    state.cleanup=()=>{interactionHost.removeEventListener('pointermove',onPointerMove);interactionHost.removeEventListener('click',onClick);};
    host.dataset.threeReady='true'; host.setAttribute('data-three-ready','true');
    host.querySelector('.dvnm-three-loading')?.remove();
    if(!host.querySelector('.dvnm-three-loading')) { /* no status text needed once the canvas appears */ }
    state.observer = new ResizeObserver(resize); state.observer.observe(host);
    state.speaking=false;
    state.updateTheme=updateTheme;
  }

  function animateState(state, now) {
    const {robot,head,arms,legs,core,coreRing,coreInner,antennaTip,antennaHalo,eyes,mouthCavity,mouthGlow,jaw,halo,haloRing2,motes,worldObjects,worldArc,canvas}=state;
    const t=(now-state.started)/1000;
    const speaking=state.speaking || state.host.classList.contains('is-speaking');
    const waving=now<(state.waveUntil||0);
    const breathe=reduceMotion?0:Math.sin(t*1.4)*.018;
    robot.position.y=.045+(reduceMotion?0:Math.sin(t*1.75)*.035);
    robot.rotation.y=(reduceMotion?0:Math.sin(t*.34)*.07)+state.pointerX*.16;
    robot.rotation.z=state.pointerX*-.018;
    head.rotation.y=state.pointerX*.24 + (reduceMotion?0:Math.sin(t*.75)*.025);
    head.rotation.x=-state.pointerY*.10 + (speaking&&!reduceMotion?Math.sin(t*3.2)*.025:0);
    head.position.y=2.48+breathe;
    core.rotation.z=reduceMotion?0:t*.42;
    const pulse=speaking&&!reduceMotion ? .68+.42*(.5+.5*Math.sin(t*16.5)) : .9+(reduceMotion?0:.10*Math.sin(t*2.2));
    core.scale.setScalar(pulse); coreRing.material.emissiveIntensity=speaking?1.5:1.0;
    coreInner.scale.y=speaking&&!reduceMotion? .85+Math.abs(Math.sin(t*15))*.3:1;
    mouthCavity.scale.y=speaking&&!reduceMotion ? .6+Math.abs(Math.sin(t*15.2))*.9 : .42;
    mouthGlow.scale.x=speaking&&!reduceMotion ? .75+Math.abs(Math.sin(t*14.1))*.35 : 1;
    jaw.rotation.x=speaking&&!reduceMotion ? -.10-Math.abs(Math.sin(t*14.8))*.17 : 0;
    antennaTip.scale.setScalar(.9+(speaking&&!reduceMotion?Math.sin(t*7)*.12:Math.sin(t*1.8)*.06));
    antennaHalo.rotation.z=reduceMotion?0:t*.65;
    const wave= waving ? Math.sin((now-(state.waveUntil-1150))/1150*Math.PI*4)*.34 : 0;
    arms.forEach(({side,shoulder,forearmPivot})=>{
      const idle=reduceMotion?0:Math.sin(t*1.35+side)*.035;
      if(side>0) {
        shoulder.rotation.z=wave + (speaking&&!reduceMotion?-.24 + Math.sin(t*5)*.06: .08) + idle;
        forearmPivot.rotation.z=wave*.38+(speaking&&!reduceMotion?-.22:0);
      } else {
        shoulder.rotation.z=-.08+(speaking&&!reduceMotion?.12:0)+idle;
        forearmPivot.rotation.z=speaking&&!reduceMotion?.12:0;
      }
    });
    legs.forEach((leg,i)=>{ leg.rotation.x=(!reduceMotion&&waving)?Math.sin(t*8+i)*.035:0; });
    const blink = now>state.lastBlink && now<state.lastBlink+135;
    if(now>state.lastBlink+135) state.lastBlink=now+1800+Math.random()*2600;
    eyes.forEach(eye=>{eye.scale.y=blink?.006:1;});
    halo.rotation.z=reduceMotion?0:Math.sin(t*.15)*.08; haloRing2.rotation.z=.38+(reduceMotion?0:t*.08);
    worldArc.rotation.y=.42+(reduceMotion?0:t*.055); worldArc.rotation.z=.65+(reduceMotion?0:t*.08);
    worldObjects.forEach(({mesh,phase,r},i)=>{if(!reduceMotion){mesh.rotation.x+=.0015+(i%3)*.0007;mesh.rotation.y+=.002;mesh.position.y+=Math.sin(t*.6+phase)*.0008;}});
    motes.forEach(({mesh,phase,r})=>{
      if(reduceMotion) return;
      const a=phase+t*.13; mesh.position.x=Math.cos(a)*r; mesh.position.z=Math.sin(a)*.35-.35; mesh.position.y=.32+((phase*1.37+t*.11)%2.2);
    });
  }

  let running=false;
  function frame(now) {
    running=false;
    if(document.visibilityState==='hidden') return;
    let needsNext=false;
    for(const state of rendererState.values()) {
      if(state.disposed || !state.active || !state.canvas.isConnected) continue;
      needsNext=true;
      try { state.resize(); animateState(state,now); state.renderer.render(state.scene,state.camera); }
      catch(_) { setFallback(state.host); state.active=false; }
    }
    if(needsNext) {running=true; requestAnimationFrame(frame);}
  }
  function ensureFrame(){ if(!running && document.visibilityState!=='hidden'){running=true;requestAnimationFrame(frame);} }
  const activate=state=>{ if(!state || state.disposed)return; state.active=true; state.started=performance.now(); ensureFrame(); };
  const deactivate=state=>{if(state)state.active=false;};

  async function upgrade(canvas) {
    if(rendererState.has(canvas) || canvas.dataset.threeRequested || !canvas.isConnected) return;
    const host=canvas.closest('[data-dvnm-robot-host]'); if(!host)return;
    if(host.closest('[hidden]')) return;
    canvas.dataset.threeRequested='true';
    try {
      await loadThree();
      if(!canvas.isConnected || host.closest('[hidden]')) { delete canvas.dataset.threeRequested; return; }
      makeRobot(canvas,host);
      const state=rendererState.get(canvas); if(state) activate(state);
    } catch(error) {
      delete canvas.dataset.threeRequested;
      setFallback(host);
      console.warn('DVNM Bot 3D renderer could not load; using its compatibility artwork.',error);
    }
  }

  let visibilityObserver;
  if('IntersectionObserver' in window) {
    visibilityObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      const canvas=entry.target; const state=rendererState.get(canvas);
      if(entry.isIntersecting) { if(state) activate(state); else upgrade(canvas); }
      else deactivate(state);
    }),{rootMargin:'180px 0px',threshold:.01});
  }
  function watch(root=document) {
    root.querySelectorAll?.('[data-dvnm-robot]').forEach(canvas=>{
      if(canvas.dataset.threeObserved) return;
      canvas.dataset.threeObserved='true';
      if(visibilityObserver) visibilityObserver.observe(canvas);
      else upgrade(canvas);
    });
  }
  watch();
  const mutations=new MutationObserver(records=>records.forEach(record=>{
    record.addedNodes.forEach(node=>{if(node.nodeType===1){ if(node.matches?.('[data-dvnm-robot]')) watch(node.parentNode||document); else watch(node); }});
    // A visitor can open/close a hidden dialog after the original scan.
    if(record.type==='attributes' && record.target.matches?.('[data-dvnm-robot]')) { const state=rendererState.get(record.target); if(state && !record.target.closest('[hidden]')) activate(state); }
  }));
  mutations.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});

  const setSpeaking=event=>{
    const active=Boolean(event.detail?.active);
    rendererState.forEach(state=>{state.speaking=active; if(active)activate(state);});
  };
  window.addEventListener('dvnm:robot-speaking',setSpeaking);
  const onThemeChange=()=>rendererState.forEach(state=>{
    state.updateTheme?.();
    state.host.dataset.theme=document.documentElement.dataset.theme||'light';
  });
  new MutationObserver(onThemeChange).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden') rendererState.forEach(deactivate);
    else {rendererState.forEach(state=>{if(state.canvas.getBoundingClientRect().bottom>=0&&state.canvas.getBoundingClientRect().top<innerHeight)activate(state);});}
  });

  // Clean up renderers if a temporary dialog/component is removed from the document.
  const disposeIfRemoved = node => {
    const removed=[];
    if(node?.nodeType===1 && node.matches?.('[data-dvnm-robot]')) removed.push(node);
    node?.querySelectorAll?.('[data-dvnm-robot]').forEach(canvas=>removed.push(canvas));
    removed.forEach(canvas=>{
      const state=rendererState.get(canvas); if(!state || canvas.isConnected) return;
      state.disposed=true; state.active=false; state.cleanup?.(); state.observer?.disconnect();
      state.renderer.dispose(); rendererState.delete(canvas);
    });
  };
  const cleanupObserver=new MutationObserver(records=>records.forEach(record=>record.removedNodes.forEach(disposeIfRemoved)));
  cleanupObserver.observe(document.documentElement,{childList:true,subtree:true});
})();
