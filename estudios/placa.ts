import * as THREE from 'three';
import { clamp, smoothstep } from '../src/engine/math';
import { FONDO_M, presion, temperatura, ZONAS } from './comun';

/**
 * Abismo's plate: everything drawn in 2D over the film, in device pixels, so a capture holds it.
 * - The clock (bottom left): the pressure, in atmospheres, large; under it the depth, the hour of
 *   the night in the room and the temperature of the water.
 * - The ladder (right): the water column, from the surface to the bottom, with the five zones.
 */

export const FONT = {
  serif: (px: number) => `${px}px "Instrument Serif"`,
  italic: (px: number) => `italic ${px}px "Instrument Serif"`,
  mono: (px: number) => `500 ${px}px "Geist Mono Variable"`,
  sans: (px: number) => `500 ${px}px "Geist Variable"`,
};

/** The work's colour (proposed: carmine rose). The colour study changes it. */
const AC = { r: 255, g: 111, b: 145 };
export function acento(c: THREE.Color) {
  AC.r = Math.round(c.r * 255);
  AC.g = Math.round(c.g * 255);
  AC.b = Math.round(c.b * 255);
}
export const ac = (a = 1) => `rgba(${AC.r},${AC.g},${AC.b},${a})`;
export const ink = (a = 1) => `rgba(236,231,219,${a})`;

export const grupo = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
/** Minutes since midnight as «04:12» (the night starts before midnight). */
export const hora = (min: number) => {
  const m = ((Math.floor(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

// ---------------------------------------------------------------- drawing helpers

export function proyectar(v: THREE.Vector3, camera: THREE.Camera, W: number, H: number, out = { x: 0, y: 0, z: 0 }) {
  const p = v.clone().project(camera);
  out.x = ((p.x + 1) / 2) * W;
  out.y = ((1 - p.y) / 2) * H;
  out.z = p.z;
  return out;
}

export function wrap(g: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** A line of text on the film (sans, or mono when `mono`), with a soft shadow. */
export function texto(g: CanvasRenderingContext2D, u: number, x: number, y: number, s: string, color: string, alpha: number, px = 13, align: CanvasTextAlign = 'left', mono = true) {
  if (alpha <= 0.01) return;
  g.save();
  g.globalAlpha = alpha;
  g.font = mono ? FONT.mono(px * u) : FONT.sans(px * u);
  g.letterSpacing = mono ? `${1.1 * u}px` : '0px';
  g.textAlign = align;
  g.textBaseline = 'middle';
  g.shadowColor = 'rgba(0,0,0,0.9)';
  g.shadowBlur = 10 * u;
  g.fillStyle = color;
  g.fillText(mono ? s.toUpperCase() : s, x, y);
  g.restore();
}

/** A note: a dot on the thing, a leader out to (x + dx, y + dy), and its label. */
export function nota(g: CanvasRenderingContext2D, u: number, x: number, y: number, text: string, dx: number, dy: number, alpha = 1, color = ac()) {
  if (alpha <= 0.01) return;
  g.save();
  g.globalAlpha = alpha;
  const lx = x + dx * u;
  const ly = y + dy * u;
  g.strokeStyle = ink(0.5);
  g.lineWidth = Math.max(1, u * 0.9);
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(lx, ly);
  g.stroke();
  g.fillStyle = color;
  g.beginPath();
  g.arc(x, y, 2.4 * u, 0, Math.PI * 2);
  g.fill();
  g.font = FONT.mono(10.5 * u);
  g.letterSpacing = `${1.1 * u}px`;
  const label = text.toUpperCase();
  const w = g.measureText(label).width;
  const tx = dx >= 0 ? lx + 6 * u : lx - 6 * u - w;
  g.fillStyle = ink(0.9);
  g.textBaseline = 'middle';
  g.shadowColor = 'rgba(0,0,0,0.9)';
  g.shadowBlur = 8 * u;
  g.fillText(label, tx, ly + 0.5 * u);
  g.restore();
}

/**
 * A thought: first person, in the middle of the dark, written letter by letter and then erased.
 * `k` runs 0 → 1 (written) → 2 (erased); between 1 and 1.4 it stays.
 */
export function pensamiento(g: CanvasRenderingContext2D, u: number, x: number, y: number, s: string, k: number, alpha = 1, px = 30) {
  if (k <= 0 || k >= 2 || alpha <= 0.01) return;
  const n = k < 1 ? Math.ceil(s.length * smoothstep(0, 1, k)) : Math.ceil(s.length * (1 - smoothstep(1.4, 2, k)));
  if (n <= 0) return;
  g.save();
  g.globalAlpha = alpha;
  g.font = FONT.italic(px * u);
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  const full = g.measureText(s).width;
  const part = s.slice(0, n);
  g.shadowColor = 'rgba(0,0,0,0.9)';
  g.shadowBlur = 14 * u;
  g.fillStyle = ink(0.86);
  g.fillText(part, x - full / 2, y);
  // The cursor, while it is being written or erased.
  if (k < 1 || k > 1.4) {
    const w = g.measureText(part).width;
    g.fillStyle = ink(0.7);
    g.fillRect(x - full / 2 + w + 3 * u, y - px * u * 0.42, Math.max(1, 1.3 * u), px * u * 0.84);
  }
  g.restore();
}

// ---------------------------------------------------------------- the clock

export interface Rotulo {
  /** «II · Tristeza». */
  capitulo?: string;
  name: string;
  fact: string;
}

/** What the clock reads: the depth, and the hour of the night in the room. */
export interface Cuenta {
  /** Depth in metres. */
  m: number;
  /** The hour in the room, in minutes since midnight (23:40 is −20). */
  min: number;
  a?: number;
  /** The wall: the clock has stopped (it is drawn dimmer, and nothing changes). */
  quieto?: number;
}

/** The pressure at bottom left, with the moment's chapter, name and sentence above it. */
/** A narrow screen (a phone upright): the scale hugs the right edge without its labels, and the
 * sentence keeps clear of it. */
export const angosto = (W: number, u: number) => W / u < 900;

export function cuenta(g: CanvasRenderingContext2D, u: number, H: number, c: Cuenta | null, cap: Rotulo | null, capAlpha = 1) {
  const x = 44 * u;
  g.save();
  g.textBaseline = 'alphabetic';
  g.shadowColor = 'rgba(0,0,0,0.85)';
  g.shadowBlur = 12 * u;
  if (cap && capAlpha > 0.01) {
    g.globalAlpha = capAlpha;
    if (cap.capitulo) {
      g.font = FONT.mono(10.5 * u);
      g.letterSpacing = `${1.6 * u}px`;
      g.fillStyle = ac();
      g.fillText(cap.capitulo.toUpperCase(), x, H - 262 * u);
      g.letterSpacing = '0px';
    }
    g.font = FONT.italic(31 * u);
    g.fillStyle = ink();
    g.fillText(cap.name, x, H - 226 * u);
    g.font = FONT.sans(14.5 * u);
    g.fillStyle = ink(0.66);
    wrap(g, cap.fact, angosto(g.canvas.width, u) ? g.canvas.width - x - 44 * u : 430 * u).forEach((line, i) => g.fillText(line, x, H - 198 * u + i * 21 * u));
    g.globalAlpha = 1;
  }
  if (c && (c.a ?? 1) > 0.01) {
    const q = c.quieto ?? 0;
    g.globalAlpha = (c.a ?? 1) * (1 - 0.45 * q);
    const atm = grupo(presion(c.m));
    g.font = FONT.serif(66 * u);
    g.fillStyle = ink();
    g.fillText(atm, x, H - 86 * u);
    const w = g.measureText(atm).width;
    g.font = FONT.serif(26 * u);
    g.fillStyle = ink(0.6);
    g.fillText('atm', x + w + 12 * u, H - 88 * u);
    g.font = FONT.mono(11 * u);
    g.letterSpacing = `${0.9 * u}px`;
    g.fillStyle = ink(0.78);
    const t = temperatura(c.m);
    g.fillText(`${grupo(c.m)} m  ·  ${hora(c.min)}  ·  ${Math.round(t)} °C`.toUpperCase(), x, H - 52 * u);
  }
  g.restore();
}

// ---------------------------------------------------------------- the ladder

/** Where a depth sits on the column (0 surface, 1 bottom): a root, so the upper zones have room. */
const col = (m: number) => Math.sqrt(clamp(m, 0, FONDO_M) / FONDO_M);

/** The water column at the right edge: the five zones, and your mark going down it. */
export function escalera(g: CanvasRenderingContext2D, u: number, W: number, H: number, m: number, alpha = 1) {
  if (alpha <= 0.01) return;
  const chico = angosto(W, u);
  const x = chico ? W - 20 * u : W - 150 * u;
  const y0 = 96 * u;
  const y1 = H - 76 * u;
  const yOf = (v: number) => y0 + col(v) * (y1 - y0);
  g.save();
  g.globalAlpha = alpha;
  g.lineWidth = Math.max(1, 1.1 * u);
  g.strokeStyle = ink(0.34);
  g.beginPath();
  g.moveTo(x, y0);
  g.lineTo(x, y1);
  g.stroke();
  // The surface: a short line across.
  g.strokeStyle = ink(0.6);
  g.beginPath();
  g.moveTo(x - 12 * u, y0);
  g.lineTo(x + 12 * u, y0);
  g.stroke();
  g.font = FONT.mono(9 * u);
  g.letterSpacing = `${1 * u}px`;
  g.textBaseline = 'middle';
  const zona = ZONAS.find((z) => m >= z[1] && m < z[2]) ?? ZONAS[ZONAS.length - 1];
  for (const z of ZONAS) {
    const ya = yOf(z[1]);
    const yb = yOf(z[2]);
    const on = z === zona;
    g.strokeStyle = ink(0.34);
    g.beginPath();
    g.moveTo(x - 7 * u, yb);
    g.lineTo(x, yb);
    g.stroke();
    if (chico) continue;
    g.textAlign = 'left';
    g.fillStyle = ink(on ? 0.92 : 0.32);
    g.fillText(z[0].toUpperCase(), x + 14 * u, (ya + yb) / 2);
    g.textAlign = 'right';
    g.fillStyle = ink(0.3);
    g.fillText(grupo(z[2] >= 11000 ? FONDO_M : z[2]), x - 12 * u, yb);
  }
  // The way down so far, and the mark.
  const yp = yOf(m);
  const grd = g.createLinearGradient(0, y0, 0, yp + 1);
  grd.addColorStop(0, ac(0.08));
  grd.addColorStop(1, ac(0.9));
  g.fillStyle = grd;
  g.fillRect(x - 1.5 * u, y0, 3 * u, yp - y0);
  g.fillStyle = ac();
  g.shadowColor = ac();
  g.shadowBlur = 10 * u;
  g.beginPath();
  g.arc(x, yp, 4 * u, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** The brand and the study, top left. */
export function marca(g: CanvasRenderingContext2D, u: number, concepto: string, sub: string) {
  g.save();
  g.textBaseline = 'alphabetic';
  g.shadowColor = 'rgba(0,0,0,0.8)';
  g.shadowBlur = 10 * u;
  g.font = FONT.serif(27 * u);
  g.fillStyle = ink();
  g.fillText('Abismo', 40 * u, 54 * u);
  const w = g.measureText('Abismo').width;
  g.font = FONT.mono(10.5 * u);
  g.letterSpacing = `${1.4 * u}px`;
  g.fillStyle = ac();
  g.fillText(concepto.toUpperCase(), 40 * u + w + 16 * u, 52 * u);
  g.fillStyle = ink(0.5);
  g.fillText(sub.toUpperCase(), 40 * u, 76 * u);
  g.restore();
}

// ---------------------------------------------------------------- the sheet

/** The sheet (key I): a panel at the right with what the journey does not stop to explain. */
export function lamina(g: CanvasRenderingContext2D, u: number, W: number, H: number, l: { titulo: string; parrafos: string[]; ayuda?: string[] }, a: number) {
  if (a <= 0.01) return;
  const w = 430 * u;
  const x = W - w - 44 * u + (1 - a) * 30 * u;
  g.save();
  g.globalAlpha = a;
  g.fillStyle = 'rgba(6,6,9,0.9)';
  g.fillRect(x - 30 * u, 0, w + 80 * u, H);
  g.strokeStyle = ink(0.18);
  g.lineWidth = Math.max(1, u);
  g.beginPath();
  g.moveTo(x - 30 * u, 0);
  g.lineTo(x - 30 * u, H);
  g.stroke();
  g.textBaseline = 'alphabetic';
  g.font = FONT.mono(10.5 * u);
  g.letterSpacing = `${1.6 * u}px`;
  g.fillStyle = ac();
  g.fillText('LÁMINA', x, 96 * u);
  g.letterSpacing = '0px';
  g.font = FONT.italic(34 * u);
  g.fillStyle = ink();
  g.fillText(l.titulo, x, 140 * u);
  let y = 186 * u;
  g.font = FONT.sans(15 * u);
  g.fillStyle = ink(0.8);
  for (const par of l.parrafos) {
    for (const line of wrap(g, par, w - 10 * u)) {
      g.fillText(line, x, y);
      y += 23 * u;
    }
    y += 14 * u;
  }
  if (l.ayuda) {
    y += 8 * u;
    g.fillStyle = ac(0.9);
    g.fillRect(x, y - 16 * u, 26 * u, Math.max(1, 1.4 * u));
    y += 12 * u;
    for (const [i, line] of l.ayuda.entries()) {
      g.font = i === 0 ? FONT.sans(16 * u) : FONT.sans(14.5 * u);
      g.fillStyle = ink(i === 0 ? 0.98 : 0.86);
      g.fillText(line, x, y);
      y += 25 * u;
    }
  }
  g.font = FONT.mono(9.5 * u);
  g.letterSpacing = `${1.2 * u}px`;
  g.fillStyle = ink(0.42);
  g.fillText('I: CERRAR', x, H - 44 * u);
  g.restore();
}
