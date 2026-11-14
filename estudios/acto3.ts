import * as THREE from 'three';
import { Timeline } from './timeline';
import { pantalla } from '../src/engine/pantalla';
import { enfocar, materia, materiaBuilder } from '../src/engine/materia';
import { clamp, gauss, rng, smoothstep } from '../src/engine/math';
import { pensamiento, type Rotulo } from './placa';
import { SEGURO, TU, V } from './comun';
import { nevar } from './nieve';
import type { Escena, Frame, Instancia } from './tipos';

/**
 * Act III · Midnight, as one long take down a place (13 Nov 2026, to the bar Diego set with act V;
 * second pass after he asked for more movement, more camera, and a whale that hits).
 *
 * You fall close to a wall of rock: your small light finds ledge after ledge going up past you, and
 * the thoughts of three in the morning come with them. Then the call passes: a front of light goes
 * down through the water, the camera leaves the wall and looks down and round, and for a moment you
 * see where you are, a canyon so large that your light was never going to find the other side. It
 * goes dark again. Something enormous comes up from below, a few metres away, while you go down:
 * a whale, going up to breathe. It does not fit in the frame; its skin goes by in your light, then
 * its eye, and one click of its own shows it whole, and the canyon behind it, for an instant. The
 * thoughts come back, faster. The second call shows the walls much closer: a trench. The flakes
 * stretch into rain.
 *
 * Nothing is lit that light does not reach: the rock and the whale are dark points that answer only
 * to your light (a little, and only close), to the front of the call and to the whale's click.
 */

/** Thoughts of three in the morning (provisional; Diego may write his own). */
const PENSAMIENTOS = ['no le importo a nadie', 'siempre va a ser así', 'algo está mal conmigo', 'para qué'];

/** Value noise and a few octaves of it, for the rock. */
export function ruidoJS(seed: number) {
  const r = rng(seed);
  const T = new Float32Array(4096);
  for (let i = 0; i < T.length; i++) T[i] = r();
  const h = (x: number, y: number) => T[(x * 73 + y * 151) & 4095];
  const n = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = x - xi;
    const fy = y - yi;
    const u = fx * fx * (3 - 2 * fx);
    const v = fy * fy * (3 - 2 * fy);
    return (h(xi, yi) * (1 - u) + h(xi + 1, yi) * u) * (1 - v) + (h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u) * v;
  };
  return (x: number, y: number) => n(x, y) * 0.5 + n(x * 2.03 + 17, y * 2.03 + 5) * 0.25 + n(x * 4.1 + 3, y * 4.1 + 41) * 0.125 + n(x * 8.3 + 9, y * 8.3 + 2) * 0.0625;
}

export const LUZ = /* glsl */ `
  uniform vec3 uTu, uOndaO;
  uniform float uAlc, uLuzI, uOndaR, uOndaI, uOndaW, uOndaCola;
  ${SEGURO}
  // The light that falls on a dark thing at wp. Yours: little, and only near.
  float tuyaEn(vec3 wp) {
    vec3 a = wp - uTu;
    return uLuzI * 1.3 / (dot(a, a) / (uAlc * uAlc * 9.0) + 1.0);
  }
  // A front of light (the call, or the whale's click), with what it leaves lit behind it for a
  // moment (uOndaCola: how far behind).
  float ondaEn(vec3 wp) {
    float dd = length(wp - uOndaO);
    float fr = (dd - uOndaR) / uOndaW;
    return (exp(-fr * fr) * 1.5 + step(dd, uOndaR) * exp(-(uOndaR - dd) / uOndaCola)) * uOndaI;
  }
  float luzEn(vec3 wp) { return tuyaEn(wp) + ondaEn(wp); }
`;
export const luzU = () => ({
  uTu: { value: new THREE.Vector3() },
  uOndaO: { value: new THREE.Vector3() },
  uAlc: { value: 1 },
  uLuzI: { value: 1 },
  uOndaR: { value: 0 },
  uOndaI: { value: 0 },
  uOndaW: { value: 4 },
  uOndaCola: { value: 80 },
});

/** The canyon: two walls of rock with ledges, wide above and closing into a trench far below. */
function canon() {
  const b = materiaBuilder(111);
  const r = b.r;
  const f = ruidoJS(7);
  const c = new THREE.Color();
  const ancho = (y: number) => 5.5 + 13 * clamp(1 + y / 125, 0, 1);
  const grande = (lado: number, y: number, z: number) => f(y * 0.045 + lado * 31, z * 0.045 + 9) * 15;
  const relieve = (lado: number, y: number, z: number) => grande(lado, y, z) + f(y * 0.2 + 3, z * 0.2 + lado * 7) * 3.2 + 1.5 * Math.sin(y * 0.5 + f(y * 0.08, z * 0.08) * 7);
  // It bends away as it goes: 0 where you fall, so you stay inside it.
  const meandro = (z: number) => 17 * (Math.sin(z * 0.03 + 1.0) - Math.sin(1.0)) + 5 * Math.sin(z * 0.08);
  const gris = new THREE.Color(0.36, 0.5, 0.74);
  const nieve = new THREE.Color(0.84, 0.92, 1.0);
  for (let i = 0; i < 620000; i++) {
    const lado = r() < 0.58 ? 1 : -1;
    const y = 14 - r() * 175;
    // More of it close to where you fall, where your light will find it.
    const z = r() < 0.3 ? gauss(r) * 7 : 46 - Math.pow(r(), 0.8) * 150;
    const rel = relieve(lado, y, z);
    // A ledge is where the wall steps out going down: snow settles on it, so it is paler.
    const repisa = clamp((relieve(lado, y - 0.6, z) - rel) * 0.9, 0, 1);
    const x = meandro(z) + lado * (ancho(y) + 14 - rel) + gauss(r) * 0.1;
    c.copy(gris).lerp(nieve, repisa);
    b.push(x, y, z, c, 0.05, 0.45 + 0.9 * repisa + 0.2 * r());
  }
  // Spires: needles of rock standing up from far below, at every distance.
  for (let k = 0; k < 14; k++) {
    const sz = -16 - r() * 92;
    const sx = meandro(sz) + (r() - 0.5) * 16;
    const cima = -22 - r() * 95;
    const fase = r() * 40;
    for (let i = 0; i < 13000; i++) {
      const baja = Math.pow(r(), 0.7) * 75;
      const a = r() * Math.PI * 2;
      const rad = (0.5 + baja * 0.11) * (0.7 + 0.6 * f(a * 1.3 + fase, baja * 0.12));
      const repisa = clamp(f(a * 2 + fase, baja * 0.5) * 2 - 0.9, 0, 1);
      c.copy(gris).lerp(nieve, repisa);
      b.push(sx + Math.cos(a) * rad, cima - baja, sz + Math.sin(a) * rad, c, 0.05, 0.45 + 0.8 * repisa + 0.2 * r());
    }
  }
  const nube = materia(b.data(), { pre: LUZ, move: /* glsl */ `em *= luzEn(p);`, uniforms: luzU() });
  /** Where the right-hand wall is (its large shape only) at height y, in the plane you fall in. */
  const pared = (y: number) => ancho(y) + 14 - grande(1, y, 0);
  return { nube, pared };
}

/** How long the whale is, and where along it (0 the tail, 1 the head) and round it the eye sits. */
const LARGO = 30;
const OJO_T = 0.74;
const OJO_A = 0.62;
/** Where the blunt end of the head starts to close, and how square it is. */
const NARIZ = 0.94;
const ROMO = 3.2;
/** Half the length and half the height of the opening of the eye. */
const OJO_L = 0.36;
const OJO_H = 0.25;

/**
 * The whale: a blunt head, closed at the front, a body that thins to the tail, the flukes, an eye;
 * wrinkled skin drawn as lines along the body; and round it the sparks its passing wakes. Local x
 * runs along the body, head first at +x.
 *
 * It is a body, not a shell of glass: every point of skin knows which way it faces, and the side
 * turned away from you is not drawn. Kinds: 0 skin, 1 sparks, 2 flukes and flippers (thin: seen
 * from both sides).
 */
function ballena() {
  const b = materiaBuilder(112);
  const r = b.r;
  const c = new THREE.Color();
  const nrm: number[] = [];
  const radio = (t: number) => {
    const base = 0.4 + 3.3 * smoothstep(0.0, 0.46, t);
    if (t <= NARIZ) return base;
    return base * Math.pow(Math.max(0, 1 - Math.pow((t - NARIZ) / (1 - NARIZ), ROMO)), 1 / ROMO);
  };
  const piel = new THREE.Color(0.46, 0.6, 0.84);
  /** A point of skin at t along the body and a round it, facing out. */
  const enPiel = (t: number, a: number, color: THREE.Color, s: number, luz: number, alza = 1) => {
    const R = radio(t);
    const t0 = Math.max(0, t - 0.002);
    const t1 = Math.min(1, t + 0.002);
    const dR = (radio(t1) - radio(t0)) / ((t1 - t0) * LARGO);
    const sa = Math.sin(a);
    const ca = Math.cos(a);
    const k = 1 / Math.hypot(dR, sa / 0.9, ca);
    b.push(-LARGO / 2 + LARGO * t, sa * R * 0.9 * alza, ca * R * alza, color, s, luz, { kind: 0 });
    nrm.push(-dR * k, (sa / 0.9) * k, ca * k);
  };
  const suelto = (x: number, y: number, z: number, color: THREE.Color, s: number, luz: number, kind: number) => {
    b.push(x, y, z, color, s, luz, { kind });
    nrm.push(0, 0, 0);
  };
  /** Where a point of skin is from the eye: along and round, in units. */
  const R_OJO = radio(OJO_T);
  const delOjo = (t: number, a: number): [number, number] => [(t - OJO_T) * LARGO, (a - OJO_A) * R_OJO];
  const abierto = (dx: number, dy: number) => (dx / OJO_L) * (dx / OJO_L) + (dy / OJO_H) * (dy / OJO_H) < 1;

  for (let i = 0; i < 190000; i++) {
    const t = Math.pow(r(), 0.8);
    // Most of the skin is on lines that run along the body: its wrinkles.
    let a = r() * Math.PI * 2;
    const arruga = r() < 0.62 * (1 - smoothstep(0.56, 0.78, t));
    if (arruga) a = (Math.round((a / (Math.PI * 2)) * 70) / 70) * Math.PI * 2 + 0.012 * Math.sin(t * 60 + a * 9);
    // No skin over the eye, and less of it round the eye: it sits in a hollow.
    const [dx, dy] = delOjo(t, a);
    if (abierto(dx, dy)) continue;
    const hueco = 0.3 + 0.7 * smoothstep(1.0, 2.6, Math.hypot(dx / OJO_L, dy / (OJO_H * 1.6)));
    // Paler below, as they are.
    const vientre = Math.sin(a) < -0.45 ? 1.5 : 1;
    enPiel(t, a, piel, 0.05, (arruga ? 0.75 : 0.35) * vientre * hueco);
  }
  // The front of the head: blunt, and closed.
  for (let i = 0; i < 13000; i++) {
    const rho = Math.sqrt(r());
    const u = Math.pow(1 - Math.pow(rho, ROMO), 1 / ROMO);
    const a = r() * Math.PI * 2;
    const R = radio(NARIZ) * rho;
    // The normal of u^n + rho^n = 1, in units.
    const nx = Math.pow(u, ROMO - 1) / ((1 - NARIZ) * LARGO);
    const nr = Math.pow(rho, ROMO - 1) / radio(NARIZ);
    const k = 1 / Math.hypot(nx, nr);
    b.push(-LARGO / 2 + LARGO * (NARIZ + (1 - NARIZ) * u), Math.sin(a) * R * 0.9, Math.cos(a) * R, piel, 0.05, 0.35, { kind: 0 });
    nrm.push(nx * k, Math.sin(a) * nr * k, Math.cos(a) * nr * k);
  }
  // Scars: pale scratches, a few, across the wrinkles (none over the eye).
  for (let k = 0; k < 40; k++) {
    const t0 = 0.3 + r() * 0.62;
    const a0 = r() * Math.PI * 2;
    const dt = (r() - 0.5) * 0.05;
    const da = (r() - 0.5) * 0.5;
    const [ex, ey] = delOjo(t0 + dt / 2, a0 + da / 2);
    if (Math.hypot(ex, ey) < 1.9) continue;
    c.setRGB(0.9, 0.95, 1.0);
    for (let i = 0; i < 90; i++) {
      const u = i / 89;
      enPiel(t0 + dt * u, a0 + da * u, c, 0.04, 0.75, 1.004);
    }
  }
  // The flukes, and a flipper.
  for (let i = 0; i < 22000; i++) {
    const u = r();
    const lado = r() < 0.5 ? -1 : 1;
    const w = (1 - u * 0.75) * 5.4 * Math.pow(r(), 0.6);
    suelto(-LARGO / 2 - 3.2 * u + 0.9 * (w / 5.4), gauss(r) * 0.06, lado * w, piel, 0.05, 0.5, 2);
  }
  for (let i = 0; i < 7000; i++) {
    const u = r();
    const lado = r() < 0.5 ? -1 : 1;
    suelto(5.4 - 2.8 * u, -2.0 - 1.6 * u, lado * (2.9 + 1.5 * u * r()), piel, 0.05, 0.5, 2);
  }
  // The eye: small for such a body. A round opening with its lids, a few creases in the skin round
  // it that do not close, an iris round a pupil that stays dark, and one point of light in it.
  {
    const en = (dx: number, dy: number, s: number, luz: number) => enPiel(OJO_T + dx / LARGO, OJO_A + dy / R_OJO, c, s, luz, 1.005);
    c.setRGB(0.95, 0.98, 1.0);
    for (let i = 0; i < 230; i++) {
      const ang = (i / 230) * Math.PI * 2;
      en(Math.cos(ang) * OJO_L + gauss(r) * 0.004, Math.sin(ang) * OJO_H + gauss(r) * 0.004, 0.03, 0.3);
    }
    for (let k = 1; k <= 3; k++)
      for (const lado of [0, 1]) {
        const desde = (lado ? 1.15 : 0.2) * Math.PI + (r() - 0.5) * 0.5;
        const hasta = desde + (0.45 + r() * 0.3) * Math.PI;
        const n = 60 + 30 * k;
        for (let i = 0; i < n; i++) {
          const u = i / (n - 1);
          const ang = desde + (hasta - desde) * u;
          en(Math.cos(ang) * (OJO_L + 0.16 * k) + gauss(r) * 0.006, Math.sin(ang) * (OJO_H + 0.14 * k) + gauss(r) * 0.006, 0.03, (0.26 / k) * Math.sin(Math.PI * u));
        }
      }
    // The iris: denser at its edge; the pupil is the hole in it.
    c.setRGB(0.5, 0.68, 0.95);
    for (let i = 0; i < 300; i++) {
      const rr = 0.115 + 0.085 * Math.pow(r(), 0.6);
      const ang = r() * Math.PI * 2;
      en(Math.cos(ang) * rr, Math.sin(ang) * rr, 0.026, 0.32 + 0.3 * smoothstep(0.16, 0.2, rr));
    }
    c.setRGB(1.0, 1.0, 1.0);
    for (let i = 0; i < 7; i++) en(0.07 + gauss(r) * 0.008, 0.06 + gauss(r) * 0.008, 0.035, 1.8);
  }
  // The sparks: a thin sheath round the body, and a long wake behind the tail.
  for (let i = 0; i < 46000; i++) {
    const estela = r() < 0.6;
    const x = estela ? -LARGO / 2 - Math.pow(r(), 0.7) * 44 : -LARGO / 2 + LARGO * r();
    const t = clamp((x + LARGO / 2) / LARGO, 0, 1);
    const a = r() * Math.PI * 2;
    const R = (estela ? 1.0 : radio(t)) + Math.abs(gauss(r)) * (estela ? 2.6 : 0.5);
    c.setRGB(0.25, 0.62, 1.0).lerp(new THREE.Color(0.3, 1.0, 0.9), r() * 0.4);
    suelto(x, Math.sin(a) * R * 0.9, Math.cos(a) * R, c, 0.035, estela ? 0.8 * (1 + (x + LARGO / 2) / 44) : 0.6, 1);
  }
  return materia(b.data(), {
    pre: /* glsl */ `${LUZ}
      attribute vec3 aN;
      uniform float uPasa;`,
    move: /* glsl */ `
      // The tail beats: the wave runs down the body and grows towards the flukes.
      float cola = smoothstep(4.0, -15.0, p.x);
      p.y += 1.5 * sin(uTime * 0.8 + p.x * 0.14) * cola * cola;
      vec3 wp = (modelMatrix * vec4(p, 1.0)).xyz;
      if (aKind < 0.5) {
        // Skin: only the side that faces you, and your light falls on it as on a body.
        vec3 n = normalize(mat3(modelMatrix) * aN);
        float cara = smoothstep(-0.08, 0.3, dot(n, normalize(cameraPosition - wp)));
        float forma = 0.3 + 0.7 * max(dot(n, normalize(uTu - wp)), 0.0);
        em *= (tuyaEn(wp) * forma + ondaEn(wp) + 0.022 * uPasa) * cara;
      } else if (aKind > 1.5) em *= luzEn(wp) + 0.022 * uPasa;
      else em *= uPasa * pw(0.5 + 0.5 * sin(uTime * (1.5 + seed * 3.0) + seed * 80.0), 6.0) * 1.2;`,
    uniforms: { ...luzU(), uPasa: { value: 0 } },
    extra: { aN: [new Float32Array(nrm), 3] },
  });
}

export const acto3: Escena = {
  id: 'acto3',
  nombre: 'Acto III',
  estilos: [{ key: '1', nombre: 'El acto', nota: 'Caer pegado a la pared con los pensamientos; la llamada que deja ver el cañón; la ballena que sube; la fosa; la lluvia.' }],
  montar(stage, _estilo, viaje): Instancia {
    const root = stage.root;
    const { camera } = stage;
    stage.bloom.strength = 0.85;
    stage.bloom.radius = 0.75;
    stage.bloom.threshold = 0.1;
    stage.finish.uniforms.uGrain.value = 0.03;
    stage.finish.uniforms.uVignette.value = 0.75;

    const mar = pantalla(/* glsl */ `
      void main() {
        vec3 d = normalize(vDir);
        gl_FragColor = vec4(vec3(0.0016, 0.003, 0.009) * (0.6 + 0.6 * smoothstep(-0.8, 0.9, d.y)), 1.0);
      }`);
    root.add(mar.mesh);

    const { nube: roca, pared } = canon();
    root.add(roca.points);
    const animal = ballena();
    // Head up: it is going to the surface.
    animal.points.rotation.set(0, 0, Math.PI / 2);
    root.add(animal.points);

    // Two snows: the one close to your light, and a thin one further off that only a front shows.
    const snow = nevar(26000, 0);
    const lejos = nevar(26000, 0);
    lejos.points.scale.setScalar(3.2);
    lejos.u.uI.value = 0;
    root.add(snow.points, lejos.points);

    const bt = materiaBuilder(113);
    bt.push(0, 0, 0, TU, 0.03, 1);
    const tu = materia(bt.data());
    tu.u.uFuente.value = 1;
    root.add(tu.points);

    const tl = new Timeline();
    // y: how far you have fallen (the camera goes with you); roce: how close to the wall (1: a few
    // metres from it); pitch, yaw, fov: where the camera looks; luz, alc: your light and its reach;
    // raya: flakes as strokes; onda1, onda2: each call crossing (0 → 1); pasa: the whale going up
    // past you (0 → 1); clic: its click (0 → 1); m, min: the clock (the hour slows down).
    tl.set({ y: 0, roce: 0, pitch: -0.1, yaw: 0, fov: 46, luz: viaje ? 0.85 : 0, alc: 1, raya: 0, onda1: 0, onda2: 0, pasa: 0, clic: 0, m: 1000, min: 75 });
    const dichos: [number, number, number][] = [];
    const pensar = (cuales: number[], dur: number, pausa: number) => {
      for (const k of cuales) {
        tl.label('__');
        dichos.push([k, tl.at('__'), dur]);
        tl.wait(dur + pausa);
      }
    };
    tl.label('noche').caption(7.0, 'Medianoche', 'Aquí ya no llega nada de arriba. Lo único que ilumina es tu luz.');
    tl.to(2.4, { luz: 1, y: -3, m: 1080, min: 96, pitch: -0.26 });
    // The wall comes out of the dark, and its ledges start going up past you.
    tl.to(4.6, { y: -13, roce: 1, yaw: 0.42, pitch: -0.3, raya: 0.16, m: 1300, min: 140 });
    tl.label('tres').caption(13.0, 'Lo que piensas a las tres', '');
    tl.with(13.0, { y: -44, m: 1850, min: 172, alc: 0.9 });
    tl.with(6.5, { yaw: 0.62, pitch: -0.42 });
    pensar([0, 1], 2.6, 0.65);
    tl.with(6.5, { yaw: 0.3, pitch: -0.22 });
    pensar([2, 3], 2.6, 0.65);
    // The call: the camera leaves the wall, looks down and round, and you see where you are.
    tl.label('voz').caption(10.0, 'Una voz', 'A esta profundidad, una voz cruza un océano entero. Por un momento ves dónde estás.');
    tl.with(8.5, { onda1: 1 }, (t) => t);
    tl.to(4.0, { y: -51, roce: 0.15, pitch: -0.62, yaw: -0.2, fov: 72, raya: 0, m: 2000, min: 178 });
    tl.to(6.0, { y: -58, roce: 0, pitch: -0.36, yaw: -0.62, fov: 58, m: 2200, min: 181 });
    // The whale: from below, close, going up while you go down.
    tl.label('ballena').caption(15.0, 'Algo sube', 'Algo enorme sube a respirar. Te mira un momento. Y sigue.');
    tl.to(4.2, { pasa: 0.33, y: -62, yaw: 0.34, pitch: -0.7, fov: 62, m: 2300, min: 183 });
    tl.to(4.0, { pasa: 0.456, y: -64.3, yaw: 0.58, pitch: -0.14, fov: 52, m: 2380, min: 184.5 });
    // It looks at you: it almost stops, and the camera stays on its eye.
    tl.to(2.0, { pasa: 0.476, y: -64.9, yaw: 0.6, pitch: 0.16, fov: 50 });
    tl.with(2.2, { clic: 1 }, (t) => t);
    tl.to(2.2, { pasa: 0.6, y: -66.2, yaw: 0.5, pitch: 0.24, fov: 66 });
    tl.to(2.6, { pasa: 1, y: -69, yaw: 0.3, pitch: 0.86, fov: 60, m: 2600, min: 186 });
    tl.label('vuelven').caption(10.0, 'Vuelven', '');
    tl.with(10.0, { y: -88, roce: 0.8, m: 3000, min: 188, alc: 0.62, luz: 0.9, pitch: -0.3, yaw: 0.45, fov: 48, raya: 0.16 });
    pensar([0, 1, 2, 3], 1.5, 0.2);
    pensar([0, 1, 3], 0.95, 0.1);
    tl.wait(0.05);
    tl.label('otra').caption(8.0, 'Otra vez', 'Alguien llama. No contestas. Las paredes están más cerca.');
    tl.with(6.5, { onda2: 1 }, (t) => t);
    tl.to(3.5, { y: -94, roce: 0.1, pitch: -0.66, yaw: -0.1, fov: 70, m: 3200, min: 189, raya: 0 });
    tl.to(4.5, { y: -102, roce: 0, pitch: -0.3, yaw: -0.45, fov: 52, m: 3400, min: 189.6 });
    tl.label('estira').caption(7.0, 'El tiempo se estira', 'La profundidad sigue bajando. La hora, casi no.');
    tl.to(7.0, { y: -116, m: 3650, min: 190, alc: 0.5, luz: 0.8, yaw: 0.1, pitch: -0.2, fov: 46 });
    tl.label('lluvia').caption(6.0, 'Lluvia', 'Y entonces ya no es nieve.');
    tl.to(6.0, { y: -134, m: 3900, min: 190, luz: 0.7, alc: 0.45, raya: 1, pitch: -0.05, yaw: 0 });

    // Where each call comes from: far above and behind where you are when it starts.
    const origen = (label: string) => V(-26, tl.get('y', tl.at(label)) + 84, 34);
    const O1 = origen('voz');
    const O2 = origen('otra');
    const dir = V();
    const tuEn = V();
    const cabeza = V();

    return {
      tl,
      luzEntrada: TU.clone(),
      chispa: tuEn,
      chispaLuz: tu,
      luzSalida: TU.clone(),
      cuenta: (p) => ({ m: tl.get('m', p), min: tl.get('min', p) }),
      rotulo(p): Rotulo | null {
        const cp = tl.captionAt(p);
        return cp ? { capitulo: 'III · Medianoche', name: cp.name, fact: cp.fact } : null;
      },
      placa(g, f) {
        for (const [k, desde, dur] of dichos) pensamiento(g, f.u, f.W * 0.5, f.H * 0.3, PENSAMIENTOS[k], ((f.p - desde) / dur) * 2);
      },
      update(f: Frame) {
        const p = f.p;
        const y = tl.get('y', p);
        const yaw = tl.get('yaw', p) + 0.012 * Math.sin(f.time * 0.11);
        const pitch = tl.get('pitch', p) + 0.008 * Math.sin(f.time * 0.14);
        camera.near = 0.03;
        camera.far = 500;
        camera.fov = tl.get('fov', p);
        // Beside the wall, following its shape, a few metres off.
        const x = (pared(y) - 6.6) * tl.get('roce', p);
        camera.position.set(x, y, 0);
        dir.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
        camera.up.set(0, 1, 0);
        camera.lookAt(x + dir.x, y + dir.y, dir.z);
        camera.updateMatrixWorld();

        // You: ahead of the camera and a little below where it looks.
        // (It opens where act II left it, a little lower in the frame, and comes up to its place.)
        tuEn.set(x + Math.sin(yaw * 0.8) * 2.6, y - 0.1 - 0.27 * (1 - smoothstep(0, 5, f.p)) + Math.sin(pitch * 0.5) * 2.6, -Math.cos(yaw * 0.8) * 2.6);
        tu.points.position.copy(tuEn);
        const luz = tl.get('luz', p) * (0.93 + 0.07 * Math.sin(f.time * 1.1));
        const alc = tl.get('alc', p);
        enfocar(tu, f.focal, f.dpr, f.time);
        tu.u.uMinPx.value = 5 * f.dpr;
        tu.u.uGain.value = 2.6 * luz;

        // The whale goes up past you on your right; it slows as its eye comes level with you.
        const pasa = tl.get('pasa', p);
        animal.points.visible = pasa > 0.001 && pasa < 0.999;
        animal.points.position.set(x + 6.4, y - 52 + 104 * pasa - 0.5 * (OJO_T - 0.5) * LARGO, -6.2);
        animal.points.rotation.y = -0.5;
        animal.points.updateMatrixWorld();
        cabeza.set(LARGO * 0.46, 0, 0).applyMatrix4(animal.points.matrixWorld);

        // The front that is crossing now, if any: a call, or the whale's own click.
        const o1 = tl.get('onda1', p);
        const o2 = tl.get('onda2', p);
        const cl = tl.get('clic', p);
        let O = O1;
        let R = 0;
        let I = 0;
        let W = 4;
        let cola = 80;
        if (cl > 0 && cl < 1) {
          // The click is a thin front: it runs down its body and out to the rock, and is gone.
          O = cabeza;
          R = 70 * cl;
          I = Math.sin(Math.PI * cl) * 0.6;
          W = 1.6;
          cola = 9;
        } else if (o1 > 0 && o1 < 1) {
          R = 40 + 190 * o1;
          I = Math.sin(Math.PI * o1);
        } else if (o2 > 0 && o2 < 1) {
          O = O2;
          R = 40 + 190 * o2;
          I = Math.sin(Math.PI * o2);
        }

        for (const n of [roca, animal]) {
          enfocar(n, f.focal, f.dpr, f.time);
          n.u.uMinPx.value = 1.4 * f.dpr;
          n.u.uMaxPx.value = 7 * f.dpr;
          (n.u.uTu.value as THREE.Vector3).copy(tuEn);
          (n.u.uOndaO.value as THREE.Vector3).copy(O);
          n.u.uAlc.value = alc;
          n.u.uLuzI.value = luz;
          n.u.uOndaR.value = R;
          n.u.uOndaI.value = I;
          n.u.uOndaW.value = W;
          n.u.uOndaCola.value = cola;
        }
        roca.u.uGain.value = 4.4;
        roca.u.uFog.value = 170;
        animal.u.uGain.value = 1.7;
        animal.u.uPasa.value = Math.sin(Math.PI * clamp(pasa, 0, 1));

        // The flakes stay where they are while you fall past them.
        for (const [n, k] of [
          [snow, 1],
          [lejos, 3.2],
        ] as const) {
          n.points.position.set(x, y, 0);
          n.u.uTime.value = f.time;
          n.u.uFocal.value = f.focal;
          n.u.uDpr.value = f.dpr;
          n.u.uCae.value = (0.75 * y) / k;
          n.u.uRaya.value = tl.get('raya', p);
          n.u.uOndaO.value.copy(O).sub(n.points.position).divideScalar(k);
          n.u.uOndaR.value = R / k;
          n.u.uOndaI.value = I * (k > 1 ? 0.5 : 0.9);
        }
        snow.u.uLuz.value.copy(tuEn).sub(snow.points.position);
        snow.u.uI.value = luz;
        snow.u.uAlc.value = alc;
      },
      dispose() {},
    };
  },
};
