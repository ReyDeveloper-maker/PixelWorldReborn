/* PixelWorld v9 — Tile & Icon Renderer */
'use strict';
window.T={AIR:0,DIRT:1,GRASS:2,STONE:3,TRUNK:4,LEAF:5,CLOUD:6,BEDROCK:7,ORE:8,PLANK:9,CAVE_STONE:10,WORLDLOCK:11};
const _tc={};
window.clearTileCache=()=>{for(const k in _tc)delete _tc[k];};
window.getTile=function(type,sz){const k=type+'_'+sz;if(_tc[k])return _tc[k];const c=document.createElement('canvas');c.width=c.height=sz;drawTileCtx(c.getContext('2d'),0,0,type,sz);_tc[k]=c;return c;};
window.getItemIcon=function(key,sz){sz=sz||24;const k='icon_'+key+'_'+sz;if(_tc[k])return _tc[k];const c=document.createElement('canvas');c.width=c.height=sz;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;drawItemIcon(ctx,0,0,key,sz);_tc[k]=c;return c;};

function drawItemIcon(ctx,x,y,key,s){
  const T_=window.T;
  const tileMap={dirt:T_.DIRT,grass:T_.GRASS,stone:T_.STONE,plank:T_.PLANK,seed:T_.LEAF,ore:T_.ORE,leaf:T_.LEAF,worldlock:T_.WORLDLOCK};
  if(tileMap[key]!==undefined){drawTileCtx(ctx,x,y,tileMap[key],s);return;}
  if(key==='fist')drawFistIcon(ctx,x,y,s);
  else if(key==='axe')drawAxeIcon(ctx,x,y,s);
  else if(key==='gem')drawGemIcon(ctx,x,y,s);
  else{ctx.fillStyle='#334';ctx.fillRect(x,y,s,s);}
}

function ip(n,s,b){return Math.round(n*s/b);}

function drawFistIcon(ctx,x,y,s){
  const b=24;
  ctx.fillStyle='#c8854a';ctx.fillRect(x+ip(4,s,b),y+ip(6,s,b),ip(16,s,b),ip(12,s,b));
  ctx.fillRect(x+ip(4,s,b),y+ip(14,s,b),ip(4,s,b),ip(4,s,b));
  ctx.fillRect(x+ip(10,s,b),y+ip(14,s,b),ip(4,s,b),ip(4,s,b));
  ctx.fillRect(x+ip(16,s,b),y+ip(14,s,b),ip(4,s,b),ip(4,s,b));
  ctx.fillStyle='#a06030';ctx.fillRect(x+ip(4,s,b),y+ip(6,s,b),ip(16,s,b),ip(3,s,b));
  ctx.fillRect(x+ip(2,s,b),y+ip(10,s,b),ip(4,s,b),ip(8,s,b));
  ctx.fillStyle='#e09a60';ctx.fillRect(x+ip(5,s,b),y+ip(7,s,b),ip(3,s,b),ip(3,s,b));
}
function drawAxeIcon(ctx,x,y,s){
  const b=24;
  ctx.fillStyle='#7a4818';ctx.fillRect(x+ip(14,s,b),y+ip(4,s,b),ip(4,s,b),ip(16,s,b));
  ctx.fillStyle='#9a5820';ctx.fillRect(x+ip(15,s,b),y+ip(4,s,b),ip(2,s,b),ip(16,s,b));
  ctx.fillStyle='#9a9a9a';ctx.fillRect(x+ip(4,s,b),y+ip(4,s,b),ip(12,s,b),ip(10,s,b));
  ctx.fillStyle='#c8c8c8';ctx.fillRect(x+ip(5,s,b),y+ip(5,s,b),ip(8,s,b),ip(6,s,b));
  ctx.fillStyle='#e8e8e8';ctx.fillRect(x+ip(6,s,b),y+ip(5,s,b),ip(4,s,b),ip(3,s,b));
  ctx.fillStyle='#707070';ctx.fillRect(x+ip(4,s,b),y+ip(4,s,b),ip(2,s,b),ip(10,s,b));
}
function drawGemIcon(ctx,x,y,s){
  const b=24;
  ctx.fillStyle='#00b090';ctx.fillRect(x+ip(6,s,b),y+ip(8,s,b),ip(12,s,b),ip(12,s,b));
  ctx.fillStyle='#30d8b0';ctx.fillRect(x+ip(7,s,b),y+ip(6,s,b),ip(10,s,b),ip(10,s,b));
  ctx.fillStyle='#80ffe8';ctx.fillRect(x+ip(9,s,b),y+ip(8,s,b),ip(4,s,b),ip(4,s,b));
  ctx.fillStyle='#006850';ctx.fillRect(x+ip(6,s,b),y+ip(4,s,b),ip(12,s,b),ip(4,s,b));
}

window.drawTileCtx=drawTileCtx;
function drawTileCtx(c,x,y,type,S){
  c.imageSmoothingEnabled=false;const s=S;const T_=window.T;const px=s/8;
  switch(type){
  case T_.DIRT:{
    c.fillStyle='#7a5230';c.fillRect(x,y,s,s);
    c.fillStyle='#5a3a1e';c.fillRect(x+px,y+px,px*2,px*2);c.fillRect(x+px*5,y+px*4,px*2,px*2);
    c.fillStyle='#9a6848';c.fillRect(x+px*3,y+px,px*2,px*2);c.fillRect(x+px*6,y+px*5,px,px);
    c.fillStyle='#b08060';c.fillRect(x+px*4,y+px,px,px);c.fillRect(x+px*2,y+px*5,px,px);
    c.fillStyle='rgba(0,0,0,.2)';c.fillRect(x,y+s-px,s,px);
    c.fillStyle='rgba(255,255,255,.08)';c.fillRect(x,y,s,px);
    c.strokeStyle='#3a200a';c.lineWidth=1;c.strokeRect(x+.5,y+.5,s-1,s-1);break;
  }
  case T_.GRASS:{
    c.fillStyle='#7a5230';c.fillRect(x,y,s,s);
    c.fillStyle='#3d7028';c.fillRect(x,y,s,~~(s*.38));
    c.fillStyle='#4e8e34';c.fillRect(x,y,s,~~(s*.24));
    c.fillStyle='#5ea840';
    const bl=s/6;for(let g=0;g<6;g++){c.fillRect(x+g*bl,y,~~(bl*.55),~~(bl*(0.55+0.45*(g%2))));}
    c.fillStyle='#2e5818';c.fillRect(x,y+~~(s*.38),s,~~(s*.07));
    c.strokeStyle='#1e4010';c.lineWidth=1;c.strokeRect(x+.5,y+.5,s-1,s-1);break;
  }
  case T_.STONE:{
    c.fillStyle='#6a6a6a';c.fillRect(x,y,s,s);
    c.fillStyle='#7a7a7a';c.fillRect(x+px,y+px,px*3,px*3);c.fillRect(x+px*4.5,y+px*4,px*2,px*2);
    c.fillStyle='#909090';c.fillRect(x+px*1.5,y+px*1.5,px*1.5,px*1.5);
    c.fillStyle='#545454';c.fillRect(x+px*4,y+px,px*3,px*1.5);c.fillRect(x+px,y+px*4.5,px*2.5,px*1.5);
    c.fillStyle='rgba(255,255,255,.06)';c.fillRect(x,y,s,px);
    c.strokeStyle='#3e3e3e';c.lineWidth=1;c.strokeRect(x+.5,y+.5,s-1,s-1);break;
  }
  case T_.CAVE_STONE:{
    c.fillStyle='#3c3c3c';c.fillRect(x,y,s,s);
    c.fillStyle='#4a4a4a';c.fillRect(x+px,y+px,px*3,px*3);c.fillRect(x+px*5,y+px*4,px*2,px*2);
    c.fillStyle='#2c2c2c';c.fillRect(x+px*4,y+px,px*3,px*1.5);
    c.strokeStyle='#242424';c.lineWidth=1;c.strokeRect(x+.5,y+.5,s-1,s-1);break;
  }
  case T_.ORE:{
    c.fillStyle='#3c3c3c';c.fillRect(x,y,s,s);
    c.fillStyle='#2c2c2c';c.fillRect(x+px,y+px,px*2.5,px*2.5);
    c.fillStyle='#00c0a0';c.fillRect(x+px*2,y+px*2,px*2.5,px*2.5);c.fillRect(x+px*5,y+px*3.5,px*2,px*2);
    c.fillStyle='#40e8c0';c.fillRect(x+px*2.5,y+px*2.5,px*1.5,px*1.5);c.fillRect(x+px*5.5,y+px*4,px,px);
    c.fillStyle='#90fff0';c.fillRect(x+px*3,y+px*3,px*.8,px*.8);
    c.fillStyle='rgba(0,220,180,.1)';c.fillRect(x,y,s,s);
    c.strokeStyle='#007860';c.lineWidth=1;c.strokeRect(x+.5,y+.5,s-1,s-1);break;
  }
  case T_.TRUNK:{
    c.fillStyle='#261004';c.fillRect(x,y,s,s);
    c.fillStyle='#442208';c.fillRect(x+~~(s*.22),y,~~(s*.55),s);
    c.fillStyle='#603410';c.fillRect(x+~~(s*.28),y+~~(s*.06),~~(s*.28),s-~~(s*.1));
    c.fillStyle='rgba(0,0,0,.18)';for(let i=1;i<4;i++)c.fillRect(x+~~(s*.22),y+~~(s*.25*i),~~(s*.55),1);
    c.strokeStyle='#160804';c.lineWidth=1;c.strokeRect(x+~~(s*.22),y,~~(s*.55),s);break;
  }
  case T_.LEAF:{
    c.fillStyle='#163e14';c.fillRect(x,y,s,s);
    c.fillStyle='#1e601e';c.fillRect(x+px,y+px,px*3,px*3);c.fillRect(x+px*4.5,y+px*3.5,px*2.5,px*2.5);
    c.fillStyle='#287a28';c.fillRect(x+px*1.5,y+px*1.5,px*2,px*2);c.fillRect(x+px*5,y+px*4,px*1.5,px*1.5);
    c.fillStyle='#34901e';c.fillRect(x+px*2,y+px*2,px,px);
    c.fillStyle='rgba(0,0,0,.14)';c.fillRect(x,y+s-px,s,px);
    c.strokeStyle='#0e2a0c';c.lineWidth=1;c.strokeRect(x+.5,y+.5,s-1,s-1);break;
  }
  case T_.CLOUD:{
    c.fillStyle='rgba(220,238,255,.85)';c.fillRect(x,y+~~(s*.22),s,s-~~(s*.22));
    c.fillStyle='rgba(240,250,255,.7)';c.fillRect(x+~~(s*.06),y+~~(s*.06),s-~~(s*.12),~~(s*.38));
    c.fillStyle='rgba(200,222,255,.5)';c.fillRect(x+~~(s*.15),y,s-~~(s*.3),~~(s*.2));break;
  }
  case T_.BEDROCK:{
    c.fillStyle='#080808';c.fillRect(x,y,s,s);
    c.fillStyle='#161616';c.fillRect(x+px,y+px,px*2.5,px*2.5);c.fillRect(x+px*4.5,y+px*4,px*2.5,px*2);
    c.fillStyle='#040404';c.fillRect(x+px*4,y+px,px*3,px*1.5);
    c.strokeStyle='#000';c.lineWidth=1;c.strokeRect(x+.5,y+.5,s-1,s-1);break;
  }
  case T_.PLANK:{
    c.fillStyle='#8a5818';c.fillRect(x,y,s,s);
    c.fillStyle='#6a4010';for(let i=0;i<3;i++)c.fillRect(x,y+~~(i*s/3),s,2);
    c.fillStyle='rgba(160,100,40,.1)';c.fillRect(x,y,s,~~(s*.12));
    c.strokeStyle='#3a1a04';c.lineWidth=1;c.strokeRect(x+.5,y+.5,s-1,s-1);break;
  }
  case T_.WORLDLOCK:{
    // World lock block — gold/purple premium look
    c.fillStyle='#2a1850';c.fillRect(x,y,s,s);
    // Border glow
    c.fillStyle='#6040c0';c.fillRect(x,y,s,px*.5);c.fillRect(x,y+s-px*.5,s,px*.5);
    c.fillRect(x,y,px*.5,s);c.fillRect(x+s-px*.5,y,px*.5,s);
    // Lock body
    c.fillStyle='#c8a020';c.fillRect(x+~~(s*.3),y+~~(s*.45),~~(s*.4),~~(s*.38));
    // Lock shackle
    c.fillStyle='#e8c040';
    c.fillRect(x+~~(s*.36),y+~~(s*.25),~~(s*.1),~~(s*.25));
    c.fillRect(x+~~(s*.54),y+~~(s*.25),~~(s*.1),~~(s*.25));
    c.fillRect(x+~~(s*.36),y+~~(s*.22),~~(s*.28),~~(s*.08));
    // Keyhole
    c.fillStyle='#1a0e30';c.beginPath();c.arc(x+~~(s*.5),y+~~(s*.58),~~(s*.08),0,Math.PI*2);c.fill();
    c.fillRect(x+~~(s*.47),y+~~(s*.58),~~(s*.06),~~(s*.14));
    // Sparkles
    c.fillStyle='rgba(255,220,80,.6)';
    c.fillRect(x+ip(2,s,16),y+ip(2,s,16),ip(1,s,16),ip(1,s,16));
    c.fillRect(x+ip(13,s,16),y+ip(3,s,16),ip(1,s,16),ip(1,s,16));
    c.fillRect(x+ip(2,s,16),y+ip(12,s,16),ip(1,s,16),ip(1,s,16));
    c.strokeStyle='#7050d8';c.lineWidth=1;c.strokeRect(x+.5,y+.5,s-1,s-1);break;
  }
  default:break;
  }
}

window.drawPixelChar=function(ctx,x,y,w,h,facing,walkFrame,punching,ptick){
  const u=h/28;ctx.save();ctx.translate(x+w/2,y+h/2);if(facing===-1)ctx.scale(-1,1);
  const lean=walkFrame>0?Math.sin(walkFrame*Math.PI/4)*.04:0;ctx.rotate(lean);
  const ox=-w/2,oy=-h/2;
  // LEGS
  const sw=walkFrame>0?Math.sin(walkFrame*Math.PI/4)*2*u:0;
  ctx.fillStyle='#2a48a0';ctx.fillRect(ox+2*u,oy+19*u,5*u,8*u+sw);
  ctx.fillStyle='#2038a0';ctx.fillRect(ox+8*u,oy+19*u,5*u,8*u-sw);
  // Shoes
  ctx.fillStyle='#4a2810';ctx.fillRect(ox+1*u,oy+25*u,6*u,3*u);ctx.fillRect(ox+8*u,oy+25*u,6*u,3*u);
  // BODY
  ctx.fillStyle='#4e7a4e';ctx.fillRect(ox+1*u,oy+11*u,13*u,9*u);
  ctx.fillStyle='#366036';ctx.fillRect(ox+1*u,oy+18*u,13*u,2*u);ctx.fillRect(ox+1*u,oy+11*u,2*u,9*u);
  ctx.fillStyle='#60944e';ctx.fillRect(ox+3*u,oy+12*u,4*u,2*u);
  ctx.fillStyle='#301808';ctx.fillRect(ox+1*u,oy+19*u,13*u,u*1.5);
  ctx.fillStyle='#FFD700';ctx.fillRect(ox+6*u,oy+19*u,3*u,u*1.5);
  // ARMS
  const pOff=punching?Math.sin(ptick*.3)*2.8*u:0;
  ctx.fillStyle='#4e7a4e';ctx.fillRect(ox+(13+pOff/u)*u,oy+11*u,4*u,7*u);
  ctx.fillStyle='#c07840';ctx.fillRect(ox+(13+pOff/u)*u,oy+17*u,4*u,3*u);
  ctx.fillStyle='#3e6a3e';ctx.fillRect(ox-2*u,oy+11*u,4*u,7*u);
  ctx.fillStyle='#a86830';ctx.fillRect(ox-2*u,oy+17*u,4*u,3*u);
  // HEAD shadow
  ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(ox+1*u,oy+11*u,13*u,u);
  // HEAD skin
  ctx.fillStyle='#c07840';ctx.fillRect(ox+2*u,oy+2*u,11*u,10*u);
  ctx.fillStyle='#985828';ctx.fillRect(ox+2*u,oy+10*u,11*u,2*u);ctx.fillRect(ox+2*u,oy+2*u,2*u,10*u);
  ctx.fillStyle='#d88a50';ctx.fillRect(ox+4*u,oy+3*u,3*u,2*u);
  // Eyes
  ctx.fillStyle='#181818';ctx.fillRect(ox+4*u,oy+5*u,2*u,2*u);ctx.fillRect(ox+9*u,oy+5*u,2*u,2*u);
  ctx.fillStyle='#fff';ctx.fillRect(ox+5*u,oy+5*u,u,u);
  // Mouth
  ctx.fillStyle='#7a3408';ctx.fillRect(ox+5*u,oy+8*u,5*u,u);
  // Hair
  ctx.fillStyle='#301808';ctx.fillRect(ox+2*u,oy+0,11*u,4*u);ctx.fillRect(ox+0,oy+2*u,3*u,5*u);ctx.fillRect(ox+12*u,oy+2*u,3*u,5*u);
  ctx.fillStyle='#5a3010';ctx.fillRect(ox+4*u,oy+u,7*u,2*u);
  ctx.restore();
};
