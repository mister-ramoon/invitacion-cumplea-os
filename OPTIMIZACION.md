# 🚀 OPTIMIZACIÓN · EDICIÓN 2026

## 📊 Resultado

| Qué | Sin optimizar | Ahora |
| --- | --- | --- |
| 11 GIFs de Bob Esponja | ~22.5 MB (los `.gif` de Tenor) | 651 KB en MP4 + 71 KB de pósters |
| Jellyfish Jam | 3.5 MB (192 kbps) | 2.3 MB (128 kbps) |
| HTML + CSS + JS | — | ~14 KB comprimidos (gzip) |

Al abrir la invitación en el celular bajan ~0.5 MB más la canción. El resto de los GIFs se descarga al hacer scroll.

## 🎬 GIFs → videos MP4

Cada "GIF" es un `<video muted loop playsinline>` con un MP4 corto: se ve igual, pero pesa ~95% menos.

- **Carga diferida:** los videos tienen `data-src` y `preload="none"`. `index.js` les pone el `src` y los reproduce cuando están a menos de 200px de la pantalla. Cuando salen de pantalla se pausan para ahorrar batería.
- **Póster:** mientras carga el video se ve un `.webp` chiquito del primer cuadro.
- **Sin saltos:** `width` y `height` en cada `<video>` reservan el espacio antes de que cargue.
- **Loops cortos:** los clips de menos de 1.5 s se repiten dentro del MP4 hasta ~3 s para que el loop no se vea trabado.
- **iPhone en ahorro de energía:** Safari bloquea los videos automáticos; si pasa, se reproducen con el siguiente toque.

## 🎵 Música

- Arranca al tocar **ABRIR INVITACIÓN**: los navegadores no dejan sonar audio sin un toque del usuario.
- Se precarga cuando termina de cargar la página, para que suene al instante (no se precarga si el celular tiene ahorro de datos).
- Se le quitó el silencio del inicio y del final para que el loop no tenga hueco.
- No tiene pausa: el botón 🔇 solo se burla y acelera la canción un rato. Si la pausan desde el sistema o los audífonos, vuelve a sonar. Cuando la pestaña queda en segundo plano se pausa y al regresar continúa.

## 📝 Formulario

- Envía a Formspree con `fetch`; la URL sale del `action` del `<form>` en `index.html`.
- Si falla la red avisa y conserva el nombre para reintentar (espera máximo 15 s).
- Si `index.js` no carga, la portada no aparece y el formulario funciona igual con un envío normal a Formspree.

## ➕ Agregar otro GIF

Requiere ffmpeg (`sudo apt install ffmpeg`).

1. Descarga el GIF de Tenor (o su MP4, que pesa menos).
2. Conviértelo:
   ```bash
   ./optimize_media.sh gif ~/Descargas/mi-gif.gif bob-nuevo
   ```
3. En `index.html` copia un `<figure class="sticker">` y cambia `data-src`, `poster`, `width`, `height` (el script te dice cuáles) y el texto.

Para cambiar la canción:

```bash
./optimize_media.sh audio "~/Descargas/otra cancion.mp3"
```

y actualiza el `<source>` del `<audio id="music">` en `index.html`.

## 🔍 Comprobarlo

DevTools → Network → recarga con la caché desactivada: al abrir solo bajan los GIFs visibles y la canción; los demás aparecen al hacer scroll.
