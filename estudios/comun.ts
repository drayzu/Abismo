import * as THREE from 'three';

/** What the studies share: the series' colours, the sea's numbers and small helpers. */

export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
/** «Tú»: the teal of the series since Destino. */
export const TU = new THREE.Color(0.45, 1.0, 0.85);
/** The candidates for the work's colour (BRIEF § Lenguaje visual). */
export const CARMIN = new THREE.Color('#ff6f91');
export const PLATA = new THREE.Color('#dfe4ee');
export const MELOCOTON = new THREE.Color('#ffb8a3');
/** Living light: most deep-sea bioluminescence is blue, around 470–490 nm. */
export const BIO = new THREE.Color(0.25, 0.62, 1.0);

export const ease = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Looks the camera from `pos` at `at`, with `up`. */
export function mirar(camera: THREE.PerspectiveCamera, pos: THREE.Vector3, at: THREE.Vector3, up = V(0, 1, 0)) {
  camera.position.copy(pos);
  camera.up.copy(up);
  camera.lookAt(at);
}

// ---------------------------------------------------------------- the sea (approximate; to verify for the sheet)

/** The zones: [name, from, to] in metres. */
export const ZONAS: [string, number, number][] = [
  ['iluminada', 0, 200],
  ['crepúsculo', 200, 1000],
  ['medianoche', 1000, 4000],
  ['abisal', 4000, 6000],
  ['hadal', 6000, 11000],
];
export const FONDO_M = 10935;

/** Pressure in atmospheres: one for the air, and about one more every ten metres of sea water. */
export const presion = (m: number) => 1 + m / 10;

const TEMP: [number, number][] = [
  [0, 18],
  [200, 12],
  [1000, 4.5],
  [4000, 1.8],
  [6000, 1.5],
  [11000, 2.4],
];
/** Water temperature in °C by depth (a typical mid-latitude profile, by hand). */
export function temperatura(m: number) {
  for (let i = 1; i < TEMP.length; i++) {
    if (m <= TEMP[i][0]) {
      const [a, ta] = TEMP[i - 1];
      const [b, tb] = TEMP[i];
      return ta + ((m - a) / (b - a)) * (tb - ta);
    }
  }
  return TEMP[TEMP.length - 1][1];
}

/**
 * GLSL that cannot make a NaN (one bad pixel blackens the frame through the bloom), plus noise and
 * what water does to light: it takes red first (clear ocean water, per metre, close to Pope and
 * Fry 1997 at 650, 530 and 450 nm).
 */
export const SEGURO = /* glsl */ `
  float pw(float x, float n) { return pow(max(x, 0.0), n); }
  float rz(float x) { return sqrt(max(x, 0.0)); }
  float h11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
  float h21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  vec2 h22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
  float ruido(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 4; i++) { s += a * ruido(p); p = p * 2.03 + 17.1; a *= 0.5; }
    return s;
  }
  const vec3 K_AGUA = vec3(0.34, 0.044, 0.0095);
  // What is left of white light after m metres of water.
  vec3 agua(float m) { return exp(-K_AGUA * max(m, 0.0)); }
`;
