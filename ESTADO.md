# Abismo · estado

## Dónde estamos

> **13 de noviembre · Diego vio el guion v2 animado y dijo que está «súper flojo»: faltan escenas, emoción, belleza e inmersión; «falta mucho todavía».** Acordado con él: dejar de avanzar a lo ancho. Se lleva una escena a su mejor nivel, se la muestra en movimiento hasta que diga «esto», y ese es el listón para las demás. Se empezó por el acto V. Debe tener inmersión y efecto wow.
>
> **Regla nueva de Diego: la obra nunca nombra un lugar** (ni Chile ni ningún otro). Se puede usar un lugar real disimulado, sin decirlo. Ojo: el texto de ayuda del final y la lámina del acto IV dicen hoy «En Chile: \*4141»; hay que resolverlo con él (la ayuda necesita ser concreta).
>
> **Acto V rehecho** (`estudios/acto5.ts`, suelto en `estudios/index.html?m=acto5`; reemplaza a `luces` en el viaje, que queda solo como estudio). Es un solo plano largo por un lugar, 82 beats, unos tres minutos:
> - El destello lejano, y después **el frente de luz**: cruza todo el fondo hacia ti y te atraviesa. Cada punto sabe cuándo le llega la luz (su distancia al primer destello), así que el frente es real.
> - Un campo de 320 000 chispas; anillos de luz que salen de ti (uno lo manda el viaje, otro tu propio movimiento).
> - 84 medusas y **una enorme** (3 unidades de radio, con canales, tentáculos largos y brazos): la cámara pasa por debajo mirando hacia arriba.
> - Un cardumen con luz que cruza como un solo cuerpo.
> - **La espiral:** una colonia enrollada como una galaxia, que se enciende desde el corazón cuando la cámara sube y gira. «Empezaste mirando galaxias. Aquí abajo hay una. Es un solo ser, y está vivo.» (El animal real es un sifonóforo; el tamaño y la forma hay que verificarlos.)
> - La otra luz, el hilo, el mensaje y la respuesta; al final la cámara se aleja y quedan las dos luces, chicas, bajo la espiral.
> - Rendimiento: 3,9 ms el cuadro más caro del acto (`node tools/ritmo.mjs <desde> <hasta> [paso]`). Hoja: `docs/viaje/acto5.jpg`. Las pruebas completas no se han vuelto a correr.
> **13 de noviembre · Diego vio el acto V nuevo: «sí, este nivel».** Ese es el listón.
>
> **Acto III rehecho al mismo criterio** (`estudios/acto3.ts`, suelto en `?m=acto3`; reemplaza a `nieve` en el viaje), a la espera de que lo vea. Un solo plano largo cayendo por un cañón, 70 beats:
> - Caes por la nieve con tu luz y los pensamientos (cuatro, y después vuelven más seguidos). Parece que caes por la nada.
> - **La llamada:** un frente de luz baja por el agua y por un momento se ve dónde estás: las paredes de un cañón enorme, con repisas y agujas de roca, que se pierde hacia abajo. Vuelve lo oscuro. Las paredes y la ballena son puntos oscuros: solo responden a tu luz (poco y de cerca) y al frente de la llamada.
> - **La ballena:** sube desde abajo y pasa a tu lado. **Pulida el 13 de noviembre (tercera pasada):** es un cuerpo y no una cáscara (no se dibuja la piel que mira hacia el otro lado, y tu luz le da volumen); la cabeza está cerrada y es roma; el ojo es una abertura redonda con iris, pupila oscura y un punto de luz, en vez de anillos; al llegar a tu altura casi se detiene dos beats y la cámara se queda en su ojo; el chasquido es un frente fino que le recorre el cuerpo y llega a la roca, sin quemar el cuadro. Antes y después: `capturas/ballena-antes.jpg`, `capturas/ballena-despues.jpg`. Copia de la versión anterior: `respaldo/acto3.v2.ts.txt`. La hoja `docs/viaje/acto3.jpg` es de antes de esta pasada. Diego no la ha visto en movimiento.
> - La segunda llamada muestra las paredes más cerca: el cañón se cierra en fosa. Los copos se vuelven lluvia.
> - El cañón es inventado (ruido), no un lugar real. Hoja: `docs/viaje/acto3.jpg`.
>
> **13 de noviembre · Diego, al ver los actos III y V en movimiento: «me encanta demasiado la inmersión del movimiento del acto 3, muy dinámico», «acto 5 también súper genial».** Ve flojos el II y el IV. Eligió seguir por el IV.
>
> **Acto IV rehecho al mismo criterio** (`estudios/acto4.ts`, suelto en `estudios/index.html?m=acto4`; reemplaza a `fondo` en el viaje, que queda solo como estudio). Diego no lo ha visto. 50 beats:
> - **La bajada:** los últimos siete kilómetros pegado a la pared de la fosa, bajo la lluvia.
> - **El suelo:** sale de lo oscuro al final y te detienes justo encima: limo gris con rizaduras, unas piedras, lo que alcanza tu luz y nada más. El reloj se detiene y la lluvia se queda donde está.
> - **El pensamiento:** una vez, con la cámara quieta (son los únicos tramos quietos del viaje, a propósito). Se borra cuando la cámara se levanta.
> - **Los otros:** la cámara sube y mira lejos: el suelo es una llanura sin fin y en ella hay 300 luces como la tuya, cada una sobre su metro de limo, ninguna cerca de otra. Se apagan, la cámara vuelve a la tuya, que baja a casi nada.
> - Cuidado: gris, sin azul, casi sin resplandor; la pared se ve desde el lado, nunca desde arriba; nada vivo todavía.
> - **Decisiones del asistente, a revisar con Diego:** el BRIEF pide cámara «quieta» en este acto y aquí se mueve dos veces (la bajada y la subida para ver a los otros); la fosa y la llanura son inventadas; las piedras casi no se ven.
> - Hoja: `docs/viaje/acto4.jpg`. Pruebas completas con este acto: todo bien (375,3 beats, 0 errores, cuadro más caro 5,1 ms). En `tools/pruebas.mjs` los tramos quietos a propósito ahora se buscan en `acto4`; la lámina de `fondo` vale también para `acto4`.
>
> **Acto II rehecho al mismo criterio** (`estudios/acto2.ts`, suelto en `estudios/index.html?m=acto2`; la versión anterior, el diagrama plano de barras, está en `respaldo/acto2.v1.ts.txt`). Diego dijo «hay que mejorarlo bastante»; no ha visto esta versión. Mismos textos, 47 beats:
> - **Los rayos están en el agua:** miras hacia arriba y la luz baja en columnas, un color cada una, en abanico; cada color llega hasta donde el agua lo deja (rojo, naranja, amarillo, verde) y la cámara gira bajo ellos.
> - **Solo el azul llega a ti,** te pasa y sigue bajando: bajas entre ocho columnas azules con hilos de luz. Empieza la nieve; los últimos que suben pasan a tu lado y la cámara los sigue un momento; el peso; al final miras arriba y las columnas se acortan desde abajo hasta que no queda nada.
> - Ya no hay notas escritas sobre el cuadro («rojo · 9 m»); ese dato queda para la lámina. Sigue abierta la pregunta de la noche y los rayos de color.
> - Hoja: `docs/viaje/acto2.jpg`. Pruebas completas: una falla de ritmo en el beat 304,5 (acto V, 20 ms) que no se repite al medir ese tramo (2,6 ms); el acto II cuesta 2,2 ms como máximo.
>
> **13 de noviembre · Diego sobre el acto VI: «es el con más potencial, podría ser el más inmersivo, bello, de todas mis obras y se está desperdiciando de forma brutal».**
>
> **Acto VI rehecho como un solo plano largo** (`estudios/acto6.ts`, suelto en `estudios/index.html?m=acto6`; la versión anterior está en `respaldo/acto6.v1.ts.txt`). Diego no lo ha visto. Mismos textos, 64,4 beats. La cámara da una vuelta entera alrededor de las dos luces y el hilo mientras suben:
> - **Desde arriba:** la llanura de luces vivas se aleja y en ella la espiral, que desde aquí es una galaxia (la obra empezó cayendo de una).
> - **De cerca:** la cámara baja a su lado y después debajo, entre 120 medusas que suben a su ritmo (una enorme) y chispas en el agua.
> - **Vuelve el azul:** las mismas columnas del acto II, ahora del Sol; subes entre ellas mientras todos los que subieron anoche bajan a tu lado.
> - **Los colores:** subes a través de cada uno donde el agua lo deja empezar (verde, amarillo, naranja, rojo), enteros por primera vez.
> - **La superficie:** el círculo del amanecer encima, se cruza de verdad (es el mismo mar y la misma ciudad de la apertura), y el final es el de antes: la ciudad, la frase, la ayuda, dos puntos.
> - **Flojo todavía:** el cruce de la superficie es apagado (el agua queda turquesa lisa unos beats); el amanecer y la ciudad son los de antes, sin rehacer; no hay ballena ni cañón al subir.
> - Hoja: `docs/viaje/acto6.jpg`. **Pruebas completas con los actos II, IV y VI nuevos: todo bien** (381,7 beats, 0 errores en 3 054 cuadros, cuadro más caro 4,4 ms).
>
> **14 de noviembre · El cruce de la superficie y el amanecer del acto VI, rehechos** (Diego dijo «sí, el amanecer»; no lo ha visto; lo anterior está en `respaldo/acto6.v2.ts.txt`). Todo está en el fondo de pantalla del acto (`FONDO` en `estudios/acto6.ts`), que ahora dibuja el lugar y no un degradado:
> - **Desde abajo:** el círculo de Snell de verdad, por píxel: el mismo cielo del final, doblado por la refracción, con la ciudad en el borde, la red de luz de las olas por debajo de la superficie y haces que bajan. La hoja de puntos solo pone destellos encima (`lleno: 0.25`).
> - **Arriba:** cielo antes de salir el Sol (noche arriba, rosa, naranja donde va a salir, nubes finas), la ciudad **a contraluz** (su perfil sale de los mismos edificios de `marYCiudad`, que ahora devuelve `edificios`) y el mar como espejo que no se queda quieto.
> - **Los últimos 11 beats ya no son un cuadro fijo:** el día va llegando (`alba`), las luces de la ciudad se apagan una a una (`uApaga` en `gota.ts`; el acto I no cambia) y al final el Sol asoma el borde sobre los techos más bajos, a un lado de la frase. No es un resplandor: asoma.
> - **Flojo todavía:** al cruzar (beat ~50,5) las ventanas de puntos y el perfil no calzan del todo durante un instante; los edificios son siluetas planas; sigue sin haber ballena ni cañón al subir.
>
> **14 de noviembre · Apertura y acto I, primera pasada de subida de nivel** (Diego: «subirles mucho el nivel»; la galaxia y la Tierra eran muy simples, y la apertura debía parecerse al final sin ser igual; no lo ha visto; lo anterior está en `respaldo/acto1.v1.ts.txt`). Mismos textos y misma duración (63,2 beats).
> - **La red y la galaxia:** la red tiene 240 nudos y hilos que se comban; la galaxia tiene bulbo y barra, disco viejo, brazos con espolones, nudos azules y rosas y un halo de cúmulos (~200 mil puntos).
> - **La Tierra es la de la serie** (`horizontes-cuerpos`, copiada con su `tools/copiar.mjs` a `src/horizontes/` y `public/texturas/`; no se edita aquí). Se ve del lado de noche con un filo de día; Abismo le añade las luces de las ciudades (`LUCES` en `acto1.ts`). Al ser un mapa real, la caída llega a una costa real (lat −33°, lon −71,6°). La obra no la nombra, pero se reconoce el continente. **Diego decidió dejarla ahí (14 de noviembre).** Se cambia con `LAT` y `LON`.
> - **El mismo mar y la misma ciudad del final, de noche y con lluvia:** el fondo del acto VI es ahora `cieloYMar()` (exportado desde `acto6.ts`) con `uNoche` y `uLluvia`: techo de nubes bajo iluminado por la ciudad, ciudad a contraluz con todas las luces encendidas, anillos de lluvia en el agua. Desde abajo, el círculo de Snell de verdad con la ciudad en el borde y los anillos de las gotas.
> - **Acto I:** la cámara ahora gira (pista `yaw`); lo que sube es además el río de `ultimos()` (acto II); el cardumen es un río de 30 mil peces que se cierra alrededor de ti y de la cámara, y se abre al irse.
> - **Sin pruebas completas tras este cambio** (a Diego le aburre esperarlas tras cada cambio: se corren una vez, al cerrar). `tsc` limpio. Las del amanecer del VI se cortaron al medir ritmo, con consola, negro y quieto ya bien.
> - **Flojo todavía:** la Tierra pasa rápido (unos 2 beats); al bajar hacia la ciudad, el horizonte del fondo entra como una banda; el mensaje sigue siendo solo texto.
>
> **14 de noviembre · Los cambios de acto y el vínculo de las dos luces** (Diego: la chispa no pasaba bien de un capítulo a otro; el vínculo de la subida era «una cuerda», las dos subían fijas, sin juego; no lo ha visto).
> - **El puente es tu luz** (`src/main.ts`): cada acto dice dónde está su luz (`chispa`) y con qué puntos la dibuja (`chispaLuz`). En el primer cuarto del puente el punto la releva en el mismo sitio (la propia se apaga, ya no se ven dos); después viaja al centro, y en el acto siguiente del centro a donde ese acto la tiene. Su brillo sale del brillo real de la luz en cada acto (`extremos`), así que no salta de tamaño. `puente` ya no se usa. Hoja: `capturas/puentes.jpg`.
> - **Los actos se funden (Diego: «sí hay que fundirlos»):** durante el puente se dibujan los dos actos, el otro primero y aparte (`rtOtro`), y se pone encima como velo (`velo`) con el peso del fundido; ya no hay negro en medio. Tu luz va directa de donde la tiene un acto a donde la tiene el otro. La película (bloom, exposición) cambia con el fundido. Lo anterior está en `respaldo/main.v1.ts.txt`. Un puente cuesta dos dibujos de escena por cuadro; el ritmo no está medido.
> - **Que el cambio no se note (Diego: a las 00:04 la luz «sube para centrarse» y pasa a otra escena de forma forzada; debe ser imperceptible):** la regla ahora es que cada acto empiece donde termina el anterior. Hecho: al final del acto I tu luz ya no va al centro, va a donde la tiene el acto II; el acto III abre con la luz donde la deja el II; el acto VI abre con la cámara donde la deja el V (atrás de las dos luces, la espiral más allá, `ESPIRAL` movida) y después sube sobre ellas; el fundido dura más (`PUENTE` 1,3 beats por lado). **V → VI arreglado:** la espiral del VI es ahora la misma del V (misma forma de una sola vuelta con flecos, misma inclinación, mismo lugar respecto de las dos luces; flota en el agua, ya no está tendida en la llanura) y la cámara abre mirando exactamente donde miraba la del V (`abre`); en la hoja la espiral no cambia durante el paso. **Falta:** al abrir el VI se ve el borde de su llanura como una línea; IV → V no se revisó (los dos están casi a oscuras).
> - **Los actos se solapan (Diego: en 101 y 391 atm «hay una pausa que pierde continuidad»):** antes, durante el fundido, el otro acto estaba congelado en su primer o último cuadro. Ahora cada acto empieza `PUENTE` (1,8) beats antes de que termine el anterior y los dos corren a la vez mientras uno se disuelve en el otro; nada se detiene. El viaje mide 9 beats menos por eso (los `inicio` de `viaje.tramos()` ya lo reflejan). La placa cambia de dueño a mitad del solape.
> - **IV → V:** el V abre con la cámara inclinada como termina el IV y tu luz en el mismo sitio del cuadro (`baja`), y lo suelta en 3,4 beats. **VI:** la llanura lejana ya no se amontona en una línea al abrir (`uRaso`).
> - **La llegada al fondo (Diego: en 1065 atm cae muy abrupto):** el último tramo de la bajada del acto IV son ahora dos de 4 beats (antes uno de 4,5): el suelo sale de la oscuridad a medio camino y después te posas. El acto IV mide 3,5 beats más.
> - **Las dos luces, segunda vuelta (Diego: le gustan las estelas y que se muevan entre sí; el vínculo «parece un balón», quizá no hace falta):** se quitó el vínculo. Lo que las une es el movimiento: se acercan hasta casi tocarse y se apartan, una destella y la otra responde, y brillan más cuando están cerca. Las estelas son colas finas (blancas junto a la luz, de su color más atrás, azuladas al final) que se trenzan, más chispas sueltas que se desprenden.
> - **Las dos luces del acto VI** (`acto6.ts`; lo anterior en `respaldo/acto6.v3.ts.txt`): ya no hay cuerda. Dan dos vueltas una alrededor de la otra durante la subida, se acercan y se apartan, una va delante y luego la otra; entre ellas va y viene luz por muchos caminos (`lazo`, tipo 0) y cada una deja una estela que se queda atrás (tipos 1 y 2). Al final se aquietan (`juego` → 0) y quedan lado a lado, de frente.
> - Sin pruebas completas (se corren al cerrar). `tsc` limpio.
>
> **La ayuda ya no nombra ningún país:** el final y la lámina del acto IV dicen solo «findahelpline.com · líneas de ayuda de tu país, gratis». Decisión del asistente para cumplir la regla; Diego no la ha confirmado (se pierde el número directo \*4141).
>
> - Lo que sigue más abajo describe el resto del viaje, que Diego considera flojo y está por rehacer con este criterio.


**El guion v2 está animado entero, en primera pasada (13 de noviembre de 2026). Diego aprobó ocho de las nueve ideas y pidió quitar el cuarto. Todavía no ha visto el resultado.**

- **El viaje** está en `http://localhost:5206/index.html` (`npx vite`; scroll avanza, `A` reproduce, `I` abre la lámina; `?beat` muestra el beat, `?p=N` salta). Son 327,8 beats, unos doce minutos con `A`: apertura y acto I 63,2 (empieza en 0), acto II 46,7 (63), acto III 53 (110), acto IV 44 (163), acto V 62,4 (207), acto VI 58,4 (269).
- **Apertura y acto I** (`estudios/acto1.ts`): los dos puntos con que termina Mente (el blanco se aleja); la red cósmica; la caída (red, galaxia, Tierra de noche, ciudad); la ciudad con lluvia; el cruce; el título sobre el círculo; el círculo que se aleja; **todo sube** (los que suben cada noche te cruzan hacia arriba); el cardumen, que se abre al pasar junto a tu luz; el mensaje «¿estás despierto?», solo sus palabras, que se escribe y se borra.
- **Acto II** (`estudios/acto2.ts`): los rayos, ahora tenues (es de noche: es la luz de la ciudad); la nieve; **los últimos que suben**; el peso, con **tu halo que empieza a achicarse**; se va el azul.
- **Acto III** (`estudios/nieve.ts`, manera 1): el halo como plano largo; cuatro pensamientos que **vuelven**, cada vez más seguidos; **la llamada** pasa dos veces por la nieve; el tiempo se estira; los copos se vuelven lluvia. Tu halo sigue achicándose.
- **Acto IV** (`estudios/fondo.ts`, manera 1): la bajada bajo la lluvia; el silencio (04:12); el pensamiento, una vez y largo; «No eres el único»; **los otros** (luces como la tuya, lejos y separadas, que aparecen un momento y se apagan); tu luz casi se apaga.
- **Acto V** (`estudios/luces.ts`, manera 2): el destello, que es la llamada; las chispas, que **contestan cuando te mueves** (cursor o scroll); los seres, con **la nieve cayendo** («Viven de lo que cae»); el plano largo entre las luces, con tu halo abriéndose; la otra persona; el hilo; el mensaje enviado y la respuesta en rosa carmín, como texto; «No se arregla».
- **Acto VI** (`estudios/acto6.ts`): subir acompañado; De cerca; vuelve el azul; **todos bajan** y tú subes; los colores, vivos por primera vez; la superficie al amanecer; la ciudad con la primera luz; la última frase, la ayuda y los dos puntos.
- **El cuarto ya no existe** en ningún acto (ni la función que lo dibujaba).
- **La lámina** (`estudios/lamina.ts`): solo está escrita la del acto IV.
- **Cómo está hecho:** `src/main.ts` es el motor de Mente (cada acto en su grupo); el puente entre actos es tu luz. `nevar` (en `estudios/nieve.ts`) sirve para la nieve, la lluvia, los que suben y los que bajan, y tiene el alcance de tu luz (`uAlc`) y la llamada (`uOnda…`). El mar y la ciudad están en `marYCiudad` (`estudios/gota.ts`). Lo que depende del movimiento del cursor o del tiempo acumulado se anula cuando el tiempo es 0 (pruebas, movimiento reducido).
- **Pruebas:** `node tools/pruebas.mjs` (con el servidor andando; tarda unos veinte minutos; no guardar nada en la carpeta mientras corre). **Última corrida, 12–13 de noviembre: una falla.** 0 errores en 2 624 cuadros, ningún cuadro negro, saltar = llegar (0,00 % en 55 saltos), cuadro más caro 3,9 ms; pero dos tramos quietos, 200,75–208 y 211,5–213,5 (el final del fondo y la espera antes de las primeras chispas). Se corrigió después (las chispas despiertan antes, y el margen de la excepción del fondo pasó de 1 a 2 beats) y **no se volvió a correr.** Resultado en `docs/viaje/pruebas.txt`.
- **Hojas:** `docs/viaje/todo.jpg` (el viaje entero con el guion v2) y `docs/viaje/nuevas.jpg` (los otros, la llamada, los seres). Las demás hojas de `docs/viaje/` son de antes del guion v2.
- **Los estudios** siguen en `http://localhost:5206/estudios/index.html`.
- No hay repo git.

## Los seis estudios

| Estudio | Maneras | Notas |
|---|---|---|
| `gota` · La lluvia y la superficie (v2) | 1 El círculo · 2 El anillo · 3 Solo la lluvia | Rehecho el 11 de noviembre en puntos y trazos de luz, sin vidrio ni mar simulado: la ciudad son puntos con su reflejo, la lluvia son los trazos de `nieve` 3 y sigue cayendo bajo el agua hasta volverse copos; la superficie es una lámina de puntos y, desde abajo, los de dentro del círculo de Snell (radio = profundidad × 1,13) se encienden, con la ciudad en el borde. La v1 (shader realista) está en `respaldo/gota.v1.ts.txt`. |
| `rojo` · El rojo se va primero | 1 Tus cosas · 2 Campos de color · 3 Los rayos | Cada color es el suyo por lo que el agua deja pasar a esa profundidad (coeficientes cercanos a Pope y Fry 1997), con la imagen expuesta para el azul. |
| `nieve` · La nieve marina y tu luz | 1 Un halo · 2 Un haz · 3 Lluvia | Incluye los pensamientos que se escriben y se borran. |
| `fondo` · El fondo | 1 Negro · 2 La llanura · 3 La nieve quieta | Sin resplandor, sin azul. La frase se dice una vez y se queda. |
| `luces` · Las luces que nacen | 1 Chispas · 2 Seres · 3 Constelación | La luz viva va en azul (no en el verde de «tú»). La otra persona, en el color de la obra. |
| `color` · El color y el reloj | 1 Rosa carmín · 2 Plata lunar · 3 Melocotón | Baja entera en pocos beats para ver el reloj funcionar; al final «tú» cambia de verde al color de la obra, para comparar. Los demás estudios usan rosa carmín. |

## Decisiones

- **11 de noviembre · Diego** pidió leer `BRIEF.md` y `SERIE.md` y hacer los estudios de la fase 0. No contó todavía las imágenes que ya tiene en la cabeza (el BRIEF dice que esas van primero).
- **11 de noviembre · asistente**, al armar los estudios (a revisar con Diego):
  - La entrada al mar no es una caída: la cámara entra en la gota y el círculo de la gota se convierte en la ventana de Snell. Es la ley de la obra (lo terrenal se vuelve lo abstracto) en una sola imagen.
  - La noche de la apertura tiene luna, para que haya algo que ver desde abajo a las 23:40.
  - En `nieve` la nieve cae despacio hacia abajo, como la lluvia. Si la cámara bajara más rápido que la nieve, la nieve subiría en pantalla; se eligió la rima con la lluvia.
  - En `fondo`, el mundo se detiene con el reloj (manera 3: la nieve queda suspendida).
  - Textos de los rótulos: provisionales, escritos para los estudios.

- **11 de noviembre · Diego, al ver los estudios** («hay algunos realmente preciosos»):
  - `gota`: es el que menos le gusta. La mezcla 3D-2D no le convence, el mar en 3D «para nada», y la ventana con lluvia tampoco. La ventana de Snell le parece inteligente como idea, pero duda de mantenerla. El menos malo: Rayos de luna. **Sin elegir; hay que rehacerlo o cambiarlo.**
  - `rojo`: **elegida 3 Los rayos.** «Tus cosas» es lindo como símbolo, pero son cosas genéricas, de nadie.
  - `nieve`: **le gustan 1 Un halo y 3 Lluvia, las dos.** El halo es más sereno y solitario; la lluvia es más triste, «de verdad estás tocando fondo». Quiere que las dos ocurran en la obra, en partes distintas.
  - `fondo`: **elegida 1 Negro,** por el vacío. (La llanura da seguridad de que hay fondo; la nieve quieta dice que te paras.)
  - `luces`: **elegida 2 Seres,** por la ambientación; duda de que sean solo medusas. Chispas y Constelación también le gustan.
  - `color`: **rosa carmín** («creo que»). No dijo si «tú» sigue en verde.

- **11 de noviembre · Diego dio el sí a rehacer la apertura** en puntos de luz, con la lluvia como hilo. Propuesta del asistente que Diego no ha contestado todavía: halo en la medianoche y lluvia al acercarse al fondo; en `luces`, chispas primero, después seres con más variedad que medusas, y un solo hilo entre tu luz y la otra; «tú» sigue en verde. `nevar` (en `estudios/nieve.ts`) ya admite pasar de copo a trazo (`uRaya`) para eso.

- **11 de noviembre · Diego, al ver la apertura v2:** «el círculo queda bien» (**elegida 1 El círculo**), pero pidió que se note un poco más que son ciudad, edificios y mar, y que parezca más que cruzas la superficie. Hecho en la misma pasada: los edificios tienen contorno, más ventanas, balizas rojas y una fila de faroles en la orilla; el mar tiene olas (bandas de destellos que viajan); antes de cruzar la cámara mira hacia el agua y al cruzar la lámina se enciende de canto; desde abajo, el borde del círculo es el perfil de la ciudad al revés, con las torres apuntando al centro (calculado con la refracción). **Diego lo vio y dio el sí («así queda»).**

- **11 de noviembre · Diego dio el sí a las tres propuestas,** y quedaron aplicadas en los estudios:
  - `nieve` 1 es ahora «Halo, después lluvia»: halo en la medianoche y, en el último tramo, los copos se alargan hasta ser lluvia y caen más rápido (`uRaya` en `nevar`).
  - `fondo` 1 (Negro) llega con esa lluvia: se detiene con el reloj, se apaga, y queda el negro.
  - `luces` 2 es ahora «Chispas, seres y un hilo»: las chispas despiertan primero; después medusas, hilos largos, cardúmenes de peces con una fila de luces y seres ovalados con luces que los recorren; y un solo hilo entre tu luz y la de la otra persona, verde en tu extremo y carmín en el suyo, que crece desde los dos lados.
  - «Tú» sigue en el verde de la serie; el rosa carmín aparece solo con la otra persona.
- **Con eso la fase 0 queda cerrada.** Elegidas: `gota` 1 El círculo (v2), `rojo` 3 Los rayos, `nieve` 1 Halo y después lluvia, `fondo` 1 Negro, `luces` 2 Chispas, seres y un hilo, color rosa carmín.

- **11 de noviembre · fase 1 (asistente).** Decisiones tomadas al armarla, a revisar con Diego:
  - La apertura y el acto I son una sola escena, sin corte.
  - La caída usa la regla de Mente: cada etapa sale de un punto de la anterior. No reusa el código de las otras obras; son nubes livianas propias (red, galaxia, Tierra de noche).
  - Ya no hay vidrio ni gota (Diego los descartó): la «ventana» del cuarto aparece recién en el acto I, dibujada en línea.
  - El cuarto va en la placa 2D (línea y luz), no en 3D, por lo que Diego dijo del 3D realista. Es lo menos resuelto del acto.
  - «El rojo se va primero» (los rayos) queda para abrir el acto II.
  - El acto I baja en el reloj hasta 200 m (21 atm) aunque la cámara solo baja 40 unidades.
  - Los textos de la voz son provisionales.

- **12 de noviembre · fase 2 (asistente).** Decisiones tomadas al armarla, a revisar con Diego:
  - Los rayos no son una bajada: son una mirada hacia arriba desde los 200 m, a toda la columna. Así el reloj no retrocede y las profundidades son las reales (9, 15, 35, 68 m).
  - «Lo que antes te gustaba» ya no son objetos: lo que se apaga uno por uno son los colores, y al final el azul («Lo último»).
  - El peso del scroll está hecho frenando la línea de tiempo (cada vez menos metros por beat), sin tocar el scroll. Falta decidir si se quiere el efecto literal.
  - El acto III reusa el estudio de la nieve sin cambios.
  - El puente entre actos es tu luz, sin destello.

- **12 de noviembre · fase 3 (asistente).** Decisiones tomadas al armarla, a revisar con Diego:
  - Los actos IV y V reusan sus estudios; solo se agregó la bajada «Más abajo» y el paso de un acto a otro.
  - Los textos del acto IV son los del BRIEF, sin cambios: «A veces pienso en no seguir.» y «Mucha gente lo piensa. Casi nadie lo dice.» No se agregó ninguna cifra a la voz.
  - La línea de ayuda todavía no aparece en ninguna parte: el BRIEF la pone en la lámina del acto IV y al final, y ninguna de las dos existe aún. Es lo primero de la fase 4.
  - Se acercó el segundo destello del acto V (caía fuera de cuadro) y las primeras chispas despiertan antes.

- **12 de noviembre · fase 4, primera parte (asistente).** Decisiones tomadas al armarla, a revisar con Diego:
  - **La última frase es provisional: «Todavía estás aquí.»** El BRIEF la deja para decidir con Diego. No promete nada.
  - **La línea de ayuda** va al final, bajo la frase («Si lo estás pensando, habla hoy con alguien. En Chile: \*4141, gratis, a toda hora. En otros países: findahelpline.com»), y en la lámina del acto IV.
  - **La lámina del acto IV** es un borrador de cuatro frases sin cifras: nombra el suicidio, dice que pensarlo es común, que la depresión es frecuente y se trata, y que desde dentro parece definitivo. Falta contrastarla con la guía de la OMS de 2023 y poner las fuentes.
  - La respuesta al mensaje es «sí. aquí estoy.», provisional.
  - Los colores vuelven con la misma imagen del acto II al revés (los rayos que te alcanzan), no con objetos.
  - El amanecer es tenue a propósito («una luz honesta»): la primera versión quedaba blanca y se bajó.
  - Las 06:42 del amanecer son una hora puesta a ojo.

## Verificado (12 de noviembre de 2026)

- **\*4141** es la Línea de Prevención del Suicidio del Ministerio de Salud de Chile: gratuita, las 24 horas, todos los días, atendida por psicólogos; se lanzó en enero de 2023. Fuentes: minsal.cl/prevencion-del-suicidio y la ficha de ventanillaunicasocial.gob.cl. A comienzos de 2026 hubo un reportaje sobre llamadas en espera y una aclaración del Ministerio; sigue siendo la línea oficial.
- **findahelpline.com** existe y lista la \*4141 para Chile.
- **Guía de la OMS para medios:** la vigente es «Preventing suicide: a resource for media professionals, update 2023» (cuarta edición, 12 de septiembre de 2023, con la IASP; ISBN 978-92-4-007684-6). Insiste en las historias de quien pasó la crisis y siguió. Falta leer su lista completa de qué hacer y qué no antes de dar por buenos los textos.
- **Cifra de la OMS:** más de 720 000 personas mueren por suicidio cada año (727 000 en 2021; ficha del 25 de marzo de 2025). La cifra de quienes lo piensan cada año, que es la que pide el BRIEF para la lámina, sigue sin verificar.
- El resto de la lista «Para verificar» del BRIEF (zonas, colores, nieve marina, bioluminiscencia, temperatura, Papageno, despertar precoz) sigue sin verificar.

## Avisos

- **Es de noche y aun así bajan rayos de colores.** La obra empieza a las 23:40; la luz que baja en el acto II no puede ser la del Sol. Por ahora se dice «la luz de arriba» (la ciudad, la luna). El BRIEF ya traía esa tensión (noche en el cuarto, colores que el agua apaga); el título «Ya no llega el Sol» del acto III también la tiene. Hay que decidirlo con Diego.

- **El rojo se va en los primeros 10 m (2 atm), no entre 200 y 1 000 m.** El BRIEF pone «El rojo se va primero» en el acto II (20 → 100 atm). Hay que elegir: o esa imagen sube al acto I, o el acto II la muestra con licencia. El estudio usa las profundidades reales.
- **Los números son aproximados y sin verificar:** presión = 1 + m/10, perfil de temperatura hecho a mano, profundidad a la que muere cada color (9, 15, 35, 68 y 315 m), fondo en 10 935 m. La lista «Para verificar» del BRIEF sigue entera.
- `tools/foto.mjs` (heredado de Mente) saca el lienzo en negro aquí; para capturas se usa `tools/hoja.mjs`.
- Flojo a la vista: en `gota` v2 la caída de la lluvia se acumula cuadro a cuadro (no es reproducible al saltar de beat); en `rojo` 1 los objetos son granulosos; `luces` 3 recuerda a las redes de Mente.
- No se midió el tiempo por cuadro ni se corrieron pruebas (`tools/pruebas.mjs` no se copió: es del viaje, fase 1).

## Guion v2 (aprobado en parte y animado)

- **12 de noviembre · Diego, al ver el viaje entero:** «¿es idea mía o la obra quedó muy corta?». Eran 171 beats, seis minutos y medio. Pidió pensar bien qué agregar. La propuesta está en `GUION-v2.md`.
- **12 de noviembre · Diego, al leerla:** de lo que menos le ha gustado de la obra es lo terrenal, el cuarto (la ventana, el celular, la cama, beat 42): «no pega mucho con mi obra». **No a la idea 2 (el cuarto hecho de luces) y fuera el cuarto que había.** Las otras ocho ideas le gustan mucho: adelante.
- **Decisiones del asistente al animarlo,** a revisar con Diego:
  - Sin cuarto, el mensaje queda como texto junto a tu luz (como los pensamientos), y la respuesta va en rosa carmín.
  - La llamada del acto III ya no enciende ningún teléfono: es solo la onda en la nieve.
  - Los pensamientos son cuatro y son del asistente: «no le importo a nadie», «siempre va a ser así», «algo está mal conmigo», «para qué».
  - El texto de la bajada al fondo es «Abisal. Después, hadal. Los últimos nombres.» (sin Hades).
  - Flojo a la vista: la llamada se ve como una franja ancha de luz, no como un anillo; los que suben son muy tenues; en el panel angosto (vertical) el viaje no está pensado todavía.

## Pendiente de Diego

1. Ver el viaje con el guion v2 y decir qué cambia.
2. Los otros (acto IV, beat 190 más o menos): es la imagen más delicada; que la mire con calma.
3. Los pensamientos del acto III (si quiere escribir los suyos) y la última frase («Todavía estás aquí.» es provisional).
4. Leer la lámina del acto IV (tecla `I` en el fondo) y el texto de ayuda del final.
5. Si el peso del scroll debe ser literal.
6. Del BRIEF siguen abiertas: cuánto de él lleva la voz y si se publica. (El relevo con Mente quedó resuelto: empieza en sus dos puntos.)

## Siguiente paso

Volver a correr las pruebas. Después, con lo que diga Diego: pulir; verificar los datos (la migración vertical, el canal del sonido, la nieve como alimento, la luz que se enciende al moverla, y toda la lista del BRIEF; leer entera la guía de la OMS de 2023); las láminas de los otros actos; el inglés (tecla L); el sonido; el teléfono y las pantallas angostas; la portada; el README.

## Reglas heredadas

- Commits en inglés con Conventional Commits y sin atribución a Claude.
- `BRIEF.md` y `.claude/` quedan fuera del repo.
- No se crea el repo, no se hace push ni se publica nada sin el sí de Diego.
- No se editan las otras obras desde aquí sin que Diego lo pida.
- Un trabajo pesado a la vez (el PC tiene 16 GB).
- Las reglas de § Cuidado del BRIEF no se negocian.
