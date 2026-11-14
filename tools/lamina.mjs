// A capture of the sheet (key I) open at a beat: node tools/lamina.mjs <out.jpg> <beat>
import { abrir } from './cromo.mjs';
const [out, beat] = process.argv.slice(2);
const c = await abrir();
await c.ir(`index.html?debug&cap=1600x900&lamina&p=${beat}`);
console.log(await c.evaluar(`viaje.hoja(${JSON.stringify(out)}, [${Number(beat)}], 1, 1600)`), out);
process.exit((await c.cerrar()) ? 1 : 0);
