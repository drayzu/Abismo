import * as THREE from 'three';
import { EASE, Timeline } from './timeline';
import { pantalla } from '../src/engine/pantalla';
import { enfocar, materia, materiaBuilder } from '../src/engine/materia';
import { gauss } from '../src/engine/math';
import type { Rotulo } from './placa';
import { SEGURO, TU, V } from './comun';
import { nevar } from './nieve';
import type { Escena, Frame, Instancia } from './tipos';

/**
 * Act II · Sadness (the twilight zone, 20 → 100 atm), as one long take through a place (13 Nov
 * 2026, to the bar of acts III and V). What it replaces was a flat diagram: five bars of colour
 * down the frame, and then snow on black.
 *
 * The rays are in the water now. You look up: far above is what is left of the surface, a pale
 * disc, and from it the light comes down in shafts, one colour each, all round you. Each colour
 * comes down as far as the water lets it: the red ones stop first, high above; then the orange,
 * the yellow, the green. The camera turns under them. Only the blue ones reach you, pass you and
 * go on down, and you go down among them. The snow begins. The last of the ones that go up every
 * night pass beside you, up one of the shafts. Going down costs more and more; your light reaches
 * less. At the end you look up once more: the blue shafts shorten from below, the disc is a point,
 * and it goes. What is left is your light.
 *
 * It is night, so this is the light of the city, faint and a little washed out (BRIEF; to settle
 * with Diego). The column above you (the first 200 m) is drawn on a scale that gives the first
 * metres more room, as before: the colours die in the first tens of metres.
 */

/** The surface is this far above where the act starts, on that scale. */
export const ARRIBA = 34;
/** How far down the act goes, in units (200 → 1 000 m). */
export const HONDO = 136;
/** Each colour, and what the water takes of it per metre (clear ocean water; to verify for the sheet). */
const COLORES: [THREE.Color, number][] = [
  [new THREE.Color(1.0, 0.06, 0.05), 0.34],
  [new THREE.Color(1.0, 0.38, 0.03), 0.2],
  [new THREE.Color(1.0, 0.85, 0.1), 0.085],
  [new THREE.Color(0.1, 0.9, 0.3), 0.044],
  [new THREE.Color(0.12, 0.35, 1.0), 0.0095],
];
/** The depth (m) at which each is down to a twentieth, and the height where that is on the scale. */
const fin = (k: number) => ARRIBA * (1 - Math.pow(3 / k / 230, 0.35));

/**
 * The shafts and the surface. Kinds: 0 to 4, a point of a shaft of that colour; 5, the surface.
 * `delay` is the shaft's own number (0 to 1), for its shimmer.
 *
 * `sol`: act VI's. It is the Sun, so the colours are whole for the first time, and their shafts
 * stand all round you instead of in a fan.
 */
export function rayos(sol = false) {
  const b = materiaBuilder(131);
  const r = b.r;
  const c = new THREE.Color();
  const palido = new THREE.Color();
  // The rays lean a little: they all come from one place far above.
  const VERT = 320;
  const haz = (kind: number, r0: number, fi: number, ancho: number, n: number, desde: number, hasta: number) => {
    const [col] = COLORES[kind];
    // The city's light: faint, and a little washed out.
    const gris = col.r * 0.3 + col.g * 0.5 + col.b * 0.2;
    palido.setRGB(gris, gris * 0.82, gris * 0.62);
    c.copy(col).lerp(palido, sol ? 0 : kind === 4 ? 0.15 : 0.4);
    const turno = r();
    // Half of it is threads of light inside the shaft; the rest, the glow round them.
    const hilos: [number, number][] = [];
    for (let i = 0; i < 7; i++) hilos.push([gauss(r) * ancho * 0.8, gauss(r) * ancho * 0.8]);
    for (let i = 0; i < n; i++) {
      const y = desde + (hasta - desde) * r();
      const abre = (VERT - y) / VERT;
      let dx = gauss(r) * ancho;
      let dz = gauss(r) * ancho;
      let luz = 0.5;
      if (r() < 0.5) {
        const [hx, hz] = hilos[Math.floor(r() * hilos.length)];
        dx = hx + gauss(r) * 0.07;
        dz = hz + gauss(r) * 0.07;
        luz = 1.0;
      }
      b.push((Math.cos(fi) * r0 + dx) * abre, y, (Math.sin(fi) * r0 + dz) * abre, c, kind === 4 ? 0.1 : 0.06, kind === 4 ? luz * 2.4 : luz, { kind, delay: turno });
    }
  };
  // A shaft at distance d, towards where the camera looks when its yaw is psi.
  const en = (kind: number, d: number, psi: number, n: number, desde: number) => haz(kind, d, psi - Math.PI / 2, 0.7 + 0.6 * r(), n, desde, ARRIBA);
  // The four that stay above stand in a fan ahead of you, in the order the water takes them.
  for (let kind = 0; kind < 4; kind++)
    for (let i = 0; i < (sol ? 6 : 4); i++)
      en(kind, (sol ? 7 : 13) + (sol ? 19 : 13) * r(), sol ? ((i * 4 + kind) / 24) * Math.PI * 2 + (r() - 0.5) * 0.2 : -0.35 + 0.42 * kind + 0.11 * i + (r() - 0.5) * 0.06, 12000, fin(COLORES[kind][1]) - 7);
  // The blue ones go all the way down, all round you. One passes right beside you.
  const azules: [number, number][] = [
    [3.6, 1.95],
    [11, 0.15],
    [16, 0.9],
    [9, 2.75],
    [19, 2.3],
    [13, 3.7],
    [8, 4.6],
    [18, 5.5],
  ];
  for (const [d, psi] of azules) haz(4, d, psi - Math.PI / 2, 1.0 + 0.7 * r(), 56000, -HONDO - 30, ARRIBA);
  // What is left of the surface: a disc of glints, brighter at the middle.
  // (Act VI has the real surface over it, so it needs none here.)
  c.setRGB(0.62, 0.72, 0.9);
  for (let i = 0; i < (sol ? 0 : 26000); i++) {
    const d = 30 * Math.sqrt(r());
    const a = r() * Math.PI * 2;
    b.push(Math.cos(a) * d, ARRIBA + gauss(r) * 0.15, Math.sin(a) * d, c, 0.09, 3.0 * Math.exp(-(d * d) / 260), { kind: 5, delay: r() });
  }
  return materia(b.data(), {
    pre: /* glsl */ `
      uniform float uFrente, uRayos, uAzul, uCorte, uTecho;
      ${SEGURO}`,
    move: /* glsl */ `
      float brillo = 0.6 + 0.4 * sin(uTime * (0.5 + aDelay) + p.y * 0.35 + aDelay * 40.0);
      if (aKind > 4.5) {
        em *= uRayos * (0.5 + 0.5 * sin(uTime * (1.0 + seed * 2.0) + seed * 60.0));
      } else {
        // How deep this point is on the scale of the column above you: 0 the surface, 1 you.
        float q = 1.0 - p.y / ${ARRIBA.toFixed(1)};
        float prof = 230.0 * pw(min(q, 1.0), 2.857);
        float k = aKind < 0.5 ? 0.34 : aKind < 1.5 ? 0.2 : aKind < 2.5 ? 0.085 : aKind < 3.5 ? 0.044 : 0.0095;
        float vive = exp(-k * prof);
        // Below you only the blue is left: it thins with the depth, and at the end it goes from below.
        if (aKind > 3.5) vive *= uAzul * exp(min(p.y, 0.0) / 150.0) * smoothstep(uCorte - 7.0, uCorte + 7.0, p.y) * mix(1.0, 0.4, smoothstep(-8.0, 10.0, p.y));
        // The light has come down as far as the front.
        float hasta = smoothstep(uFrente + 0.07, uFrente - 0.07, q);
        // Seen from right under the surface all the shafts meet and burn the frame: there (uTecho) they thin out.
        em *= vive * hasta * uRayos * brillo * mix(1.0, smoothstep(${ARRIBA.toFixed(1)}, ${(ARRIBA - 16).toFixed(1)}, p.y), uTecho);
      }`,
    uniforms: { uFrente: { value: 0 }, uRayos: { value: 0 }, uAzul: { value: 1 }, uCorte: { value: -400 }, uTecho: { value: 0 } },
  });
}

/** The last of the ones that go up every night: a loose stream of small lights, rising. */
export function ultimos() {
  const b = materiaBuilder(132);
  const r = b.r;
  const c = new THREE.Color();
  for (let i = 0; i < 16000; i++) {
    // Along a band that leans across your way, in knots: they travel together.
    const s = r();
    const nudo = Math.floor(r() * 9);
    const cx = -7 + 2.2 * Math.sin(nudo * 2.1) + 5.5 * s;
    const cz = -5.5 + 1.6 * Math.cos(nudo * 1.3) - 3 * s;
    c.setRGB(0.55, 0.8, 1.0).lerp(TU, r() * 0.25);
    b.push(cx + gauss(r) * 1.5, (r() - 0.5) * 90 + nudo * 3, cz + gauss(r) * 1.5, c, 0.035, 0.5 + r(), { kind: nudo });
  }
  return materia(b.data(), {
    pre: /* glsl */ `uniform float uSub, uSuben, uY; ${SEGURO}`,
    move: /* glsl */ `
      // They rise past you, each at its own pace, and are only there while they pass.
      p.y = mod(p.y + uSub * (9.0 + 5.0 * seed) + 45.0, 90.0) - 45.0;
      p.x += 0.25 * sin(uTime * (0.8 + seed) + seed * 50.0);
      float borde = smoothstep(45.0, 30.0, abs(p.y));
      p.y += uY;
      em *= uSuben * borde * (0.45 + 0.55 * pw(0.5 + 0.5 * sin(uTime * (1.2 + seed * 2.0) + seed * 70.0), 3.0));`,
    uniforms: { uSub: { value: 0 }, uSuben: { value: 0 }, uY: { value: 0 } },
  });
}

export const acto2: Escena = {
  id: 'acto2',
  nombre: 'Acto II',
  estilos: [{ key: '1', nombre: 'El acto', nota: 'Los rayos en el agua: cada color llega hasta donde puede; bajar entre los azules; la nieve; los últimos que suben; el peso; y el azul que también se va.' }],
  montar(stage): Instancia {
    const root = stage.root;
    const { camera } = stage;
    stage.bloom.strength = 0.75;
    stage.bloom.radius = 0.75;
    stage.bloom.threshold = 0.12;
    stage.finish.uniforms.uGrain.value = 0.03;
    stage.finish.uniforms.uVignette.value = 0.7;

    const mar = pantalla(
      /* glsl */ `
      uniform float uAzul;
      void main() {
        vec3 d = normalize(vDir);
        // The water: the blue that is left, more of it above.
        gl_FragColor = vec4(vec3(0.003, 0.014, 0.05) * uAzul * (0.25 + 1.1 * smoothstep(-0.7, 1.0, d.y)), 1.0);
      }`,
      { uAzul: { value: 0 } },
    );
    root.add(mar.mesh);

    const luces = rayos();
    const suben = ultimos();
    const snow = nevar(26000, 0);
    root.add(luces.points, suben.points, snow.points);

    const b = materiaBuilder(81);
    b.push(0, 0, 0, TU, 0.03, 1);
    const tu = materia(b.data());
    tu.u.uFuente.value = 1;
    root.add(tu.points);

    const tl = new Timeline();
    // y: how far you have gone down (the camera goes with you); pitch, yaw, fov: where it looks;
    // frente: how far down the light has come (0 the surface, 1 you, more: below you); rayos: the
    // light from above; azul: the blue that is left; corte: the height below which the blue shafts
    // are gone; luz, alc: your light and its reach; nieve: the snow; suben, sub: the last ones going
    // up; m, min: the clock.
    tl.set({ y: 0, pitch: 0.1, yaw: 0, fov: 58, frente: -0.2, rayos: 0, azul: 0, corte: -400, luz: 1, alc: 1.5, nieve: 0, suben: 0, sub: 0, m: 200, min: 4 });
    tl.label('arriba');
    // You look up at all the water you already have above you.
    tl.to(2.0, { pitch: 0.72, fov: 82, rayos: 1, azul: 0.5, frente: 0.06 });
    tl.label('rojo').caption(5.6, 'El rojo se va primero', 'De la luz de la ciudad, el agua se lleva primero el rojo.');
    tl.to(5.6, { frente: 0.44, yaw: 0.35, y: -1, m: 204, min: 8 });
    tl.label('demas').caption(5.6, 'Después, lo demás', 'Después el naranja. El amarillo. El verde.');
    tl.to(5.6, { frente: 0.84, yaw: 0.95, pitch: 0.62, y: -3, m: 209, min: 13 });
    // The blue comes down to you, passes you and goes on; the camera comes down with it.
    tl.label('llega').caption(5.0, 'Lo que llega', 'Hasta ti solo llega el azul. Y poco.');
    tl.to(5.0, { frente: 3.8, yaw: 1.55, pitch: 0.1, fov: 62, y: -8, m: 215, min: 17 });
    tl.label('nieve').caption(7.0, 'La nieve', 'Empieza a caer. No va a parar.');
    tl.to(2.4, { nieve: 1, pitch: -0.32, yaw: 1.8, y: -22, m: 300 });
    tl.to(4.6, { y: -50, m: 460, azul: 0.36, min: 32, yaw: 2.2, pitch: -0.2 });
    tl.label('ultimos').caption(6.0, 'Los últimos', 'Los últimos que suben pasan a tu lado. No se detienen.');
    tl.to(2.0, { suben: 1, sub: 1.2, y: -56, m: 500, pitch: 0.12, yaw: 2.35 });
    // The camera follows them up for a moment.
    tl.to(4.0, { suben: 0, sub: 5.5, y: -64, m: 540, min: 40, pitch: 0.5, yaw: 2.55 });
    tl.label('peso').caption(8.0, 'El peso', 'Hasta lo más pequeño cuesta. Tu luz alcanza menos.');
    // The same scroll, and less and less way made.
    tl.to(2.6, { y: -72, m: 575, alc: 1.3, pitch: -0.25, fov: 54 });
    tl.to(2.6, { y: -76, m: 595, alc: 1.15 });
    tl.to(2.8, { y: -78.5, m: 606, azul: 0.22, min: 52, alc: 1.05, yaw: 2.7 });
    // You look up once more: the blue shortens from below, and goes.
    tl.label('azul').caption(7.0, 'Lo último', 'Al final se va también el azul.');
    tl.to(1.6, { pitch: 1.05, fov: 66, y: -84, m: 650 });
    tl.to(4.0, { y: -126, m: 960, corte: ARRIBA + 12, azul: 0, rayos: 0, min: 73, luz: 0.85, alc: 1.0, yaw: 3.0 });
    tl.to(1.4, { y: -HONDO, m: 985, min: 74.5, pitch: -0.1, fov: 46 });
    // No stop at the end: you keep sinking at the same pace while act III comes up over this one.
    tl.to(0.9, { y: -HONDO - 6, m: 1000, min: 75 }, EASE.linear);

    const dir = V();
    const tuEn = V();

    return {
      tl,
      luzEntrada: TU.clone(),
      chispa: tuEn,
      chispaLuz: tu,
      luzSalida: TU.clone(),
      cuenta: (p) => ({ m: tl.get('m', p), min: tl.get('min', p) }),
      rotulo(p): Rotulo | null {
        const cp = tl.captionAt(p);
        return cp ? { capitulo: 'II · Tristeza', name: cp.name, fact: cp.fact } : null;
      },
      update(f: Frame) {
        const p = f.p;
        const y = tl.get('y', p);
        const yaw = tl.get('yaw', p) + 0.012 * Math.sin(f.time * 0.11);
        const pitch = tl.get('pitch', p) + 0.008 * Math.sin(f.time * 0.14);
        camera.near = 0.03;
        camera.far = 600;
        camera.fov = tl.get('fov', p);
        camera.position.set(0, y, 0);
        dir.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
        camera.up.set(0, 1, 0);
        camera.lookAt(dir.x, y + dir.y, dir.z);
        camera.updateMatrixWorld();

        // You: ahead of the camera and a little below where it looks.
        tuEn.set(Math.sin(yaw) * 2.6 * Math.cos(pitch * 0.6), y - 0.35 + Math.sin(pitch * 0.6) * 2.6, -Math.cos(yaw) * 2.6 * Math.cos(pitch * 0.6));
        tu.points.position.copy(tuEn);
        const luz = tl.get('luz', p) * (0.93 + 0.07 * Math.sin(f.time * 1.1));
        enfocar(tu, f.focal, f.dpr, f.time);
        tu.u.uMinPx.value = 5 * f.dpr;
        tu.u.uGain.value = 2.6 * luz;

        const azul = tl.get('azul', p);
        mar.u.uAzul.value = azul;
        enfocar(luces, f.focal, f.dpr, f.time);
        luces.u.uMinPx.value = 1.4 * f.dpr;
        luces.u.uMaxPx.value = 9 * f.dpr;
        luces.u.uGain.value = 2.0;
        luces.u.uFog.value = 420;
        luces.u.uFrente.value = tl.get('frente', p);
        luces.u.uRayos.value = tl.get('rayos', p);
        // The shafts keep more of their light than the water round them, until the end.
        luces.u.uAzul.value = Math.min(1, azul * 2.4);
        luces.u.uCorte.value = tl.get('corte', p);

        const su = tl.get('suben', p);
        suben.points.visible = su > 0.002;
        enfocar(suben, f.focal, f.dpr, f.time);
        suben.u.uMinPx.value = 1.8 * f.dpr;
        suben.u.uGain.value = 1.6;
        suben.u.uSuben.value = su;
        suben.u.uSub.value = tl.get('sub', p);
        suben.u.uY.value = y;
        // They pass on the side the camera looks to.
        suben.points.rotation.y = -tl.get('yaw', tl.at('ultimos') + 3);

        // The flakes stay where they are while you go down past them.
        const nv = tl.get('nieve', p);
        snow.points.visible = nv > 0.001;
        snow.points.position.set(0, y, 0);
        snow.u.uTime.value = f.time;
        snow.u.uFocal.value = f.focal;
        snow.u.uDpr.value = f.dpr;
        snow.u.uCae.value = 0.75 * y;
        snow.u.uLuz.value.copy(tuEn).sub(snow.points.position);
        snow.u.uI.value = luz * nv;
        snow.u.uAlc.value = tl.get('alc', p);
        // A little of the blue from above still falls on the snow, while there is any.
        snow.u.uAmb.value = 0.12 * azul * nv;
      },
      dispose() {},
    };
  },
};
