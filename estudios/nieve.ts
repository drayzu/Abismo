import * as THREE from 'three';
import { Timeline } from './timeline';
import { pantalla } from '../src/engine/pantalla';
import { enfocar, materia, materiaBuilder } from '../src/engine/materia';
import { rng } from '../src/engine/math';
import { pensamiento, type Rotulo } from './placa';
import { SEGURO, TU, V } from './comun';
import type { Escena, Frame, Instancia } from './tipos';

/**
 * Study · marine snow and your light in the dark (act III). Below a thousand metres the Sun does
 * not arrive. The only light is yours, a small point, and the only thing it shows is the snow that
 * passes: particles that fall without end towards the bottom, like the rain on the window.
 *
 * The snow is one cloud of points in a box that wraps around the camera; each flake is lit only by
 * how close it is to your light. The thoughts of three in the morning are written and erased.
 *
 * 1 · A halo: your light reaches a little, all around.
 * 2 · A beam: your light points down, into what is coming.
 * 3 · Rain: the flakes are drawn as short streaks, as the rain on the glass was.
 */

const CAJA = 9;

export function nevar(n: number, estilo: number) {
  const r = rng(31);
  const pos = new Float32Array(n * 3);
  const seed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (r() - 0.5) * CAJA;
    pos[i * 3 + 1] = (r() - 0.5) * CAJA;
    pos[i * 3 + 2] = (r() - 0.5) * CAJA;
    seed[i] = r();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const u = {
    uTime: { value: 0 },
    uFocal: { value: 1000 },
    uDpr: { value: 1 },
    uLuz: { value: V() },
    uI: { value: 1 },
    uCol: { value: TU.clone() },
    uModo: { value: estilo },
    uCae: { value: 0 },
    /** 0: round flakes; 1: streaks, like rain. */
    uRaya: { value: estilo === 2 ? 1 : 0 },
    /** Light that does not come from you (the air above the sea). */
    uAmb: { value: 0 },
    /** The journey's crossfade between acts. */
    uFundido: { value: 1 },
    /** How far your light reaches (1: as in the study). It shrinks with the pressure. */
    uAlc: { value: 1 },
    /** A call: a thin shell of light, centred far away, of radius uOndaR, passing through the snow. */
    uOndaO: { value: V(-30, 6, -22) },
    uOndaR: { value: 0 },
    uOndaI: { value: 0 },
    uOndaCol: { value: new THREE.Color(0.8, 0.86, 1.0) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: u,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float seed;
      uniform float uTime, uFocal, uDpr, uI, uModo, uCae, uRaya, uAmb, uFundido, uAlc, uOndaR, uOndaI;
      uniform vec3 uLuz, uCol, uOndaO, uOndaCol;
      varying vec3 vEm;
      varying float vRaya;
      void main() {
        vec3 p = position;
        float v = 0.05 + 0.11 * seed;
        // Falling, wrapped in the box; a slow sideways drift.
        p.y = mod(p.y - uTime * v - uCae * (0.6 + 0.8 * seed) + ${(CAJA / 2).toFixed(1)}, ${CAJA.toFixed(1)}) - ${(CAJA / 2).toFixed(1)};
        p.x += 0.12 * sin(uTime * 0.21 + seed * 50.0);
        p.z += 0.12 * cos(uTime * 0.17 + seed * 80.0);
        vec3 a = p - uLuz;
        float d2 = dot(a, a);
        float luz;
        if (uModo > 0.5 && uModo < 1.5) {
          // A cone that points down and a little ahead.
          vec3 eje = normalize(vec3(0.25, -1.0, -0.35));
          float c = dot(a / sqrt(max(d2, 1e-6)), eje);
          luz = smoothstep(0.78, 0.95, c) * 5.0 / (d2 * 0.3 + 0.4) + 0.05 / (d2 + 0.03);
        } else {
          luz = 0.42 / (d2 / (uAlc * uAlc) + 0.06);
        }
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float depth = max(-mv.z, 0.05);
        float tam = (0.011 + 0.02 * seed * seed) * uFocal / depth;
        float raya = uRaya;
        float px = clamp(tam * (1.0 + 5.0 * raya), 1.6 * uDpr, 46.0 * uDpr);
        gl_PointSize = px;
        // Large and near means out of focus: the same light over more area.
        float area = min(1.0, (2.4 * uDpr) * (2.4 * uDpr) / (tam * tam));
        vEm = mix(vec3(0.75, 0.82, 0.9), uCol, 0.55) * (luz * uI + uAmb) * uFundido * mix(1.0, area, 0.75) * (0.5 + 0.5 * seed) * (1.0 + 0.5 * raya);
        // The call: whatever the shell is crossing lights up for a moment.
        float od = (length(p - uOndaO) - uOndaR) / 0.45;
        vEm += uOndaCol * exp(-od * od) * uOndaI * uFundido * mix(1.0, area, 0.75) * (0.4 + 0.6 * seed);
        vRaya = raya;
        if (vEm.r + vEm.g + vEm.b < 2e-3 || mv.z > -0.08) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vEm;
      varying float vRaya;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float trazo = exp(-c.x * c.x * 900.0) * smoothstep(0.5, 0.1, abs(c.y)) * (0.4 + 0.6 * smoothstep(-0.5, 0.5, c.y));
        // Between flake and stroke the point gets narrower as it gets longer (it never swells).
        float f = exp(-c.x * c.x * mix(14.0, 900.0, vRaya)) * mix(exp(-c.y * c.y * 14.0), trazo / max(exp(-c.x * c.x * 900.0), 1e-4), vRaya);
        gl_FragColor = vec4(vEm * f, 1.0);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return { points, u };
}

/**
 * The thoughts of three in the morning (provisional; Diego may write his own). They come back: the
 * same ones, sooner each time. That is what rumination is.
 */
const PENSAMIENTOS = ['no le importo a nadie', 'siempre va a ser así', 'algo está mal conmigo', 'para qué'];

export const nieve: Escena = {
  id: 'nieve',
  nombre: 'La nieve marina y tu luz',
  estilos: [
    { key: '1', nombre: 'Halo, después lluvia', nota: 'Elegida: el halo en la medianoche, sereno; al acercarte al fondo los copos se alargan hasta ser lluvia.' },
    { key: '2', nombre: 'Un haz', nota: 'Tu luz apunta hacia abajo, hacia lo que viene. Solo se ve lo que cruza el haz.' },
    { key: '3', nombre: 'Lluvia', nota: 'Los copos son trazos cortos, como la lluvia en el vidrio. La misma imagen, más honda.' },
  ],
  montar(stage, estilo, viaje): Instancia {
    const root = stage.root;
    const { camera } = stage;
    stage.bloom.strength = 0.85;
    stage.bloom.radius = 0.75;
    stage.bloom.threshold = 0.1;
    stage.finish.uniforms.uGrain.value = 0.03;
    stage.finish.uniforms.uVignette.value = 0.75;

    const mar = pantalla(/* glsl */ `
      ${SEGURO}
      void main() {
        vec3 d = normalize(vDir);
        gl_FragColor = vec4(vec3(0.0016, 0.003, 0.009) * (0.6 + 0.6 * smoothstep(-0.8, 0.9, d.y)), 1.0);
      }`);
    root.add(mar.mesh);

    const snow = nevar(26000, estilo);
    root.add(snow.points);

    const TU_EN = V(0, -0.15, -2.6);
    const b = materiaBuilder(32);
    b.push(TU_EN.x, TU_EN.y, TU_EN.z, TU, 0.03, 1);
    const tu = materia(b.data());
    tu.u.uFuente.value = 1;
    root.add(tu.points);

    const tl = new Timeline();
    // m: depth; min: the hour (it slows down); luz: your light; alc: how far it reaches; cae: how
    // far the snow has fallen; onda1, onda2: each call crossing the frame (0 → 1); az: the camera.
    // In the journey your light is already on: it is what comes from act II.
    tl.set({ m: 1000, min: 75, luz: viaje ? 0.85 : 0, alc: 1, cae: 0, az: 0, raya: estilo === 2 ? 1 : 0, onda1: 0, onda2: 0 });
    /** Every thought on screen: [which, from, how long]. */
    const dichos: [number, number, number][] = [];
    const pensar = (cuales: number[], dur: number, pausa: number) => {
      for (const k of cuales) {
        tl.label('__');
        dichos.push([k, tl.at('__'), dur]);
        tl.wait(dur + pausa);
      }
    };
    tl.label('noche').caption(6.0, 'Medianoche', 'Aquí ya no llega nada de arriba. Lo único que ilumina es tu luz.');
    tl.to(2.0, { luz: 1, m: 1100, min: 96, cae: 0.5 });
    tl.to(4.0, { m: 1400, min: 140, cae: 1.6, az: 0.1 });
    tl.label('tres').caption(13.0, 'Lo que piensas a las tres', '');
    tl.with(13.0, { m: 2000, min: 176, cae: 4.4, az: 0.24, alc: 0.8 });
    pensar([0, 1, 2, 3], 2.6, 0.65);
    tl.label('voz').caption(6.5, 'Una voz', 'A esta profundidad, una voz cruza un océano entero.');
    tl.with(4.2, { onda1: 1 }, (t) => t);
    tl.to(6.5, { m: 2400, min: 183, cae: 5.9, az: 0.32 });
    tl.label('vuelven').caption(10.0, 'Vuelven', '');
    tl.with(10.0, { m: 2900, min: 187, cae: 7.7, az: 0.42, alc: 0.62, luz: 0.9 });
    pensar([0, 1, 2, 3], 1.5, 0.2);
    pensar([0, 1, 3], 0.95, 0.1);
    tl.label('otra').caption(5.0, 'Otra vez', 'Alguien llama. No contestas.');
    tl.with(3.4, { onda2: 1 }, (t) => t);
    tl.to(5.0, { m: 3200, min: 189, cae: 8.8, az: 0.5 });
    tl.label('estira').caption(7.0, 'El tiempo se estira', 'La profundidad sigue bajando. La hora, casi no.');
    tl.to(7.0, { m: 3600, min: 190, cae: 10.3, az: 0.56, alc: 0.5, luz: 0.8 });
    tl.label('lluvia').caption(5.6, 'Lluvia', 'Y entonces ya no es nieve.');
    // The chosen way: towards the bottom the flakes stretch into rain, and fall faster.
    tl.to(5.6, { m: 3900, min: 190, cae: estilo === 1 ? 12 : 19, az: 0.6, luz: 0.7, alc: 0.45, raya: estilo === 1 ? 0 : 1 });

    return {
      tl,
      luzEntrada: TU.clone(),
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
        camera.near = 0.02;
        camera.far = 100;
        camera.fov = 44;
        const az = tl.get('az', p);
        camera.position.set(Math.sin(az) * 0.9, 0.05 * Math.sin(f.time * 0.08), -2.6 + Math.cos(az) * 2.6);
        camera.up.set(0, 1, 0);
        camera.lookAt(TU_EN.x, TU_EN.y + (viaje ? 0 : 0.1), TU_EN.z);
        const luz = tl.get('luz', p) * (0.93 + 0.07 * Math.sin(f.time * 1.1));
        snow.u.uTime.value = f.time;
        snow.u.uFocal.value = f.focal;
        snow.u.uDpr.value = f.dpr;
        snow.u.uLuz.value.copy(TU_EN);
        snow.u.uI.value = luz;
        snow.u.uAlc.value = tl.get('alc', p);
        snow.u.uCae.value = tl.get('cae', p);
        snow.u.uRaya.value = tl.get('raya', p);
        // The call comes from far to the left and crosses the whole frame once.
        const o1 = tl.get('onda1', p);
        const o2 = tl.get('onda2', p);
        const o = o1 > 0 && o1 < 1 ? o1 : o2;
        const lejos = snow.u.uOndaO.value.distanceTo(TU_EN);
        snow.u.uOndaR.value = lejos - 7 + 14 * o;
        snow.u.uOndaI.value = 0.9 * Math.sin(Math.PI * Math.min(1, Math.max(0, o)));
        enfocar(tu, f.focal, f.dpr, f.time);
        tu.u.uMinPx.value = 5 * f.dpr;
        tu.u.uGain.value = 2.6 * luz;
      },
      dispose() {},
    };
  },
};
