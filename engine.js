/* PixelWorld v9 — Engine */
'use strict';
window.gc=null;window.cx=null;window.CW=0;window.CH=0;
window.TILE_SZ=36;window.PW_=29;window.PH_=46;

// Edit mode: false=punch, true=edit/place
window.editMode=false;

window.initCanvas=function(){
  gc=document.getElementById('gc');
  cx=gc.getContext('2d',{alpha:false});
  resizeGame();
};

window.resizeGame=function(){
  CW=window.innerWidth;CH=window.innerHeight;
  gc.width=CW;gc.height=CH;
  TILE_SZ=Math.max(26,Math.min(40,Math.floor(Math.min(CW/20,CH/14))));
  PW_=Math.round(TILE_SZ*.82);PH_=Math.round(TILE_SZ*1.3);
  clearTileCache();
  layoutUI();
  preRenderHotbarIcons();
};

/* ── LAYOUT ── */
window.layoutUI=function(){
  const vsmall=CH<380,small=CH<460;
  const btnSz=vsmall?30:small?36:42;
  const abSz=vsmall?46:small?52:58;
  const pad=small?7:11;
  const ctrlH=vsmall?110:small?132:152;
  document.documentElement.style.setProperty('--ctrl-h',ctrlH+'px');

  const dp=document.getElementById('dpad');if(!dp)return;
  const dSize=btnSz*3+6;
  dp.style.cssText='position:relative;width:'+dSize+'px;height:'+dSize+'px;margin:0 0 '+pad+'px '+pad+'px;';

  ['dl','du','dr'].forEach(id=>{const e=document.getElementById(id);if(e){e.style.width=e.style.height=btnSz+'px';}});
  const dl=document.getElementById('dl'),du=document.getElementById('du'),dr=document.getElementById('dr');
  if(dl)dl.style.cssText+=';left:0;top:'+(btnSz+3)+'px;';
  if(du)du.style.cssText+=';left:'+(btnSz+3)+'px;top:0;';
  if(dr)dr.style.cssText+=';right:0;top:'+(btnSz+3)+'px;';
  const dc=document.getElementById('dcenter');
  if(dc)dc.style.cssText='position:absolute;left:'+(btnSz+3)+'px;top:'+(btnSz+3)+'px;width:'+btnSz+'px;height:'+btnSz+'px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);';

  const ctrlEl=document.getElementById('ctrl');
  if(ctrlEl)ctrlEl.style.height=ctrlH+'px';

  const abts=document.getElementById('abts');
  if(abts)abts.style.cssText='display:flex;flex-direction:column;gap:6px;align-items:flex-end;pointer-events:auto;margin:0 '+pad+'px '+pad+'px 0;';

  ['bjump','buse','bpunch'].forEach(id=>{
    const e=document.getElementById(id);
    if(e){e.style.width=e.style.height=abSz+'px';e.style.fontSize=(vsmall?7:small?8:9)+'px';}
  });

  // Hotbar: centered at bottom above controls
  const hb=document.getElementById('hotbar');
  if(hb){
    hb.style.bottom=(ctrlH+6)+'px';
    const slotSz=Math.max(36,Math.min(52,Math.floor((CW-16)/8.2)));
    document.querySelectorAll('.hs').forEach(s=>{s.style.width=s.style.height=slotSz+'px';});
  }

  // Edit/Punch toggle button (slot 0 area — left side of hotbar)
  updateEditModeBtn();

  // Chat bubble above hotbar
  const cb=document.getElementById('chatBubble');
  if(cb&&hb){
    cb.style.bottom=(ctrlH+(hb.offsetHeight||44)+10)+'px';
    cb.style.left='50%';cb.style.transform='translateX(-50%)';
  }
  buildTopBtns();
};

window.updateEditModeBtn=function(){
  const btn=document.getElementById('editToggleBtn');
  if(!btn)return;
  btn.textContent=editMode?'EDIT':'HIT';
  btn.style.background=editMode?'rgba(52,152,219,.25)':'rgba(231,76,60,.25)';
  btn.style.borderColor=editMode?'#3498db':'#e74c3c';
  btn.style.color=editMode?'#3498db':'#e74c3c';
};

window.toggleEditMode=function(){
  editMode=!editMode;
  updateEditModeBtn();
  showToast(editMode?'Edit Mode — Place blocks':'Punch Mode — Break blocks',1800);
};

window.buildTopBtns=function(){
  const tr=document.getElementById('topRight');if(!tr)return;
  tr.innerHTML='';
  const sz=Math.min(32,Math.max(26,Math.floor(CH/22)));
  const btns=[
    {cls:'ic-chat',fn:'openChat()',tip:'Chat'},
    {cls:'ic-bag',fn:'openInv()',tip:'Inventory'},
    {cls:'ic-shop',fn:'openShop()',tip:'Shop'},
    {cls:'ic-gear',fn:'openSett()',tip:'Settings'},
    {cls:'ic-globe',fn:'openWorldsMenu()',tip:'Worlds'},
    {cls:'ic-door',fn:'doLogout()',tip:'Logout'},
  ];
  btns.forEach(({cls,fn,tip})=>{
    const b=document.createElement('div');b.className='topBtn';
    b.style.width=b.style.height=sz+'px';b.title=tip;
    const ic=document.createElement('canvas');const icSz=Math.round(sz*.6);
    ic.width=ic.height=icSz;ic.style.cssText='display:block;image-rendering:pixelated;';
    drawTopIcon(ic.getContext('2d'),cls,icSz);b.appendChild(ic);
    b.addEventListener('click',()=>{try{eval(fn);}catch(e){}});
    b.addEventListener('touchend',e=>{e.preventDefault();try{eval(fn);}catch(e){}},{passive:false});
    tr.appendChild(b);
  });
};

function drawTopIcon(ctx,cls,sz){
  ctx.imageSmoothingEnabled=false;
  const p=n=>Math.round(n*sz/16);
  ctx.fillStyle='#c8a020';
  if(cls==='ic-chat'){ctx.fillRect(p(1),p(1),p(14),p(10));ctx.fillStyle='#1a1428';ctx.fillRect(p(2),p(2),p(12),p(8));ctx.fillStyle='#c8a020';ctx.fillRect(p(3),p(12),p(3),p(2));ctx.fillRect(p(2),p(11),p(4),p(2));}
  else if(cls==='ic-bag'){ctx.fillRect(p(5),p(1),p(6),p(3));ctx.fillRect(p(2),p(4),p(12),p(10));ctx.fillStyle='#1a1428';ctx.fillRect(p(3),p(5),p(10),p(8));ctx.fillStyle='#c8a020';ctx.fillRect(p(6),p(6),p(4),p(4));}
  else if(cls==='ic-shop'){
    // coin/shop icon
    ctx.beginPath();ctx.arc(p(8),p(8),p(6),0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#1a1428';ctx.beginPath();ctx.arc(p(8),p(8),p(4),0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#c8a020';ctx.fillRect(p(7),p(4),p(2),p(8));ctx.fillRect(p(5),p(6),p(6),p(2));
  }
  else if(cls==='ic-gear'){ctx.fillRect(p(6),p(0),p(4),p(3));ctx.fillRect(p(6),p(13),p(4),p(3));ctx.fillRect(p(0),p(6),p(3),p(4));ctx.fillRect(p(13),p(6),p(3),p(4));ctx.fillRect(p(3),p(2),p(3),p(3));ctx.fillRect(p(10),p(2),p(3),p(3));ctx.fillRect(p(3),p(11),p(3),p(3));ctx.fillRect(p(10),p(11),p(3),p(3));ctx.beginPath();ctx.arc(p(8),p(8),p(4),0,Math.PI*2);ctx.fill();ctx.fillStyle='#1a1428';ctx.beginPath();ctx.arc(p(8),p(8),p(2),0,Math.PI*2);ctx.fill();}
  else if(cls==='ic-globe'){ctx.beginPath();ctx.arc(p(8),p(8),p(6),0,Math.PI*2);ctx.fill();ctx.fillStyle='#1a1428';ctx.fillRect(p(3),p(7),p(10),p(2));ctx.fillRect(p(7),p(2),p(2),p(12));ctx.strokeStyle='#1a1428';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p(8),p(8),p(5.5),0,Math.PI*2);ctx.stroke();}
  else if(cls==='ic-door'){ctx.fillRect(p(3),p(1),p(10),p(14));ctx.fillStyle='#1a1428';ctx.fillRect(p(5),p(3),p(5),p(10));ctx.fillStyle='#c8a020';ctx.fillRect(p(10),p(8),p(2),p(2));ctx.fillRect(p(9),p(6),p(4),p(4));ctx.fillStyle='#1a1428';ctx.fillRect(p(10),p(7),p(2),p(2));}
}

/* ── HOTBAR ICONS ── */
const HOTBAR_DEFS=[{key:'fist'},{key:'axe'},{key:'dirt'},{key:'grass'},{key:'stone'},{key:'plank'},{key:'seed'},{key:'worldlock'}];
window.preRenderHotbarIcons=function(){
  document.querySelectorAll('.hs').forEach((sl,i)=>{
    sl.innerHTML='';
    const def=HOTBAR_DEFS[i];if(!def)return;
    const sz=Math.max(20,Math.round((sl.offsetWidth||42)*.52));
    const ic=getItemIcon(def.key,sz);
    const img=document.createElement('canvas');img.width=img.height=sz;
    img.style.cssText='display:block;image-rendering:pixelated;pointer-events:none;';
    img.getContext('2d').drawImage(ic,0,0);sl.appendChild(img);
    const lbl=document.createElement('div');lbl.className='sl';lbl.textContent=def.key==='worldlock'?'LOCK':def.key;sl.appendChild(lbl);
    const cnt=document.createElement('div');cnt.className='sc';cnt.id='sc'+i;sl.appendChild(cnt);
  });
};

/* ── PLAYER ── */
window.P=null;
window.initPlayer=function(){
  P={x:10*TILE_SZ,y:(GROUND-3)*TILE_SZ,vx:0,vy:0,grnd:false,face:1,hp:100,maxHp:100,gems:0,lv:1,xp:0,frame:0,ftick:0,walkBob:0,ptick:0,punching:false,bTarget:null,bTimer:0,bDur:0};
};

/* ── CAMERA ── */
window.cam={x:0,y:0};window.camT={x:0,y:0};
window.updateCam=function(){
  camT.x=P.x+PW_/2-CW/2;camT.y=P.y+PH_/2-CH/2;
  camT.x=Math.max(0,Math.min(camT.x,WW*TILE_SZ-CW));
  camT.y=Math.max(0,Math.min(camT.y,WH*TILE_SZ-CH));
  if(SETT.smoothCam){cam.x+=(camT.x-cam.x)*.15;cam.y+=(camT.y-cam.y)*.15;}
  else{cam.x=camT.x;cam.y=camT.y;}
  cam.x=Math.max(0,Math.min(cam.x,WW*TILE_SZ-CW));
  cam.y=Math.max(0,Math.min(cam.y,WH*TILE_SZ-CH));
};

/* ── INPUT ── */
window.inp={left:false,right:false,jump:false,use:false,punch:false};window.jumpQ=false;
window.bindBtn=function(el,key){
  if(!el||el._pwb)return;el._pwb=true;
  const on=e=>{e.preventDefault();e.stopPropagation();inp[key]=true;if(key==='jump')jumpQ=true;el.classList.add('on');};
  const off=e=>{e.preventDefault();e.stopPropagation();inp[key]=false;el.classList.remove('on');};
  el.addEventListener('touchstart',on,{passive:false});el.addEventListener('touchend',off,{passive:false});el.addEventListener('touchcancel',off,{passive:false});
  el.addEventListener('mousedown',on);el.addEventListener('mouseup',off);el.addEventListener('mouseleave',off);
};
window.bindActionBtn=function(el,cb){
  if(!el||el._pwb)return;el._pwb=true;
  const on=e=>{e.preventDefault();e.stopPropagation();el.classList.add('on');cb();};
  const off=e=>{e.preventDefault();e.stopPropagation();el.classList.remove('on');};
  el.addEventListener('touchstart',on,{passive:false});el.addEventListener('touchend',off,{passive:false});el.addEventListener('touchcancel',off,{passive:false});
  el.addEventListener('mousedown',on);el.addEventListener('mouseup',off);el.addEventListener('mouseleave',off);
};

const KM={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'jump',KeyW:'jump',Space:'jump',KeyZ:'punch',KeyX:'use',KeyE:'use'};
window.addEventListener('keydown',e=>{
  if(KM[e.code]){inp[KM[e.code]]=true;if(KM[e.code]==='jump')jumpQ=true;e.preventDefault();}
  if(e.key==='Enter'&&chatOpen){sendChat();e.preventDefault();}
  if(e.code==='Tab'){e.preventDefault();selHotbar((selSlot+1)%HOTBAR_KEYS.length);}
  if(e.code==='KeyQ'){toggleEditMode();}
  if(e.code==='Escape'){document.querySelectorAll('.panel.open').forEach(p=>p.classList.remove('open'));}
  const n=parseInt(e.key);if(n>=1&&n<=8)selHotbar(n-1);
});
window.addEventListener('keyup',e=>{if(KM[e.code])inp[KM[e.code]]=false;});

/* ── BREAK RANGE — must be near block ── */
const BREAK_REACH=4; // tiles distance max
function inBreakRange(c,r){
  const pc=~~((P.x+PW_/2)/TILE_SZ);
  const pr=~~((P.y+PH_/2)/TILE_SZ);
  const dx=c-pc,dy=r-pr;
  return Math.sqrt(dx*dx+dy*dy)<=BREAK_REACH;
}

/* ── PHYSICS ── */
const GRAV=0.52,BASE_SPD=3.4,JVEL=-12.5;
function solidPx(bx,by){return isSolid(~~(bx/TILE_SZ),~~(by/TILE_SZ));}

window.stepPlayer=function(){
  const spd=BASE_SPD*(SETT.moveSpd/100);
  const mv=(inp.right?1:0)-(inp.left?1:0);
  if(mv!==0)P.face=mv;
  P.vx=mv*spd;P.vy=Math.min(P.vy+GRAV,18);
  if(jumpQ&&P.grnd){P.vy=JVEL;P.grnd=false;jumpQ=false;}else jumpQ=false;

  P.x+=P.vx;P.x=Math.max(0,Math.min(P.x,WW*TILE_SZ-PW_));
  const MY=P.y+PH_*.5;
  if(P.vx>0&&solidPx(P.x+PW_-.5,MY)){P.x=~~((P.x+PW_)/TILE_SZ)*TILE_SZ-PW_-.01;P.vx=0;}
  else if(P.vx<0&&solidPx(P.x+.5,MY)){P.x=Math.ceil(P.x/TILE_SZ)*TILE_SZ+.01;P.vx=0;}

  P.y+=P.vy;P.grnd=false;
  const PL=P.x+3,PR=P.x+PW_-3;
  if(P.vy>=0){const foot=P.y+PH_;if(solidPx(PL,foot-.2)||solidPx(PR,foot-.2)){P.y=~~(foot/TILE_SZ)*TILE_SZ-PH_-.01;P.vy=0;P.grnd=true;}}
  else{if(solidPx(PL,P.y+.2)||solidPx(PR,P.y+.2)){P.y=Math.ceil(P.y/TILE_SZ)*TILE_SZ+.01;P.vy=0;}}
  P.y=Math.max(0,Math.min(P.y,(WH-2)*TILE_SZ-PH_));
  if(P.y>(WH-1)*TILE_SZ-PH_){P.y=(GROUND-3)*TILE_SZ;P.x=10*TILE_SZ;P.vy=0;showToast('Respawned!');}

  if(mv!==0&&P.grnd){P.ftick++;if(P.ftick>6){P.frame=(P.frame+1)%8;P.ftick=0;}P.walkBob=Math.sin(P.frame*Math.PI/4)*3.5;}
  else{P.walkBob*=.74;P.frame=0;}

  if(P.punching||P.bTarget)P.ptick=(P.ptick+1)%24;
  else if(P.ptick>0)P.ptick=Math.max(0,P.ptick-3);

  if(inp.use)useAction();
  if(inp.punch&&!editMode)punchAction();

  if(P.bTarget){
    P.punching=true;P.bTimer++;
    wdmg[P.bTarget.r*WW+P.bTarget.c]=P.bTimer/P.bDur;
    if(!inBreakRange(P.bTarget.c,P.bTarget.r)){P.bTarget=null;P.bTimer=0;P.punching=false;}
    else if(P.bTimer>=P.bDur)finishBreak();
  }else if(!inp.use&&!inp.punch)P.punching=false;

  if(Math.random()<.002)saveProgress();
  updateCam();
};

/* ── BREAKING ── */
window.startBreak=function(c,r){
  const t=wt(c,r);
  if(t===T.AIR||t===T.BEDROCK)return;
  // Check world lock — only owner can break
  if(window.currentWorldLocked&&window.currentWorldOwner!==window.currentUser){
    showToast('World is locked! Only owner can edit.');return;
  }
  if(!inBreakRange(c,r)){showToast('Too far away! Walk closer.');return;}
  if(P.bTarget&&P.bTarget.c===c&&P.bTarget.r===r)return;
  wdmg[r*WW+c]=0;P.bTarget={c,r};P.bTimer=0;
  P.bDur=brkDur(t,HOTBAR_KEYS[selSlot]);P.punching=true;
};

window.finishBreak=function(){
  const{c,r}=P.bTarget;const t=wt(c,r);
  if(SETT.particles)spawnParts(c*TILE_SZ+TILE_SZ/2,r*TILE_SZ+TILE_SZ/2,t,14);
  const dk=tileDrop(t);
  if(dk)spawnDrop(c*TILE_SZ+TILE_SZ/2,r*TILE_SZ,dk);
  wdmg[r*WW+c]=0;wset(c,r,T.AIR);
  // Gems reward 1-5 based on block type
  const gemReward={[T.ORE]:4+~~(Math.random()*2),[T.CAVE_STONE]:2,[T.STONE]:1,[T.WORLDLOCK]:0}[t]||1;
  P.gems+=gemReward;P.xp+=2;
  if(P.xp>=P.lv*20){P.lv++;P.xp=0;showToast('LEVEL UP! LV '+P.lv);}
  updateGemsHUD();
  document.getElementById('hudLv').textContent='LV '+P.lv;
  P.bTarget=null;P.bTimer=0;P.punching=false;updateHB();
};

function brkDur(t,item){
  let b={[T.DIRT]:26,[T.GRASS]:26,[T.STONE]:68,[T.CAVE_STONE]:84,[T.ORE]:96,[T.TRUNK]:50,[T.PLANK]:40,[T.LEAF]:10,[T.CLOUD]:10,[T.WORLDLOCK]:999}[t]||44;
  if(item==='axe')b=Math.ceil(b*.36);
  return Math.max(4,Math.ceil(b*(100/Math.max(SETT.breakSpd,10))));
}
function tileDrop(t){
  return{[T.DIRT]:'dirt',[T.GRASS]:'dirt',[T.STONE]:'stone',[T.CAVE_STONE]:'stone',[T.TRUNK]:'plank',[T.PLANK]:'plank',[T.ORE]:'ore',[T.LEAF]:'leaf',[T.WORLDLOCK]:'worldlock'}[t]||null;
}

window.useAction=function(){
  const fd=P.face>0?1:-1;
  const fc=~~((P.x+PW_/2+fd*TILE_SZ*.9)/TILE_SZ);
  const fr=~~((P.y+PH_*.4)/TILE_SZ);
  worldInteract(fc*TILE_SZ-cam.x+TILE_SZ/2,fr*TILE_SZ-cam.y+TILE_SZ/2);
};
window.punchAction=function(){
  if(editMode)return;
  const fc=~~((P.x+PW_/2+P.face*TILE_SZ*.85)/TILE_SZ);
  const fr=~~((P.y+PH_*.5)/TILE_SZ);
  startBreak(fc,fr);
};

window.worldInteract=function(ex,ey){
  if(!gameRunning)return;
  const elAt=document.elementFromPoint(ex,ey);
  if(elAt&&elAt.closest('#ctrl,#hotbar,#topRight,#hud,#toast,#chatBubble,.panel,#editToggleBtn'))return;
  const wx=ex+cam.x,wy=ey+cam.y;
  const c=~~(wx/TILE_SZ),r=~~(wy/TILE_SZ);
  if(c<0||c>=WW||r<0||r>=WH)return;

  // Right-click or edit mode on worldlock = open lock menu
  const t=wt(c,r);
  if(t===T.WORLDLOCK){
    openWorldLockMenu(c,r);return;
  }

  const item=HOTBAR_KEYS[selSlot]||'fist';

  if(editMode){
    // Edit mode: place blocks
    if(t===T.AIR){
      if(item==='fist'||item==='axe')return;
      if(!inBreakRange(c,r)){showToast('Too far! Walk closer.');return;}
      const pt={dirt:T.DIRT,grass:T.GRASS,stone:T.STONE,plank:T.PLANK,seed:T.LEAF,worldlock:T.WORLDLOCK}[item]||0;
      if(pt){
        if(window.currentWorldLocked&&window.currentWorldOwner!==window.currentUser){showToast('World is locked!');return;}
        if(inv[item]&&inv[item].q>0){
          wset(c,r,pt);inv[item].q--;updateHB();
          if(SETT.particles)spawnParts(c*TILE_SZ+TILE_SZ/2,r*TILE_SZ+TILE_SZ/2,pt,6);
          if(item==='worldlock'){lockWorld(c,r);}
          showToast('Placed '+item);
        }else showToast('No '+item+'!');
      }
    }else{
      // Break in edit mode too
      if(!inBreakRange(c,r)){showToast('Too far!');return;}
      startBreak(c,r);
    }
  }else{
    // Punch mode
    if(item==='fist'||item==='axe'){startBreak(c,r);}
    else{
      if(t===T.AIR){
        if(!inBreakRange(c,r)){showToast('Too far!');return;}
        if(window.currentWorldLocked&&window.currentWorldOwner!==window.currentUser){showToast('World is locked!');return;}
        const pt={dirt:T.DIRT,grass:T.GRASS,stone:T.STONE,plank:T.PLANK,seed:T.LEAF,worldlock:T.WORLDLOCK}[item]||0;
        if(pt&&inv[item]&&inv[item].q>0){
          wset(c,r,pt);inv[item].q--;updateHB();
          if(SETT.particles)spawnParts(c*TILE_SZ+TILE_SZ/2,r*TILE_SZ+TILE_SZ/2,pt,6);
          if(item==='worldlock')lockWorld(c,r);
          showToast('Placed '+item);
        }else if(pt)showToast('No '+item+'!');
        else startBreak(c,r);
      }else startBreak(c,r);
    }
  }
};

/* ── WORLD LOCK ── */
window.currentWorldLocked=false;
window.currentWorldOwner='';
window.worldLockPos={c:-1,r:-1};

window.lockWorld=function(c,r){
  currentWorldLocked=true;
  currentWorldOwner=currentUser;
  worldLockPos={c,r};
  showToast('World locked! You are the owner.');
  saveProgress();
};

window.openWorldLockMenu=function(c,r){
  const menu=document.getElementById('worldLockMenu');
  if(!menu)return;
  const isOwner=currentWorldOwner===currentUser;
  document.getElementById('wlmTitle').textContent=isOwner?'YOUR WORLD LOCK':'WORLD LOCK';
  document.getElementById('wlmOwner').textContent='Owner: '+(currentWorldOwner||'Unknown');
  document.getElementById('wlmProtect').style.display=isOwner?'flex':'none';
  document.getElementById('wlmGrant').style.display=isOwner?'flex':'none';
  document.getElementById('wlmTrade').style.display='flex';
  menu.classList.add('open');
};

/* ── PARTICLES ── */
window.parts=[];
window.spawnParts=function(x,y,type,n){
  const cols={[T.DIRT]:['#7a5230','#5a3a1e','#9a6848'],[T.GRASS]:['#3d7028','#5ea840','#7a5230'],[T.STONE]:['#6a6a6a','#909090','#545454'],[T.CAVE_STONE]:['#3c3c3c','#4a4a4a'],[T.ORE]:['#00c0a0','#40e8c0','#90fff0'],[T.TRUNK]:['#442208','#603410'],[T.LEAF]:['#163e14','#34901e'],[T.PLANK]:['#8a5818','#6a4010'],[T.WORLDLOCK]:['#c8a020','#e8c040','#7050d8']}[type]||['#aaa'];
  n=n||8;
  for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*7,vy:(Math.random()-.5)*5-2.5,life:28+Math.random()*32,max:60,col:cols[~~(Math.random()*cols.length)],s:1.5+Math.random()*4});
};
window.drops=[];
window.spawnDrop=function(x,y,key){drops.push({x,y,vy:-3.5,life:240,key,bob:Math.random()*Math.PI*2});};
window.floats=[];
window.addFloat=function(wx,wy,txt,col){floats.push({wx,wy,txt,col:col||'#FFD700',life:54,max:54});};

/* ── BG ── */
let bgClX=0;
window.drawBG=function(){
  const skyEnd=Math.max(0,(GROUND+1)*TILE_SZ-cam.y);
  if(skyEnd>0){
    const g=cx.createLinearGradient(0,0,0,skyEnd);
    g.addColorStop(0,'#1a3a6a');g.addColorStop(.5,'#2e6898');g.addColorStop(1,'#5a9ec0');
    cx.fillStyle=g;cx.fillRect(0,0,CW,skyEnd);
  }
  if(skyEnd<CH){
    const g=cx.createLinearGradient(0,skyEnd,0,CH);
    g.addColorStop(0,'#2e1808');g.addColorStop(1,'#0c0604');
    cx.fillStyle=g;cx.fillRect(0,skyEnd,CW,CH-skyEnd);
  }
  if(SETT.sunRays&&cam.y<GROUND*TILE_SZ*.8){
    const sx=CW*.82,sy=44-cam.y*.06;cx.save();
    const sg=cx.createRadialGradient(sx,sy,0,sx,sy,60);
    sg.addColorStop(0,'rgba(255,240,80,.22)');sg.addColorStop(1,'rgba(255,200,0,0)');
    cx.fillStyle=sg;cx.fillRect(sx-65,sy-65,130,130);
    cx.shadowBlur=28;cx.shadowColor='rgba(255,215,0,.5)';
    cx.fillStyle='#ffe050';cx.beginPath();cx.arc(sx,sy,14,0,Math.PI*2);cx.fill();
    cx.shadowBlur=0;cx.strokeStyle='rgba(255,225,0,.15)';cx.lineWidth=2;
    for(let a=0;a<Math.PI*2;a+=Math.PI/7){cx.beginPath();cx.moveTo(sx+Math.cos(a)*18,sy+Math.sin(a)*18);cx.lineTo(sx+Math.cos(a)*32,sy+Math.sin(a)*32);cx.stroke();}
    cx.restore();
  }
  bgClX=(bgClX+.055)%(CW+130);
  cx.globalAlpha=.1;cx.fillStyle='#c8e8ff';
  for(let i=0;i<6;i++){const bx=((i*190+bgClX)%(CW+130))-65;const by=20+i*14-cam.y*.02;if(by>-20&&by<CH*.6){cx.fillRect(~~bx,~~by,75,14);cx.fillRect(~~bx+10,~~by-8,55,12);}}
  cx.globalAlpha=1;
};

/* ── WORLD RENDERER ── */
window.drawWorld=function(){
  const sz=TILE_SZ;
  const sc=Math.max(0,~~(cam.x/sz)-1),ec=Math.min(WW,~~((cam.x+CW)/sz)+2);
  const sr=Math.max(0,~~(cam.y/sz)-1),er=Math.min(WH,~~((cam.y+CH)/sz)+2);
  for(let r=sr;r<er;r++){
    for(let c=sc;c<ec;c++){
      const t=wt(c,r);if(t===T.AIR)continue;
      const sx=~~(c*sz-cam.x),sy=~~(r*sz-cam.y);
      cx.drawImage(getTile(t,sz),sx,sy,sz,sz);
      // World lock glow
      if(t===T.WORLDLOCK){
        cx.fillStyle='rgba(120,80,220,'+(0.08+Math.sin(Date.now()*.003)*.05)+')';
        cx.fillRect(sx,sy,sz,sz);
      }
      const d=wdmg[r*WW+c];
      if(d>0){
        cx.fillStyle='rgba(0,0,0,'+(d*.55)+')';cx.fillRect(sx,sy,sz,sz);
        cx.strokeStyle='rgba(255,255,255,'+(d*.25)+')';cx.lineWidth=1;
        const nc=~~(d*5);
        for(let ci=0;ci<nc;ci++){cx.beginPath();cx.moveTo(sx+4+ci*5,sy+4+ci*4);cx.lineTo(sx+10+ci*5,sy+10+ci*3);cx.stroke();}
      }
    }
  }
};

/* ── PLAYER RENDERER ── */
window.drawPlayer=function(){
  const sx=~~(P.x-cam.x),sy=~~(P.y-cam.y);
  cx.fillStyle='rgba(0,0,0,.14)';cx.beginPath();cx.ellipse(sx+PW_/2,sy+PH_+1,PW_*.34,3.5,0,0,Math.PI*2);cx.fill();
  const uname=window.currentUser||'';
  if(uname){
    cx.save();cx.font='bold 8px "Courier New"';cx.textAlign='center';cx.textBaseline='bottom';
    const tw=cx.measureText(uname).width;
    // Mode indicator dot
    cx.fillStyle=editMode?'rgba(52,152,219,.9)':'rgba(231,76,60,.9)';
    cx.fillRect(sx+PW_/2-tw/2-6,sy-17,tw+16,12);
    cx.fillStyle='#fff';cx.fillText(uname,sx+PW_/2,sy-5);
    // 3-dot menu on player name
    cx.fillStyle='rgba(255,255,255,.7)';
    for(let i=0;i<3;i++)cx.fillRect(sx+PW_/2+tw/2+2-8+i*3,sy-12,2,2);
    cx.restore();
  }
  drawPixelChar(cx,sx,sy,PW_,PH_,P.face,P.frame,P.punching,P.ptick);
  if(P.punching||P.bTarget){
    const item=HOTBAR_KEYS[selSlot];const ic=getItemIcon(item,Math.round(TILE_SZ*.72));
    cx.save();cx.translate(sx+PW_*.88,sy+PH_*.32);
    const po=P.ptick>0?Math.sin(P.ptick*.28)*.38:0;
    cx.rotate(P.face===1?-0.85+po:-0.25-po);cx.drawImage(ic,-ic.width*.3,0);cx.restore();
  }
};

/* ── BREAK INDICATOR ── */
window.drawBreakInd=function(){
  if(!P.bTarget)return;
  const sz=TILE_SZ;const{c,r}=P.bTarget;
  const sx=~~(c*sz-cam.x),sy=~~(r*sz-cam.y);
  const prog=Math.min(P.bTimer/P.bDur,1);
  const pulse=.4+Math.sin(Date.now()*.014)*.28;
  cx.strokeStyle=`rgba(255,240,0,${pulse})`;cx.lineWidth=2.5;cx.strokeRect(sx+2,sy+2,sz-4,sz-4);
  cx.fillStyle='rgba(0,0,0,.6)';cx.fillRect(sx+2,sy+sz-8,sz-4,7);
  const barColor=prog<.5?'#FFD700':prog<.8?'#ff8800':'#ff4400';
  cx.fillStyle=barColor;cx.fillRect(sx+2,sy+sz-8,(sz-4)*prog,7);
};

/* ── REACH INDICATOR ── */
window.drawReachCircle=function(){
  if(!P)return;
  const sx=~~(P.x+PW_/2-cam.x),sy=~~(P.y+PH_/2-cam.y);
  cx.save();cx.strokeStyle='rgba(255,255,255,.06)';cx.lineWidth=1;cx.setLineDash([4,6]);
  cx.beginPath();cx.arc(sx,sy,BREAK_REACH*TILE_SZ,0,Math.PI*2);cx.stroke();
  cx.setLineDash([]);cx.restore();
};

/* ── PARTICLES RENDERER ── */
window.drawParts=function(){
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.2;p.vx*=.96;p.life--;if(p.life<=0){parts.splice(i,1);continue;}cx.globalAlpha=p.life/p.max;cx.fillStyle=p.col;cx.fillRect(~~(p.x-cam.x-p.s/2),~~(p.y-cam.y-p.s/2),~~p.s,~~p.s);}
  cx.globalAlpha=1;
};

/* ── DROPS ── */
window.drawDrops=function(){
  const sz=TILE_SZ;
  for(let i=drops.length-1;i>=0;i--){
    const d=drops[i];d.y+=d.vy;d.vy=Math.min(d.vy+.26,5);
    if(d.vy>=0&&isSolid(~~(d.x/sz),~~((d.y+10)/sz)))d.vy=0;
    d.bob+=.055;d.life--;
    if(Math.abs(d.x-(P.x+PW_/2))<sz*1.4&&Math.abs(d.y-(P.y+PH_/2))<sz*1.6){
      if(!inv[d.key])inv[d.key]={n:d.key,q:0};inv[d.key].q++;
      if(d.key==='ore'){P.gems+=2;updateGemsHUD();}
      addFloat(d.x,d.y-10,'+1 '+d.key.toUpperCase(),'#FFD700');
      updateHB();drops.splice(i,1);continue;
    }
    if(d.life<=0){drops.splice(i,1);continue;}
    const ic=getItemIcon(d.key,~~(sz*.54));
    cx.save();cx.globalAlpha=Math.min(1,d.life/45);cx.shadowBlur=6;cx.shadowColor='rgba(255,215,0,.4)';
    cx.drawImage(ic,~~(d.x-cam.x-ic.width/2),~~(d.y-cam.y+Math.sin(d.bob)*3.5));cx.restore();cx.globalAlpha=1;
  }
};

/* ── FLOAT TEXT ── */
window.drawFloats=function(){
  cx.textBaseline='top';cx.textAlign='left';cx.font='bold 10px "Courier New"';
  for(let i=floats.length-1;i>=0;i--){const f=floats[i];f.wy-=.65;f.life--;if(f.life<=0){floats.splice(i,1);continue;}cx.globalAlpha=f.life/f.max;cx.fillStyle=f.col;cx.fillText(f.txt,~~(f.wx-cam.x-18),~~(f.wy-cam.y));}
  cx.globalAlpha=1;
};

/* ── HUD helpers ── */
window.updateGemsHUD=function(){const el=document.getElementById('hudGems');if(!el)return;const sp=el.querySelector('span');if(sp)sp.textContent=P?P.gems:0;};
window.updateHeartsHUD=function(){
  const max=5;const hp=P?P.hp:100;const full=Math.round((hp/100)*max);
  const el=document.querySelector('.hp-hearts');if(!el)return;el.innerHTML='';
  for(let i=0;i<max;i++){const h=document.createElement('div');h.className='heart'+(i<full?'':' empty');const b=document.createElement('div');b.className='heart-body';h.appendChild(b);el.appendChild(h);}
};
