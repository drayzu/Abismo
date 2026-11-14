import * as THREE from 'three';
import { Timeline } from './timeline';
import { enfocar, materia, materiaBuilder } from '../src/engine/materia';
import type { Rotulo } from './placa';
import { ease, SEGURO } from './comun';
import { nevar } from './nieve';
import type { Escena, Frame, Instancia } from './tipos';

/**
 * Study · the rain that does not stop at the water (opening and act I), second version.
 *
 * The first version drew a glass and a sea that tried to look real; Diego did not like that 3D next
 * to the rest of the work (respaldo/gota.v1.ts.txt). This one is in the work's own language: points
 * and strokes of light on black, and nothing else.
 *
 * - The city across the water is points of light, with its reflection trembling below it.
 * - The rain is the same strokes as the «Lluvia» way of the snow study. It falls over the city,
 *   crosses the surface and keeps falling under it, slower, until each stroke is a flake.
 * - The surface is a sheet of points. From above it glints. From below, the points inside a circle
 *   are lit and the rest are dark: Snell's window (everything above the water fits in a cone of
 *   97°, so the circle's radius is the depth × 1.13), with the city squeezed into its rim.
 *
 * 1 · The circle: the sky as a disc of light, the city as its rim.
 * 2 · The ring: only the rim; the city, as a crown that is left above.
 * 3 · Only the rain: no window at all; the surface closes and the rain goes on.
 */

const BAJO = new THREE.Color(0.45, 0.66, 1.0);

const MANERAS = [
  { lleno: 1.0, aro: 1.0, espejo: 1.0 },
  { lleno: 0.0, aro: 1.5, espejo: 0.35 },
  { lleno: 0.0, aro: 0.0, espejo: 1.6 },
];

/** The sea as a sheet of points, the city across it with its reflection, and a few stars. */
export function marYCiudad(M: { lleno: number; aro: number; espejo: number }) {
    const b = materiaBuilder(61);
    const r = b.r;
    const c = new THREE.Color();
    const calida = () => {
      const k = r();
      if (k < 0.58) c.setRGB(1.0, 0.6, 0.24);
      else if (k < 0.84) c.setRGB(1.0, 0.86, 0.62);
      else if (k < 0.93) c.setRGB(1.0, 0.24, 0.18);
      else c.setRGB(0.5, 0.75, 1.0);
      return c;
    };
    // The surface: a sheet of points, denser near the middle (kind 0).
    for (let i = 0; i < 170000; i++) {
      const a = r() * Math.PI * 2;
      const rad = 30 * Math.pow(r(), 0.66);
      c.setRGB(1, 1, 1);
      b.push(Math.cos(a) * rad, 0, Math.sin(a) * rad, c, 0.022, 1, { kind: 0 });
    }
    // The city: buildings as grids of lit windows (kind 1), and their reflection (kind 2).
    const edificios: { x: number; z: number; ancho: number; alto: number }[] = [];
    for (let k = 0; k < 90; k++) {
      const x0 = -30 + 60 * r();
      const z0 = -26 - 8 * r();
      const ancho = 0.8 + 1.8 * r();
      const alto = 1.2 + 9 * r() * r();
      const nx = Math.max(2, Math.round(ancho / 0.28));
      const ny = Math.max(3, Math.round(alto / 0.34));
      const tono = calida().clone();
      edificios.push({ x: x0, z: z0, ancho, alto });
      for (let j = 0; j < ny; j++)
        for (let i = 0; i < nx; i++) {
          if (r() < 0.36) continue;
          const x = x0 + (i / nx - 0.5) * ancho;
          const y = 0.5 + (j / ny) * alto;
          const col = r() < 0.75 ? tono : calida();
          const luz = 0.5 + 0.9 * r();
          b.push(x, y, z0, col, 0.09, luz, { kind: 1 });
          b.push(x, -y, z0, col, 0.09, luz * 0.5, { kind: 2 });
        }
      // The building's outline, faint, so it reads as a building and not as a cloud of lights.
      c.setRGB(0.4, 0.5, 0.75);
      for (let y = 0.4; y < alto + 0.6; y += 0.16) {
        b.push(x0 - ancho * 0.56, y, z0, c, 0.045, 0.3, { kind: 1 });
        b.push(x0 + ancho * 0.44, y, z0, c, 0.045, 0.3, { kind: 1 });
      }
      for (let x = -0.56; x <= 0.44; x += 0.14 / ancho) b.push(x0 + ancho * x, alto + 0.6, z0, c, 0.045, 0.3, { kind: 1 });
      if (alto > 6) {
        c.setRGB(1.0, 0.15, 0.1);
        b.push(x0, alto + 1.0, z0, c, 0.16, 1.6, { kind: 1 });
      }
    }
    // The shore: a row of street lamps at the water's edge, and their reflection.
    for (let x = -34; x <= 34; x += 0.55) {
      c.setRGB(1.0, 0.78, 0.45);
      b.push(x + 0.2 * r(), 0.32, -24.5, c, 0.11, 1.5, { kind: 1 });
      b.push(x + 0.2 * r(), -0.32, -24.5, c, 0.11, 0.8, { kind: 2 });
    }
    // A few stars (kind 3).
    for (let i = 0; i < 500; i++) {
      const a = r() * Math.PI * 2;
      const e = 0.12 + 1.2 * r();
      c.setRGB(0.75, 0.82, 1.0);
      b.push(Math.cos(a) * Math.cos(e) * 80, Math.sin(e) * 80, Math.sin(a) * Math.cos(e) * 80, c, 0.12, 0.25 + 0.5 * r(), { kind: 3 });
    }
    const mundo = materia(b.data(), {
      pre: /* glsl */ `
        uniform vec3 uCam;
        uniform float uLleno, uAro, uEspejo, uAlba, uApaga;
        ${SEGURO}`,
      move: /* glsl */ `
        float h = -uCam.y;
        float arriba = smoothstep(-0.05, 0.12, uCam.y);
        if (aKind < 0.5) {
          float tw = 0.35 + 0.65 * pw(0.5 + 0.5 * sin(uTime * (0.5 + seed * 1.6) + seed * 50.0), 3.0);
          // Waves: bands of glints that travel, so the sheet reads as water.
          float ola = sin(dot(p.xz, vec2(0.9, 0.5)) * 1.3 + uTime * 0.9) + sin(dot(p.xz, vec2(-0.4, 1.0)) * 2.1 - uTime * 1.2);
          float cresta = pw(0.5 + 0.25 * ola, 3.0);
          p.y += 0.05 * ola;
          float rho = length(p.xz - uCam.xz);
          // From above: the water glints, more where the city shines on it.
          vec3 sobre = mix(vec3(0.42, 0.5, 0.66), vec3(1.0, 0.7, 0.55), uAlba) * (0.05 + 0.75 * cresta) * tw * (1.0 + uAlba) + vec3(1.0, 0.62, 0.3) * 0.5 * tw * smoothstep(-8.0, -30.0, p.z) * pw(seed, 3.0);
          // From below: Snell's window. Inside the circle the sky comes through; its rim is the horizon.
          float R = max(h, 0.0) * 1.134;
          float dentro = smoothstep(R * 1.03, R * 0.9, rho);
          float da = (rho - R) / (0.06 * R + 0.04);
          float aro = exp(-da * da);
          vec3 ciudad = seed < 0.55 ? vec3(1.0, 0.6, 0.24) : seed < 0.85 ? vec3(1.0, 0.86, 0.62) : vec3(1.0, 0.25, 0.18);
          vec3 bajo = mix(vec3(0.5, 0.64, 0.9), vec3(1.0, 0.74, 0.6) * 1.4, uAlba) * dentro * tw * 0.8 * uLleno;
          // The rim is the horizon: each point there looks out at a height over it (refraction, n = 1.333),
          // so the skyline stands on the rim, upside down, its towers pointing to the centre.
          float sa = 1.333 * sin(atan(rho, max(h, 1e-3)));
          float alt = sa < 1.0 ? acos(sa) : -1.0;
          float az = atan(p.z - uCam.z, p.x - uCam.x);
          float colu = floor(az * 17.0);
          float hc = h11(colu * 3.7 + 1.0);
          float alto = (0.05 + 0.42 * hc * hc) * smoothstep(1.5, 0.5, abs(az + 1.5708)) + 0.03;
          float edificio = alt >= 0.0 && alt < alto ? 1.0 : 0.0;
          vec3 torre = hc < 0.6 ? vec3(1.0, 0.6, 0.24) : hc < 0.88 ? vec3(1.0, 0.86, 0.62) : vec3(0.5, 0.75, 1.0);
          bajo += torre * edificio * step(0.2, fract(seed * 7.3)) * 4.5 * uAro;
          bajo += ciudad * aro * step(0.6, fract(seed * 7.3)) * 0.8 * uAro;
          bajo += vec3(0.16, 0.22, 0.34) * 0.07 * tw * (1.0 - dentro * uLleno) * uEspejo;
          // What is above gets dimmer with every metre.
          // (The points also shrink with distance, so the light is raised to keep the circle readable.)
          bajo *= (1.3 + 0.4 * max(h, 0.0)) * exp(-max(h, 0.0) * 0.03);
          em = mix(bajo, sobre, arriba);
          // Crossing: for an instant the sheet is edge-on and lights up around you.
          float cy = uCam.y / 0.16;
          em += vec3(0.5, 0.68, 1.0) * exp(-cy * cy) * exp(-rho * 0.1) * tw * 1.8;
        } else if (aKind < 1.5) {
          // At dawn most of the city's lights are already off.
          // (uApaga: how many of them have gone out, one by one, as the day comes.)
          em *= (1.0 - 0.6 * uAlba) * 1.7 * arriba * (0.75 + 0.25 * sin(uTime * (0.3 + seed) + seed * 30.0)) * smoothstep(-0.03, 0.03, fract(seed * 13.7) - uApaga);
        } else if (aKind < 2.5) {
          p.x += 0.3 * sin(uTime * 1.2 + seed * 40.0 + p.y * 2.2) * (0.3 - p.y * 0.12);
          em *= 1.6 * arriba * smoothstep(-0.03, 0.03, fract(seed * 13.7) - uApaga);
        } else {
          em *= arriba * (1.0 - uAlba);
        }`,
      uniforms: { uCam: { value: new THREE.Vector3() }, uLleno: { value: M.lleno }, uAro: { value: M.aro }, uEspejo: { value: M.espejo }, uAlba: { value: 0 }, uApaga: { value: -1 } },
    });
    return Object.assign(mundo, { edificios });
}

export const gota: Escena = {
  id: 'gota',
  nombre: 'La lluvia y la superficie',
  estilos: [
    { key: '1', nombre: 'El círculo', nota: 'Desde abajo, todo lo de arriba cabe en un círculo de luz, con la ciudad en el borde.' },
    { key: '2', nombre: 'El anillo', nota: 'Solo el borde: la ciudad queda arriba como una corona que se aleja.' },
    { key: '3', nombre: 'Solo la lluvia', nota: 'Sin ventana: la superficie se cierra y la lluvia sigue cayendo debajo.' },
  ],
  montar(stage, estilo): Instancia {
    const root = stage.root;
    const { camera } = stage;
    const M = MANERAS[estilo];
    stage.bloom.strength = 0.8;
    stage.bloom.radius = 0.75;
    stage.bloom.threshold = 0.12;
    stage.finish.uniforms.uGrain.value = 0.03;
    stage.finish.uniforms.uVignette.value = 0.7;

    const mundo = marYCiudad(M);
    root.add(mundo.points);

    const lluvia = nevar(26000, 2);
    lluvia.u.uCol.value.setRGB(0.8, 0.86, 0.96);
    lluvia.u.uI.value = 0;
    root.add(lluvia.points);

    const tl = new Timeline();
    // y: the camera's height over the water; th: its pitch (0 level, π/2 straight up); raya: the
    // rain as strokes (1) or flakes (0); vel: how fast it falls; amb: the light on it.
    tl.set({ y: 1.9, th: 0.02, fov: 46, raya: 1, vel: 7, amb: 0.3, min: -20 });
    tl.label('yo').caption(3.0, '¿Y yo?', '¿Y yo, qué soy en todo esto?');
    tl.to(3.0, { y: 1.3, min: -19 });
    tl.label('lluvia').caption(3.0, 'Llueve', 'Llueve sobre la ciudad. Llueve sobre el mar.');
    tl.to(3.0, { y: 0.3, th: -0.2 });
    tl.label('cruce').caption(2.2, 'La superficie', 'La lluvia no se detiene en el agua.');
    tl.to(0.9, { y: 0.0, th: -0.05, vel: 4 });
    tl.to(1.3, { y: -1.1, th: 0.7, fov: 70, vel: 1.2, amb: 0.2, min: -18 });
    tl.label('arriba').caption(5.0, estilo === 2 ? 'Debajo' : 'Lo que queda arriba', estilo === 2 ? 'Arriba se cierra. La lluvia sigue.' : 'Desde abajo, todo lo de arriba cabe en un círculo.');
    tl.to(2.4, { y: -2.6, th: estilo === 2 ? 0.5 : 1.15, fov: estilo === 2 ? 60 : 96, raya: 0.6, vel: 0.7 });
    tl.to(2.6, { y: -5.5, th: estilo === 2 ? 0.6 : 1.32, fov: estilo === 2 ? 60 : 104, raya: 0.35, vel: 0.4, amb: 0.16 });
    tl.label('aleja').caption(4.4, 'Se aleja', 'Cada metro, un poco más lejos.');
    tl.to(4.4, { y: -12, th: estilo === 2 ? 0.3 : 1.2, raya: 0, vel: 0.1, amb: 0.1, min: -15 });

    let caida = 0;

    return {
      tl,
      cuenta: (p) => ({ m: Math.max(0, -tl.get('y', p)), min: tl.get('min', p) }),
      rotulo(p): Rotulo | null {
        const cp = tl.captionAt(p);
        return cp ? { capitulo: p < tl.at('cruce') ? 'Apertura · Después de lo inmenso' : 'I · Soledad', name: cp.name, fact: cp.fact } : null;
      },
      update(f: Frame) {
        const p = f.p;
        const y = tl.get('y', p);
        const th = tl.get('th', p) + 0.01 * Math.sin(f.time * 0.2);
        camera.near = 0.03;
        camera.far = 300;
        camera.fov = tl.get('fov', p);
        camera.position.set(0.15 * Math.sin(f.time * 0.07), y, 0);
        camera.up.set(0, Math.cos(th), Math.sin(th));
        camera.lookAt(camera.position.x, y + Math.sin(th), -Math.cos(th));

        enfocar(mundo, f.focal, f.dpr, f.time);
        mundo.u.uMinPx.value = 1.5 * f.dpr;
        mundo.u.uMaxPx.value = 9 * f.dpr;
        mundo.u.uGain.value = 1.0;
        (mundo.u.uCam.value as THREE.Vector3).copy(camera.position);

        // The rain's box goes with the camera; how far it has fallen adds up frame by frame.
        caida += f.dt * tl.get('vel', p);
        lluvia.points.position.set(camera.position.x, y, 0);
        lluvia.u.uTime.value = f.time;
        lluvia.u.uFocal.value = f.focal;
        lluvia.u.uDpr.value = f.dpr;
        lluvia.u.uCae.value = caida;
        lluvia.u.uRaya.value = tl.get('raya', p);
        // Under the water the rain is bluer.
        lluvia.u.uCol.value.setRGB(0.8, 0.86, 0.96).lerp(BAJO, ease(0.1, -0.6, y));
        lluvia.u.uAmb.value = tl.get('amb', p) * (1 - 0.5 * ease(-6, -12, y));
      },
      dispose() {},
    };
  },
};
