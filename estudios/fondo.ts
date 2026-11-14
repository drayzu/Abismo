import { Timeline } from './timeline';
import { pantalla } from '../src/engine/pantalla';
import { enfocar, materia, materiaBuilder } from '../src/engine/materia';
import { pensamiento, type Rotulo } from './placa';
import { FONDO_M, SEGURO, TU, V } from './comun';
import { nevar } from './nieve';
import type { Escena, Frame, Instancia } from './tipos';

/**
 * Study · the bottom (act IV), and how to show it without making it beautiful. The rules of care
 * (BRIEF § Cuidado) decide this image: the bottom is cold, still and dark, never seductive; there
 * is no body, no struggle, no edge. The camera is your point of light and nothing else. The clock
 * stops at 04:12. The thought is said once, plainly, and the voice answers that you are not the
 * only one. Your light goes down to almost nothing, and does not go out.
 *
 * 1 · Black: nothing at all but your light and the stopped clock. After «you are not the only one»
 *     the black fills for a moment with lights like yours, far apart, each alone; then only yours.
 * 2 · The plain: the grey sediment of the abyssal floor, a metre of it, lit by what is left of you.
 * 3 · The still snow: the snow that fell all the way down has stopped in mid-water, like the clock.
 */

const SUELO = /* glsl */ `
  uniform float uLuz, uModo;
  uniform vec3 uTu;
  ${SEGURO}
  void main() {
    vec3 c = vec3(0.0);
    vec3 d = normalize(vDir);
    if (uModo > 0.5 && uModo < 1.5 && d.y < -0.01) {
      // The floor, 0.55 under the camera: grey silt with soft ripples, seen only near your light.
      vec3 o = vec3(0.0, 0.0, 0.0);
      float t = -0.55 / d.y;
      vec3 x = o + d * t;
      float limo = 0.55 + 0.45 * fbm(x.xz * 3.0) - 0.25 * fbm(x.xz * 14.0);
      limo *= 0.8 + 0.2 * sin(x.z * 9.0 + 2.0 * fbm(x.xz * 1.5));
      vec3 a = x - uTu;
      float luz = 0.3 / (dot(a, a) + 0.25);
      float inc = clamp(-normalize(a).y, 0.0, 1.0);
      c = vec3(0.46, 0.46, 0.44) * limo * luz * inc * uLuz * exp(-t * 0.25);
    }
    gl_FragColor = vec4(c, 1.0);
  }
`;

export const fondo: Escena = {
  id: 'fondo',
  nombre: 'El fondo',
  estilos: [
    { key: '1', nombre: 'Negro', nota: 'Elegida: la lluvia se detiene, se apaga, y no queda nada: solo tu luz y el reloj detenido.' },
    { key: '2', nombre: 'La llanura', nota: 'El limo gris del fondo, apenas un metro alrededor de tu luz. Frío, sin azul.' },
    { key: '3', nombre: 'La nieve quieta', nota: 'La nieve que cayó hasta aquí se quedó detenida en el agua, igual que el reloj.' },
  ],
  montar(stage, estilo, viaje): Instancia {
    const root = stage.root;
    const { camera } = stage;
    // No glow down here: nothing should look inviting.
    stage.bloom.strength = 0.3;
    stage.bloom.radius = 0.4;
    stage.bloom.threshold = 0.3;
    stage.finish.uniforms.uGrain.value = 0.034;
    stage.finish.uniforms.uVignette.value = 0.8;

    const TU_EN = V(0, -0.2, -2.6);
    const piso = pantalla(SUELO, { uLuz: { value: 1 }, uModo: { value: estilo }, uTu: { value: TU_EN.clone() } });
    root.add(piso.mesh);

    // Way 1 arrives with the rain of the end of act III: it stops with the clock, and then goes out.
    const snow = estilo === 2 ? nevar(26000, 0) : estilo === 0 ? nevar(26000, 2) : null;
    if (snow) {
      if (estilo === 2) snow.u.uCol.value.setRGB(0.7, 0.72, 0.74);
      root.add(snow.points);
    }

    const b = materiaBuilder(41);
    b.push(TU_EN.x, TU_EN.y, TU_EN.z, TU, 0.03, 1);
    const tu = materia(b.data());
    tu.u.uFuente.value = 1;
    root.add(tu.points);

    // The others (way 1): lights like yours, far and far apart. None of them sees the rest.
    const bo = materiaBuilder(42);
    for (let i = 0; i < 280; i++) {
      const [x, y, z] = bo.onSphere();
      const rad = 7 + 34 * Math.pow(bo.r(), 1.4);
      bo.push(x * rad, y * rad * 0.7, -Math.abs(z) * rad - 3, TU, 0.03, 0.5 + 0.5 * bo.r());
    }
    const otros = materia(bo.data(), { move: /* glsl */ `em *= 0.75 + 0.25 * sin(uTime * (0.5 + seed) + seed * 40.0);` });
    otros.u.uFuente.value = 1;
    if (estilo === 0) root.add(otros.points);

    const tl = new Timeline();
    // luz: your light; quieto: the clock stopped; t: the thought, 0 → 1 written (it is not erased here).
    // alc: how far your light reaches; otros: the others, each in their own dark.
    tl.set({ luz: viaje ? 0.7 : 0.55, alc: viaje ? 0.45 : 0.3, quieto: 0, t: 0, para: 0, lluvia: 1, cae: 0, otros: 0, m: viaje ? 3900 : FONDO_M, min: viaje ? 190 : 252 });
    if (viaje) {
      // The journey comes from act III at 3 900 m, in the rain: the rest of the way down.
      tl.label('baja').caption(10.0, 'Más abajo', 'Abisal. Después, hadal. Los últimos nombres.');
      tl.to(4.0, { m: 6000, min: 222, cae: 8, alc: 0.3 });
      tl.to(6.0, { m: FONDO_M, min: 252, cae: 19, luz: 0.55, alc: 0.16 });
    }
    tl.label('silencio').caption(6.0, 'El silencio', 'Aquí no se oye nada. El reloj se detiene.');
    tl.with(2.0, { para: 1 });
    tl.to(2.0, { quieto: 1 });
    tl.to(2.4, { luz: 0.42, lluvia: 0 });
    tl.wait(1.6);
    // Said once, slowly, with nothing else on screen.
    tl.label('pensamiento').caption(9.0, 'El pensamiento', '');
    tl.wait(1.2);
    tl.with(3.6, { t: 1 }, (x) => x);
    tl.to(7.8, { luz: 0.34 });
    tl.label('unico').caption(5.0, 'No eres el único', 'Mucha gente lo piensa. Casi nadie lo dice.');
    tl.to(5.0, { luz: 0.3 });
    tl.label('otros').caption(8.0, 'Los otros', 'Cada uno en su oscuridad.');
    tl.to(3.0, { otros: 1 });
    tl.wait(2.4);
    tl.to(2.6, { otros: 0, luz: 0.26 });
    tl.label('casi').caption(6.0, 'Tu luz', 'Baja hasta casi nada. Y no se apaga.');
    tl.to(4.4, { luz: 0.07 });
    tl.wait(1.6);

    let reloj = 0;
    let ultimo = -1;

    return {
      tl,
      luzEntrada: TU.clone(),
      luzSalida: TU.clone(),
      // It leaves the act as it is at the end: almost out.
      puente: 0.05,
      cuenta: (p) => ({ m: tl.get('m', p), min: tl.get('min', p), quieto: tl.get('quieto', p) }),
      rotulo(p): Rotulo | null {
        const cp = tl.captionAt(p);
        return cp ? { capitulo: 'IV · El fondo', name: cp.name, fact: cp.fact } : null;
      },
      placa(g, f) {
        // Said once, plainly; it stays while the voice answers.
        pensamiento(g, f.u, f.W * 0.5, f.H * 0.34, 'A veces pienso en no seguir.', Math.min(tl.get('t', f.p), 1.2), 1, 34);
      },
      update(f: Frame) {
        const p = f.p;
        camera.near = 0.02;
        camera.far = 100;
        camera.fov = 44;
        const para = tl.get('para', p);
        // The world slows to a stop with the clock: its time only runs while it has not stopped.
        if (ultimo >= 0) reloj += Math.max(0, f.time - ultimo) * (1 - para);
        ultimo = f.time;
        camera.position.set(0, 0, 0);
        camera.up.set(0, 1, 0);
        camera.lookAt(TU_EN.x, TU_EN.y - (viaje ? 0 : 0.05), TU_EN.z);
        // With no ambient time (the tests, or reduced motion) the rain's own time is zero too, so a
        // frame depends only on where the journey is.
        const corre = f.time === 0 ? 0 : reloj;
        const luz = tl.get('luz', p);
        piso.u.uLuz.value = luz;
        if (snow) {
          snow.u.uTime.value = 40 + corre;
          snow.u.uFocal.value = f.focal;
          snow.u.uDpr.value = f.dpr;
          snow.u.uLuz.value.copy(TU_EN);
          if (estilo === 0) snow.u.uAlc.value = tl.get('alc', p);
          snow.u.uI.value = estilo === 0 ? 0.6 * tl.get('lluvia', p) : luz * 0.7;
          if (estilo === 0) snow.u.uCae.value = corre * 2.2 + tl.get('cae', p);
        }
        enfocar(otros, f.focal, f.dpr, f.time);
        otros.u.uMinPx.value = 3.4 * f.dpr;
        otros.u.uGain.value = 2.4 * tl.get('otros', p);
        enfocar(tu, f.focal, f.dpr, f.time);
        tu.u.uMinPx.value = 5 * f.dpr;
        tu.u.uGain.value = 2.6 * luz;
      },
      dispose() {},
    };
  },
};
