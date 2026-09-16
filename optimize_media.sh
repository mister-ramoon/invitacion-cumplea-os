#!/usr/bin/env bash
# 🎬 OPTIMIZADOR DE MEDIOS (GIFs y música)
# Uso:
#   ./optimize_media.sh gif   <archivo.gif|.mp4|.webm> <nombre>   → assets/gifs/<nombre>.mp4 + póster .webp
#   ./optimize_media.sh audio <archivo.mp3|.wav|.m4a> [nombre]    → assets/audio/<nombre>.mp3 (128 kbps)
#
# Tip: en Tenor descarga el MP4 del GIF (pesa mucho menos que el .gif y se ve igual).
# Requiere ffmpeg:  sudo apt install ffmpeg  (Ubuntu/WSL)  ·  brew install ffmpeg  (macOS)

set -euo pipefail

usage() { sed -n '3,8p' "$0"; exit 1; }

if ! command -v ffmpeg >/dev/null || ! command -v ffprobe >/dev/null; then
  echo "❌ Necesitas ffmpeg: sudo apt install ffmpeg (Ubuntu/WSL) o brew install ffmpeg (macOS)"
  exit 1
fi

mode=${1:-}
input=${2:-}
[[ -n "$mode" && -f "$input" ]] || usage

size() { echo "$(( $(stat -c%s "$1" 2>/dev/null || stat -f%z "$1") / 1024 ))KB"; }

case "$mode" in
  gif)
    name=${3:-}
    [[ -n "$name" ]] || usage
    mkdir -p assets/gifs
    duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$input")
    # Los clips muy cortos (<1.5s) se repiten hasta ~3s para que el loop no se vea trabado
    loops=$(awk -v d="$duration" 'BEGIN { if (d + 0 > 0 && d < 1.5) print int(3 / d + 0.999) - 1; else print 0 }')

    ffmpeg -hide_banner -loglevel error -y -stream_loop "$loops" -i "$input" \
      -vf "scale=w='trunc(min(iw\,480)/2)*2':h=-2:flags=lanczos" -an \
      -c:v libx264 -preset veryslow -tune animation -crf 28 -profile:v high -pix_fmt yuv420p \
      -movflags +faststart -map_metadata -1 "assets/gifs/$name.mp4"

    # Póster: primer cuadro chiquito, se ve mientras carga el video
    ffmpeg -hide_banner -loglevel error -y -i "$input" -frames:v 1 \
      -vf "scale=w='trunc(min(iw\,360)/2)*2':h=-2:flags=lanczos" \
      -c:v libwebp -quality 50 -compression_level 6 "assets/gifs/$name.webp"

    dims=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "assets/gifs/$name.mp4")
    echo "✅ assets/gifs/$name.mp4 ($(size "assets/gifs/$name.mp4")) + póster ($(size "assets/gifs/$name.webp"))"
    echo "   En el <video> usa: width=\"${dims%x*}\" height=\"${dims#*x}\""
    ;;

  audio)
    name=${3:-$(basename "${input%.*}" | tr ' A-Z' '-a-z')}
    mkdir -p assets/audio
    # Quita el silencio del inicio y del final para que el loop no tenga hueco
    ffmpeg -hide_banner -loglevel error -y -i "$input" \
      -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse" \
      -map_metadata -1 -c:a libmp3lame -b:a 128k -ar 44100 "assets/audio/$name.mp3"
    echo "✅ assets/audio/$name.mp3 ($(size "assets/audio/$name.mp3"), antes $(size "$input"))"
    ;;

  *)
    usage
    ;;
esac
