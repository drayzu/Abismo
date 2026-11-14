import * as THREE from 'three';
import { Timeline } from './timeline';
import { enfocar, materia, materiaBuilder } from '../src/engine/materia';
import { gauss } from '../src/engine/math';
import { ac, FONT, pensamiento, type Rotulo } from './placa';
import { BIO, CARMIN, ease, FONDO_M, SEGURO, TU, V } from './comun';
import { nevar } from './nieve';
import type { Escena, Frame, Instancia } from './tipos';

/**
 * Act V · The crack, rebuilt as one long take through a place (13 Nov 2026; Diego: the journey
 * lacked scenes, beauty and immersion). The study it replaces was an orbit round a small cloud.
 *
 * The bottom is black. Far away a light: the call. Then the dark catches: a front of light races
 * across the whole plain towards you and through you, and what it leaves lit is a country of living
 * lights that was there all the time. The camera travels through it: sparks that answer in rings
 * when you move, jellyfish near and far, one of them enormous, passing overhead with its arms
 * trailing; a school of small fish that crosses as one body; and, when the camera rises, a spiral of
 * light as wide as the frame: one animal, a colony tens of metres long, coiled like a galaxy. The
 * work opened looking at galaxies; down here there is one, and it is alive. Then the other light.
 *
 * Everything is one cloud of points, each with the moment it wakes (how far it is from the first
 * flash), so the front is real: nothing is lit before the light reaches it.
 */

const PRIMERA = V(6, 5, -78);
const GIGANTE = V(2.6, 6.2, -21);
const ESPIRAL = V(-15, 12, -66);
/** Where your light stays at the end, and the other one beside it. */
const AQUI = V(-2.2, 2.2, -44.5);
const OTRA = V(1.25, 0.22, -0.5);
const LEJOS = 96;

function poblar() {
  const b = materiaBuilder(101);
  const r = b.r;
  const aC: number[] = [];
  const aS: number[] = [];
  const aFase: number[] = [];
  const aR: number[] = [];
  const c = new THREE.Color();
  const tinte = () => {
    const k = r();
    if (k < 0.66) c.copy(BIO).lerp(new THREE.Color(0.35, 0.8, 1.0), r() * 0.6);
    else if (k < 0.9) c.setRGB(0.2, 0.9, 0.85);
    else c.setRGB(0.55, 0.45, 1.0);
    return c;
  };
  /** When a light at (x, y, z) wakes: 0 at the first flash, 1 at the far end of the plain. */
  const turno = (x: number, y: number, z: number) => Math.min(1, Math.hypot(x - PRIMERA.x, y - PRIMERA.y, z - PRIMERA.z) / LEJOS);
  const add = (x: number, y: number, z: number, col: THREE.Color, s: number, light: number, kind: number, delay: number, cx: number, cy: number, cz: number, t: number, fase: number, R = 1) => {
    b.push(x, y, z, col, s, light, { kind, delay });
    aC.push(cx, cy, cz);
    aS.push(t);
    aFase.push(fase);
    aR.push(R);
  };

  // 0 · The plankton: sparks through the whole plain, thicker near the level you travel at.
  for (let i = 0; i < 210000; i++) {
    const x = (r() - 0.5) * 64;
    const y = 2 + gauss(r) * 7;
    const z = 14 - r() * 100;
    add(x, y, z, tinte(), 0.02, 1, 0, turno(x, y, z) + r() * 0.012, x, y, z, 0, r() * 6.28);
  }
  for (let i = 0; i < 110000; i++) {
    const z = 12 - r() * 62;
    const x = -1.5 + gauss(r) * 6.5;
    const y = 1.6 + gauss(r) * 3.4;
    add(x, y, z, tinte(), 0.018, 1, 0, turno(x, y, z) + r() * 0.012, x, y, z, 0, r() * 6.28);
  }

  // 1, 2 · Jellyfish: a bell with canals and a bright rim, and tentacles that trail.
  const medusa = (cx: number, cy: number, cz: number, R: number, col: THREE.Color, brazos: boolean) => {
    const fase = r() * 6.28;
    const d = turno(cx, cy, cz);
    const canales = Math.round(16 + 12 * R);
    const nb = Math.min(34000, Math.round(900 + 3600 * R * R));
    for (let i = 0; i < nb; i++) {
      const h = Math.pow(r(), 0.7);
      let a = r() * Math.PI * 2;
      const enCanal = r() < 0.4;
      if (enCanal) a = (Math.round((a / (Math.PI * 2)) * canales) / canales) * Math.PI * 2;
      const rr = R * Math.sqrt(1 - (1 - h) * (1 - h));
      const borde = h > 0.94;
      add(cx + Math.cos(a) * rr, cy + R * 0.72 * (1 - h), cz + Math.sin(a) * rr, col, 0.014, borde ? 1.7 : enCanal ? 0.9 : 0.3, 1, d, cx, cy, cz, h, fase, R);
    }
    const nt = Math.round(10 + 10 * R);
    for (let k = 0; k < nt; k++) {
      const a = (k / nt) * Math.PI * 2 + r();
      const largo = R * (brazos ? 5 + 3 * r() : 3 + 4 * r());
      const rr = R * (0.55 + 0.42 * r());
      const np = Math.round(70 + 90 * R);
      for (let i = 0; i < np; i++) {
        const t = i / (np - 1);
        add(cx + Math.cos(a) * rr * (1 - 0.3 * t), cy - t * largo, cz + Math.sin(a) * rr * (1 - 0.3 * t), col, 0.01, (brazos ? 1.3 : 0.8) * (1 - 0.65 * t), 2, d, cx, cy, cz, t, fase + k, R);
      }
    }
    if (!brazos) return;
    // The great one's arms: five ribbons with a frilled edge, trailing far below and behind it.
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + 0.4;
      for (let i = 0; i < 11000; i++) {
        const u = Math.pow(r(), 0.8);
        const v = r() * 2 - 1;
        const w = R * 0.26 * (1 - 0.55 * u);
        const x = Math.cos(a) * R * (0.3 + 0.25 * u) + v * w * Math.cos(a + 1.57);
        const z = Math.sin(a) * R * (0.3 + 0.25 * u) + v * w * Math.sin(a + 1.57) + u * u * R * 0.8;
        const filo = Math.abs(v) > 0.86;
        add(cx + x, cy - u * R * 2.3, cz + z, col, 0.012, filo ? 1.2 : 0.3, 2, d, cx, cy, cz, u, fase + k * 1.3, R * 0.6);
      }
    }
  };
  medusa(GIGANTE.x, GIGANTE.y, GIGANTE.z, 3.1, new THREE.Color(0.42, 0.74, 1.0), true);
  for (let m = 0; m < 84; m++) {
    const x = (r() - 0.5) * 50;
    const y = -3 + r() * 15;
    const z = 4 - r() * 84;
    // Not on the way.
    if (Math.abs(x + 1) < 3.2 && Math.abs(y - 1.5) < 3.5) continue;
    if (Math.hypot(x - GIGANTE.x, z - GIGANTE.z) < 7) continue;
    medusa(x, y, z, 0.32 + 1.3 * r() * r(), tinte().clone(), false);
  }

  // 3 · The spiral: one colony, coiled; lights run along it, and a fringe hangs from every turn.
  {
    const d = turno(ESPIRAL.x, ESPIRAL.y, ESPIRAL.z);
    const tx = 0.95;
    const tz = 0.22;
    const girar = (x: number, y: number, z: number): [number, number, number] => {
      const y1 = y * Math.cos(tx) - z * Math.sin(tx);
      const z1 = y * Math.sin(tx) + z * Math.cos(tx);
      return [x * Math.cos(tz) - y1 * Math.sin(tz), x * Math.sin(tz) + y1 * Math.cos(tz), z1];
    };
    for (let i = 0; i < 130000; i++) {
      const sp = Math.pow(r(), 0.8);
      const ang = sp * 2.7 * Math.PI * 2;
      const rad = (1.6 + 12 * sp) * (1 + 0.05 * Math.sin(ang * 2.3 + 1));
      const q = r();
      // A third is the stem, close to half the fringe that hangs from it, the rest a dust around it.
      const tipo = q < 0.3 ? 0 : q < 0.75 ? 1 : 2;
      const j = tipo === 0 ? 0.12 : tipo === 1 ? 0.3 : 1.25;
      const cuelga = tipo === 1 ? -Math.pow(r(), 1.3) * 2.3 : tipo === 2 ? gauss(r) * 0.5 : 0;
      const [x, y, z] = girar(Math.cos(ang) * rad + gauss(r) * j, cuelga + gauss(r) * 0.05, Math.sin(ang) * rad + gauss(r) * j);
      if (tipo === 0) c.setRGB(0.86, 0.93, 1.0).lerp(new THREE.Color(1.0, 0.9, 0.78), 1 - sp);
      else if (tipo === 1) c.setRGB(0.3, 0.62, 1.0);
      else c.setRGB(0.4, 0.55, 1.0);
      add(ESPIRAL.x + x, ESPIRAL.y + y, ESPIRAL.z + z, c, tipo === 0 ? 0.05 : 0.045, tipo === 0 ? 0.34 : tipo === 1 ? 0.3 : 0.15, 3, 1.12 + sp * 0.16, ESPIRAL.x, ESPIRAL.y, ESPIRAL.z, sp, tipo === 0 ? 0.0 : 3.0);
    }
    for (let i = 0; i < 6000; i++) {
      const [x, y, z] = girar(gauss(r) * 1.0, gauss(r) * 0.35, gauss(r) * 1.0);
      c.setRGB(1.0, 0.93, 0.8);
      add(ESPIRAL.x + x, ESPIRAL.y + y, ESPIRAL.z + z, c, 0.06, 0.4, 3, 1.1, ESPIRAL.x, ESPIRAL.y, ESPIRAL.z, 0, 1.0);
    }
  }

  // 4 · A school of small fish, each with a light at the head: it crosses the way as one body.
  for (let i = 0; i < 9000; i++) {
    const ox = gauss(r) * 2.4;
    const oy = gauss(r) * 1.1;
    const oz = gauss(r) * 2.4;
    const fase = r() * 0.16;
    c.setRGB(0.55, 0.85, 1.0);
    for (let k = 0; k < 2; k++) add(ox, oy, oz, c, 0.016, k === 0 ? 2.6 : 1.0, 4, 0, ox, oy, oz, k, fase);
  }

  // 5 · Alarm jellies: a small ring whose light goes round and round.
  for (let m = 0; m < 26; m++) {
    const cx = (r() - 0.5) * 40;
    const cy = -2 + r() * 12;
    const cz = 2 - r() * 70;
    if (Math.abs(cx + 1) < 2.5 && Math.abs(cy - 1.5) < 2.5) continue;
    const d = turno(cx, cy, cz);
    const R = 0.25 + 0.3 * r();
    const fase = r() * 6.28;
    const tilt = r() * 1.2;
    c.setRGB(0.35, 0.7, 1.0);
    for (let i = 0; i < 160; i++) {
      const t = i / 160;
      const a = t * Math.PI * 2;
      const rr = R * (i % 2 ? 1 : 0.7);
      add(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * Math.sin(tilt), cz + Math.sin(a) * rr * Math.cos(tilt), c, 0.012, 1, 5, d, cx, cy, cz, t, fase, R);
    }
  }

  return materia(b.data(), {
    pre: /* glsl */ `
      attribute vec3 aC;
      attribute float aS, aFase, aR;
      uniform float uOn, uOla1, uOla1I, uOla2, uOla2I, uPez;
      uniform vec3 uTu;
      ${SEGURO}`,
    move: /* glsl */ `
      vec3 l = p - aC;
      float despierta = step(aDelay, uOn);
      // The front: the moment the light reaches a point it flares, and then settles.
      float nace = exp(-max(uOn - aDelay, 0.0) * 20.0) * despierta;
      if (aKind < 0.5) {
        float tt = uTime * (0.18 + seed * 0.5) + aFase;
        float ola = pw(0.5 + 0.5 * sin(dot(p, vec3(0.21, 0.1, 0.17)) - uTime * 0.4), 6.0);
        vec3 base = em;
        em *= 0.1 + 1.3 * pw(0.5 + 0.5 * sin(tt), 8.0) + 0.6 * ola;
        // Rings that go out from you: one the journey sends, one that your own movement sends.
        float lejos = length(p - uTu);
        float a1 = (lejos - uOla1) / 0.55;
        float a2 = (lejos - uOla2) / 0.55;
        em += base * 3.2 * (exp(-a1 * a1) * uOla1I + exp(-a2 * a2) * uOla2I);
        p += 0.08 * vec3(sin(uTime * 0.13 + seed * 40.0), sin(uTime * 0.11 + seed * 70.0), cos(uTime * 0.12 + seed * 55.0));
      } else if (aKind < 1.5) {
        float late = sin(uTime * 0.8 + aFase - aS * 2.2);
        l.xz *= 1.0 + 0.13 * late * (0.3 + 0.7 * aS);
        l.y *= 1.0 - 0.09 * late;
        em *= 0.6 + 0.6 * pw(0.5 + 0.5 * sin(uTime * 0.8 + aFase - aS * 3.0), 3.0);
      } else if (aKind < 2.5) {
        l.x += 0.3 * aR * sin(aS * 6.0 - uTime * 0.8 + aFase) * aS;
        l.z += 0.3 * aR * cos(aS * 5.0 - uTime * 0.65 + aFase * 1.3) * aS;
        l.y += 0.06 * aR * sin(uTime * 0.8 + aFase) * (1.0 - aS);
        em *= 0.3 + 1.3 * pw(0.5 + 0.5 * sin(aS * 14.0 - uTime * 1.5 + aFase), 5.0);
      } else if (aKind < 3.5) {
        // aFase: 0 the stem, 3 the fringe, 1 the heart.
        float corre = pw(0.5 + 0.5 * sin(aS * 120.0 - uTime * 1.2), 8.0);
        em *= aFase > 2.0 ? 0.35 + 1.6 * pw(0.5 + 0.5 * sin(aS * 300.0 + l.y * 5.0 - uTime * 2.0), 4.0) : aFase > 0.5 ? 0.8 + 0.3 * sin(uTime * 0.6) : 0.5 + 2.0 * corre;
      } else if (aKind < 4.5) {
        float tt = uPez + aFase;
        vec3 ruta = vec3(20.0 - 44.0 * tt, 2.0 + 2.0 * sin(tt * 5.0), -39.0 - 5.0 * sin(tt * 3.1));
        vec3 dir = normalize(vec3(-44.0, 10.0 * cos(tt * 5.0), -15.5 * cos(tt * 3.1)));
        p = ruta + aC * (1.0 + 0.3 * sin(tt * 9.0 + seed * 6.0)) - dir * aS * 0.12;
        em *= (0.5 + 1.5 * pw(0.5 + 0.5 * sin(tt * 40.0 + seed * 20.0), 6.0)) * smoothstep(-0.05, 0.1, tt) * smoothstep(1.15, 1.0, tt);
      } else {
        em *= 0.06 + 2.6 * pw(0.5 + 0.5 * cos(aS * 6.2832 - uTime * 4.0 + aFase), 14.0);
      }
      if ((aKind > 0.5 && aKind < 3.5) || aKind > 4.5) p = aC + l + vec3(0.0, 0.14 * sin(uTime * 0.14 + aFase), 0.0);
      em *= aKind > 3.5 && aKind < 4.5 ? smoothstep(0.25, 0.4, uOn) : despierta * (1.0 + 9.0 * nace);`,
    uniforms: {
      uOn: { value: 0 },
      uOla1: { value: 0 },
      uOla1I: { value: 0 },
      uOla2: { value: 0 },
      uOla2I: { value: 0 },
      uPez: { value: -1 },
      uTu: { value: new THREE.Vector3() },
    },
    extra: { aC: [new Float32Array(aC), 3], aS: [new Float32Array(aS), 1], aFase: [new Float32Array(aFase), 1], aR: [new Float32Array(aR), 1] },
  });
}

export const acto5: Escena = {
  id: 'acto5',
  nombre: 'Acto V',
  estilos: [{ key: '1', nombre: 'El acto', nota: 'Un solo plano por un lugar: el frente de luz que cruza el fondo, la medusa enorme, el cardumen, la espiral, la otra luz.' }],
  montar(stage): Instancia {
    const root = stage.root;
    const { camera } = stage;
    stage.bloom.strength = 0.9;
    stage.bloom.radius = 0.8;
    stage.bloom.threshold = 0.1;
    stage.finish.uniforms.uGrain.value = 0.03;
    stage.finish.uniforms.uVignette.value = 0.7;

    const vivas = poblar();
    root.add(vivas.points);

    const snow = nevar(26000, 0);
    root.add(snow.points);

    const uno = (col: THREE.Color, seed: number) => {
      const bb = materiaBuilder(seed);
      bb.push(0, 0, 0, col, 0.03, 1);
      const m = materia(bb.data());
      m.u.uFuente.value = 1;
      root.add(m.points);
      return m;
    };
    const f1 = uno(BIO, 102);
    f1.points.position.copy(PRIMERA);
    const tu = uno(TU, 103);
    const otra = uno(CARMIN, 104);
    otra.points.position.copy(AQUI).add(OTRA);
    const bh = materiaBuilder(105);
    for (let i = 0; i < 170; i++) {
      const t = i / 169;
      bh.push(OTRA.x * t, OTRA.y * t + 0.035 * Math.sin(t * Math.PI), OTRA.z * t, TU.clone().lerp(CARMIN, t), 0.007, 0.9);
    }
    const hilo = materia(bh.data(), {
      pre: /* glsl */ `uniform float uHilo;`,
      // It grows from both ends and meets in the middle.
      move: /* glsl */ `
        float aa = clamp(length(p) / ${OTRA.length().toFixed(3)}, 0.0, 1.0);
        float falta = 1.0 - uHilo;
        em *= smoothstep(falta - 0.06, falta, abs(aa - 0.5) * 2.0) * step(0.002, uHilo);
        p.y += 0.012 * sin(aa * 14.0 + uTime * 0.7);`,
      uniforms: { uHilo: { value: 0 } },
    });
    hilo.points.position.copy(AQUI);
    root.add(hilo.points);

    const tl = new Timeline();
    // px, py, pz, yaw, pitch, fov: the camera's way through the plain. on: how far the front of
    // light has come (0 the first flash, 1 the far end). ola: the ring the journey sends out from
    // you. pez: the school crossing (0 → 1). sep: your light stops and the camera goes on without
    // it. alc, nieve, cae: your light's reach and the snow. msj, resp: the message and its answer.
    // (It opens as act IV ends: the camera tilted down, your light low in the frame; baja lets go of that.)
    tl.set({ baja: 1, px: 0, py: 0, pz: 8, yaw: 0, pitch: -0.2, fov: 44, on: 0, f1: 0, luz: 0.07, alc: 0.16, nieve: 0, cae: 0, mov: 0, ola: 0, pez: -0.2, sep: 0, otra: 0, hilo: 0, msj: 0, resp: 0, min: 252 });
    tl.label('destello').caption(6.0, 'Un destello', 'Lejos, una luz. Es la voz que oíste pasar.');
    tl.with(3.4, { baja: 0, pitch: 0, fov: 50 });
    tl.wait(0.8);
    tl.to(0.8, { f1: 1, min: 253 });
    tl.to(1.2, { f1: 0 });
    tl.to(0.8, { f1: 1 });
    tl.to(1.2, { f1: 0.3, on: 0.02 });
    tl.to(1.2, { on: 0.1, pitch: 0.04 });
    // The front crosses the plain and goes through you.
    tl.label('ahi').caption(9.0, 'Las luces que estaban ahí', 'Estaban ahí todo el tiempo. En la oscuridad no se veían.');
    tl.to(6.0, { on: 0.9, pz: 6, luz: 0.3, alc: 0.5, nieve: 0.6, cae: 1.4 }, (t) => t);
    tl.to(3.0, { on: 1.05, pz: 4, luz: 0.45, alc: 0.8, nieve: 1, cae: 2.6, min: 254 });
    tl.label('contestan').caption(8.0, 'Contestan', 'Cuando te mueves, se encienden.');
    tl.with(5.0, { ola: 1 }, (t) => t);
    tl.to(8.0, { pz: -3, py: 0.2, mov: 1, alc: 1.1, cae: 5.4, luz: 0.6 });
    // Among them; under the great one, looking up.
    tl.label('seres').caption(15.0, 'Viven de lo que cae', 'Aquí nadie ha visto el Sol. Viven de lo que cae.');
    tl.to(6.0, { pz: -12, px: -1.2, py: 0.6, yaw: 0.18, pitch: 0.34, cae: 8.4, alc: 1.4 });
    tl.to(5.0, { pz: -20, px: -2.4, py: 0.9, yaw: 0.5, pitch: 0.92, fov: 60, cae: 11, min: 256 });
    tl.to(4.0, { pz: -26, px: -2.2, py: 1.2, yaw: 0.12, pitch: 0.3, fov: 54, cae: 13 });
    tl.label('banco').caption(6.0, 'Pasan', 'Otra vez un cardumen. Esta vez con luz.');
    tl.with(8.0, { pez: 0.95 }, (t) => t);
    tl.to(6.0, { pz: -32, py: 1.6, yaw: -0.1, pitch: 0.1, cae: 16 });
    // The camera rises and turns, and there it is.
    tl.label('galaxia').caption(13.0, 'Otra galaxia', 'Empezaste mirando galaxias. Aquí abajo hay una. Es un solo ser, y está vivo.');
    tl.to(4.0, { pz: -36, py: 2.6, yaw: -0.46, pitch: 0.44, fov: 62, cae: 18, luz: 0.8, on: 1.1 });
    // It lights from its heart outwards.
    tl.with(4.0, { on: 1.32 }, (t) => t);
    tl.to(9.0, { pz: -41, py: 4.4, px: -3.4, yaw: -0.62, pitch: 0.4, fov: 66, cae: 22.5, min: 257 });
    tl.label('otra').caption(9.0, 'Otra luz como la tuya', 'Una de ellas es otra persona. La que llamaba.');
    tl.to(4.0, { sep: 1, pz: -40.6, py: 2.7, px: -1.4, yaw: -0.12, pitch: -0.05, fov: 46, otra: 1, cae: 24.5 });
    tl.to(5.0, { pz: -41.6, px: -1.0, py: 2.5, yaw: -0.2, luz: 1, hilo: 1, min: 258, cae: 26.6 });
    tl.label('mensaje').caption(6.4, 'El mensaje', '');
    tl.with(6.4, { yaw: -0.3, px: -0.6, cae: 28.6 });
    tl.with(1.8, { msj: 1 }, (x) => x);
    tl.wait(3.2);
    tl.to(1.4, { resp: 1 });
    tl.wait(1.8);
    // Back and up: the two lights, small, in the middle of everything that is lit.
    tl.label('no').caption(8.0, 'No se arregla', 'No se arregla de una vez. Pero el fondo no es todo.');
    tl.to(8.0, { pz: -33, py: 5.4, px: 1.5, yaw: -0.36, pitch: -0.12, fov: 60, min: 260, cae: 31 });
    tl.wait(0.6);

    const dir = V();
    const tuEn = V();
    const va = V();
    let energia = 0;
    let ultimoP = -1;
    let puntero = 0;
    let anillo = -1;
    const alMover = (ev: PointerEvent) => (puntero += Math.hypot(ev.movementX, ev.movementY) / 300);
    addEventListener('pointermove', alMover);

    return {
      tl,
      luzEntrada: TU.clone(),
      chispa: tuEn,
      chispaLuz: tu,
      luzSalida: TU.clone(),
      cuenta: (p) => ({ m: FONDO_M, min: tl.get('min', p), quieto: 1 - ease(0, 0.8, p) }),
      rotulo(p): Rotulo | null {
        const cp = tl.captionAt(p);
        return cp ? { capitulo: 'V · La grieta', name: cp.name, fact: cp.fact } : null;
      },
      placa(g, f) {
        // The message, sent at last, and a short answer in the other's colour.
        const sale = 1 - ease(tl.at('no') + 1.5, tl.at('no') + 3.5, f.p);
        pensamiento(g, f.u, f.W * 0.5, f.H * 0.24, '¿estás despierto?', Math.min(tl.get('msj', f.p), 1.2), sale, 28);
        const re = tl.get('resp', f.p) * sale;
        if (re > 0.01) {
          g.save();
          g.globalAlpha = re;
          g.font = FONT.italic(28 * f.u);
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.shadowColor = 'rgba(0,0,0,0.9)';
          g.shadowBlur = 14 * f.u;
          g.fillStyle = ac();
          g.fillText('sí. aquí estoy.', f.W * 0.5, f.H * 0.24 + 44 * f.u);
          g.restore();
        }
      },
      update(f: Frame) {
        const p = f.p;
        const yaw = tl.get('yaw', p) + 0.012 * Math.sin(f.time * 0.13);
        const pitch = tl.get('pitch', p) + 0.008 * Math.sin(f.time * 0.17);
        camera.near = 0.03;
        camera.far = 400;
        camera.fov = tl.get('fov', p);
        camera.position.set(tl.get('px', p), tl.get('py', p), tl.get('pz', p));
        dir.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
        camera.up.set(0, 1, 0);
        camera.lookAt(camera.position.x + dir.x, camera.position.y + dir.y, camera.position.z + dir.z);
        camera.updateMatrixWorld();

        // You go a little ahead of the camera and below it, looking less up than it does; at the
        // end you stop, and the camera goes on by itself.
        va.set(Math.sin(yaw * 0.5), Math.sin(pitch * 0.25) - 0.13 - 0.07 * tl.get('baja', p), -Math.cos(yaw * 0.5)).normalize();
        tuEn.copy(camera.position).addScaledVector(va, 2.5).lerp(AQUI, tl.get('sep', p));
        tu.points.position.copy(tuEn);

        enfocar(vivas, f.focal, f.dpr, f.time);
        vivas.u.uMinPx.value = 1.5 * f.dpr;
        vivas.u.uMaxPx.value = 9 * f.dpr;
        vivas.u.uGain.value = 0.85;
        vivas.u.uFog.value = 46;
        vivas.u.uFogNear.value = 6;
        vivas.u.uOn.value = tl.get('on', p);
        vivas.u.uPez.value = tl.get('pez', p);
        (vivas.u.uTu.value as THREE.Vector3).copy(tuEn);
        const ola = tl.get('ola', p);
        vivas.u.uOla1.value = 30 * ola;
        vivas.u.uOla1I.value = Math.sin(Math.PI * Math.min(1, ola)) * 0.9;

        // Your own movement sends a ring too (the pointer, or the scroll). With no ambient time
        // (the tests, reduced motion) there is none, so a frame depends only on where the journey is.
        const mov = tl.get('mov', p);
        if (f.time === 0) {
          energia = 0;
          anillo = -1;
        } else {
          energia += puntero + (ultimoP >= 0 ? Math.min(0.5, Math.abs(p - ultimoP) * 5) : 0);
          energia = Math.min(1.4, energia) * Math.exp(-f.dt * 1.4);
          if (anillo < 0 && energia > 0.45 && mov > 0.5) anillo = 0;
          if (anillo >= 0) {
            anillo += f.dt * 7;
            if (anillo > 22) anillo = -1;
          }
        }
        puntero = 0;
        ultimoP = p;
        vivas.u.uOla2.value = Math.max(anillo, 0);
        vivas.u.uOla2I.value = anillo >= 0 ? mov * Math.sin((Math.PI * anillo) / 22) : 0;

        const luz = tl.get('luz', p) * (0.93 + 0.07 * Math.sin(f.time * 1.1));
        snow.points.position.copy(camera.position);
        snow.u.uTime.value = f.time;
        snow.u.uFocal.value = f.focal;
        snow.u.uDpr.value = f.dpr;
        snow.u.uLuz.value.copy(tuEn).sub(camera.position);
        snow.u.uI.value = luz * tl.get('nieve', p);
        snow.u.uAlc.value = tl.get('alc', p);
        snow.u.uCae.value = tl.get('cae', p);
        // Everything that is lit down here falls on the snow a little, too.
        snow.u.uAmb.value = 0.035 * tl.get('nieve', p);

        for (const [m, gain, px] of [
          [f1, 7.0 * tl.get('f1', p), 6],
          [tu, 2.8 * luz, 5.5],
          [otra, 4.2 * tl.get('otra', p) * (0.93 + 0.07 * Math.sin(f.time * 0.9 + 2)), 5.5],
        ] as const) {
          enfocar(m, f.focal, f.dpr, f.time);
          m.u.uMinPx.value = px * f.dpr;
          m.u.uGain.value = gain;
        }
        enfocar(hilo, f.focal, f.dpr, f.time);
        hilo.u.uMinPx.value = 1.6 * f.dpr;
        hilo.u.uGain.value = 1.2;
        hilo.u.uHilo.value = tl.get('hilo', p);
      },
      dispose() {
        removeEventListener('pointermove', alMover);
      },
    };
  },
};
