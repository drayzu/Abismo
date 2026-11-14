import * as THREE from 'three';
import { Timeline } from './timeline';
import { pantalla } from '../src/engine/pantalla';
import { enfocar, materia, materiaBuilder } from '../src/engine/materia';
import { clamp, gauss, rng } from '../src/engine/math';
import { pensamiento, type Rotulo } from './placa';
import { ease, FONDO_M, TU, V } from './comun';
import { nevar } from './nieve';
import { LUZ, luzU, ruidoJS } from './acto3';
import type { Escena, Frame, Instancia } from './tipos';

/**
 * Act IV · The bottom, as a place (13 Nov 2026, to the bar of acts III and V). The study it
 * replaces (`fondo`, way 1) was your light on black: it had no floor and no size.
 *
 * You go down the last seven kilometres close to the wall of the trench, in the rain; your light
 * finds less of it every time. The floor comes up out of the dark at the last moment and you stop
 * just over it: grey silt with ripples, a few stones, a metre of it and no more. The clock stops,
 * and the rain stops where it is, in mid-water. The thought is said once, with the camera still.
 * Then the voice answers that you are not the only one, and the camera lifts and looks out: the
 * floor is a plain with no end, and across it, far apart, there are lights like yours, each over
 * its own metre of silt, none of them near another. They go out. The camera comes back down to
 * yours, which shrinks to almost nothing, and does not go out.
 *
 * The rules of care (BRIEF § Cuidado) decide the image: the bottom is cold, still and dark, never
 * inviting (grey, no blue, almost no glow); there is no body, no struggle and no edge (the wall is
 * seen from beside it, never from above); nothing here is alive yet (that is act V).
 */

/** Where the camera stops, and where your light rests, just over the silt. */
const ALTO = 1.0;
const REPOSO = V(0, 0.35, -2.6);
/** How far the camera lifts and backs away to look out over the plain. */
const SUBE = 13;
const ATRAS = 8;
/** From how high the act comes down. */
const CIMA = 96;

const f = ruidoJS(23);
/** The silt: long soft swells, and ripple marks across them. */
const cresta = (x: number, z: number) => 0.5 + 0.5 * Math.sin(z * 15 + 9 * f(x * 0.3, z * 0.25) + 1.6 * x);
const alto = (x: number, z: number) => 0.3 * (f(x * 0.13, z * 0.13) - 0.47) + 0.035 * cresta(x, z);

/** The wall of the trench on your right, down to its foot. */
function muro() {
  const b = materiaBuilder(121);
  const r = b.r;
  const c = new THREE.Color();
  const grande = (y: number, z: number) => f(y * 0.06 + 31, z * 0.06 + 9) * 8;
  const relieve = (y: number, z: number) => grande(y, z) + f(y * 0.25 + 3, z * 0.25 + 7) * 2.4 + 1.1 * Math.sin(y * 0.55 + f(y * 0.08, z * 0.08) * 7);
  const gris = new THREE.Color(0.4, 0.43, 0.5);
  const nieve = new THREE.Color(0.8, 0.82, 0.86);
  for (let i = 0; i < 520000; i++) {
    const y = (CIMA + 16) * r();
    const z = r() < 0.72 ? gauss(r) * 4 - 2 : 16 - r() * 62;
    const rel = relieve(y, z);
    // A ledge is where the wall steps out going down: what falls settles on it, so it is paler.
    const repisa = clamp((relieve(y - 0.6, z) - rel) * 0.9, 0, 1);
    c.copy(gris).lerp(nieve, repisa);
    b.push(14 - rel + gauss(r) * 0.08, y, z, c, 0.038, 0.45 + 0.9 * repisa + 0.2 * r());
  }
  const nube = materia(b.data(), { pre: LUZ, move: /* glsl */ `em *= luzEn(p);`, uniforms: luzU() });
  /** Where the wall is (its large shape only) at height y, in the plane you come down in. */
  const pared = (y: number) => 14 - grande(y, 0);
  return { nube, pared };
}

/**
 * The floor, and the others. Kinds: 0 the silt and the stones near where you stop, lit only by
 * your light; 1 the metre of silt under each of the others, lit by theirs. `delay` is each one's
 * turn to appear.
 */
function llanura() {
  const b = materiaBuilder(122);
  const r = b.r;
  const c = new THREE.Color();
  const limo = new THREE.Color(0.5, 0.51, 0.53);
  const copo = new THREE.Color(0.86, 0.87, 0.88);
  const limoEn = (x: number, z: number, luz: number, kind: number, delay: number) => {
    const k = cresta(x, z);
    // A few pale specks: what fell all the way down and stayed.
    const caido = r() < 0.05;
    b.push(x, alto(x, z), z, caido ? copo : limo, caido ? 0.03 : 0.022, luz * (caido ? 1.6 : 0.07 + 0.93 * k * k * k), { kind, delay });
  };
  for (let i = 0; i < 320000; i++) limoEn(REPOSO.x + gauss(r) * 2.7, REPOSO.z + gauss(r) * 2.7, 1, 0, 0);
  for (let i = 0; i < 70000; i++) {
    const a = r() * Math.PI * 2;
    const d = 26 * Math.pow(r(), 0.7);
    limoEn(REPOSO.x + Math.cos(a) * d, REPOSO.z + Math.sin(a) * d, 1, 0, 0);
  }
  // Stones: a few, half sunk. Paler on top, where things settle.
  const piedra = new THREE.Color(0.34, 0.35, 0.38);
  for (let k = 0; k < 18; k++) {
    const a = r() * Math.PI * 2;
    const d = 0.7 + 6.5 * Math.pow(r(), 0.8);
    const sx = REPOSO.x + Math.cos(a) * d;
    const sz = REPOSO.z + Math.sin(a) * d;
    const rad = 0.05 + 0.2 * r() * r();
    const chata = 0.35 + 0.3 * r();
    const y0 = alto(sx, sz) - rad * 0.25;
    for (let i = 0; i < 300; i++) {
      const [nx, ny, nz] = b.onSphere();
      if (ny < -0.2) continue;
      c.copy(piedra).lerp(copo, clamp(ny * 1.4 - 0.5, 0, 1) * 0.6);
      b.push(sx + nx * rad, y0 + ny * rad * chata, sz + nz * rad, c, 0.024, 0.35 + 0.5 * Math.max(ny, 0), { kind: 0 });
    }
  }
  // The others: far, and far from each other.
  const donde: [number, number, number][] = [];
  const ro = rng(77);
  for (let n = 0; donde.length < 300 && n < 20000; n++) {
    const z = -9 - 250 * Math.pow(ro(), 1.5);
    // The wall is on your right where you came down; further on the plain opens to both sides.
    const x = 5 - 140 * Math.pow(ro(), 1.3) + (z < -55 ? 90 * ro() : 0);
    if (Math.hypot(x - REPOSO.x, z - REPOSO.z) < 9) continue;
    if (donde.some(([ox, oz]) => Math.hypot(x - ox, z - oz) < 6.5)) continue;
    donde.push([x, z, ro()]);
  }
  for (const [ox, oz, turno] of donde)
    for (let i = 0; i < 210; i++) {
      const dx = gauss(r) * 0.85;
      const dz = gauss(r) * 0.85;
      limoEn(ox + dx, oz + dz, 2.4 / ((dx * dx + dz * dz) / 0.5 + 1), 1, turno);
    }
  const suelo = materia(b.data(), {
    pre: /* glsl */ `${LUZ}
      uniform float uOtros;`,
    move: /* glsl */ `
      if (aKind < 0.5) em *= tuyaEn(p);
      else em *= 5.0 * smoothstep(aDelay * 0.7, aDelay * 0.7 + 0.3, uOtros);`,
    uniforms: { ...luzU(), uOtros: { value: 0 } },
  });

  const bo = materiaBuilder(123);
  for (const [ox, oz, turno] of donde) bo.push(ox, alto(ox, oz) + 0.35, oz, TU, 0.03, 0.55 + 0.45 * bo.r(), { delay: turno });
  const otros = materia(bo.data(), {
    pre: /* glsl */ `uniform float uOtros;`,
    move: /* glsl */ `em *= smoothstep(aDelay * 0.7, aDelay * 0.7 + 0.3, uOtros) * (0.78 + 0.22 * sin(uTime * (0.5 + seed) + seed * 40.0));`,
    uniforms: { uOtros: { value: 0 } },
  });
  otros.u.uFuente.value = 1;
  return { suelo, otros };
}

export const acto4: Escena = {
  id: 'acto4',
  nombre: 'Acto IV',
  estilos: [{ key: '1', nombre: 'El acto', nota: 'Bajar pegado a la pared de la fosa; el suelo; el reloj y la lluvia detenidos; el pensamiento; la llanura con los otros; tu luz casi se apaga.' }],
  montar(stage, _estilo, _viaje): Instancia {
    const root = stage.root;
    const { camera } = stage;
    // Almost no glow down here: nothing should look inviting.
    stage.bloom.strength = 0.32;
    stage.bloom.radius = 0.45;
    stage.bloom.threshold = 0.28;
    stage.finish.uniforms.uGrain.value = 0.034;
    stage.finish.uniforms.uVignette.value = 0.8;

    const mar = pantalla(/* glsl */ `
      void main() {
        gl_FragColor = vec4(0.0011, 0.0014, 0.0024, 1.0);
      }`);
    root.add(mar.mesh);

    const { nube: roca, pared } = muro();
    const { suelo, otros } = llanura();
    root.add(roca.points, suelo.points, otros.points);

    const snow = nevar(26000, 0);
    snow.u.uCol.value.setRGB(0.7, 0.74, 0.78);
    root.add(snow.points);

    const bt = materiaBuilder(124);
    bt.push(0, 0, 0, TU, 0.03, 1);
    const tu = materia(bt.data());
    tu.u.uFuente.value = 1;
    root.add(tu.points);

    const tl = new Timeline();
    // y: the camera's height over the floor; sep: how far from the wall; llega: the wall left behind
    // (0 → 1); sube: the camera lifts to look out;
    // pitch, yaw, fov; luz, alc: your light and its reach; raya: flakes as strokes; para: the world
    // stops with the clock; quieto: the clock stopped; t: the thought, written; otros: the others.
    tl.set({ y: CIMA, sep: 7, llega: 0, borra: 0, sube: 0, pitch: -0.05, yaw: 0, fov: 46, luz: 0.7, alc: 0.45, raya: 1, para: 0, quieto: 0, t: 0, otros: 0, m: 3900, min: 190 });
    tl.label('baja').caption(15.5, 'Más abajo', 'Abisal. Después, hadal. Los últimos nombres.');
    tl.to(3.5, { y: 70, sep: 4.2, yaw: 0.5, pitch: -0.3, m: 5200, min: 212 });
    tl.to(4.0, { y: 30, yaw: 0.36, pitch: -0.4, m: 8200, min: 238, alc: 0.36 });
    // The floor comes up out of the dark, and you stop just over it.
    // The floor does not arrive all at once: it comes up out of the dark, and you settle on it.
    tl.to(4.0, { y: 13, llega: 0.55, yaw: 0.14, pitch: -0.3, m: 10300, min: 247, luz: 0.6, alc: 0.33, raya: 0.6 });
    tl.to(4.0, { y: ALTO, llega: 1, yaw: 0, pitch: -0.2, fov: 44, m: FONDO_M, min: 252, luz: 0.55, alc: 0.3, raya: 0.35 });
    tl.label('silencio').caption(7.0, 'El silencio', 'Aquí no se oye nada. El reloj se detiene.');
    tl.with(2.0, { para: 1 });
    tl.to(2.0, { quieto: 1 });
    // The rain stops where it is.
    tl.to(3.0, { raya: 0, luz: 0.46 });
    tl.wait(2.0);
    // Said once, slowly, with nothing moving.
    tl.label('pensamiento').caption(9.0, 'El pensamiento', '');
    tl.wait(1.2);
    tl.with(3.6, { t: 1 }, (x) => x);
    tl.to(7.8, { luz: 0.36 });
    tl.label('unico').caption(5.0, 'No eres el único', 'Mucha gente lo piensa. Casi nadie lo dice.');
    tl.to(5.0, { luz: 0.32, sube: 0.1, pitch: -0.26 });
    // The camera lifts and looks out: the plain, and the others on it.
    tl.label('otros').caption(11.0, 'Los otros', 'Cada uno en su oscuridad.');
    tl.with(1.6, { borra: 1 }, (x) => x);
    tl.to(4.0, { sube: 1, pitch: -0.5, yaw: -0.2, fov: 62, otros: 0.55 });
    tl.to(2.2, { otros: 1 });
    tl.wait(1.6);
    tl.to(3.2, { otros: 0, sube: 0, pitch: -0.2, yaw: 0, fov: 44, luz: 0.26 });
    tl.label('casi').caption(6.0, 'Tu luz', 'Baja hasta casi nada. Y no se apaga.');
    tl.to(4.4, { luz: 0.07, alc: 0.1 });
    tl.wait(1.6);

    const dir = V();
    const tuEn = V();
    let reloj = 0;
    let ultimo = -1;

    return {
      tl,
      luzEntrada: TU.clone(),
      chispa: tuEn,
      chispaLuz: tu,
      luzSalida: TU.clone(),
      // It leaves the act as it is at the end: almost out.
      puente: 0.85,
      cuenta: (p) => ({ m: tl.get('m', p), min: tl.get('min', p), quieto: tl.get('quieto', p) }),
      rotulo(p): Rotulo | null {
        const cp = tl.captionAt(p);
        return cp ? { capitulo: 'IV · El fondo', name: cp.name, fact: cp.fact } : null;
      },
      placa(g, fr) {
        // Said once, plainly; it stays while the voice answers, and is erased when the camera lifts.
        pensamiento(g, fr.u, fr.W * 0.5, fr.H * 0.34, 'A veces pienso en no seguir.', Math.min(tl.get('t', fr.p), 1.2) + tl.get('borra', fr.p), 1, 34);
      },
      update(fr: Frame) {
        const p = fr.p;
        const para = tl.get('para', p);
        // The world slows to a stop with the clock: its time only runs while it has not stopped.
        if (ultimo >= 0) reloj += Math.max(0, fr.time - ultimo) * (1 - para);
        ultimo = fr.time;
        // With no ambient time (the tests, or reduced motion) a frame depends only on where the journey is.
        const corre = fr.time === 0 ? 0 : reloj;
        const vivo = 1 - para;

        const y = tl.get('y', p);
        const sube = tl.get('sube', p);
        const yaw = tl.get('yaw', p) + 0.012 * Math.sin(fr.time * 0.11) * vivo;
        const pitch = tl.get('pitch', p) + 0.008 * Math.sin(fr.time * 0.14) * vivo;
        camera.near = 0.03;
        camera.far = 600;
        camera.fov = tl.get('fov', p);
        const x = (pared(y) - tl.get('sep', p)) * (1 - tl.get('llega', p));
        camera.position.set(x, y + SUBE * sube, ATRAS * sube);
        dir.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
        camera.up.set(0, 1, 0);
        camera.lookAt(camera.position.x + dir.x, camera.position.y + dir.y, camera.position.z + dir.z);
        camera.updateMatrixWorld();

        // You: ahead of the camera while you fall; then at rest, just over the silt.
        tuEn.set(x + Math.sin(yaw * 0.8) * 2.6, y - 0.1 + Math.sin(pitch * 0.5) * 2.6, -Math.cos(yaw * 0.8) * 2.6).lerp(REPOSO, ease(4.5, ALTO, y));
        tu.points.position.copy(tuEn);
        const luz = tl.get('luz', p) * (1 - 0.07 * vivo + 0.07 * vivo * Math.sin(fr.time * 1.1));
        const alc = tl.get('alc', p);
        enfocar(tu, fr.focal, fr.dpr, fr.time);
        tu.u.uMinPx.value = 5 * fr.dpr;
        tu.u.uGain.value = 2.6 * luz;

        for (const n of [roca, suelo]) {
          enfocar(n, fr.focal, fr.dpr, fr.time);
          n.u.uMinPx.value = 1.4 * fr.dpr;
          n.u.uMaxPx.value = 7 * fr.dpr;
          (n.u.uTu.value as THREE.Vector3).copy(tuEn);
          n.u.uAlc.value = alc;
          n.u.uLuzI.value = luz;
          n.u.uOndaI.value = 0;
        }
        roca.u.uGain.value = 3.0;
        suelo.u.uGain.value = 0.5;
        suelo.u.uMaxPx.value = 3.5 * fr.dpr;
        suelo.u.uFog.value = 240;
        const o = tl.get('otros', p);
        suelo.u.uOtros.value = o;
        enfocar(otros, fr.focal, fr.dpr, fr.time);
        otros.points.visible = o > 0.001;
        otros.u.uMinPx.value = 4 * fr.dpr;
        otros.u.uGain.value = 2.2;
        otros.u.uFog.value = 240;
        otros.u.uOtros.value = o;

        // The flakes stay where they are while you fall past them, and when you stop, they stop.
        snow.points.position.set(x, y, 0);
        snow.u.uTime.value = corre;
        snow.u.uFocal.value = fr.focal;
        snow.u.uDpr.value = fr.dpr;
        snow.u.uCae.value = 0.75 * (y - CIMA);
        snow.u.uRaya.value = tl.get('raya', p);
        snow.u.uOndaI.value = 0;
        snow.u.uLuz.value.copy(tuEn).sub(snow.points.position);
        snow.u.uI.value = luz;
        snow.u.uAlc.value = alc;
      },
      dispose() {},
    };
  },
};
