import * as THREE from 'three';
import { Timeline } from './timeline';
import { enfocar, materia, materiaBuilder } from '../src/engine/materia';
import { ac, FONT, nota, pensamiento, proyectar, type Rotulo } from './placa';
import { BIO, CARMIN, ease, FONDO_M, SEGURO, TU, V } from './comun';
import { nevar } from './nieve';
import type { Escena, Frame, Instancia } from './tipos';

/**
 * Study · the lights that are born, and the light that is a person (act V). The clock moves again:
 * 04:13. Far away a blue light comes on and goes out. Then another. Then hundreds: they were there
 * all the time, and in the dark they could not be seen. One of them has the work's colour: it is
 * another person. This is the long shot of the act and should be the most beautiful image of the
 * work; the beauty is in the lights, never in the dark.
 *
 * Living light is blue (most deep-sea bioluminescence is, around 470–490 nm), so it does not read
 * as the teal of «tú».
 *
 * 1 · Sparks: only points that flash, in waves that answer each other.
 * 2 · Beings: jellyfish that pulse and long threads with lights running along them.
 * 3 · Constellation: the sparks, and a thread of light between those that are close.
 */

const PRIMERA = V(3.2, 0.9, -5.5);
const SEGUNDA = V(-1.7, 0.55, -2.4);
const OTRA = V(1.25, 0.2, -0.5);

export const luces: Escena = {
  id: 'luces',
  nombre: 'Las luces que nacen',
  estilos: [
    { key: '1', nombre: 'Chispas', nota: 'Solo puntos que destellan, en olas que se responden. Lo más cercano al lenguaje de la serie.' },
    { key: '2', nombre: 'Chispas, seres y un hilo', nota: 'Elegida: primero las chispas, que contestan cuando te mueves; después los seres; y un solo hilo entre tu luz y la otra.' },
    { key: '3', nombre: 'Constelación', nota: 'Las chispas, y un hilo de luz entre las que están cerca. El sentido se hace de cerca.' },
  ],
  montar(stage, estilo, viaje): Instancia {
    const root = stage.root;
    const { camera } = stage;
    stage.bloom.strength = 0.95;
    stage.bloom.radius = 0.8;
    stage.bloom.threshold = 0.08;
    stage.finish.uniforms.uGrain.value = 0.03;
    stage.finish.uniforms.uVignette.value = 0.7;

    const b = materiaBuilder(51);
    const r = b.r;
    const aC: number[] = [];
    const aS: number[] = [];
    const aFase: number[] = [];
    const c = new THREE.Color();
    const tinte = () => {
      const k = r();
      if (k < 0.72) c.copy(BIO).lerp(new THREE.Color(0.35, 0.8, 1.0), r() * 0.6);
      else if (k < 0.93) c.setRGB(0.2, 0.9, 0.85);
      else c.setRGB(0.55, 0.45, 1.0);
      return c;
    };
    /** When a light at (x, y, z) wakes: the wave goes out from the first flash. */
    const turno = (x: number, y: number, z: number) => Math.min(1, 0.06 + (Math.hypot(x - PRIMERA.x, y - PRIMERA.y, z - PRIMERA.z) / 13) * 0.8 + r() * 0.12);
    const add = (x: number, y: number, z: number, col: THREE.Color, s: number, light: number, kind: number, delay: number, cx: number, cy: number, cz: number, t: number, fase: number) => {
      b.push(x, y, z, col, s, light, { kind, delay });
      aC.push(cx, cy, cz);
      aS.push(t);
      aFase.push(fase);
    };

    // Sparks, everywhere, thinner far away.
    const chispas: [number, number, number, number][] = [];
    const nChispas = estilo === 0 ? 7000 : estilo === 1 ? 2600 : 2400;
    for (let i = 0; i < nChispas; i++) {
      const [x, y, z] = b.onSphere();
      const rad = 0.9 + 9 * Math.pow(r(), 1.5);
      const px = x * rad;
      const py = y * rad * 0.55;
      const pz = z * rad;
      const d = (estilo === 1 ? 0.5 : 1) * turno(px, py, pz);
      add(px, py, pz, tinte(), 0.016, 1, 0, d, px, py, pz, 0, r() * 6.28);
      chispas.push([px, py, pz, d]);
    }

    if (estilo === 1) {
      // Jellyfish: a bell that pulses, a brighter rim, tentacles that trail.
      for (let m = 0; m < 9; m++) {
        const [x, y, z] = b.onSphere();
        const rad = 2.3 + 5 * r();
        const cx = x * rad;
        const cy = y * rad * 0.5;
        const cz = z * rad;
        const R = 0.14 + 0.36 * r() * r();
        const col = tinte().clone();
        const fase = r() * 6.28;
        // The beings wake after the sparks.
        const d = Math.min(1, 0.52 + 0.48 * turno(cx, cy, cz));
        const nb = Math.round(500 + 2600 * R);
        for (let i = 0; i < nb; i++) {
          const h = Math.pow(r(), 0.7);
          const a = r() * Math.PI * 2;
          const rr = R * Math.sqrt(1 - (1 - h) * (1 - h));
          const borde = h > 0.93;
          add(cx + Math.cos(a) * rr, cy + R * 0.75 * (1 - h), cz + Math.sin(a) * rr, col, 0.012, borde ? 1.6 : 0.5, 1, d, cx, cy, cz, h, fase);
        }
        const nt = 7 + Math.floor(r() * 6);
        for (let k = 0; k < nt; k++) {
          const a = (k / nt) * Math.PI * 2 + r();
          const largo = R * (2.5 + 3.5 * r());
          const rr = R * (0.35 + 0.6 * r());
          for (let i = 0; i < 70; i++) {
            const t = i / 69;
            add(cx + Math.cos(a) * rr * (1 - 0.3 * t), cy - t * largo, cz + Math.sin(a) * rr * (1 - 0.3 * t), col, 0.009, 0.75 * (1 - 0.6 * t), 2, d, cx, cy, cz, t, fase + k);
          }
        }
      }
      // Threads: long colonies, with lights that run along them.
      for (let m = 0; m < 6; m++) {
        const [x, y, z] = b.onSphere();
        const rad = 2 + 5 * r();
        let px = x * rad;
        let py = y * rad * 0.5 + 1;
        let pz = z * rad;
        const cx = px;
        const cy = py;
        const cz = pz;
        const col = tinte().clone();
        const fase = r() * 6.28;
        const d = Math.min(1, 0.52 + 0.48 * turno(px, py, pz));
        let dx = r() - 0.5;
        let dz = r() - 0.5;
        for (let i = 0; i < 520; i++) {
          const t = i / 519;
          dx += (r() - 0.5) * 0.12;
          dz += (r() - 0.5) * 0.12;
          px += dx * 0.012;
          pz += dz * 0.012;
          py -= 0.0075;
          add(px, py, pz, col, 0.008, 0.9, 3, d, cx, cy, cz, t, fase);
        }
      }
      // Small fish with a row of lights along the body, in schools that move as one (kind 4):
      // the school of act I, down here.
      for (let sc = 0; sc < 3; sc++) {
        const [x, y, z] = b.onSphere();
        const rad = 2.0 + 2.5 * r();
        const cx = x * rad;
        const cy = y * rad * 0.4;
        const cz = z * rad;
        const fase = r() * 6.28;
        const d = Math.min(1, 0.6 + 0.4 * turno(cx, cy, cz));
        const col = new THREE.Color(0.45, 0.8, 1.0);
        for (let k = 0; k < 80; k++) {
          const ox = cx + (r() - 0.5) * 1.5;
          const oy = cy + (r() - 0.5) * 0.5;
          const oz = cz + (r() - 0.5) * 1.0;
          for (let i = 0; i < 6; i++) add(ox, oy, oz, col, 0.005, i === 5 ? 0.9 : 0.4, 4, d, ox, oy, oz, i / 5, fase);
        }
      }
      // Comb jellies: an oval with eight rows of lights that run along it (kind 5).
      for (let m = 0; m < 6; m++) {
        const [x, y, z] = b.onSphere();
        const rad = 2.4 + 3.4 * r();
        const cx = x * rad;
        const cy = y * rad * 0.5;
        const cz = z * rad;
        const R = 0.09 + 0.12 * r();
        const fase = r() * 6.28;
        const d = Math.min(1, 0.52 + 0.48 * turno(cx, cy, cz));
        const col = r() < 0.5 ? new THREE.Color(0.3, 0.85, 1.0) : new THREE.Color(0.55, 0.5, 1.0);
        for (let k = 0; k < 8; k++)
          for (let i = 0; i < 44; i++) {
            const t = i / 43;
            const lat = (t - 0.5) * Math.PI * 0.94;
            const a = (k / 8) * Math.PI * 2;
            add(cx + Math.cos(a) * Math.cos(lat) * R, cy + Math.sin(lat) * R * 1.6, cz + Math.sin(a) * Math.cos(lat) * R, col, 0.007, 0.8, 5, d, cx, cy, cz, t, fase + k * 0.4);
          }
      }
      // One thread of light, between your light and the other (kind 6): teal at your end, the
      // colour of the work at theirs.
      for (let i = 0; i < 170; i++) {
        const t = i / 169;
        const x = OTRA.x * t;
        const y = OTRA.y * t;
        const z = OTRA.z * t;
        add(x, y, z, TU.clone().lerp(CARMIN, t), 0.007, 0.9, 6, 0, x, y, z, t, 0);
      }
    }

    const vivas = materia(b.data(), {
      pre: /* glsl */ `
        attribute vec3 aC;
        attribute float aS, aFase;
        uniform float uOn, uHilo;
        ${SEGURO}`,
      move: /* glsl */ `
        float on = smoothstep(aDelay, aDelay + 0.07, uOn);
        // The moment it wakes it flashes, as the first one did.
        float nace = exp(-pw((uOn - aDelay - 0.035) * 28.0, 2.0)) * step(aDelay, uOn);
        vec3 l = p - aC;
        if (aKind < 0.5) {
          float t = uTime * (0.18 + seed * 0.5) + aFase;
          // A slow breath, and a wave that crosses the whole field.
          float ola = pw(0.5 + 0.5 * sin(dot(p, vec3(0.5, 0.2, 0.4)) - uTime * 0.45), 6.0);
          em *= 0.1 + 1.3 * pw(0.5 + 0.5 * sin(t), 8.0) + 0.9 * ola;
          p += 0.06 * vec3(sin(uTime * 0.13 + seed * 40.0), sin(uTime * 0.11 + seed * 70.0), cos(uTime * 0.12 + seed * 55.0));
        } else if (aKind < 1.5) {
          float late = sin(uTime * 0.9 + aFase);
          l.xz *= 1.0 + 0.16 * late * (0.4 + 0.6 * aS);
          l.y *= 1.0 - 0.1 * late;
          em *= 0.7 + 0.5 * pw(0.5 + 0.5 * sin(uTime * 0.9 + aFase - aS * 3.0), 3.0);
        } else if (aKind < 2.5) {
          l.x += 0.05 * sin(aS * 9.0 - uTime * 1.0 + aFase) * aS;
          l.z += 0.05 * cos(aS * 7.0 - uTime * 0.8 + aFase) * aS;
          l.y += 0.03 * sin(uTime * 0.9 + aFase) * (1.0 - aS);
          em *= 0.35 + 1.4 * pw(0.5 + 0.5 * sin(aS * 12.0 - uTime * 1.6 + aFase), 5.0);
        } else if (aKind < 3.5) {
          l.x += 0.08 * sin(aS * 6.0 - uTime * 0.4 + aFase);
          l.z += 0.08 * cos(aS * 5.0 - uTime * 0.33 + aFase);
          em *= 0.2 + 2.0 * pw(0.5 + 0.5 * sin(aS * 26.0 - uTime * 1.3 + aFase), 10.0);
        }
        else if (aKind < 4.5) {
          // The school goes round; each fish points where it goes, and its tail beats.
          float t = uTime * 0.16 + aFase;
          vec3 dir = normalize(vec3(cos(t) * 1.6, cos(t * 0.7) * 0.175, -sin(t) * 1.6));
          l = vec3(sin(t) * 1.6, sin(t * 0.7) * 0.25, cos(t) * 1.6) + dir * (aS - 0.5) * 0.07;
          l += cross(dir, vec3(0.0, 1.0, 0.0)) * 0.012 * sin(uTime * 6.0 + aC.x * 31.0 - aS * 3.0) * (1.0 - aS);
          em *= 0.6 + 0.4 * sin(uTime * 1.7 + aC.z * 17.0);
        } else if (aKind < 5.5) {
          em *= 0.2 + 1.9 * pw(0.5 + 0.5 * sin(aS * 10.0 - uTime * 2.2 + aFase), 6.0);
        } else {
          // The thread grows from both ends and meets in the middle.
          l.y += 0.035 * sin(aS * 6.2832 + uTime * 0.6) * sin(aS * 3.1416);
          float falta = 1.0 - uHilo;
          em *= smoothstep(falta - 0.06, falta, abs(aS - 0.5) * 2.0) * step(0.002, uHilo) * (0.7 + 0.3 * sin(aS * 20.0 - uTime * 1.5));
        }
        if (aKind > 0.5) p = aC + l + vec3(0.0, aKind < 5.5 ? 0.12 * sin(uTime * 0.14 + aFase) : 0.0, 0.0);
        em *= on * (1.0 + 4.0 * nace);`,
      uniforms: { uOn: { value: 0 }, uHilo: { value: 0 } },
      extra: { aC: [new Float32Array(aC), 3], aS: [new Float32Array(aS), 1], aFase: [new Float32Array(aFase), 1] },
    });
    root.add(vivas.points);

    // Way 3: a thread between sparks that are close.
    let hilos: THREE.LineSegments | null = null;
    const uHilos = { uOn: { value: 0 }, uTime: { value: 0 } };
    if (estilo === 2) {
      const pos: number[] = [];
      const del: number[] = [];
      const n = Math.min(chispas.length, 1500);
      for (let i = 0; i < n; i++) {
        const a = chispas[i];
        let hechos = 0;
        for (let j = i + 1; j < n && hechos < 2; j++) {
          const q = chispas[j];
          const d = Math.hypot(a[0] - q[0], a[1] - q[1], a[2] - q[2]);
          if (d < 0.55) {
            pos.push(a[0], a[1], a[2], q[0], q[1], q[2]);
            const t = Math.max(a[3], q[3]) + 0.05;
            del.push(t, t);
            hechos++;
          }
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
      geo.setAttribute('aDelay', new THREE.BufferAttribute(new Float32Array(del), 1));
      hilos = new THREE.LineSegments(
        geo,
        new THREE.ShaderMaterial({
          uniforms: uHilos,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexShader: /* glsl */ `
            attribute float aDelay;
            uniform float uOn, uTime;
            varying float vA;
            void main() {
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              gl_Position = projectionMatrix * mv;
              vA = smoothstep(aDelay, aDelay + 0.12, uOn) * exp(-max(-mv.z - 2.0, 0.0) * 0.22) * (0.6 + 0.4 * sin(uTime * 0.5 + aDelay * 60.0));
            }`,
          fragmentShader: /* glsl */ `
            varying float vA;
            void main() { gl_FragColor = vec4(vec3(0.03, 0.075, 0.14) * vA, 1.0); }`,
        }),
      );
      hilos.frustumCulled = false;
      root.add(hilos);
    }

    const uno = (at: THREE.Vector3, col: THREE.Color, seed: number) => {
      const bb = materiaBuilder(seed);
      bb.push(at.x, at.y, at.z, col, 0.03, 1);
      const m = materia(bb.data());
      m.u.uFuente.value = 1;
      root.add(m.points);
      return m;
    };
    const f1 = uno(PRIMERA, BIO, 52);
    const f2 = uno(SEGUNDA, BIO, 53);
    const tu = uno(V(0, 0, 0), TU, 54);
    const otra = uno(OTRA, CARMIN, 55);

    const snow = nevar(26000, 0);
    root.add(snow.points);

    // Sparks close to you that only light when something moves (most living light does this).
    const bm = materiaBuilder(57);
    for (let i = 0; i < 900; i++) {
      const [x, y, z] = bm.onSphere();
      const rad = 0.25 + 1.5 * Math.pow(bm.r(), 1.3);
      bm.push(x * rad, y * rad * 0.8, z * rad, BIO.clone().lerp(new THREE.Color(0.4, 0.95, 1.0), bm.r() * 0.6), 0.014, 1);
    }
    const cerca = materia(bm.data(), {
      pre: /* glsl */ `uniform float uMov; ${SEGURO}`,
      move: /* glsl */ `
        // Each one flares for a moment, in its own turn, while there is movement.
        em *= uMov * pw(0.5 + 0.5 * sin(uTime * (2.0 + seed * 3.0) + seed * 90.0), 5.0);
        p += 0.05 * vec3(sin(uTime * 0.3 + seed * 40.0), cos(uTime * 0.27 + seed * 60.0), sin(uTime * 0.23 + seed * 80.0));`,
      uniforms: { uMov: { value: 0 } },
    });
    root.add(cerca.points);
    let energia = 0;
    let ultimoP = -1;
    let puntero = 0;
    const alMover = (ev: PointerEvent) => (puntero += Math.hypot(ev.movementX, ev.movementY) / 300);
    addEventListener('pointermove', alMover);

    const tl = new Timeline();
    // f1, f2: the first two flashes; on: the wave that wakes the rest; otra: the other person;
    // az, D, alto: the camera's slow turn; luz: your light; min: the hour moves again.
    // alc: how far your light reaches (it opens again here); nieve, cae: the snow, which is what
    // everything down here lives on; mov: how much the lights answer when you move; msj, resp: the
    // message, sent at last, and its answer.
    tl.set({ f1: 0, f2: 0, on: 0, otra: 0, hilo: 0, az: 0.5, D: 4.4, alto: 0.3, luz: 0.07, alc: 0.16, nieve: 0, cae: 0, mov: 0, msj: 0, resp: 0, min: 252 });
    tl.label('destello').caption(6.0, 'Un destello', 'Lejos, una luz. Es la voz que oíste pasar: alguien sigue llamando.');
    tl.wait(0.8);
    tl.to(0.8, { f1: 1, min: 253 });
    tl.to(1.1, { f1: 0 });
    tl.to(0.8, { f2: 1 });
    tl.to(1.1, { f2: 0, az: 0.6 });
    tl.to(1.4, { on: 0.24, luz: 0.16, az: 0.7 });
    tl.label('ahi').caption(9.0, 'Las luces que estaban ahí', 'Estaban ahí todo el tiempo. En la oscuridad no se veían.');
    tl.to(4.0, { on: 0.32, az: 0.9, luz: 0.3, alc: 0.4, nieve: 0.5, cae: 1.2, mov: 1 });
    tl.to(5.0, { on: 0.52, az: 1.2, luz: 0.45, D: 4.8, min: 255, alc: 0.7, nieve: 1, cae: 2.8 });
    tl.label('contestan').caption(6.0, 'Contestan', 'Cuando te mueves, se encienden.');
    tl.to(6.0, { on: 0.6, az: 1.5, alto: 0.42, alc: 0.9, cae: 4.4 });
    tl.label('seres').caption(12.0, 'Viven de lo que cae', 'Aquí nadie ha visto el Sol. Viven de lo que cae.');
    tl.to(6.0, { on: 0.86, az: 1.9, alto: 0.5, luz: 0.6, alc: 1.1, cae: 6.2 });
    tl.to(6.0, { on: 1.02, az: 2.35, alto: 0.6, luz: 0.8, D: 5.2, min: 257, alc: 1.4, cae: 8 });
    // The long shot: the camera goes slowly round, among the lights.
    tl.label('largo').caption(9.0, 'Entre las luces', 'Tu luz vuelve a alcanzar.');
    tl.to(9.0, { az: 3.3, D: 4.2, alto: 0.35, alc: 1.8, cae: 10.6 });
    tl.label('otra').caption(8.0, 'Otra luz como la tuya', 'Una de ellas es otra persona. La que llamaba.');
    tl.to(3.2, { otra: 1, az: 3.65, D: 3.6, alto: 0.4 });
    tl.to(4.8, { az: 4.1, D: 3.0, luz: 1, min: 258, hilo: 1, cae: 12.4 });
    tl.label('mensaje').caption(6.4, 'El mensaje', '');
    tl.with(6.4, { az: 4.5, cae: 13.6 });
    tl.with(1.8, { msj: 1 }, (x) => x);
    tl.wait(3.2);
    tl.to(1.4, { resp: 1 });
    tl.wait(1.8);
    tl.label('no').caption(6.0, 'No se arregla', 'No se arregla de una vez. Pero el fondo no es todo.');
    tl.to(6.0, { az: 4.95, D: 3.4, alto: 0.55, min: 260, cae: 14.6 });

    const scr = { x: 0, y: 0, z: 0 };

    return {
      tl,
      luzEntrada: TU.clone(),
      luzSalida: TU.clone(),
      cuenta: (p) => ({ m: FONDO_M, min: tl.get('min', p), quieto: 1 - ease(0, 0.5, p) }),
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
        const o = tl.get('otra', f.p);
        if (o > 0.4) {
          proyectar(OTRA, camera, f.W, f.H, scr);
          nota(g, f.u, scr.x, scr.y, 'otra persona', 44, -48, ease(0.4, 1, o) * (1 - ease(tl.at('no') + 1, tl.at('no') + 2.5, f.p)), ac());
        }
      },
      update(f: Frame) {
        const p = f.p;
        camera.near = 0.02;
        camera.far = 100;
        camera.fov = 46;
        const az = tl.get('az', p) + f.time * 0.008;
        const D = tl.get('D', p);
        camera.position.set(Math.sin(az) * D, tl.get('alto', p), Math.cos(az) * D);
        camera.up.set(0, 1, 0);
        camera.lookAt(0.3, 0.05, -0.1);

        enfocar(vivas, f.focal, f.dpr, f.time);
        vivas.u.uMinPx.value = 1.7 * f.dpr;
        vivas.u.uMaxPx.value = 8 * f.dpr;
        vivas.u.uGain.value = estilo === 1 ? 0.8 : 1.1;
        vivas.u.uOn.value = tl.get('on', p) * 1.1;
        vivas.u.uHilo.value = tl.get('hilo', p);

        snow.u.uTime.value = f.time;
        snow.u.uFocal.value = f.focal;
        snow.u.uDpr.value = f.dpr;
        snow.u.uLuz.value.set(0, 0, 0);
        snow.u.uI.value = tl.get('luz', p) * tl.get('nieve', p);
        snow.u.uAlc.value = tl.get('alc', p);
        snow.u.uCae.value = tl.get('cae', p);

        // Movement: the pointer, and the scroll itself. With no ambient time (the tests, reduced
        // motion) there is none, so a frame depends only on where the journey is.
        if (f.time === 0) energia = 0;
        else {
          energia += puntero + (ultimoP >= 0 ? Math.min(0.5, Math.abs(p - ultimoP) * 6) : 0);
          energia = Math.min(1.4, energia) * Math.exp(-f.dt * 1.6);
        }
        puntero = 0;
        ultimoP = p;
        enfocar(cerca, f.focal, f.dpr, f.time);
        cerca.u.uMinPx.value = 1.8 * f.dpr;
        cerca.u.uGain.value = 1.6;
        cerca.u.uMov.value = energia * tl.get('mov', p);
        uHilos.uOn.value = tl.get('on', p) * 1.1;
        uHilos.uTime.value = f.time;
        for (const [m, k, px] of [
          [f1, 5.0 * tl.get('f1', p), 6],
          [f2, 5.0 * tl.get('f2', p), 6],
          [tu, 2.8 * tl.get('luz', p) * (0.93 + 0.07 * Math.sin(f.time * 1.1)), 5.5],
          [otra, 4.0 * tl.get('otra', p) * (0.93 + 0.07 * Math.sin(f.time * 0.9 + 2)), 5.5],
        ] as const) {
          enfocar(m, f.focal, f.dpr, f.time);
          m.u.uMinPx.value = px * f.dpr;
          m.u.uGain.value = k;
        }
      },
      dispose() {
        removeEventListener('pointermove', alMover);
      },
    };
  },
};
