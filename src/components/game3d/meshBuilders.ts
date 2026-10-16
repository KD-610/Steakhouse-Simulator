import * as THREE from 'three';
import { DishId } from '../../types/game';
import { MENU_ITEMS } from '../../data/gameConstants';

// Shared materials for performance optimization
export const materialsCache = {
  darkWood: new THREE.MeshStandardMaterial({ color: 0x5d3a22, roughness: 0.45, metalness: 0.1 }),
  luxuryWood: new THREE.MeshStandardMaterial({ color: 0x3d2417, roughness: 0.32, metalness: 0.15 }),
  whiteMarble: new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.18, metalness: 0.12 }),
  goldMetal: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.22, metalness: 0.85 }),
  darkSteel: new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.3, metalness: 0.75 }),
  blackLeather: new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.45 }),
  burgundyLeather: new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.38 }),
  ceramicWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.12 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.35, roughness: 0.1, transmission: 0.9 }),
  emberGlow: new THREE.MeshBasicMaterial({ color: 0xff4500 }),
  leavesGreen: new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.45 })
};

export function createFurnitureMesh(catalogId: string): THREE.Group {
  const group = new THREE.Group();
  group.userData = { catalogId };

  if (catalogId === 'table_wood') {
    // Top
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 1.4), materialsCache.darkWood);
    top.position.y = 0.82;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // 4 Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.82, 8);
    [[-0.95, -0.55], [0.95, -0.55], [-0.95, 0.55], [0.95, 0.55]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, materialsCache.darkSteel);
      leg.position.set(lx, 0.41, lz);
      leg.castShadow = true;
      group.add(leg);
    });

    // Placemats & Glasses
    [-0.55, 0.55].forEach(px => {
      const placemat = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }));
      placemat.rotation.x = -Math.PI / 2;
      placemat.position.set(px, 0.871, 0);
      group.add(placemat);

      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.12, 8), materialsCache.glass);
      glass.position.set(px + 0.15, 0.93, -0.2);
      group.add(glass);
    });

    // 2 Chairs
    [-1.25, 1.25].forEach(cx => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.55), materialsCache.blackLeather);
      seat.position.set(cx, 0.45, 0);
      seat.castShadow = true;
      group.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 0.55), materialsCache.darkWood);
      back.position.set(cx + (cx < 0 ? -0.25 : 0.25), 0.71, 0);
      back.castShadow = true;
      group.add(back);

      // Chair legs
      const chairLegGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 6);
      [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].forEach(([clx, clz]) => {
        const cl = new THREE.Mesh(chairLegGeo, materialsCache.darkSteel);
        cl.position.set(cx + clx, 0.225, clz);
        group.add(cl);
      });
    });

  } else if (catalogId === 'table_luxury') {
    // Luxury dark mahogany tabletop with gold trim
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.5), materialsCache.luxuryWood);
    top.position.y = 0.84;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    const rim = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.04, 1.54), materialsCache.goldMetal);
    rim.position.y = 0.84;
    group.add(rim);

    // Pedestal base
    const basePillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.8, 12), materialsCache.goldMetal);
    basePillar.position.set(0, 0.4, 0);
    group.add(basePillar);

    const basePlate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.9), materialsCache.darkSteel);
    basePlate.position.set(0, 0.025, 0);
    group.add(basePlate);

    // Burgundy Leather curved booths
    [-1.35, 1.35].forEach(bx => {
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 0.85), materialsCache.burgundyLeather);
      seat.position.set(bx, 0.45, 0);
      seat.castShadow = true;
      group.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.65, 0.85), materialsCache.burgundyLeather);
      back.position.set(bx + (bx < 0 ? -0.28 : 0.28), 0.75, 0);
      back.castShadow = true;
      group.add(back);
    });

  } else if (catalogId === 'table_vip') {
    // Marble table
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.09, 24), materialsCache.whiteMarble);
    top.position.y = 0.85;
    top.castShadow = true;
    group.add(top);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.13, 1.13, 0.03, 24), materialsCache.goldMetal);
    rim.position.y = 0.85;
    group.add(rim);

    // Gold pedestal
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 0.82, 16), materialsCache.goldMetal);
    pedestal.position.y = 0.41;
    group.add(pedestal);

    // Candelabra center
    const candleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.3, 8), materialsCache.goldMetal);
    candleBase.position.set(0, 1.0, 0);
    group.add(candleBase);

    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
    flame.position.set(0, 1.18, 0);
    group.add(flame);

    const candleLight = new THREE.PointLight(0xffa500, 0.8, 3.5);
    candleLight.position.set(0, 1.25, 0);
    group.add(candleLight);

    // VIP chairs (gold & black velvet)
    [-1.25, 1.25].forEach(cx => {
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16), materialsCache.blackLeather);
      seat.position.set(cx, 0.45, 0);
      seat.castShadow = true;
      group.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.45), materialsCache.goldMetal);
      back.position.set(cx + (cx < 0 ? -0.22 : 0.22), 0.72, 0);
      back.castShadow = true;
      group.add(back);
    });

  } else if (catalogId === 'grill_basic') {
    // Single BBQ grill
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 1.1), materialsCache.darkSteel);
    body.position.y = 0.425;
    body.castShadow = true;
    group.add(body);

    // Grill grate
    const grate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.04, 0.9), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 }));
    grate.position.y = 0.87;
    group.add(grate);

    // Glowing hot charcoal bed
    const coals = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.85), materialsCache.emberGlow);
    coals.rotation.x = -Math.PI / 2;
    coals.position.y = 0.88;
    group.add(coals);

    // Hood / Chimney
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.8, 10), materialsCache.darkSteel);
    chimney.position.set(0, 1.2, -0.35);
    group.add(chimney);

    // Warm grill light
    const gLight = new THREE.PointLight(0xff4500, 1.2, 4);
    gLight.position.set(0, 1.1, 0);
    group.add(gLight);

  } else if (catalogId === 'grill_double') {
    // Commercial Double Charbroiler
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 1.2), materialsCache.darkSteel);
    body.position.y = 0.45;
    body.castShadow = true;
    group.add(body);

    const goldKnobs = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8), materialsCache.goldMetal);
    goldKnobs.rotation.x = Math.PI / 2;
    goldKnobs.position.set(-0.6, 0.7, 0.61);
    group.add(goldKnobs);

    const goldKnobs2 = goldKnobs.clone();
    goldKnobs2.position.x = 0.6;
    group.add(goldKnobs2);

    // 2 Grill beds
    [-0.6, 0.6].forEach(gx => {
      const grate = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.04, 0.95), new THREE.MeshStandardMaterial({ color: 0x111827 }));
      grate.position.set(gx, 0.92, 0);
      group.add(grate);

      const coals = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.85), materialsCache.emberGlow);
      coals.rotation.x = -Math.PI / 2;
      coals.position.set(gx, 0.93, 0);
      group.add(coals);
    });

    const gLight = new THREE.PointLight(0xff3700, 1.8, 5.5);
    gLight.position.set(0, 1.2, 0);
    group.add(gLight);

  } else if (catalogId === 'stone_oven') {
    // Domed Turkish stone oven
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1.6), new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }));
    base.position.y = 0.4;
    group.add(base);

    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.9 }));
    dome.position.y = 0.8;
    group.add(dome);

    const opening = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.4, 16, 1, false, 0, Math.PI), materialsCache.emberGlow);
    opening.rotation.z = Math.PI / 2;
    opening.position.set(0, 0.95, 0.7);
    group.add(opening);

    const ovenLight = new THREE.PointLight(0xf97316, 2, 4);
    ovenLight.position.set(0, 1.0, 0.7);
    group.add(ovenLight);

  } else if (catalogId === 'meat_fridge') {
    // Dry-Aged Meat Display Cabinet
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.0, 0.9), materialsCache.darkSteel);
    frame.position.y = 1.0;
    frame.castShadow = true;
    group.add(frame);

    const glassDoor = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.7, 0.05), materialsCache.glass);
    glassDoor.position.set(0, 1.0, 0.43);
    group.add(glassDoor);

    // Hanging Steaks inside fridge
    const meatMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.6 });
    [-0.4, 0, 0.4].forEach(mx => {
      const meat = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.45, 0.15), meatMat);
      meat.position.set(mx, 1.25, 0.1);
      group.add(meat);

      const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2), materialsCache.darkSteel);
      hook.position.set(mx, 1.55, 0.1);
      group.add(hook);
    });

    // Himalayan salt wall glow inside
    const saltGlow = new THREE.PointLight(0xfb923c, 1.4, 3.5);
    saltGlow.position.set(0, 1.0, 0);
    group.add(saltGlow);

  } else if (catalogId === 'plant_palm') {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.6, 12), new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8 }));
    pot.position.y = 0.3;
    pot.castShadow = true;
    group.add(pot);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.8, 8), materialsCache.darkWood);
    trunk.position.y = 0.8;
    group.add(trunk);

    for (let i = 0; i < 6; i++) {
      const frond = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.3, 4), materialsCache.leavesGreen);
      frond.rotation.z = 0.65;
      frond.rotation.y = (i * Math.PI * 2) / 6;
      frond.position.set(0, 1.2, 0);
      frond.castShadow = true;
      group.add(frond);
    }

  } else if (catalogId === 'golden_bull') {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 1.0), materialsCache.darkSteel);
    plinth.position.y = 0.2;
    group.add(plinth);

    // Muscular bull torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.7, 0.6), materialsCache.goldMetal);
    torso.position.y = 0.75;
    torso.castShadow = true;
    group.add(torso);

    // Bull head with horns
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.55, 6), materialsCache.goldMetal);
    head.rotation.z = -Math.PI / 3;
    head.position.set(0.75, 0.95, 0);
    group.add(head);

    // Horns
    [-0.2, 0.2].forEach(hz => {
      const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.07, 0.35, 6), materialsCache.goldMetal);
      horn.rotation.x = hz * 1.5;
      horn.rotation.z = 0.5;
      horn.position.set(0.7, 1.15, hz);
      group.add(horn);
    });

  } else if (catalogId === 'neon_sign') {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.1), new THREE.MeshStandardMaterial({ color: 0x09090b }));
    group.add(frame);

    const glowingTube = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 8, 24), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    glowingTube.position.z = 0.06;
    group.add(glowingTube);

    const light = new THREE.PointLight(0xef4444, 1.8, 4);
    light.position.set(0, 0, 0.3);
    group.add(light);
    group.position.y = 2.4;

  } else if (catalogId === 'chandelier_crystal') {
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), materialsCache.goldMetal);
    chain.position.y = 0.6;
    group.add(chain);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 8, 24), materialsCache.goldMetal);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 4), materialsCache.glass);
      crystal.position.set(Math.cos(angle) * 0.7, -0.15, Math.sin(angle) * 0.7);
      group.add(crystal);
    }

    const cLight = new THREE.PointLight(0xfef08a, 2.2, 8);
    group.add(cLight);
    group.position.y = 3.6;

  } else if (catalogId === 'picture_steak') {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.08), materialsCache.goldMetal);
    group.add(frame);

    const canvas = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.8 }));
    canvas.position.z = 0.05;
    group.add(canvas);
    group.position.y = 2.2;

  } else if (catalogId === 'turkish_carpet') {
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.0), new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.95 }));
    rug.rotation.x = -Math.PI / 2;
    rug.position.y = 0.02;
    group.add(rug);

    const border = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.6), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 }));
    border.rotation.x = -Math.PI / 2;
    border.position.y = 0.025;
    group.add(border);

  } else if (catalogId === 'table_outdoor_patio') {
    // Wrought Iron round patio table with umbrella
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.05, 20), materialsCache.darkSteel);
    top.position.y = 0.82;
    top.castShadow = true;
    group.add(top);

    // Center umbrella pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 12), materialsCache.goldMetal);
    pole.position.y = 1.3;
    group.add(pole);

    // Sun umbrella canopy
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 }); // rich burgundy canvas
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.6, 16, 1, true), canopyMat);
    canopy.position.y = 2.4;
    canopy.castShadow = true;
    group.add(canopy);

    const umbrellaGoldTip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), materialsCache.goldMetal);
    umbrellaGoldTip.position.y = 2.75;
    group.add(umbrellaGoldTip);

    // 4 Patio Chairs
    [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(ang => {
      const dist = 1.15;
      const cx = Math.cos(ang) * dist;
      const cz = Math.sin(ang) * dist;

      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.42), materialsCache.darkWood);
      seat.position.set(cx, 0.45, cz);
      group.add(seat);

      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8), materialsCache.darkSteel);
      leg.position.set(cx, 0.225, cz);
      group.add(leg);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.04), materialsCache.darkSteel);
      back.position.set(cx + Math.cos(ang) * 0.18, 0.68, cz + Math.sin(ang) * 0.18);
      back.rotation.y = -ang + Math.PI / 2;
      group.add(back);
    });

  } else if (catalogId === 'sign_neon_standing') {
    // Standing neon signboard with glowing NUSA-ET logo
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.08, 16), materialsCache.darkSteel);
    base.position.y = 0.04;
    group.add(base);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 12), materialsCache.goldMetal);
    pole.position.y = 0.95;
    group.add(pole);

    // Signboard panel
    const signBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.95, 0.18), new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1 }));
    signBox.position.set(0, 1.85, 0);
    signBox.castShadow = true;
    group.add(signBox);

    // Gold trim around signboard
    const trim = new THREE.Mesh(new THREE.BoxGeometry(1.68, 1.02, 0.14), materialsCache.goldMetal);
    trim.position.set(0, 1.85, 0);
    group.add(trim);

    // Glowing Neon text front & back
    [-0.1, 0.1].forEach(zOff => {
      const neonText = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.65, 0.03),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      neonText.position.set(0, 1.85, zOff);
      group.add(neonText);

      const subText = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.12, 0.04),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      subText.position.set(0, 1.55, zOff);
      group.add(subText);
    });

    // Neon glow light
    const signGlow = new THREE.PointLight(0xef4444, 2.5, 7);
    signGlow.position.set(0, 1.9, 0.4);
    group.add(signGlow);

  } else if (catalogId === 'sign_chalkboard') {
    // A-Frame Sidewalk Chalkboard
    const frameMat = materialsCache.darkWood;
    [-0.12, 0.12].forEach((zOff, idx) => {
      const slant = idx === 0 ? 0.15 : -0.15;
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.06), frameMat);
      legL.position.set(-0.45, 0.6, zOff);
      legL.rotation.x = slant;
      group.add(legL);

      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.06), frameMat);
      legR.position.set(0.45, 0.6, zOff);
      legR.rotation.x = slant;
      group.add(legR);

      // Black chalkboard face
      const board = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.03), new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 }));
      board.position.set(0, 0.65, zOff);
      board.rotation.x = slant;
      group.add(board);

      // White chalk menu lines
      const chalkTitle = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.04), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      chalkTitle.position.set(0, 0.92, zOff + (idx === 0 ? -0.02 : 0.02));
      chalkTitle.rotation.x = slant;
      group.add(chalkTitle);

      const chalkLine = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 0.04), new THREE.MeshBasicMaterial({ color: 0xf8fafc }));
      chalkLine.position.set(0, 0.75, zOff + (idx === 0 ? -0.02 : 0.02));
      chalkLine.rotation.x = slant;
      group.add(chalkLine);
    });

  } else if (catalogId === 'sign_totem_luxury') {
    // 3.2m Monolithic luxury illuminated totem
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.6), materialsCache.darkSteel);
    base.position.y = 0.15;
    group.add(base);

    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.85, 3.2, 0.35), new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2 }));
    pillar.position.y = 1.75;
    pillar.castShadow = true;
    group.add(pillar);

    // Gold side trims
    [-0.43, 0.43].forEach(px => {
      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.2, 0.38), materialsCache.goldMetal);
      trim.position.set(px, 1.75, 0);
      group.add(trim);
    });

    // Glowing front and back panels
    [-0.18, 0.18].forEach(pz => {
      const logoGlow = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, 0.04), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      logoGlow.position.set(0, 2.3, pz);
      group.add(logoGlow);

      const steakIcon = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.05), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      steakIcon.position.set(0, 1.4, pz);
      group.add(steakIcon);
    });

    const totemLight = new THREE.PointLight(0xf59e0b, 2.0, 9);
    totemLight.position.set(0, 2.6, 0.5);
    group.add(totemLight);

  } else if (catalogId === 'outdoor_heater') {
    // Stainless steel patio mushroom heater
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.1, 16), materialsCache.darkSteel);
    base.position.y = 0.05;
    group.add(base);

    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.8, 16), materialsCache.darkSteel);
    tank.position.y = 0.5;
    group.add(tank);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 12), materialsCache.darkSteel);
    pole.position.y = 1.45;
    group.add(pole);

    // Burner mesh
    const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.25, 16), materialsCache.emberGlow);
    burner.position.y = 2.1;
    group.add(burner);

    // Mushroom reflector dome
    const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.05, 0.15, 20), materialsCache.goldMetal);
    dome.position.y = 2.3;
    group.add(dome);

    const flameLight = new THREE.PointLight(0xf97316, 2.4, 6.5);
    flameLight.position.set(0, 2.1, 0);
    group.add(flameLight);

  } else if (catalogId === 'street_lantern') {
    // Vintage street lantern
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.4, 12), materialsCache.darkSteel);
    base.position.y = 0.2;
    group.add(base);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.4, 12), materialsCache.darkSteel);
    post.position.y = 1.4;
    group.add(post);

    const lanternHousing = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.35), materialsCache.goldMetal);
    lanternHousing.position.y = 2.7;
    group.add(lanternHousing);

    const glassPanels = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.3), materialsCache.glass);
    glassPanels.position.y = 2.7;
    group.add(glassPanels);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffedd5 }));
    bulb.position.y = 2.7;
    group.add(bulb);

    const lampLight = new THREE.PointLight(0xffedd5, 2.2, 8.5);
    lampLight.position.set(0, 2.7, 0);
    lampLight.castShadow = true;
    group.add(lampLight);

  } else if (catalogId === 'outdoor_flower_hedge') {
    // Boxwood hedge planter
    const planter = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 0.5), new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 }));
    planter.position.y = 0.2;
    planter.castShadow = true;
    group.add(planter);

    const hedge = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.75, 0.45), materialsCache.leavesGreen);
    hedge.position.y = 0.75;
    hedge.castShadow = true;
    group.add(hedge);

    // Fairy lights on hedge
    for (let f = 0; f < 8; f++) {
      const fairy = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      fairy.position.set(-0.85 + f * 0.24, 0.65 + (f % 2) * 0.2, 0.24);
      group.add(fairy);
    }
  }

  return group;
}

export function createFood3DMesh(dishId: DishId): THREE.Group {
  const group = new THREE.Group();
  const dish = MENU_ITEMS[dishId] || MENU_ITEMS.biftek;

  // Ceramic white serving platter
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.04, 18), materialsCache.ceramicWhite);
  plate.castShadow = true;
  group.add(plate);

  const cookedMat = new THREE.MeshStandardMaterial({ color: dish.cookedColor, roughness: 0.45 });

  if (dishId === 'biftek') {
    // Tomahawk steak shape
    const meat = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.09, 0.28), cookedMat);
    meat.position.y = 0.06;
    group.add(meat);

    // Bone handle
    const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.35, 8), materialsCache.whiteMarble);
    bone.rotation.z = Math.PI / 3;
    bone.position.set(0.28, 0.08, 0);
    group.add(bone);

    // Rosemary twig garnish
    const herb = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.18), materialsCache.leavesGreen);
    herb.position.set(-0.05, 0.12, 0);
    herb.rotation.y = 0.4;
    group.add(herb);

  } else if (dishId === 'lahmacun') {
    // Round flatbread
    const dough = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.025, 20), cookedMat);
    dough.position.y = 0.035;
    group.add(dough);

    // Lemon wedge
    const lemon = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8, 1, false, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    lemon.position.set(0.12, 0.06, 0.08);
    group.add(lemon);

  } else if (dishId === 'kuskas') {
    // Boat shaped pide
    const pide = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.22), cookedMat);
    pide.position.y = 0.04;
    group.add(pide);

  } else if (dishId === 'manti') {
    // Dumplings with yogurt
    const yogurt = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
    yogurt.position.y = 0.04;
    group.add(yogurt);

    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.045), cookedMat);
      m.position.set((Math.random() - 0.5) * 0.25, 0.07, (Math.random() - 0.5) * 0.25);
      group.add(m);
    }

  } else if (dishId === 'cubuk_patates') {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 6), materialsCache.darkWood);
    stick.rotation.z = Math.PI / 2;
    stick.position.y = 0.08;
    group.add(stick);

    for (let i = -0.18; i <= 0.18; i += 0.06) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 6, 12), cookedMat);
      ring.rotation.y = Math.PI / 2;
      ring.position.set(i, 0.08, 0);
      group.add(ring);
    }

  } else if (dishId === 'kunefe') {
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.035, 18), materialsCache.darkSteel);
    pan.position.y = 0.03;
    group.add(pan);

    const dessert = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 18), cookedMat);
    dessert.position.y = 0.055;
    group.add(dessert);

    // Pistachio sprinkle
    const pist = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.01, 10), materialsCache.leavesGreen);
    pist.position.y = 0.08;
    group.add(pist);

  } else if (dishId === 'baklava') {
    // Triangular carrot slice
    const triangle = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.08, 3), cookedMat);
    triangle.rotation.x = Math.PI;
    triangle.position.y = 0.06;
    group.add(triangle);

    // Cream / Maras Ice cream scoop
    const ice = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfffbeb }));
    ice.position.set(0.12, 0.07, 0);
    group.add(ice);
  }

  return group;
}

export function createHumanoidMesh(isWaiter: boolean = false, isVIP: boolean = false): THREE.Group {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.7 });
  let clothesColor = 0x334155;

  if (isWaiter) {
    clothesColor = 0x1e293b; // Elegant slate navy tuxedo vest
  } else if (isVIP) {
    clothesColor = 0xf8fafc; // All white luxury VIP suit
  } else {
    // Random stylish patron clothes
    const colors = [0x1e3a8a, 0x065f46, 0x991b1b, 0x581c87, 0xb45309, 0x374151];
    clothesColor = colors[Math.floor(Math.random() * colors.length)];
  }

  const clothesMat = new THREE.MeshStandardMaterial({ color: clothesColor, roughness: 0.5 });

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.3), isWaiter ? materialsCache.ceramicWhite : clothesMat);
  torso.position.y = 0.85;
  torso.castShadow = true;
  group.add(torso);

  // If waiter, add black vest over white shirt
  if (isWaiter) {
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.65, 0.28), clothesMat);
    vest.position.set(0, 0.86, 0);
    group.add(vest);
  }

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 14), skinMat);
  head.position.y = 1.35;
  head.castShadow = true;
  group.add(head);

  // Hair
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.15, 0.46), new THREE.MeshStandardMaterial({ color: 0x18181b }));
  hair.position.y = 1.5;
  group.add(hair);

  // Legs
  const legMat = new THREE.MeshStandardMaterial({ color: 0x09090b });
  [-0.15, 0.15].forEach(lx => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8), legMat);
    leg.position.set(lx, 0.25, 0);
    leg.castShadow = true;
    group.add(leg);
  });

  // Arms
  [-0.32, 0.32].forEach(ax => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.55, 8), isWaiter ? materialsCache.ceramicWhite : clothesMat);
    arm.position.set(ax, 0.85, 0);
    group.add(arm);
  });

  if (isWaiter) {
    // Golden amber apron
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.52, 0.04), materialsCache.goldMetal);
    apron.position.set(0, 0.74, 0.16);
    group.add(apron);

    // Bright red Bowtie
    const bowtie = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.05), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    bowtie.position.set(0, 1.18, 0.16);
    group.add(bowtie);

    // Serving Platter in hand
    const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.02, 16), materialsCache.goldMetal);
    tray.position.set(0.3, 0.9, 0.22);
    group.add(tray);

    const napkin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.12), materialsCache.ceramicWhite);
    napkin.position.set(0.3, 0.92, 0.22);
    group.add(napkin);

    // Overhead Floating Badge: GARSON
    const badgeGroup = new THREE.Group();
    badgeGroup.position.set(0, 1.95, 0);

    const badgeBack = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.22, 0.04), new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2 }));
    badgeGroup.add(badgeBack);

    const badgeFront = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.15, 0.05), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    badgeGroup.add(badgeFront);

    // Dedicated spotlight over waiter so they never get lost in shadows
    const waiterSpot = new THREE.PointLight(0xfff1db, 1.4, 6);
    waiterSpot.position.set(0, 0.4, 0);
    badgeGroup.add(waiterSpot);

    group.add(badgeGroup);
  }

  if (isVIP) {
    // Dark luxury sunglasses
    const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.08), materialsCache.goldMetal);
    glasses.position.set(0, 1.37, 0.2);
    group.add(glasses);

    // Gold chain
    const chain = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 6, 12), materialsCache.goldMetal);
    chain.position.set(0, 1.15, 0.14);
    group.add(chain);
  }

  return group;
}
