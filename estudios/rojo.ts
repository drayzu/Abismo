import * as THREE from 'three';
import { Timeline } from './timeline';
import { pantalla } from '../src/engine/pantalla';
import { enfocar, materia, materiaBuilder } from '../src/engine/materia';
import { ink, nota, texto, type Rotulo } from './placa';
import { ease, SEGURO } from './comun';
import type { Escena, Frame, Instancia } from './tipos';

/**
 * Study · red goes first (act II). Water takes the colours in order: red in the first ten metres,
 * then orange, then yellow, then green; blue is what is left. Nothing here is invented: every
 * colour on screen is its own colour times what the water lets through at that depth (the image is
 * exposed for the blue, as an eye would adapt).
 *
 * 1 · Your things, made of points of light, lose their colour as they go down with you.
 * 2 · Fields of colour, after Rothko: three soft rectangles that go out one by one.
 * 3 · The shafts: one ray of each colour comes down from the surface, and each dies at its depth.
 */

/** What is left of each channel relative to blue after m metres. */
const QUEDA = /* glsl */ `
  vec3 queda(float m) { return exp(-(K_AGUA - K_AGUA.b) * max(m, 0.0)); }
  float luzP(float m) { return 0.22 + 0.78 * exp(-m / 110.0); }
`;

const FRAG = /* glsl */ `
  uniform float uM, uModo;
  ${SEGURO}
  ${QUEDA}

  float campo(vec2 p, vec2 c, vec2 r, float seed) {
    vec2 q = abs(p - c) - r;
    float borde = 0.035 + 0.05 * fbm(p * 5.0 + seed);
    float d = max(q.x, q.y);
    return smoothstep(borde, -borde, d) * (0.82 + 0.18 * fbm(p * vec2(3.0, 9.0) + seed * 3.0));
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    vec3 d = normalize(vDir);
    vec3 c;
    if (uModo < 0.5) {
      // The water, level: a little more light above.
      c = vec3(0.006, 0.035, 0.11) * luzP(uM) * (0.35 + 0.9 * smoothstep(-0.5, 0.6, d.y));
      c += vec3(0.02, 0.1, 0.2) * fbm(vec2(d.x * 6.0, uTime * 0.1)) * smoothstep(0.0, 0.5, d.y) * exp(-uM / 30.0) * 0.25;
    } else if (uModo < 1.5) {
      // Rothko: a ground and three fields, as pigments under the light that is left.
      vec3 alb = vec3(0.2, 0.035, 0.05) * (0.8 + 0.4 * fbm(p * 2.0));
      alb = mix(alb, vec3(0.92, 0.07, 0.11), campo(p, vec2(0.0, 0.27), vec2(0.4, 0.105), 1.0));
      alb = mix(alb, vec3(1.0, 0.42, 0.06), campo(p, vec2(0.0, 0.0), vec2(0.4, 0.095), 2.0));
      alb = mix(alb, vec3(1.0, 0.82, 0.16), campo(p, vec2(0.0, -0.26), vec2(0.4, 0.1), 3.0));
      vec3 q = queda(uM);
      c = (alb * q + dot(alb, vec3(0.4, 0.5, 0.1)) * vec3(0.01, 0.05, 0.3) * (1.0 - q.g)) * (0.25 + 0.75 * luzP(uM)) * 0.42;
      c *= smoothstep(1.05, 0.3, length(p * vec2(0.9, 1.25)));
    } else {
      // The shafts: the pixel's own depth, with more water in frame the deeper we are.
      float span = min(16.0 + uM * 1.1, 2.0 * uM);
      float prof = max(uM + (0.5 - vUv.y) * span, 0.0);
      c = vec3(0.004, 0.02, 0.06) * exp(-prof / 160.0);
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        vec3 col = i == 0 ? vec3(1.0, 0.06, 0.05) : i == 1 ? vec3(1.0, 0.38, 0.03) : i == 2 ? vec3(1.0, 0.85, 0.1) : i == 3 ? vec3(0.1, 0.9, 0.3) : vec3(0.12, 0.35, 1.0);
        float k = i == 0 ? 0.34 : i == 1 ? 0.2 : i == 2 ? 0.085 : i == 3 ? 0.044 : 0.0095;
        float x0 = (fi - 2.0) * 0.27;
        float x = p.x - x0 - (0.5 - vUv.y) * 0.12;
        float w = 0.03 + 0.015 * fbm(vec2(fi * 7.0, vUv.y * 3.0 + uTime * 0.1));
        float haz = exp(-x * x / (w * w)) + 0.35 * exp(-x * x / (w * w * 9.0));
        haz *= 0.75 + 0.25 * fbm(vec2(x * 30.0 + fi * 3.0, uTime * 0.25));
        c += col * haz * exp(-k * prof) * 0.42;
      }
      c *= step(0.0, uM + (0.5 - vUv.y) * span) * 0.999 + 0.001;
    }
    gl_FragColor = vec4(c, 1.0);
  }
`;

/** Where a colour is down to a twentieth, in metres (clear ocean water; to verify for the sheet). */
const MUERE: [string, number][] = [
  ['rojo', 9],
  ['naranja', 15],
  ['amarillo', 35],
  ['verde', 68],
  ['azul', 315],
];

export const rojo: Escena = {
  id: 'rojo',
  nombre: 'El rojo se va primero',
  estilos: [
    { key: '1', nombre: 'Tus cosas', nota: 'Una bufanda, una guitarra, una foto, hechas de puntos de luz. El agua les quita el color en orden.' },
    { key: '2', nombre: 'Campos de color', nota: 'Tres campos, a la manera de Rothko. Se apagan uno por uno hasta quedar azules.' },
    { key: '3', nombre: 'Los rayos', nota: 'Un rayo de cada color baja desde la superficie. Cada uno muere a su profundidad.' },
  ],
  montar(stage, estilo): Instancia {
    const root = stage.root;
    const { camera } = stage;
    stage.bloom.strength = estilo === 2 ? 0.6 : 0.35;
    stage.bloom.radius = 0.6;
    stage.bloom.threshold = 0.25;
    stage.finish.uniforms.uGrain.value = estilo === 1 ? 0.05 : 0.028;

    const film = pantalla(FRAG, { uM: { value: 0 }, uModo: { value: estilo } });
    root.add(film.mesh);

    let nube: ReturnType<typeof materia> | null = null;
    if (estilo === 0) {
      const b = materiaBuilder(21);
      const r = b.r;
      const c = new THREE.Color();
      const put = (x: number, y: number, z: number, ox: number, oy: number, rot: number, kind: number, s = 0.016, light = 1) => {
        const cs = Math.cos(rot);
        const sn = Math.sin(rot);
        b.push(ox + x * cs - y * sn, oy + x * sn + y * cs, z, c, s, light, { kind });
      };
      // The scarf: a ribbon that hangs and curls.
      for (let i = 0; i < 9000; i++) {
        const s = r();
        const t = r() - 0.5;
        const x = 0.34 * Math.sin(s * 5.2) + t * 0.26 * Math.cos(s * 3.0);
        const y = 1.25 - s * 2.5;
        const z = 0.22 * Math.cos(s * 5.2) + t * 0.26 * Math.sin(s * 3.0);
        const raya = Math.floor(s * 22) % 5 === 0;
        c.setRGB(raya ? 1.0 : 0.95, raya ? 0.5 : 0.06, raya ? 0.42 : 0.1);
        put(x, y, z, -1.75, 0.05, 0.12, 0);
      }
      // The guitar: a sunburst body (yellow, orange, red at the edge), the hole, the neck, six strings.
      for (let i = 0; i < 15000; i++) {
        const x = (r() - 0.5) * 1.1;
        const y = (r() - 0.5) * 1.8 - 0.1;
        const da = Math.hypot(x, y + 0.42) / 0.52;
        const db = Math.hypot(x, y - 0.28) / 0.4;
        const cintura = Math.hypot(x / 0.33, (y + 0.02) / 0.3);
        const dentro = Math.min(da, db, cintura);
        if (dentro > 1 || Math.hypot(x, y - 0.02) < 0.13) continue;
        const k = Math.pow(dentro, 2.2);
        c.setRGB(1.0 - 0.35 * k, 0.78 - 0.66 * k, 0.2 - 0.16 * k);
        put(x, y, (r() - 0.5) * 0.05, 0.05, -0.3, -0.32, 1);
      }
      for (let i = 0; i < 2600; i++) {
        const y = 0.6 + r() * 1.05;
        c.setRGB(0.42, 0.2, 0.08);
        put((r() - 0.5) * 0.11, y, 0.03, 0.05, -0.3, -0.32, 1);
      }
      for (let i = 0; i < 700; i++) {
        c.setRGB(0.5, 0.26, 0.1);
        put((r() - 0.5) * 0.2, 1.66 + r() * 0.24, 0.03, 0.05, -0.3, -0.32, 1);
      }
      for (let k = 0; k < 6; k++)
        for (let i = 0; i < 260; i++) {
          c.setRGB(1.0, 0.9, 0.55);
          put((k - 2.5) * 0.017, -0.55 + (i / 260) * 2.25, 0.06, 0.05, -0.3, -0.32, 1, 0.008, 0.8);
        }
      // The photo: two people on a hill at sunset, with a white border.
      for (let j = 0; j < 96; j++)
        for (let i = 0; i < 128; i++) {
          const u = i / 127;
          const v = j / 95;
          const marco = u < 0.045 || u > 0.955 || v < 0.06 || v > 0.94;
          const cerro = 0.3 + 0.07 * Math.sin(u * 5.0 + 0.6);
          const sol = Math.hypot((u - 0.62) * 1.33, v - 0.56);
          const gente = (Math.abs(u - 0.33) < 0.016 || Math.abs(u - 0.385) < 0.014) && v > cerro - 0.02 && v < cerro + 0.15;
          if (marco) c.setRGB(0.92, 0.9, 0.84);
          else if (gente) c.setRGB(0.07, 0.04, 0.05);
          else if (v < cerro) c.setRGB(0.1, 0.42, 0.16);
          else if (sol < 0.085) c.setRGB(1.0, 0.95, 0.6);
          else {
            const h = (v - cerro) / (0.94 - cerro);
            c.setRGB(1.0, 0.22 + 0.62 * Math.exp(-sol * 3.2) + 0.1 * h, 0.2 + 0.2 * h);
          }
          put((u - 0.5) * 1.3, (v - 0.5) * 0.98, 0, 1.85, 0.1, 0.14, 2, 0.013, 1.5);
        }
      nube = materia(b.data(), {
        pre: /* glsl */ `
          uniform float uM;
          uniform vec3 uCae;
          ${SEGURO}
          ${QUEDA}`,
        move: /* glsl */ `
          float cae = aKind < 0.5 ? uCae.x : aKind < 1.5 ? uCae.y : uCae.z;
          if (aKind < 0.5) {
            p.z += 0.1 * sin(p.y * 3.0 + uTime * 0.5);
            p.x += 0.05 * sin(p.y * 2.2 - uTime * 0.35);
          }
          p.y += 0.05 * sin(uTime * 0.27 + aKind * 2.1) - cae * cae * 3.6;
          p.x += cae * 0.3 * (aKind - 1.0);
          em *= queda(uM) * luzP(uM) * (1.0 - smoothstep(0.05, 0.9, cae));`,
        uniforms: { uM: { value: 0 }, uCae: { value: new THREE.Vector3() } },
      });
      root.add(nube.points);
    }

    const tl = new Timeline();
    // m: depth; cae1..3: each thing going out and falling away (way 1).
    tl.set({ m: 0.4, min: 2, cae1: 0, cae2: 0, cae3: 0 });
    tl.label('antes').caption(2.4, 'Lo que traes', estilo === 0 ? 'Bajan contigo las cosas que te gustaban.' : 'Cerca de la superficie, todos los colores.');
    tl.to(2.4, { m: 3, min: 4 });
    tl.label('rojo').caption(3.4, 'El rojo se va primero', 'El agua se lleva primero el rojo.');
    tl.to(3.4, { m: 14, min: 9 });
    tl.label('demas').caption(3.6, 'Después, lo demás', 'Después el naranja. Después el amarillo.');
    tl.to(3.6, { m: 60, min: 16 });
    tl.label('azul').caption(3.2, 'Todo azul', 'Las cosas siguen ahí. Solo que ya no tienen color.');
    tl.to(3.2, { m: 180, min: 24 });
    tl.label('pierden').caption(4.2, 'Lo que antes te gustaba', 'Se apagan una por una, y se pierden hacia abajo.');
    tl.to(1.6, { cae1: 1, m: 260 });
    tl.to(1.4, { cae2: 1, m: 330 });
    tl.to(1.2, { cae3: 1, m: 400, min: 34 });

    const scr = { x: 0, y: 0, z: 0 };

    return {
      tl,
      cuenta: (p) => ({ m: tl.get('m', p), min: tl.get('min', p) }),
      rotulo(p): Rotulo | null {
        const cp = tl.captionAt(p);
        return cp ? { capitulo: 'II · Tristeza', name: cp.name, fact: cp.fact } : null;
      },
      placa(g, f) {
        const m = tl.get('m', f.p);
        if (estilo === 2) {
          // Each ray's end, where it is down to a twentieth.
          const span = Math.min(16 + m * 1.1, 2 * m);
          MUERE.forEach(([nombre, prof], i) => {
            const y = (0.5 - (prof - m) / span) * f.H;
            if (y < 70 * f.u || y > f.H - 300 * f.u) return;
            const x = f.W / 2 + ((i - 2) * 0.27 + ((prof - m) / span) * 0.12) * f.H;
            nota(g, f.u, x, y, `${nombre} · ${prof} m`, 34, 0, 0.85, ink(0.9));
          });
        } else {
          // Which colours are gone by now.
          const idos = MUERE.filter(([, prof]) => m > prof).map(([n]) => n);
          if (idos.length) texto(g, f.u, f.W / 2, 92 * f.u, `ya no llega: ${idos.join(' · ')}`, ink(0.75), ease(8, 11, m), 10.5, 'center');
        }
        void scr;
      },
      update(f: Frame) {
        const p = f.p;
        camera.near = 0.05;
        camera.far = 100;
        camera.fov = 40;
        camera.position.set(0.12 * Math.sin(f.time * 0.06), 0.06 * Math.sin(f.time * 0.045), 6.4);
        camera.up.set(0, 1, 0);
        camera.lookAt(0, 0, 0);
        film.u.uM.value = tl.get('m', p);
        if (nube) {
          enfocar(nube, f.focal, f.dpr, f.time);
          nube.u.uMaxPx.value = 5 * f.dpr;
          nube.u.uGain.value = 0.24;
          nube.u.uM.value = tl.get('m', p);
          (nube.u.uCae.value as THREE.Vector3).set(tl.get('cae1', p), tl.get('cae2', p), tl.get('cae3', p));
        }
      },
      dispose() {},
    };
  },
};
