/* PixelWorld v9 — Main */
'use strict';
const DB_USERS='pw_users_v5';const DB_WORLDS='pw_worlds_v5';const DB_CHAT='pw_chat_v3';const DB_SETT='pw_sett_v2';const DB_TRADES='pw_trades_v1';
const getJ=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):(d!==undefined?d:{});}catch(e){return d!==undefined?d:{};}};
const setJ=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){showToast('Storage full!',2000);}};

window.SETT=Object.assign({particles:true,smoothCam:true,sunRays:true,breakSpd:100,moveSpd:100},getJ(DB_SETT));
function saveSett(){setJ(DB_SETT,SETT);}
window.togSett=function(k){SETT[k]=!SETT[k];saveSett();document.getElementById('tog_'+k).classList.toggle('on',SETT[k]);};
window.updSlider=function(k,v){SETT[k]=+v;saveSett();document.getElementById('v_'+k).textContent=(+v/100).toFixed(1)+'x';};
function syncSettUI(){['particles','smoothCam','sunRays'].forEach(k=>document.getElementById('tog_'+k).classList.toggle('on',SETT[k]));['breakSpd','moveSpd'].forEach(k=>{document.getElementById('sl_'+k).value=SETT[k];document.getElementById('v_'+k).textContent=(SETT[k]/100).toFixed(1)+'x';});}

/* ── STATE ── */
window.currentUser=null;window.currentWorldId=null;window.currentWorldName='';
window.chatOpen=false;window.gameRunning=false;window.rafId=null;
let _selWT='normal';

/* ── INVENTORY ── */
window.HOTBAR_KEYS=['fist','axe','dirt','grass','stone','plank','seed','worldlock'];
window.inv={};window.selSlot=0;
window.resetInv=function(){
  inv={fist:{n:'Fist',q:1},axe:{n:'Axe',q:1},dirt:{n:'Dirt',q:0},grass:{n:'Grass',q:0},stone:{n:'Stone',q:0},plank:{n:'Plank',q:0},seed:{n:'Seed',q:8},ore:{n:'Ore',q:0},leaf:{n:'Leaf',q:0},worldlock:{n:'World Lock',q:0}};
};
window.updateHB=function(){for(let i=0;i<HOTBAR_KEYS.length;i++){const el=document.getElementById('sc'+i);if(el){const k=HOTBAR_KEYS[i];el.textContent=(inv[k]&&inv[k].q>0)?inv[k].q:'';}}}; 
window.selHotbar=function(i){selSlot=i;document.querySelectorAll('.hs').forEach((s,idx)=>s.classList.toggle('on',idx===i));if(P){P.bTarget=null;P.bTimer=0;P.punching=false;}};

/* ── TOAST ── */
let _toastTm;
window.showToast=function(t,dur){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');clearTimeout(_toastTm);_toastTm=setTimeout(()=>el.classList.remove('show'),dur||2600);};

/* ── AUTH ── */
let authMode='login';
window.switchTab=function(m){authMode=m;document.getElementById('tabLogin').classList.toggle('on',m==='login');document.getElementById('tabReg').classList.toggle('on',m==='reg');document.getElementById('authErr').textContent='';document.getElementById('authOk').textContent='';};
window.doAuth=function(){
  const u=document.getElementById('aUser').value.trim(),p=document.getElementById('aPass').value;
  const eE=document.getElementById('authErr'),oE=document.getElementById('authOk');eE.textContent='';oE.textContent='';
  if(!u||u.length<3){eE.textContent='Username needs 3+ characters';return;}
  if(!/^[a-zA-Z0-9_]+$/.test(u)){eE.textContent='Letters, numbers, underscore only';return;}
  if(!p||p.length<4){eE.textContent='Password needs 4+ characters';return;}
  const users=getJ(DB_USERS);const key=u.toLowerCase();
  if(authMode==='reg'){
    if(users[key]){eE.textContent='Username already taken';return;}
    users[key]={username:u,password:btoa(p),created:Date.now(),gems:0,totalGems:0,worldsCreated:0};
    setJ(DB_USERS,users);oE.textContent='Account created!';setTimeout(()=>startAssetDownload(u),350);
  }else{
    if(!users[key]){eE.textContent='User not found';return;}
    if(atob(users[key].password)!==p){eE.textContent='Wrong password';return;}
    oE.textContent='Welcome back, '+users[key].username+'!';setTimeout(()=>startAssetDownload(users[key].username),250);
  }
};
['aUser','aPass'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('keydown',e=>{if(e.key==='Enter')doAuth();});});

/* ── ASSET LOAD ── */
function startAssetDownload(username){
  document.getElementById('authScreen').style.display='none';
  const ls=document.getElementById('loadingScreen');ls.style.display='flex';
  document.getElementById('loadFill').style.width='0';
  const steps=[{label:'Loading character sprite',ms:300},{label:'Building tile textures',ms:400},{label:'Pre-rendering icons',ms:260},{label:'Setting up storage',ms:160},{label:'Starting engine',ms:220}];
  const stEl=document.getElementById('loadSteps');stEl.innerHTML='';
  steps.forEach((s,i)=>{const d=document.createElement('div');d.className='lStep pending';d.id='ls'+i;d.innerHTML='<div class="lStep-icon"></div><span>'+s.label+'</span>';stEl.appendChild(d);});
  const total=steps.reduce((a,s)=>a+s.ms,0);let elapsed=0,si=0;
  function ss(i,st){const el=document.getElementById('ls'+i);if(el)el.className='lStep '+st;}
  ss(0,'active');
  const iv=setInterval(()=>{
    elapsed+=28;const pct=Math.min(99,elapsed/total*100);
    document.getElementById('loadFill').style.width=pct+'%';
    let acc=0;for(let i=0;i<steps.length;i++){acc+=steps[i].ms;if(elapsed>=acc&&si<=i){ss(i,'done');if(i+1<steps.length)ss(i+1,'active');si=i+1;}}
    document.getElementById('loadTxt').textContent=si<steps.length?steps[Math.min(si,steps.length-1)].label.toUpperCase()+'...':'READY!';
    if(elapsed>=total){clearInterval(iv);document.getElementById('loadFill').style.width='100%';document.getElementById('loadTxt').textContent='READY!';steps.forEach((_,i)=>ss(i,'done'));
      [1,2,3,4,5,6,7,8,9,10,11].forEach(t=>{try{getTile(t,36);getTile(t,32);}catch(e){}});
      HOTBAR_KEYS.forEach(k=>{try{getItemIcon(k,24);getItemIcon(k,32);}catch(e){}});
      setTimeout(()=>{ls.style.display='none';openWorldSelect(username);},180);}
  },28);
}

/* ── WORLD SELECT ── */
window.openWorldSelect=function(username){currentUser=username;document.getElementById('wsSub').textContent='Player: '+username;renderWorlds();document.getElementById('worldScreen').classList.add('open');};
window.renderWorlds=function(){
  const db=getJ(DB_WORLDS);const mine=Object.entries(db).filter(([,w])=>w.owner===currentUser);
  const list=document.getElementById('worldList');list.innerHTML='';
  if(!mine.length){list.innerHTML='<div style="color:#888;font-size:9px;text-align:center;padding:20px 0;letter-spacing:1px;">No worlds yet — create one below!</div>';return;}
  mine.sort((a,b)=>(b[1].lastPlayed||0)-(a[1].lastPlayed||0)).forEach(([id,w])=>{
    const card=document.createElement('div');card.className='worldCard';
    const ic=document.createElement('canvas');ic.width=ic.height=36;ic.className='wIcon';ic.style.imageRendering='pixelated';
    const ctx=ic.getContext('2d');
    if(w.type==='flat')drawTileCtx(ctx,0,0,T.GRASS,36);
    else if(w.type==='cave')drawTileCtx(ctx,0,0,T.CAVE_STONE,36);
    else drawTileCtx(ctx,0,0,T.GRASS,36);
    if(w.locked){const lc=document.createElement('canvas');lc.width=lc.height=16;lc.style.cssText='position:absolute;bottom:0;right:0;image-rendering:pixelated;';drawTileCtx(lc.getContext('2d'),0,0,T.WORLDLOCK,16);ic.parentElement&&ic.parentElement.style.setProperty('position','relative');ic.after&&ic.after(lc);}
    card.appendChild(ic);
    const info=document.createElement('div');info.className='wInfo';
    const typeLabel={normal:'Normal',flat:'Flat',cave:'Caves'}[w.type]||w.type;
    const lockBadge=w.locked?'<span class="lockBadge">LOCKED</span>':'';
    info.innerHTML='<div class="wName">'+esc(w.name)+lockBadge+'</div><div class="wDetail">'+typeLabel+' · LV '+(w.lv||1)+' · '+(w.gems||0)+' gems · '+timeSince(w.lastPlayed||w.created)+'</div>';
    card.appendChild(info);
    const del=document.createElement('div');del.className='wDel';del.title='Delete world';del.innerHTML='<div class="ic-trash"></div>';
    del.addEventListener('click',e=>{e.stopPropagation();delWorld(id);});card.appendChild(del);
    card.addEventListener('click',()=>enterWorld(id,w));list.appendChild(card);
  });
};
function delWorld(id){if(!confirm('Delete this world?'))return;const db=getJ(DB_WORLDS);delete db[id];setJ(DB_WORLDS,db);if(currentWorldId===id)currentWorldId=null;renderWorlds();}
function enterWorld(id,w){currentWorldId=id;currentWorldName=w.name;document.getElementById('worldScreen').classList.remove('open');startGameLoad(w);}
window.backToAuth=function(){currentUser=null;document.getElementById('worldScreen').classList.remove('open');document.getElementById('authScreen').style.display='flex';document.getElementById('aUser').value='';document.getElementById('aPass').value='';};
window.openNWModal=function(){_selWT='normal';updateWTBtns();document.getElementById('nwName').value='';document.getElementById('nwErr').textContent='';document.getElementById('nwModal').classList.add('open');setTimeout(()=>document.getElementById('nwName').focus(),100);};
window.closeNWModal=function(){document.getElementById('nwModal').classList.remove('open');};
window.selWT=function(t){_selWT=t;updateWTBtns();};
function updateWTBtns(){['normal','flat','cave'].forEach(t=>document.getElementById('wt_'+t).classList.toggle('on',t===_selWT));}
window.createWorld=function(){
  const name=document.getElementById('nwName').value.trim();
  if(!name||name.length<2){document.getElementById('nwErr').textContent='Name too short';return;}
  const db=getJ(DB_WORLDS);
  const id='w_'+Date.now()+'_'+Math.random().toString(36).slice(2,6);
  db[id]={name,type:_selWT,owner:currentUser,created:Date.now(),lastPlayed:Date.now(),lv:1,gems:0,locked:false};
  setJ(DB_WORLDS,db);
  // Give new player 1 world lock block
  const users=getJ(DB_USERS);const key=currentUser.toLowerCase();
  if(users[key]){users[key].worldsCreated=(users[key].worldsCreated||0)+1;setJ(DB_USERS,users);}
  closeNWModal();renderWorlds();showToast('World created! You got 1 World Lock block!');
  // Grant 1 world lock to inventory when game starts
  window._pendingWorldLock=true;
};
document.getElementById('nwName').addEventListener('keydown',e=>{if(e.key==='Enter')createWorld();});
document.getElementById('nwModal').addEventListener('click',e=>{if(e.target===document.getElementById('nwModal'))closeNWModal();});

/* ── GAME LOAD ── */
function startGameLoad(worldData){
  const ls=document.getElementById('loadingScreen');ls.style.display='flex';
  document.getElementById('loadSteps').innerHTML='';document.getElementById('loadFill').style.width='0';
  document.getElementById('loadTxt').textContent='LOADING WORLD...';
  let p=0;const iv=setInterval(()=>{p+=Math.random()*14+6;if(p>=100){p=100;clearInterval(iv);document.getElementById('loadFill').style.width='100%';document.getElementById('loadTxt').textContent='READY!';setTimeout(()=>{ls.style.display='none';launchGame(worldData);},160);}document.getElementById('loadFill').style.width=p+'%';},50);
}

/* ── SAVE / LOAD ── */
window.saveProgress=function(){
  if(!currentUser||!currentWorldId)return;
  const db=getJ(DB_WORLDS);if(!db[currentWorldId])return;
  db[currentWorldId].lv=P.lv;db[currentWorldId].gems=P.gems;db[currentWorldId].lastPlayed=Date.now();
  db[currentWorldId].locked=currentWorldLocked;db[currentWorldId].lockedBy=currentWorldOwner;
  db[currentWorldId].save={px:~~P.x,py:~~P.y,hp:P.hp,gems:P.gems,lv:P.lv,xp:P.xp,inv:JSON.parse(JSON.stringify(inv)),world:Array.from(world),locked:currentWorldLocked,lockedBy:currentWorldOwner,lockPos:worldLockPos};
  setJ(DB_WORLDS,db);
  // Update user total gems
  const users=getJ(DB_USERS);const key=currentUser.toLowerCase();
  if(users[key]){users[key].gems=P.gems;users[key].totalGems=Math.max(users[key].totalGems||0,P.gems);setJ(DB_USERS,users);}
};
function loadProgress(){
  if(!currentUser||!currentWorldId)return false;
  const db=getJ(DB_WORLDS);const wd=db[currentWorldId];if(!wd||!wd.save)return false;
  const s=wd.save;P.x=s.px||10*TILE_SZ;P.y=s.py||(GROUND-3)*TILE_SZ;P.hp=s.hp||100;P.gems=s.gems||0;P.lv=s.lv||1;P.xp=s.xp||0;
  if(s.inv)Object.assign(inv,s.inv);
  if(s.world&&s.world.length===WW*WH)world=new Uint8Array(s.world);
  currentWorldLocked=s.locked||false;currentWorldOwner=s.lockedBy||'';
  if(s.lockPos)worldLockPos=s.lockPos;
  return true;
}

/* ── LAUNCH ── */
window.launchGame=function(worldData){
  resizeGame();genWorld((worldData&&worldData.type)||'normal');resetInv();initPlayer();
  if(loadProgress()){P.vx=0;P.vy=0;P.grnd=false;P.bTarget=null;}
  // Grant free world lock on new world
  if(window._pendingWorldLock){inv.worldlock={n:'World Lock',q:1};window._pendingWorldLock=false;showToast('You got 1 free World Lock block!');}
  parts.length=0;drops.length=0;floats.length=0;wdmg.fill(0);editMode=false;
  ['dl','dr','du','bjump','buse','bpunch'].forEach(id=>{const e=document.getElementById(id);if(e)e._pwb=false;});
  bindBtn(document.getElementById('dl'),'left');bindBtn(document.getElementById('dr'),'right');bindBtn(document.getElementById('du'),'jump');
  bindActionBtn(document.getElementById('bjump'),()=>{inp.jump=true;jumpQ=true;});
  bindActionBtn(document.getElementById('buse'),()=>{inp.use=true;useAction();});
  bindActionBtn(document.getElementById('bpunch'),()=>{inp.punch=true;if(!editMode)punchAction();});
  gc.onclick=e=>worldInteract(e.clientX,e.clientY);
  gc.ontouchstart=e=>{if(e.touches.length===1)worldInteract(e.touches[0].clientX,e.touches[0].clientY);};
  // Player name 3-dot click
  gc.addEventListener('click',e=>{checkPlayerNameClick(e.clientX,e.clientY);});
  selHotbar(0);
  ['gc','hud','topRight','hotbar','ctrl','editToggleBtn'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='';});
  updateGemsHUD();document.getElementById('hudLv').textContent='LV '+P.lv;document.getElementById('hudWorld').textContent=currentWorldName;
  updateHB();preRenderHotbarIcons();updateHeartsHUD();updateEditModeBtn();
  cam.x=0;cam.y=0;updateCam();cam.x=camT.x;cam.y=camT.y;
  gameRunning=true;if(rafId)cancelAnimationFrame(rafId);rafId=requestAnimationFrame(loop);
  showToast('Welcome, '+currentUser+'!');
};

/* ── MAIN LOOP ── */
function loop(){
  if(!gameRunning)return;rafId=requestAnimationFrame(loop);
  cx.clearRect(0,0,CW,CH);drawBG();drawWorld();
  drawReachCircle();
  if(SETT.particles)drawParts();drawDrops();drawBreakInd();drawPlayer();drawFloats();
  stepPlayer();
}

/* ── PLAYER 3-DOT CLICK (name tag) ── */
function checkPlayerNameClick(mx,my){
  if(!P||!gameRunning)return;
  const sx=~~(P.x-cam.x),sy=~~(P.y-cam.y);
  const cx2=sx+PW_/2;const cy2=sy-12;
  if(Math.abs(mx-cx2)<30&&Math.abs(my-cy2)<10){openProfilePanel(currentUser);}
}

/* ── PROFILE PANEL ── */
window.openProfilePanel=function(username){
  const users=getJ(DB_USERS);const key=(username||'').toLowerCase();const u=users[key]||{};
  const worlds=getJ(DB_WORLDS);const myWorlds=Object.values(worlds).filter(w=>w.owner===username);
  const panel=document.getElementById('profilePanel');
  const canvas=document.getElementById('profileCharCanvas');
  if(canvas){canvas.width=80;canvas.height=110;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,80,110);drawPixelChar(ctx,0,0,80,110,1,0,false,0);}
  document.getElementById('profileName').textContent=username;
  document.getElementById('profileGems').textContent=u.gems||P?.gems||0;
  document.getElementById('profileLevel').textContent=P?.lv||1;
  document.getElementById('profileWorlds').textContent=myWorlds.length;
  document.getElementById('profileJoined').textContent=u.created?new Date(u.created).toLocaleDateString():'?';
  // Trade button — only show if viewing another player
  const tradeBtn=document.getElementById('profileTradeBtn');
  if(tradeBtn){tradeBtn.style.display=(username!==currentUser)?'block':'none';tradeBtn.onclick=()=>{closeProfile();openTradePanel(username);};}
  panel.classList.add('open');
};
window.closeProfile=function(){document.getElementById('profilePanel').classList.remove('open');};

/* ── SHOP ── */
const SHOP_ITEMS=[
  {id:'worldlock',name:'World Lock',desc:'Lock your world to protect it from others.',price:2000,icon:'worldlock'},
  {id:'axe',name:'Axe',desc:'Break blocks 2.5x faster.',price:150,icon:'axe'},
  {id:'seed',name:'Seeds x10',desc:'Plant leaves anywhere.',price:50,icon:'seed',qty:10},
];
window.openShop=function(){
  const grid=document.getElementById('shopGrid');grid.innerHTML='';
  SHOP_ITEMS.forEach(item=>{
    const card=document.createElement('div');card.className='shopCard';
    const ic=getItemIcon(item.icon,32);const iconC=document.createElement('canvas');
    iconC.width=iconC.height=32;iconC.style.imageRendering='pixelated';iconC.getContext('2d').drawImage(ic,0,0);
    card.appendChild(iconC);
    const info=document.createElement('div');info.className='shopInfo';
    info.innerHTML='<div class="shopName">'+item.name+'</div><div class="shopDesc">'+item.desc+'</div><div class="shopPrice"><span class="gemDot"></span> '+item.price+' gems</div>';
    card.appendChild(info);
    const btn=document.createElement('button');btn.className='shopBuyBtn';btn.textContent='BUY';
    btn.addEventListener('click',()=>buyItem(item));card.appendChild(btn);
    grid.appendChild(card);
  });
  document.getElementById('shopGems').textContent=P?P.gems:0;
  document.getElementById('shopPanel').classList.add('open');
};
window.closeShop=function(){document.getElementById('shopPanel').classList.remove('open');};
function buyItem(item){
  if(!P)return;
  if(P.gems<item.price){showToast('Not enough gems! Need '+item.price+' gems.');return;}
  P.gems-=item.price;updateGemsHUD();
  const qty=item.qty||1;
  if(!inv[item.id])inv[item.id]={n:item.name,q:0};
  inv[item.id].q+=qty;updateHB();
  document.getElementById('shopGems').textContent=P.gems;
  saveProgress();showToast('Bought '+item.name+'!');
}

/* ── TRADE SYSTEM ── */
window.openTradePanel=function(targetUser){
  document.getElementById('tradeTarget').textContent=targetUser||'?';
  document.getElementById('tradeFromList').innerHTML='';
  document.getElementById('tradeToList').innerHTML='';
  document.getElementById('tradeStatus').textContent='';
  // My trade offer items
  const allKeys=Object.keys(inv).filter(k=>inv[k]&&inv[k].q>0&&k!=='fist'&&k!=='axe');
  allKeys.forEach(k=>{
    const row=document.createElement('div');row.className='tradeRow';
    const ic=getItemIcon(k,22);const iconC=document.createElement('canvas');iconC.width=iconC.height=22;iconC.style.imageRendering='pixelated';iconC.getContext('2d').drawImage(ic,0,0);
    row.appendChild(iconC);
    const lbl=document.createElement('span');lbl.textContent=inv[k].n+' x'+inv[k].q;lbl.style.flex='1';row.appendChild(lbl);
    const inp2=document.createElement('input');inp2.type='number';inp2.min='0';inp2.max=inv[k].q;inp2.value='0';inp2.className='tradeInput';inp2.dataset.key=k;
    row.appendChild(inp2);document.getElementById('tradeFromList').appendChild(row);
  });
  window._tradeTarget=targetUser;
  document.getElementById('tradePanel').classList.add('open');
};
window.closeTrade=function(){document.getElementById('tradePanel').classList.remove('open');};
window.sendTrade=function(){
  const inputs=document.querySelectorAll('#tradeFromList .tradeInput');
  const offer={};let hasOffer=false;
  inputs.forEach(inp2=>{const qty=parseInt(inp2.value)||0;if(qty>0){offer[inp2.dataset.key]=qty;hasOffer=true;}});
  if(!hasOffer){showToast('Select items to offer!');return;}
  // Save trade offer to storage
  const trades=getJ(DB_TRADES,[]);
  const tradeId='t_'+Date.now();
  trades.push({id:tradeId,from:currentUser,to:window._tradeTarget,offer,status:'pending',ts:Date.now()});
  setJ(DB_TRADES,trades.slice(-100));
  // Check for pending trades from target to us (auto-match)
  const myIncoming=trades.filter(t=>t.to===currentUser&&t.from===window._tradeTarget&&t.status==='pending');
  if(myIncoming.length>0){completeTrade(myIncoming[0],offer);}
  else{document.getElementById('tradeStatus').textContent='Trade offer sent to '+window._tradeTarget+'!';showToast('Trade offer sent!');}
};
function completeTrade(incomingTrade,myOffer){
  // Give items
  Object.entries(incomingTrade.offer).forEach(([k,q])=>{if(!inv[k])inv[k]={n:k,q:0};inv[k].q+=q;});
  // Remove offered items
  Object.entries(myOffer).forEach(([k,q])=>{if(inv[k])inv[k].q=Math.max(0,inv[k].q-q);});
  updateHB();saveProgress();
  const trades=getJ(DB_TRADES,[]);
  const idx=trades.findIndex(t=>t.id===incomingTrade.id);
  if(idx>=0){trades[idx].status='completed';setJ(DB_TRADES,trades);}
  showToast('Trade completed with '+incomingTrade.from+'!');
  document.getElementById('tradeStatus').textContent='Trade complete!';
}
window.checkIncomingTrades=function(){
  const trades=getJ(DB_TRADES,[]);
  const pending=trades.filter(t=>t.to===currentUser&&t.status==='pending');
  if(pending.length>0){
    const t=pending[0];
    const itemList=Object.entries(t.offer).map(([k,q])=>q+'x '+k).join(', ');
    showToast(t.from+' offers: '+itemList,5000);
  }
};

/* ── WORLD LOCK MENU ── */
window.closeWorldLockMenu=function(){document.getElementById('worldLockMenu').classList.remove('open');};
window.wlmProtect=function(){
  if(currentWorldOwner!==currentUser){showToast('Not the owner!');return;}
  const db=getJ(DB_WORLDS);if(db[currentWorldId]){db[currentWorldId].locked=!db[currentWorldId].locked;setJ(DB_WORLDS,db);}
  currentWorldLocked=!currentWorldLocked;
  showToast(currentWorldLocked?'World protected!':'World protection removed.');
  closeWorldLockMenu();
};
window.wlmGrant=function(){
  const name=prompt('Grant access to username:');if(!name)return;
  const db=getJ(DB_WORLDS);if(db[currentWorldId]){if(!db[currentWorldId].access)db[currentWorldId].access=[];db[currentWorldId].access.push(name.toLowerCase());setJ(DB_WORLDS,db);}
  showToast('Access granted to '+name+'!');closeWorldLockMenu();
};
window.wlmTrade=function(){closeWorldLockMenu();const target=prompt('Trade world lock to username:');if(!target)return;openTradePanel(target);};

/* ── INVENTORY ── */
window.openInv=function(){
  const g=document.getElementById('invGrid');g.innerHTML='';
  const allKeys=['fist','axe','dirt','grass','stone','plank','seed','ore','leaf','worldlock'];
  allKeys.forEach((k)=>{
    const v=inv[k];const hi=HOTBAR_KEYS.indexOf(k);
    const d=document.createElement('div');d.className='iSlot'+(hi===selSlot?' active':'');
    const sz=Math.max(20,Math.min(30,~~(((document.getElementById('invGrid').offsetWidth||300)-16)/9-4)));
    const ic=getItemIcon(k,sz);const img=document.createElement('canvas');img.width=img.height=sz;img.style.cssText='display:block;image-rendering:pixelated;';img.getContext('2d').drawImage(ic,0,0);d.appendChild(img);
    if(v&&v.q>0){const q=document.createElement('div');q.className='iq';q.textContent=v.q;d.appendChild(q);}
    if(hi>=0)d.addEventListener('click',()=>{selHotbar(hi);preRenderHotbarIcons();document.querySelectorAll('.iSlot').forEach((s,i)=>s.classList.toggle('active',HOTBAR_KEYS.indexOf(allKeys[i])===selSlot));});
    g.appendChild(d);
  });
  const pc=document.getElementById('invPlayerCanvas');if(pc){pc.width=60;pc.height=80;const pctx=pc.getContext('2d');pctx.clearRect(0,0,60,80);drawPixelChar(pctx,0,0,60,80,1,0,false,0);}
  const st=document.getElementById('invStats');if(st)st.innerHTML='<span>Name</span> '+esc(currentUser||'?')+'<br><span>Level</span> '+P.lv+' &nbsp;<span>XP</span> '+P.xp+'/'+P.lv*20+'<br><span>Gems</span> '+P.gems+'&nbsp;<span>HP</span> '+P.hp+'/100';
  document.getElementById('invPanel').classList.add('open');
};
window.closeInv=function(){document.getElementById('invPanel').classList.remove('open');};
window.openSett=function(){syncSettUI();document.getElementById('settPanel').classList.add('open');};
window.closeSett=function(){document.getElementById('settPanel').classList.remove('open');};
window.confirmReset=function(){if(!confirm('Reset world? All progress lost!'))return;const db=getJ(DB_WORLDS);if(db[currentWorldId]){delete db[currentWorldId].save;setJ(DB_WORLDS,db);}genWorld((db[currentWorldId]&&db[currentWorldId].type)||'normal');resetInv();updateHB();P.x=10*TILE_SZ;P.y=(GROUND-3)*TILE_SZ;P.vx=0;P.vy=0;P.hp=100;P.gems=0;P.lv=1;P.xp=0;currentWorldLocked=false;currentWorldOwner='';closeSett();showToast('World reset!');};

/* ── CHAT ── */
window.openChat=function(){chatOpen=true;loadChatUI();document.getElementById('chatPanel').classList.add('open');setTimeout(()=>document.getElementById('chatInput').focus(),120);};
window.closeChat=function(){chatOpen=false;document.getElementById('chatPanel').classList.remove('open');};
function loadChatUI(){
  const log=getJ(DB_CHAT+'_'+(currentWorldId||'def'),[]);
  const el=document.getElementById('chatLog');el.innerHTML='';
  if(!log.length)el.innerHTML='<div class="cMsg sys"><span class="ct">No messages yet!</span></div>';
  else log.forEach(m=>appendCMsg(m,false));
  el.scrollTop=el.scrollHeight;
  document.getElementById('chatOnline').textContent='World: '+currentWorldName;
}
function appendCMsg(m,scroll){
  const el=document.getElementById('chatLog');const d=document.createElement('div');d.className='cMsg'+(m.sys?' sys':'');
  if(m.sys)d.innerHTML='<span class="ct">'+esc(m.text)+'</span>';
  else d.innerHTML='<span class="cn">'+esc(m.user)+'</span> <span class="cts">'+m.time+'</span><br><span class="ct">'+esc(m.text)+'</span>';
  el.appendChild(d);if(scroll!==false)el.scrollTop=el.scrollHeight;
}
window.sendChat=function(){
  const inp2=document.getElementById('chatInput');const text=inp2.value.trim();if(!text)return;inp2.value='';
  const now=new Date();const time=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
  const msg={user:currentUser,text,time,ts:Date.now()};
  const wid=currentWorldId||'def';const log=getJ(DB_CHAT+'_'+wid,[]);log.push(msg);setJ(DB_CHAT+'_'+wid,log.slice(-200));
  appendCMsg(msg);showChatBubble(currentUser+': '+text);
};
document.getElementById('chatSend').addEventListener('click',sendChat);
document.getElementById('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'){sendChat();e.preventDefault();}});
let _cbTm;
function showChatBubble(text){const el=document.getElementById('chatBubble');el.textContent=text.length>55?text.slice(0,52)+'...':text;el.classList.add('show');clearTimeout(_cbTm);_cbTm=setTimeout(()=>el.classList.remove('show'),3500);}

/* ── WORLDS / LOGOUT ── */
window.openWorldsMenu=function(){saveProgress();gameRunning=false;if(rafId){cancelAnimationFrame(rafId);rafId=null;}['gc','hud','topRight','hotbar','ctrl','editToggleBtn'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none';});document.getElementById('chatBubble').classList.remove('show');renderWorlds();document.getElementById('worldScreen').classList.add('open');};
window.doLogout=function(){saveProgress();gameRunning=false;if(rafId){cancelAnimationFrame(rafId);rafId=null;}['gc','hud','topRight','hotbar','ctrl','editToggleBtn'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none';});document.querySelectorAll('.panel').forEach(p=>p.classList.remove('open'));document.getElementById('worldScreen').classList.remove('open');document.getElementById('chatBubble').classList.remove('show');currentUser=null;currentWorldId=null;document.getElementById('authScreen').style.display='flex';document.getElementById('aUser').value='';document.getElementById('aPass').value='';};

/* ── HELPERS ── */
function timeSince(ts){if(!ts)return'never';const s=~~((Date.now()-ts)/1000);if(s<60)return s+'s ago';if(s<3600)return~~(s/60)+'m ago';if(s<86400)return~~(s/3600)+'h ago';return~~(s/86400)+'d ago';}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

/* ── INIT ── */
window.addEventListener('load',()=>{
  const ab=document.getElementById('authBg');
  for(let i=0;i<70;i++){const s=document.createElement('div');const sz=~~(1+Math.random()*2.5);const col=Math.random()>.72?'#ffe8a0':Math.random()>.5?'#c0d0ff':'#e0e8ff';s.className='astar';s.style.cssText='width:'+sz+'px;height:'+sz+'px;left:'+Math.random()*100+'%;top:'+Math.random()*100+'%;background:'+col+';animation-duration:'+(1.2+Math.random()*2.4)+'s;animation-delay:'+(Math.random()*2.8)+'s';ab.appendChild(s);}
  initCanvas();
  let _rsT;window.addEventListener('resize',()=>{clearTimeout(_rsT);_rsT=setTimeout(resizeGame,120);});
  window.addEventListener('orientationchange',()=>setTimeout(resizeGame,400));
  let p=0;const ls=document.getElementById('loadingScreen');
  const iv=setInterval(()=>{p+=Math.random()*16+8;if(p>=100){p=100;clearInterval(iv);document.getElementById('loadFill').style.width='100%';setTimeout(()=>{ls.style.display='none';document.getElementById('authScreen').style.display='flex';},200);}document.getElementById('loadFill').style.width=p+'%';},45);
  // Check incoming trades every 15s
  setInterval(()=>{if(gameRunning&&currentUser)checkIncomingTrades();},15000);
});
