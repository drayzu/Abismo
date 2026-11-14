// The cost of a frame over a stretch of the journey: node tools/ritmo.mjs <from> <to> [step]
import { abrir } from './cromo.mjs';
const [desde, hasta, paso = 2] = process.argv.slice(2).map(Number);
const c = await abrir();
await c.ir('index.html?debug&cap=1600x900');
await c.evaluar('viaje.listo()');
const ms = await c.evaluar(`(() => { const o = []; for (let b = ${desde}; b <= ${hasta}; b += ${paso}) o.push([b, +viaje.ritmo(b, 12).toFixed(1)]); return o; })()`);
console.log(ms.map(([b, m]) => `${b}: ${m}`).join('  '));
console.log('máximo', Math.max(...ms.map((x) => x[1])), 'ms');
process.exit((await c.cerrar()) ? 1 : 0);
