/* PixelWorld — World Generation */
'use strict';

window.WW = 120;
window.WH = 52;
window.GROUND = 22;

window.world = null;
window.wdmg = null;

window.wt = function(c, r) {
  return (c >= 0 && c < WW && r >= 0 && r < WH) ? world[r * WW + c] : T.BEDROCK;
};
window.wset = function(c, r, v) {
  if (c >= 0 && c < WW && r >= 0 && r < WH) {
    world[r * WW + c] = v;
    clearTileCache();
  }
};
window.isSolid = function(c, r) {
  const t = wt(c, r);
  return t !== T.AIR && t !== T.CLOUD && t !== T.LEAF;
};

window.genWorld = function(type) {
  world = new Uint8Array(WW * WH);
  wdmg = new Float32Array(WW * WH);

  // Sky
  for (let r = 0; r < GROUND; r++)
    for (let c = 0; c < WW; c++) world[r * WW + c] = T.AIR;

  // Terrain
  for (let c = 0; c < WW; c++) {
    const hv = type === 'flat' ? 0 : Math.round(Math.sin(c * .17) * 1.5 + Math.sin(c * .07) * .8);
    const gh = Math.min(GROUND + hv, WH - 2);
    world[gh * WW + c] = T.GRASS;
    for (let r = gh + 1; r < Math.min(gh + 5, WH - 1); r++) world[r * WW + c] = T.DIRT;
    for (let r = gh + 5; r < WH - 1; r++) world[r * WW + c] = T.STONE;
    world[(WH - 1) * WW + c] = T.BEDROCK;
  }

  // Ores
  const oreN = type === 'cave' ? 200 : 130;
  for (let i = 0; i < oreN; i++) {
    const oc = 1 + Math.floor(Math.random() * (WW - 2));
    const or = GROUND + 8 + Math.floor(Math.random() * (WH - GROUND - 11));
    if (or < WH - 1 && wt(oc, or) === T.STONE) {
      world[or * WW + oc] = T.ORE;
      if (Math.random() > .55 && wt(oc + 1, or) === T.STONE) world[or * WW + oc + 1] = T.ORE;
      if (Math.random() > .55 && wt(oc, or + 1) === T.STONE) world[(or + 1) * WW + oc] = T.ORE;
    }
  }

  // Caves
  const caveN = type === 'cave' ? 100 : 55;
  for (let i = 0; i < caveN; i++) {
    const cc = 3 + Math.floor(Math.random() * (WW - 6));
    const rc = GROUND + 5 + Math.floor(Math.random() * (WH - GROUND - 8));
    const rad = type === 'cave' ? 3 + Math.floor(Math.random() * 4) : 2 + Math.floor(Math.random() * 3);
    for (let dr = -rad; dr <= rad; dr++)
      for (let dc = -rad * 2; dc <= rad * 2; dc++) {
        if (dr * dr / (rad * rad) + dc * dc / (rad * rad * 4) < 1) {
          const t = wt(cc + dc, rc + dr);
          if (t === T.STONE || t === T.DIRT)
            world[(rc + dr) * WW + (cc + dc)] = T.CAVE_STONE;
        }
      }
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -2; dc <= 2; dc++)
        if (rc + dr > 0 && cc + dc > 0 && rc + dr < WH && cc + dc < WW)
          world[(rc + dr) * WW + (cc + dc)] = T.AIR;
  }

  // Trees
  if (type !== 'flat') {
    for (let i = 0; i < 20; i++) {
      const tc = 4 + Math.floor(Math.random() * (WW - 8));
      const hv = Math.round(Math.sin(tc * .17) * 1.5 + Math.sin(tc * .07) * .8);
      const gh = GROUND + hv;
      const h = 4 + Math.floor(Math.random() * 3);
      for (let r = gh - h; r < gh; r++) if (wt(tc, r) === T.AIR) world[r * WW + tc] = T.TRUNK;
      for (let lr = gh - h - 1; lr >= gh - h - 3; lr--)
        for (let lc = tc - 2; lc <= tc + 2; lc++)
          if (lc > 0 && lc < WW - 1 && wt(lc, lr) === T.AIR) world[lr * WW + lc] = T.LEAF;
      if (gh - h - 3 >= 0 && wt(tc, gh - h - 3) === T.AIR) world[(gh - h - 3) * WW + tc] = T.LEAF;
    }
  }

  // Clouds
  for (let i = 0; i < 14; i++) {
    const cr = 3 + Math.floor(Math.random() * 7);
    const cc = Math.floor(Math.random() * (WW - 8));
    const cw = 3 + Math.floor(Math.random() * 5);
    for (let dc = 0; dc < cw; dc++) if (cc + dc < WW) world[cr * WW + (cc + dc)] = T.CLOUD;
    if (cr - 1 >= 0) for (let dc = 1; dc < cw - 1; dc++) if (cc + dc < WW) world[(cr - 1) * WW + (cc + dc)] = T.CLOUD;
  }
};
