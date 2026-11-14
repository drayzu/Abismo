import * as THREE from 'three';
import { Timeline } from './timeline';
import { pantalla } from '../src/engine/pantalla';
import { enfocar, materia, materiaBuilder } from '../src/engine/materia';
import { smoothstep } from '../src/engine/math';
import { ac, acento, FONT, ink, nota, proyectar, type Rotulo } from './placa';
import { BIO, CARMIN, ease, FONDO_M, MELOCOTON, PLATA, SEGURO, TU, V } from './comun';
import type { Escena, Frame, Instancia } from './tipos';

/**
 * Study · the work's colour and the pressure clock. The whole way down in a few beats, so the
 * clock and the water column are seen working: the title under the surface, the descent, the wall
 * (the clock stops at 04:12), 04:13 and the other light, in the work's colour. At the end «tú»
 * changes from the series' teal to the work's colour, to compare.
 *
 * The ways are the three candidates for the colour.
 */

const COLORES = [CARMIN, PLATA, MELOCOTON];

/** The water seen level, by depth: turquoise, blue, then almost nothing. Shared by other studies. */
export const COLUMNA = /* glsl */ `
  vec3 columna(float m, float arriba) {
    float luz = 0.42 * exp(-m / 300.0);
    vec3 tinte = mix(vec3(0.07, 0.42, 0.56), vec3(0.015, 0.11, 0.44), smoothstep(0.0, 160.0, m));
    tinte = mix(tinte, vec3(0.012, 0.03, 0.16), smoothstep(160.0, 900.0, m));
    float cielo = 0.35 + 1.1 * smoothstep(-0.7, 1.0, arriba);
    return tinte * luz * cielo + vec3(0.0015, 0.002, 0.005) * (0.6 + 0.4 * arriba);
  }
`;

export const color: Escena = {
  id: 'color',
  nombre: 'El color y el reloj',
  estilos: [
    { key: '1', nombre: 'Rosa carmín', nota: 'Lo primero que el agua se lleva y lo último que vuelve: lo vivo, la otra persona.' },
    { key: '2', nombre: 'Plata lunar', nota: 'La luz que queda, casi sin color.' },
    { key: '3', nombre: 'Melocotón', nota: 'El amanecer del final.' },
  ],
  montar(stage, estilo): Instancia {
    const root = stage.root;
    const { camera } = stage;
    const C = COLORES[estilo];
    acento(C);
    stage.bloom.strength = 0.75;
    stage.bloom.radius = 0.7;
    stage.bloom.threshold = 0.2;

    const mar = pantalla(
      /* glsl */ `
      uniform float uM;
      ${SEGURO}
      ${COLUMNA}
      void main() {
        vec3 d = normalize(vDir);
        vec3 c = columna(uM, d.y);
        // Shafts from above, only near the surface.
        float r = fbm(vec2(d.x * 7.0 + d.z * 3.0, uTime * 0.12)) * smoothstep(0.0, 0.9, d.y);
        c += vec3(0.2, 0.55, 0.7) * r * 0.1 * exp(-uM / 60.0);
        gl_FragColor = vec4(c, 1.0);
      }`,
      { uM: { value: 0 } },
    );
    root.add(mar.mesh);

    const TU_EN = V(-0.42, 0, 0);
    const OTRA = V(0.42, 0.05, 0);
    const b1 = materiaBuilder(11);
    b1.push(TU_EN.x, TU_EN.y, TU_EN.z, new THREE.Color(1, 1, 1), 0.03, 1);
    const tu = materia(b1.data(), { pre: /* glsl */ `uniform vec3 uCol;`, move: /* glsl */ `em = uCol;`, uniforms: { uCol: { value: TU.clone() } } });
    tu.u.uFuente.value = 1;
    const b2 = materiaBuilder(12);
    b2.push(OTRA.x, OTRA.y, OTRA.z, C, 0.03, 1);
    const otra = materia(b2.data());
    otra.u.uFuente.value = 1;

    // The living lights around: blue, close to the teal of «tú» (the thing to check).
    const b3 = materiaBuilder(13);
    for (let i = 0; i < 420; i++) {
      const [x, y, z] = b3.onSphere();
      const r = 1.2 + 5 * Math.pow(b3.r(), 1.6);
      const c = BIO.clone().lerp(new THREE.Color(0.3, 1.0, 0.8), b3.r() * 0.45);
      b3.push(x * r, y * r * 0.6, z * r - 1.5, c, 0.02, 1);
    }
    const vivas = materia(b3.data(), {
      pre: /* glsl */ `uniform float uOn;`,
      move: /* glsl */ `
        float t = uTime * (0.25 + seed * 0.5) + seed * 60.0;
        float pulso = pow(max(0.5 + 0.5 * sin(t), 0.0), 6.0);
        em *= pulso * smoothstep(seed * 0.8, seed * 0.8 + 0.2, uOn);
        p.y += 0.05 * sin(uTime * 0.2 + seed * 30.0);`,
      uniforms: { uOn: { value: 0 } },
    });
    root.add(vivas.points, tu.points, otra.points);

    const tl = new Timeline();
    // m: depth; min: the hour; quieto: the clock stopped; otra: the other light; vivas: the living lights; cambio: «tú» takes the work's colour.
    tl.set({ m: 2, min: -20, titulo: 0, tu: 0, quieto: 0, otra: 0, vivas: 0, cambio: 0, tuLuz: 1 });
    tl.label('titulo').caption(3.0, 'El título', 'Así entra la obra: bajo la superficie, a una atmósfera.');
    tl.to(0.8, { titulo: 1 });
    tl.to(1.6, { m: 8, min: -19 });
    tl.to(0.6, { titulo: 0, tu: 1 });
    tl.label('baja').caption(5.2, 'El reloj de presión', 'El número grande es el peso que llevas encima. Debajo: la profundidad, la hora en el cuarto y el frío del agua.');
    tl.to(1.2, { m: 200, min: 12 });
    tl.to(1.2, { m: 1000, min: 75 });
    tl.to(1.4, { m: 4000, min: 190 });
    tl.to(1.4, { m: FONDO_M, min: 252, tuLuz: 0.25 });
    tl.label('muro').caption(2.4, 'El muro', 'En el fondo el reloj se detiene. La hora se queda pegada en las 04:12.');
    tl.to(2.4, { quieto: 1, tuLuz: 0.12 });
    tl.label('grieta').caption(3.6, 'La otra luz', '04:13. Algo se mueve otra vez. Una de las luces tiene el color de la obra: es otra persona.');
    tl.set({ min: 252 });
    tl.to(0.3, { min: 253, quieto: 0 });
    tl.to(1.5, { vivas: 1, tuLuz: 0.6 });
    tl.to(1.8, { otra: 1, tuLuz: 1 });
    tl.label('cambio').caption(3.2, '¿Y tú?', 'Tu luz puede seguir en el verde de la serie, o tomar el color de la obra. Aquí cambia para comparar.');
    tl.wait(1.2);
    tl.to(1.2, { cambio: 1 });
    tl.wait(0.8);

    const scr = { x: 0, y: 0, z: 0 };
    const col = new THREE.Color();

    return {
      tl,
      cuenta: (p) => ({ m: tl.get('m', p), min: tl.get('min', p), quieto: tl.get('quieto', p) }),
      rotulo(p): Rotulo | null {
        const cp = tl.captionAt(p);
        return cp ? { capitulo: 'Fase 0 · color y reloj', name: cp.name, fact: cp.fact } : null;
      },
      placa(g, f) {
        const u = f.u;
        const t = tl.get('titulo', f.p);
        if (t > 0.01) {
          g.save();
          g.globalAlpha = t;
          g.textAlign = 'center';
          g.shadowColor = 'rgba(0,0,0,0.7)';
          g.shadowBlur = 24 * u;
          g.font = FONT.mono(11.5 * u);
          g.letterSpacing = `${3.4 * u}px`;
          g.fillStyle = ac();
          g.fillText('HORIZONTES · 06', f.W / 2, f.H * 0.4 - 96 * u);
          g.letterSpacing = '0px';
          g.font = FONT.serif(150 * u);
          g.fillStyle = ink();
          g.fillText('Abismo', f.W / 2, f.H * 0.4 + 36 * u);
          g.font = FONT.italic(30 * u);
          g.fillStyle = ink(0.8);
          g.fillText('¿Para qué seguir?', f.W / 2, f.H * 0.4 + 92 * u);
          g.restore();
        }
        const o = tl.get('otra', f.p);
        if (o > 0.3) {
          const a = ease(0.3, 0.9, o);
          const cambio = tl.get('cambio', f.p);
          proyectar(TU_EN, camera, f.W, f.H, scr);
          nota(g, u, scr.x, scr.y, cambio > 0.5 ? 'tú · color de la obra' : 'tú · verde de la serie', -46, -52, a, ink(0.9));
          proyectar(OTRA, camera, f.W, f.H, scr);
          nota(g, u, scr.x, scr.y, 'otra persona', 46, -52, a);
        }
      },
      update(f: Frame) {
        const p = f.p;
        camera.near = 0.02;
        camera.far = 200;
        camera.fov = 40;
        camera.position.set(0.08 * Math.sin(f.time * 0.07), 0.04 * Math.sin(f.time * 0.05), 3.4);
        camera.up.set(0, 1, 0);
        camera.lookAt(0, 0, 0);
        mar.u.uM.value = tl.get('m', p);

        const cambio = tl.get('cambio', p);
        col.copy(TU).lerp(C, smoothstep(0, 1, cambio));
        (tu.u.uCol.value as THREE.Color).copy(col);
        enfocar(tu, f.focal, f.dpr, f.time);
        tu.u.uMinPx.value = 6 * f.dpr;
        tu.u.uGain.value = 3.0 * tl.get('tu', p) * tl.get('tuLuz', p) * (0.92 + 0.08 * Math.sin(f.time * 0.9));
        enfocar(otra, f.focal, f.dpr, f.time);
        otra.u.uMinPx.value = 6 * f.dpr;
        otra.u.uGain.value = 4.2 * tl.get('otra', p) * (0.92 + 0.08 * Math.sin(f.time * 0.8 + 2));
        enfocar(vivas, f.focal, f.dpr, f.time);
        vivas.u.uMinPx.value = 2.2 * f.dpr;
        vivas.u.uGain.value = 1.6;
        vivas.u.uOn.value = tl.get('vivas', p);
      },
      dispose() {},
    };
  },
};
