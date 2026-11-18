import * as THREE from 'three';
import { Timeline } from './timeline';
import { pantalla } from '../src/engine/pantalla';
import { enfocar, materia, materiaBuilder } from '../src/engine/materia';
import { gauss, smoothstep } from '../src/engine/math';
import { FONT, ink, type Rotulo } from './placa';
import { BIO, CARMIN, ease, FONDO_M, SEGURO, TU, V } from './comun';
import { marYCiudad } from './gota';
import { nevar } from './nieve';
import { ruidoJS } from './acto3';
import { ARRIBA, rayos, ultimos } from './acto2';
import type { Escena, Frame, Instancia } from './tipos';

/**
 * Act VI · The way up (all the zones backwards, 1 100 → 1 atm, until dawn), as one long take
 * (13 Nov 2026; Diego: the act with most to give, and it was being wasted). What it replaces was
 * two lights in the middle of the frame, snow, and a flat diagram of bars of colour.
 *
 * The camera goes round the two lights, yours and the other one with the thread between them,
 * all the way up: one full turn in eleven kilometres. It starts over them, looking down: the plain
 * of living lights falls away, and in it the spiral, which from here is a galaxy; the work opened
 * falling out of one. The camera comes down beside you and then under you, among jellyfish that
 * rise at their own pace. Far above, the first blue; then its shafts, the same ones of act II, and
 * you go up among them while everything that went up last night comes back down past you. Then the
 * green begins, the yellow, the orange, the red: you go up through each colour where the water
 * lets it start, and this time it is the Sun, so they are whole. Over you the surface is a circle
 * of dawn. You cross it. It is not raining. The same city as in the opening, across the water, in
 * the first light. The last sentence and, under it, where to find help (BRIEF § Cuidado, 5). It
 * ends in two points.
 *
 * It is not a happy ending: the sentence does not promise anything, and the dawn is the first
 * light, not a blaze.
 */

/** How far under the surface (y = 0) the floor is, in units. */
const SUELO = 364;
/** Where the spiral lies on the plain. */
// (Where act V leaves it: the same place from the two lights, the same animal.)
const ESPIRAL = V(-12.8, -SUELO + 13.8, -21.5);

/**
 * What lives down here. Kinds: 0 a spark (the plain, the spiral, the water); 1 the bell of a
 * jellyfish; 2 what hangs from it. `aC` is the centre of the animal a point belongs to and `aFase`
 * its own time.
 */
function vida() {
  const b = materiaBuilder(141);
  const r = b.r;
  const c = new THREE.Color();
  const aC: number[] = [];
  const aFase: number[] = [];
  const f = ruidoJS(41);
  const tinte = () => {
    const k = r();
    if (k < 0.62) c.copy(BIO).lerp(new THREE.Color(0.35, 0.8, 1.0), r() * 0.6);
    else if (k < 0.88) c.setRGB(0.2, 0.9, 0.85);
    else c.setRGB(0.55, 0.45, 1.0);
    return c;
  };
  const pon = (x: number, y: number, z: number, col: THREE.Color, s: number, luz: number, kind: number, cx = 0, cy = 0, cz = 0, fase = 0) => {
    b.push(x, y, z, col, s, luz, { kind });
    aC.push(cx, cy, cz);
    aFase.push(fase);
  };
  // The plain: a country of sparks, in patches, as far as you can see from above.
  for (let n = 0; n < 150000; ) {
    const d = 190 * Math.sqrt(r());
    const a = r() * Math.PI * 2;
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (f(x * 0.035 + 9, z * 0.035) * 1.7 - 0.25 < r()) continue;
    pon(x, -SUELO + Math.abs(gauss(r)) * 1.4, z, tinte(), 0.11, 0.7 + 1.3 * r(), 0);
    n++;
  }
  // The spiral: the colony act V found, as it is there (one coil, a fringe hanging from every
  // turn, tilted in the water), so the change of act does not change it (kind 3).
  {
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
      const tipo = q < 0.3 ? 0 : q < 0.75 ? 1 : 2;
      const j = tipo === 0 ? 0.12 : tipo === 1 ? 0.3 : 1.25;
      const cuelga = tipo === 1 ? -Math.pow(r(), 1.3) * 2.3 : tipo === 2 ? gauss(r) * 0.5 : 0;
      const [x, y, z] = girar(Math.cos(ang) * rad + gauss(r) * j, cuelga + gauss(r) * 0.05, Math.sin(ang) * rad + gauss(r) * j);
      if (tipo === 0) c.setRGB(0.86, 0.93, 1.0).lerp(new THREE.Color(1.0, 0.9, 0.78), 1 - sp);
      else if (tipo === 1) c.setRGB(0.3, 0.62, 1.0);
      else c.setRGB(0.4, 0.55, 1.0);
      pon(ESPIRAL.x + x, ESPIRAL.y + y, ESPIRAL.z + z, c, tipo === 0 ? 0.05 : 0.045, tipo === 0 ? 0.5 : tipo === 1 ? 0.42 : 0.2, 3);
    }
    for (let i = 0; i < 6000; i++) {
      const [x, y, z] = girar(gauss(r) * 1.0, gauss(r) * 0.35, gauss(r) * 1.0);
      c.setRGB(1.0, 0.93, 0.8);
      pon(ESPIRAL.x + x, ESPIRAL.y + y, ESPIRAL.z + z, c, 0.06, 0.55, 3);
    }
  }
  // Sparks in the water, all the way up to where the light begins; fewer the higher.
  for (let i = 0; i < 130000; i++) {
    const d = 3 + 46 * Math.sqrt(r());
    const a = r() * Math.PI * 2;
    pon(Math.cos(a) * d, -SUELO + 250 * Math.pow(r(), 1.5), Math.sin(a) * d, tinte(), 0.085, 0.5 + 1.1 * r(), 0);
  }
  // Jellyfish, near and far, each rising at its own pace. One of them is enormous.
  const medusa = (cx: number, cy: number, cz: number, R: number) => {
    const fase = r() * 40;
    const col = tinte().clone();
    const palida = col.clone().lerp(new THREE.Color(0.9, 0.95, 1.0), 0.5);
    const n = Math.round(700 + 500 * R);
    for (let i = 0; i < n; i++) {
      // The bell: more of it on its ribs and at its rim.
      const th = Math.acos(1 - r() * (r() < 0.3 ? 1 : 0.35) - (r() < 0.3 ? 0 : 0.65));
      let fi = r() * Math.PI * 2;
      const costilla = r() < 0.55;
      if (costilla) fi = (Math.round((fi / (Math.PI * 2)) * 14) / 14) * Math.PI * 2;
      pon(cx + R * Math.sin(th) * Math.cos(fi), cy + R * 0.75 * Math.cos(th), cz + R * Math.sin(th) * Math.sin(fi), costilla ? palida : col, 0.05, costilla ? 0.9 : 0.45, 1, cx, cy, cz, fase);
    }
    const hilos = 10 + Math.floor(r() * 6);
    for (let h = 0; h < hilos; h++) {
      const fi = (h / hilos) * Math.PI * 2 + r() * 0.3;
      const largo = R * (2.2 + 2.6 * r());
      const centro = h % 3 === 0;
      const rr = centro ? R * 0.25 : R * 0.96;
      for (let i = 0; i < 90; i++) {
        const t = i / 89;
        pon(cx + rr * Math.cos(fi) * (1 - 0.3 * t), cy - t * largo * (centro ? 0.6 : 1), cz + rr * Math.sin(fi) * (1 - 0.3 * t), centro ? palida : col, 0.04, (centro ? 0.8 : 0.5) * (1 - 0.75 * t), 2, cx, cy, cz, fase);
      }
    }
  };
  for (let k = 0; k < 120; k++) {
    const d = 3.5 + 26 * Math.pow(r(), 0.9);
    const a = r() * Math.PI * 2;
    medusa(Math.cos(a) * d, -SUELO + 22 + 215 * r(), Math.sin(a) * d, 0.35 + 1.1 * r() * r());
  }
  medusa(-6.5, -SUELO + 112, -4.5, 3.4);
  return materia(b.data(), {
    pre: /* glsl */ `
      attribute vec3 aC;
      attribute float aFase;
      uniform float uVida, uPlano, uRaso;
      ${SEGURO}`,
    move: /* glsl */ `
      if (aKind < 0.5 || aKind > 2.5) {
        // From low over it the far plain would pile up into a line: it is only there when you are over it.
        if (aKind < 0.5 && p.y < ${(-SUELO + 8).toFixed(1)}) em *= 1.0 - uRaso * smoothstep(14.0, 60.0, length(p.xz - cameraPosition.xz));
        em *= (aKind > 2.5 || p.y < ${(-SUELO + 8).toFixed(1)} ? uPlano : uVida) * (0.35 + 0.65 * pw(0.5 + 0.5 * sin(uTime * (0.6 + seed * 1.6) + seed * 90.0), 2.0));
      } else {
        vec3 rel = p - aC;
        // It swims: the bell closes and opens, and what hangs from it follows late.
        float late = sin(uTime * 1.1 + aFase);
        if (aKind < 1.5) {
          float borde = smoothstep(0.9, 0.0, rel.y / max(length(rel), 1e-4));
          rel.xz *= 1.0 - 0.16 * late * borde;
        } else {
          float abajo = clamp(-rel.y, 0.0, 30.0);
          rel.xz *= 1.0 - 0.16 * sin(uTime * 1.1 + aFase - 0.5 * abajo) / (1.0 + 0.3 * abajo);
          rel.x += 0.12 * abajo * sin(uTime * 0.6 + aFase + abajo * 0.7);
          rel.z += 0.12 * abajo * cos(uTime * 0.5 + aFase * 1.3 + abajo * 0.6);
        }
        p = aC + rel;
        p.y += 0.4 * sin(uTime * 0.3 + aFase);
        em *= uVida * (0.7 + 0.3 * late);
      }`,
    uniforms: { uVida: { value: 1 }, uPlano: { value: 1 }, uRaso: { value: 0 } },
    extra: { aC: [new Float32Array(aC), 3], aFase: [new Float32Array(aFase), 1] },
  });
}

/** The plane the skyline is drawn on, how wide it is and how tall the tallest thing on it. */
const PLANO_Z = -28;
const PERFIL_ANCHO = 96;
const PERFIL_ALTO = 14;
/** Where the camera is at the end, which is where the skyline is seen from. */
const MIRA = V(0, 2.5, 2.6);

/**
 * The sky, the city against it and the sea, from above and from below. The end uses it at dawn;
 * the opening, on the night it rains (uNoche, uLluvia): the same place, before.
 */
const FONDO = /* glsl */ `
  uniform float uM, uSobre, uCielo, uAzul, uAlba, uNoche, uLluvia;
  uniform vec3 uCam, uSol;
  uniform sampler2D uPerfil;
  ${SEGURO}
  float perfil(float x) { return abs(x) < ${(PERFIL_ANCHO / 2).toFixed(1)} ? texture2D(uPerfil, vec2(x / ${PERFIL_ANCHO.toFixed(1)} + 0.5, 0.5)).r * ${PERFIL_ALTO.toFixed(1)} : 0.0; }
  // How much of the city stands between you and the sky, looking from o along d.
  float tapa(vec3 o, vec3 d) {
    if (d.z > -1e-3) return 0.0;
    float t = (${PLANO_Z.toFixed(1)} - o.z) / d.z;
    float y = o.y + d.y * t;
    return y > -0.02 ? smoothstep(0.05, -0.05, y - perfil(o.x + d.x * t)) : 0.0;
  }
  // The sky before sunrise: night still overhead, rose under it and, where the Sun is going to
  // come up, orange. Thin clouds, lit from below. uAlba: how far the day has come.
  vec3 cielo(vec3 d) {
    float e = max(d.y, 0.0);
    vec2 hz = normalize(d.xz + 1e-5);
    float k = pw(0.5 + 0.5 * dot(hz, normalize(uSol.xz)), 2.0);
    vec3 alto = mix(vec3(0.03, 0.05, 0.12), vec3(0.05, 0.1, 0.22), uAlba);
    vec3 rosa = mix(vec3(0.15, 0.08, 0.15), vec3(0.3, 0.15, 0.19), uAlba);
    vec3 naranja = mix(vec3(0.3, 0.12, 0.06), vec3(0.5, 0.25, 0.09), uAlba);
    vec3 c = mix(alto, rosa, exp(-e * 4.5) * (0.3 + 0.7 * k));
    c = mix(c, naranja, exp(-e * 13.0) * (0.2 + 0.8 * k));
    vec2 q = d.xz / (e + 0.14);
    float n = fbm(q * vec2(0.42, 1.5) + vec2(uTime * 0.004, 3.0));
    float nube = smoothstep(0.46, 0.72, n) * smoothstep(0.015, 0.1, e) * smoothstep(0.95, 0.35, e);
    vec3 cn = mix(vec3(0.03, 0.035, 0.07), mix(vec3(0.3, 0.12, 0.14), vec3(0.85, 0.42, 0.3), uAlba), k * exp(-e * 3.2));
    c = mix(c, cn, nube * 0.75);
    float cs = dot(d, uSol);
    c += vec3(1.0, 0.5, 0.2) * (exp((cs - 1.0) * 55.0) * 0.1 + exp((cs - 1.0) * 700.0) * 0.3) * uAlba;
    c += vec3(1.5, 0.95, 0.45) * smoothstep(0.99986, 0.99991, cs);
    if (uNoche > 0.001) {
      // The night it rains: a low ceiling of cloud, lit from below by the city.
      float kc = pw(0.5 - 0.5 * hz.y, 2.0);
      float nn = fbm(d.xz / (e + 0.2) * vec2(0.5, 0.9) + vec2(uTime * 0.012, 0.0));
      vec3 noche = vec3(0.008, 0.011, 0.022) + vec3(0.016, 0.02, 0.034) * nn;
      noche += vec3(0.17, 0.075, 0.035) * exp(-e * 6.0) * (0.2 + 0.8 * kc) * (0.45 + 0.9 * nn);
      c = mix(c, noche, uNoche);
    }
    return c * uCielo;
  }
  // The rings the rain leaves on the water.
  float gotas(vec2 q) {
    float s = 0.0;
    for (int k = 0; k < 2; k++) {
      vec2 g = q * (k == 0 ? 1.3 : 2.1) + float(k) * 13.7;
      vec2 i = floor(g);
      vec2 hh = h22(i);
      float t = fract(uTime * 0.6 + hh.x * 9.0);
      float r = length(fract(g) - 0.5 - (hh - 0.5) * 0.4);
      s += exp(-pw(abs(r - t * 0.4) / 0.035, 2.0)) * (1.0 - t);
    }
    return s;
  }
  // The sky with the city standing dark against it.
  vec3 arriba(vec3 o, vec3 d) {
    vec3 c = cielo(d);
    vec3 bruma = cielo(vec3(d.x, 0.03, d.z));
    return mix(c, vec3(0.006, 0.007, 0.012) * uCielo + bruma * 0.07, tapa(o, d));
  }
  // The sea from above: a mirror that does not keep still.
  vec3 mar(vec3 d) {
    float t = uCam.y / max(-d.y, 1e-3);
    vec2 q = uCam.xz + d.xz * t;
    // Past the city there is no sea: the shore, dark.
    if (q.y < ${(PLANO_Z + 1).toFixed(1)}) return vec3(0.006, 0.007, 0.012) * uCielo + cielo(vec3(d.x, 0.03, d.z)) * 0.05;
    float lejos = 1.0 / (1.0 + 0.045 * t);
    vec2 w = vec2(fbm(q * vec2(0.7, 1.9) + vec2(uTime * 0.11, 0.0)), fbm(q * vec2(0.7, 1.9) + vec2(5.2, -uTime * 0.13))) - 0.47;
    float go = gotas(q) * uLluvia * lejos;
    w += go * 0.45;
    vec3 r = normalize(vec3(d.x + w.x * 0.5 * lejos, -d.y + 0.015 + abs(w.y) * 0.4 * lejos, d.z));
    vec3 c = arriba(vec3(q.x, 0.0, q.y), r);
    return vec3(0.003, 0.009, 0.016) * uCielo + c * (1.0 + 2.0 * go) * mix(0.3, 0.9, pw(1.0 + d.y, 4.0));
  }
  // Under the water: its own colour, and overhead the circle everything above fits in (Snell's
  // window), which is the same sky, bent, with the city on its rim.
  vec3 debajo(vec3 d) {
    float h = max(-uCam.y, 0.0);
    float up = smoothstep(-0.6, 1.0, d.y);
    // (Kept under what the bloom takes for a light: a bright sky of water turns into one white stain.)
    vec3 agua = mix(vec3(0.003, 0.014, 0.05), vec3(0.01, 0.075, 0.11), exp(-uM / 45.0)) * uAzul * (0.1 + 0.9 * exp(-uM / 240.0)) * (0.25 + 1.1 * up);
    if (d.y > 0.03 && h < 160.0) {
      float t = h / d.y;
      vec2 q = uCam.xz + d.xz * t;
      float am = 0.26 / (1.0 + 0.06 * t);
      vec2 w = vec2(fbm(q * 0.9 + vec2(uTime * 0.2, 0.0)), fbm(q * 0.9 + vec2(3.1, -uTime * 0.17))) - 0.47;
      vec3 n = normalize(vec3(d.x + w.x * am, d.y, d.z + w.y * am));
      float sa = 1.333 * length(n.xz);
      float dentro = smoothstep(1.0, 0.92, sa);
      float sc = min(sa, 0.9995);
      vec3 aire = vec3(normalize(n.xz + 1e-5) * sc, sqrt(1.0 - sc * sc)).xzy;
      vec3 c = arriba(vec3(q.x, 0.0, q.y), aire);
      // The net of light the waves draw on the underside.
      float red = pw(1.0 - abs(fbm(q * 1.5 + vec2(0.0, uTime * 0.12)) - 0.5) * 2.0, 5.0) / (1.0 + 0.03 * t);
      red = mix(red, 0.3 * red + 1.5 * gotas(q) / (1.0 + 0.05 * t), uLluvia);
      vec3 pasa = exp(-t * vec3(0.085, 0.028, 0.02));
      agua += c * (1.0 + 0.7 * red) * dentro * pasa * (0.8 + 1.0 * (1.0 - exp(-h / 12.0)));
      agua += vec3(0.018, 0.05, 0.06) * (1.0 - dentro) * red * exp(-t * 0.07) * uCielo;
      // Light coming down from the circle in beams.
      float a = atan(d.z, d.x);
      float haz = pw(fbm(vec2(a * 5.0, uTime * 0.06 + 9.0)), 2.0) * smoothstep(0.75, 0.5, d.y) * smoothstep(0.05, 0.4, d.y);
      agua += vec3(0.16, 0.3, 0.3) * haz * exp(-h / 26.0) * 0.5 * uCielo;
    }
    return agua;
  }
  void main() {
    vec3 d = normalize(vDir);
    vec3 c = vec3(0.0);
    if (uSobre < 0.999) c += debajo(d) * (1.0 - uSobre);
    if (uSobre > 0.001) c += (d.y > 0.0 ? arriba(uCam, d) : mar(d)) * uSobre;
    gl_FragColor = vec4(c, 1.0);
  }
`;

/** The background of a scene by this sea: the sky, the skyline of these buildings and the water. */
export function cieloYMar(edificios: { x: number; z: number; ancho: number; alto: number }[]) {
  // The skyline, as the end's camera sees it against the sky: how tall the city stands at each x.
  const perfil = new Uint8Array(2048);
  const dz = MIRA.z - PLANO_Z;
  const alX = (i: number) => ((i + 0.5) / 2048 - 0.5) * PERFIL_ANCHO;
  for (const e of edificios) {
    const s = dz / (MIRA.z - e.z);
    const tope = Math.round((255 * (MIRA.y + (e.alto + 0.6 - MIRA.y) * s)) / PERFIL_ALTO);
    const i0 = Math.floor((((e.x - e.ancho * 0.56) * s) / PERFIL_ANCHO + 0.5) * 2048);
    const i1 = Math.ceil((((e.x + e.ancho * 0.44) * s) / PERFIL_ANCHO + 0.5) * 2048);
    for (let i = Math.max(0, i0); i < Math.min(2048, i1); i++) perfil[i] = Math.max(perfil[i], tope);
  }
  const tex = new THREE.DataTexture(perfil, 2048, 1, THREE.RedFormat);
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  // Where the Sun comes up: over the lowest roofs there are, off the middle of the frame.
  let solX = 8;
  let solTope = 1e9;
  for (let x = -17; x <= 17; x += 0.25) {
    if (Math.abs(x) < 9) continue;
    let t = 0;
    for (let i = 0; i < 2048; i++) if (Math.abs(alX(i) - x) < 1.1) t = Math.max(t, perfil[i]);
    if (t < solTope) [solTope, solX] = [t, x];
  }
  const SOL_AZ = Math.atan2(solX, dz);
  const SOL_FIN = Math.atan2((solTope / 255) * PERFIL_ALTO - MIRA.y, Math.hypot(solX, dz)) - 0.006;

  const film = pantalla(FONDO, { uM: { value: FONDO_M }, uSobre: { value: 0 }, uCielo: { value: 0 }, uAzul: { value: 0 }, uAlba: { value: 0 }, uCam: { value: V() }, uSol: { value: V(0, 0, -1) }, uPerfil: { value: tex }, uNoche: { value: 0 }, uLluvia: { value: 0 } });
  return { film, SOL_AZ, SOL_FIN };
}

export const acto6: Escena = {
  id: 'acto6',
  nombre: 'Acto VI',
  estilos: [{ key: '1', nombre: 'El acto', nota: 'Una vuelta entera alrededor de las dos luces mientras suben: la llanura y la espiral desde arriba, las medusas, las columnas azules, todos los que bajan, cada color, la superficie al amanecer y la ciudad.' }],
  montar(stage): Instancia {
    const root = stage.root;
    const { camera } = stage;
    stage.bloom.strength = 0.6;
    stage.bloom.radius = 0.7;
    stage.bloom.threshold = 0.2;
    stage.finish.uniforms.uGrain.value = 0.03;
    stage.finish.uniforms.uVignette.value = 0.65;

    // The circle of sky is in the background now; the sheet of points only glints on it.
    const mundo = marYCiudad({ lleno: 0.25, aro: 1, espejo: 1 });

    const { film, SOL_AZ, SOL_FIN } = cieloYMar(mundo.edificios);
    root.add(film.mesh);
    const vivas = vida();
    // The Sun's rays: their top is the surface.
    const luces = rayos(true);
    luces.points.position.y = -ARRIBA;
    const bajan = ultimos();
    const snow = nevar(26000, 0);
    snow.u.uCol.value.setRGB(0.7, 0.8, 0.9);
    snow.u.uI.value = 0;
    root.add(mundo.points, vivas.points, luces.points, bajan.points, snow.points);

    // The two lights: yours and the other one. They are not tied: they go round each other, come
    // close and part, one ahead and then the other.
    const uno = (col: THREE.Color, semilla: number, luz: number) => {
      const bb = materiaBuilder(semilla);
      bb.push(0, 0, 0, col, 0.03, luz);
      const n = materia(bb.data());
      n.u.uFuente.value = 1;
      return n;
    };
    const tu = uno(TU, 91, 1);
    const otra = uno(CARMIN, 93, 1.5);
    // Nothing ties them (Diego: a line between them reads as something else). What there is
    // between them is how they move: round each other, close and apart, one answering the other.
    // And what each leaves behind as it climbs: a tail, white where it has just been and its own
    // colour further back (kinds 1 and 2), and sparks that come off it and drift (kinds 3 and 4).
    // Because they go round each other, the two tails braid.
    const bl = materiaBuilder(92);
    const gris = new THREE.Color(1, 1, 1);
    for (let i = 0; i < 7000; i++) bl.push(0, 0, 0, gris, 0.006, 1, { kind: 1 + (i % 2) });
    for (let i = 0; i < 5000; i++) bl.push(0, 0, 0, gris, 0.011, 1, { kind: 3 + (i % 2) });
    const lazo = materia(bl.data(), {
      pre: /* glsl */ `
        uniform vec3 uP, uColA, uColB;
        uniform float uAng, uYaw, uSep, uAlt, uEstela, uJuego;
        ${SEGURO}`,
      move: /* glsl */ `
        float lado = mod(aKind, 2.0) > 0.5 ? -1.0 : 1.0;
        float suelta = step(2.5, aKind);
        float h = fract(seed * 9.7);
        float edad = fract(seed * 13.0 + uTime * mix(0.16 + 0.1 * h, 0.05 + 0.05 * h, suelta));
        // Where its light was a while ago: further back round the turn, and further down.
        float atras = edad * mix(1.0, 0.8, suelta);
        float a = uAng - atras * 5.2 * uJuego;
        float th = a - uYaw;
        float sx = lado * uSep * (1.0 + 0.5 * atras);
        vec3 o = vec3(sx * cos(th), lado * uAlt * sin(a * 0.7 + 1.0), -sx * sin(th));
        vec3 azar = vec3(h11(seed * 31.0), h11(seed * 57.0), h11(seed * 91.0)) - 0.5;
        p = uP + o - vec3(0.0, atras * 3.2, 0.0);
        // The tail is tight; the sparks leave it and wander.
        p += azar * mix(0.008 + 0.07 * edad, 0.04 + 0.75 * edad, suelta);
        p.xz += suelta * 0.12 * edad * vec2(sin(uTime * 0.5 + seed * 40.0), cos(uTime * 0.43 + seed * 23.0));
        vec3 propio = lado < 0.0 ? uColA : uColB;
        vec3 col = mix(vec3(1.0), propio, smoothstep(0.0, 0.14, edad));
        col = mix(col, propio * vec3(0.55, 0.65, 1.35), smoothstep(0.3, 1.0, edad));
        float titila = pw(0.5 + 0.5 * sin(uTime * (1.2 + 3.0 * fract(seed * 5.3)) + seed * 50.0), mix(1.0, 4.0, suelta));
        em = col * mix(0.5 * pw(1.0 - edad, 1.6) * (0.6 + 0.4 * titila), 1.1 * pw(1.0 - edad, 1.2) * titila, suelta) * uEstela;`,
      uniforms: {
        uP: { value: V() },
        uColA: { value: TU.clone() },
        uColB: { value: CARMIN.clone() },
        uAng: { value: 0 },
        uYaw: { value: 0 },
        uSep: { value: 0.26 },
        uAlt: { value: 0 },
        uEstela: { value: 1 },
        uJuego: { value: 1 },
      },
    });
    root.add(tu.points, otra.points, lazo.points);
    const tuEn = V();
    const otraEn = V();

    const tl = new Timeline();
    // y: the two lights' height (0 is the surface); D, pitch, yaw, fov: the camera, which goes
    // round them (pitch below 0: it is over them, looking down); gira: the pair turning; m, min:
    // the clock; plano: the plain you leave; vida: what lives in the water; azul: the blue of the
    // water; rayos: the Sun's rays; bajan, baj: everything that went up last night, going back down
    // past you; mundo, cielo: the surface and the sky; parY: the two lights lower in the frame;
    // par, frase, ayuda, hud: the end.
    tl.set({ y: -SUELO + 4, D: 12.5, pitch: -0.26, yaw: -0.31, fov: 60, gira: 0, m: FONDO_M, min: 260, plano: 1, vida: 1, azul: 0, rayos: 0, bajan: 0, baj: 0, mundo: 0, cielo: 0, parY: 0, par: 1, frase: 0, ayuda: 0, hud: 1, alba: 0, juego: 1, abre: 1 });
    tl.label('sube').caption(9.0, 'Subir acompañado', 'Las luces suben contigo.');
    // Over the two of you, looking down: the plain falls away, and the spiral in it.
    // It opens where act V ends: back from the two of you, the spiral beyond. Then it comes over you.
    tl.to(4.5, { y: -SUELO + 26, pitch: -0.95, yaw: -0.5, D: 3.4, fov: 56, m: 9000, min: 275, abre: 0 });
    tl.to(4.5, { y: -SUELO + 70, pitch: 0.15, yaw: 1.7, D: 3.0, m: 6500, min: 292, plano: 0.6 });
    tl.label('cerca').caption(10.0, 'De cerca', 'El universo no te da un sentido. Tampoco te lo quita. Ese se hace de cerca.');
    tl.to(4.0, { y: -SUELO + 105, D: 1.5, pitch: 0.3, yaw: 2.5, gira: 1.2, fov: 50, m: 4200, min: 310, plano: 0 });
    tl.to(6.0, { y: -SUELO + 150, D: 2.2, pitch: 0.7, yaw: 3.2, gira: 2.2, m: 1500, min: 330 });
    // Under you now, looking up: far above, the first blue, and then its shafts.
    tl.label('azul').caption(8.0, 'Vuelve el azul', 'Arriba amanece. Primero vuelve el azul.');
    tl.to(8.0, { y: -149, pitch: 1.0, yaw: 3.8, D: 2.8, fov: 64, m: 400, min: 356, azul: 1, rayos: 1, bajan: 0.6, baj: 3, vida: 0.5 });
    tl.label('bajan').caption(8.0, 'Todos bajan', 'Todo lo que subió anoche vuelve a bajar. Tú subes.');
    tl.to(8.0, { y: -64, pitch: 0.35, yaw: 4.5, m: 120, min: 372, bajan: 1, baj: 11, vida: 0.15 });
    // Up through each colour, where the water lets it begin.
    tl.label('colores').caption(10.0, 'Y lo demás', 'Después el verde. El amarillo. Al final, el rojo.');
    tl.to(5.0, { y: -24, pitch: 0.8, yaw: 5.1, fov: 76, m: 45, min: 384, bajan: 0.3, baj: 15, mundo: 0.6, cielo: 1 });
    tl.to(5.0, { y: -6, pitch: 1.1, yaw: 5.6, D: 3.2, m: 7, min: 392, bajan: 0, baj: 17, mundo: 1, vida: 0 });
    tl.label('superficie').caption(8.0, 'La superficie', 'Amanece. Ya no llueve.');
    tl.to(2.6, { y: -0.6, pitch: 0.9, yaw: 5.9, m: 0.5, min: 395 });
    tl.to(2.4, { y: 1.0, pitch: 0.4, yaw: 6.1, fov: 60, m: 0, rayos: 0, min: 397 });
    tl.to(3.0, { y: 1.3, pitch: 0.03, yaw: Math.PI * 2, fov: 44, D: 2.6, parY: 0.34, min: 400, juego: 0.45 });
    tl.label('final').caption(4.0, 'La ciudad', 'La misma. Con la primera luz.');
    // It keeps rising, very slowly, to the end: the day goes on coming.
    tl.with(11.4, { y: 2.4, alba: 1 }, (t) => t);
    tl.to(4.0, { min: 402, par: 0.8, juego: 0 });
    tl.label('frase');
    tl.to(1.8, { frase: 1, hud: 0 });
    tl.to(1.6, { ayuda: 1 });
    tl.wait(2.0);
    // It ends as Mente did, in two points: yours, and the other's.
    tl.to(2.0, { par: 1 });

    const dir = V();
    const P = V();
    // The two go round each other twice on the way up, and end side by side, facing you.
    const VUELTAS = (Math.PI * 4) / tl.at('final');
    const YAW_BAJAN = tl.get('yaw', tl.at('bajan') + 4);

    return {
      tl,
      luzEntrada: TU.clone(),
      chispa: tuEn,
      chispaLuz: tu,
      cuenta: (p) => ({ m: tl.get('m', p), min: tl.get('min', p), a: tl.get('hud', p) }),
      rotulo(p): Rotulo | null {
        const cp = tl.captionAt(p);
        return cp && p < tl.at('frase') ? { capitulo: 'VI · La subida', name: cp.name, fact: cp.fact } : null;
      },
      marca: (p) => tl.get('hud', p),
      fin: (p) => tl.get('ayuda', p),
      placa(g, f) {
        const u = f.u;
        const fr = tl.get('frase', f.p);
        if (fr > 0.01) {
          g.save();
          g.globalAlpha = fr;
          g.textAlign = 'center';
          g.shadowColor = 'rgba(0,0,0,0.85)';
          g.shadowBlur = 24 * u;
          g.font = FONT.italic(54 * u);
          g.fillStyle = ink();
          // Provisional: the last sentence is Diego's to decide (BRIEF, open decision 5).
          g.fillText('Todavía estás aquí.', f.W / 2, f.H * 0.42);
          g.restore();
        }
        // The help line is the series' closing card (the frame's, in the page: its link can be followed).
      },
      update(f: Frame) {
        const p = f.p;
        const y = tl.get('y', p);
        const yaw = tl.get('yaw', p) + 0.01 * Math.sin(f.time * 0.11);
        const pitch = tl.get('pitch', p) + 0.006 * Math.sin(f.time * 0.14);
        const D = tl.get('D', p);
        camera.near = 0.03;
        camera.far = 700;
        camera.fov = tl.get('fov', p);
        // The camera goes round the two lights, and looks at them; at the end they sit lower in the frame.
        P.set(0, y, 0);
        dir.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
        const baja = tl.get('parY', p) * 0.9;
        camera.position.set(P.x - dir.x * D, P.y - dir.y * D + baja, P.z - dir.z * D);
        // As it opens it looks where act V's camera was looking (a little off the two lights).
        const ab = tl.get('abre', p);
        if (ab > 0) dir.set(Math.sin(yaw - 0.05 * ab) * Math.cos(pitch + 0.14 * ab), Math.sin(pitch + 0.14 * ab), -Math.cos(yaw - 0.05 * ab) * Math.cos(pitch + 0.14 * ab));
        camera.up.set(0, 1, 0);
        camera.lookAt(camera.position.x + dir.x, camera.position.y + dir.y, camera.position.z + dir.z);
        camera.updateMatrixWorld();
        const sobre = smoothstep(-0.05, 0.12, camera.position.y);

        const m = tl.get('m', p);
        const mu = tl.get('mundo', p);
        film.u.uM.value = m;
        film.u.uSobre.value = sobre;
        film.u.uCielo.value = tl.get('cielo', p);
        film.u.uAzul.value = tl.get('azul', p);
        const alba = Math.pow(tl.get('alba', p), 1.7);
        film.u.uAlba.value = alba;
        (film.u.uCam.value as THREE.Vector3).copy(camera.position);
        // The Sun starts under the horizon and, at the very end, shows its rim over the roofs.
        const el = -0.07 + (SOL_FIN + 0.07) * alba;
        (film.u.uSol.value as THREE.Vector3).set(Math.sin(SOL_AZ) * Math.cos(el), Math.sin(el), -Math.cos(SOL_AZ) * Math.cos(el));
        // The last stars go, and the city's lights go out one by one.
        mundo.u.uAlba.value = 0.5 + 0.5 * alba;
        mundo.u.uApaga.value = 0.1 + 0.6 * alba;

        mundo.points.visible = mu > 0.001;
        enfocar(mundo, f.focal, f.dpr, f.time);
        mundo.u.uMinPx.value = 1.5 * f.dpr;
        mundo.u.uMaxPx.value = 9 * f.dpr;
        // From below, close to it, the circle of the sky would burn the frame.
        const h = Math.min(1, Math.max(0, -camera.position.y / 30));
        mundo.u.uGain.value = (0.3 * Math.max(0.3, h) * (1 - sobre) + 0.8 * sobre) * mu;
        (mundo.u.uCam.value as THREE.Vector3).copy(camera.position);

        const vi = tl.get('vida', p);
        const pl = tl.get('plano', p);
        vivas.points.visible = vi + pl > 0.002;
        enfocar(vivas, f.focal, f.dpr, f.time);
        vivas.u.uMinPx.value = 1.5 * f.dpr;
        vivas.u.uMaxPx.value = 10 * f.dpr;
        vivas.u.uGain.value = 1.5;
        vivas.u.uFog.value = 230;
        vivas.u.uVida.value = vi;
        vivas.u.uPlano.value = pl;
        vivas.u.uRaso.value = tl.get('abre', p);

        const ra = tl.get('rayos', p);
        luces.points.visible = ra > 0.001 && sobre < 0.99;
        enfocar(luces, f.focal, f.dpr, f.time);
        luces.u.uMinPx.value = 1.4 * f.dpr;
        luces.u.uMaxPx.value = 9 * f.dpr;
        luces.u.uGain.value = 2.2 * (1 - sobre) * Math.min(1, Math.max(0.25, -camera.position.y / 16));
        luces.u.uTecho.value = 1;
        luces.u.uFog.value = 420;
        luces.u.uFrente.value = 20;
        luces.u.uRayos.value = ra;
        luces.u.uAzul.value = 1;
        luces.u.uCorte.value = -1000;

        const ba = tl.get('bajan', p);
        bajan.points.visible = ba > 0.002;
        enfocar(bajan, f.focal, f.dpr, f.time);
        bajan.u.uMinPx.value = 1.8 * f.dpr;
        bajan.u.uGain.value = 2.2;
        bajan.u.uSuben.value = ba;
        bajan.u.uSub.value = -tl.get('baj', p);
        // They pass close to the camera, on the side it looks to.
        bajan.u.uY.value = camera.position.y;
        bajan.points.position.set(camera.position.x, 0, camera.position.z);
        bajan.points.rotation.y = -YAW_BAJAN;

        // Specks in the water, staying where they are while you go up past them.
        snow.points.visible = sobre < 0.5;
        snow.points.position.copy(camera.position);
        snow.u.uTime.value = f.time;
        snow.u.uFocal.value = f.focal;
        snow.u.uDpr.value = f.dpr;
        snow.u.uCae.value = 0.75 * camera.position.y;
        snow.u.uAmb.value = 0.05 + 0.1 * tl.get('azul', p);

        // The play between the two: the turn goes with the journey; how far apart they are and
        // which one is ahead, with time. At the end they come to rest.
        const ju = tl.get('juego', p);
        const ang = VUELTAS * Math.min(p, tl.at('final')) + 0.35 * ju * Math.sin(f.time * 0.21);
        // They come close, almost touch, and swing apart.
        const sep = 0.26 + ju * (0.16 * Math.sin(f.time * 0.37) + 0.12 * Math.sin(f.time * 0.23 + 2));
        const alt = 0.17 * ju;
        const th = ang - yaw;
        const dy = alt * Math.sin(ang * 0.7 + 1);
        tuEn.set(P.x - sep * Math.cos(th), P.y - dy, P.z + sep * Math.sin(th));
        otraEn.set(P.x + sep * Math.cos(th), P.y + dy, P.z - sep * Math.sin(th));
        tu.points.position.copy(tuEn);
        otra.points.position.copy(otraEn);
        const k = tl.get('par', p);
        for (const n of [tu, otra]) {
          enfocar(n, f.focal, f.dpr, f.time);
          n.u.uMinPx.value = 5.5 * f.dpr;
        }
        // One flares and, a moment later, the other answers; and both are brighter when they are close.
        const llama = (t: number) => Math.pow(0.5 + 0.5 * Math.sin(t * 0.9), 6);
        const cerca = 1 + 0.35 * ju * smoothstep(0.32, 0.12, sep);
        tu.u.uGain.value = 2.8 * k * cerca * (1 + 0.3 * ju * llama(f.time - 0.7));
        otra.u.uGain.value = 2.8 * k * cerca * (1 + 0.3 * ju * llama(f.time));
        enfocar(lazo, f.focal, f.dpr, f.time);
        lazo.u.uMinPx.value = 1.5 * f.dpr;
        lazo.u.uMaxPx.value = 6 * f.dpr;
        lazo.u.uGain.value = 1.6 * k;
        (lazo.u.uP.value as THREE.Vector3).copy(P);
        lazo.u.uAng.value = ang;
        lazo.u.uYaw.value = yaw;
        lazo.u.uSep.value = sep;
        lazo.u.uAlt.value = alt;
        lazo.u.uJuego.value = ju;
        // In the air nothing is left behind.
        lazo.u.uEstela.value = (0.25 + 0.75 * ju) * (1 - sobre);
      },
      dispose() {},
    };
  },
};
