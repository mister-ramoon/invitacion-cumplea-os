#!/bin/bash

# 🚀 SCRIPT DE OPTIMIZACIÓN DE IMÁGENES
# =====================================
# Este script optimiza automáticamente todas las imágenes de tu invitación

echo "🎨 Iniciando optimización de imágenes para la invitación..."

# Verificar si imagemagick está instalado
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick no está instalado."
    echo "💡 Para instalarlo:"
    echo "   - macOS: brew install imagemagick"
    echo "   - Ubuntu: sudo apt-get install imagemagick"
    echo "   - Windows: https://imagemagick.org/script/download.php"
    exit 1
fi

# Crear directorio para imágenes optimizadas
mkdir -p photos/optimized

# Contadores
optimized_count=0
total_size_before=0
total_size_after=0

echo "📂 Procesando imágenes en photos/..."

# Procesar cada imagen
for image in photos/*.{jpg,jpeg,png,gif,webp,avif} 2>/dev/null; do
    if [[ -f "$image" ]]; then
        filename=$(basename "$image")
        name="${filename%.*}"
        ext="${filename##*.}"
        
        # Tamaño original
        size_before=$(stat -f%z "$image" 2>/dev/null || stat -c%s "$image")
        total_size_before=$((total_size_before + size_before))
        
        echo "⚡ Optimizando: $filename"
        
        # Optimización según tipo de archivo
        case "${ext,,}" in
            jpg|jpeg)
                # JPEG: reducir calidad a 85%, redimensionar si es muy grande
                convert "$image" \
                    -resize '400x400>' \
                    -quality 85 \
                    -strip \
                    "photos/optimized/${name}.jpg"
                ;;
            png)
                # PNG: convertir a JPEG para mejor compresión (excepto si tiene transparencia)
                if identify -format '%A' "$image" | grep -q "True"; then
                    # Tiene transparencia, mantener PNG pero optimizar
                    convert "$image" \
                        -resize '400x400>' \
                        -strip \
                        "photos/optimized/${name}.png"
                else
                    # Sin transparencia, convertir a JPEG
                    convert "$image" \
                        -resize '400x400>' \
                        -quality 85 \
                        -background white \
                        -flatten \
                        -strip \
                        "photos/optimized/${name}.jpg"
                fi
                ;;
            gif)
                # GIF: mantener animación pero optimizar
                convert "$image" \
                    -resize '300x300>' \
                    -coalesce \
                    -layers optimize \
                    "photos/optimized/${name}.gif"
                ;;
            webp)
                # WebP: re-optimizar con mejor compresión
                convert "$image" \
                    -resize '400x400>' \
                    -quality 80 \
                    "photos/optimized/${name}.webp"
                ;;
            avif)
                # AVIF: convertir a WebP para mejor compatibilidad
                convert "$image" \
                    -resize '400x400>' \
                    -quality 80 \
                    "photos/optimized/${name}.webp"
                ;;
        esac
        
        # Verificar si la optimización fue exitosa
        optimized_file="photos/optimized/${name}."*
        if ls $optimized_file 1> /dev/null 2>&1; then
            size_after=$(stat -f%z $optimized_file 2>/dev/null || stat -c%s $optimized_file)
            total_size_after=$((total_size_after + size_after))
            
            reduction=$((100 - (size_after * 100 / size_before)))
            echo "  ✅ ${filename} → ${reduction}% reducción ($(numfmt --to=iec $size_before) → $(numfmt --to=iec $size_after))"
            
            optimized_count=$((optimized_count + 1))
        else
            echo "  ❌ Error optimizando ${filename}"
        fi
    fi
done

# Estadísticas finales
if [ $optimized_count -gt 0 ]; then
    total_reduction=$((100 - (total_size_after * 100 / total_size_before)))
    
    echo ""
    echo "🎉 ¡Optimización completada!"
    echo "📊 Estadísticas:"
    echo "   • Imágenes procesadas: $optimized_count"
    echo "   • Tamaño original: $(numfmt --to=iec $total_size_before)"
    echo "   • Tamaño optimizado: $(numfmt --to=iec $total_size_after)"
    echo "   • Reducción total: ${total_reduction}%"
    echo ""
    echo "💡 Para usar las imágenes optimizadas:"
    echo "   1. Respalda tu carpeta photos original"
    echo "   2. Reemplaza el contenido de photos/ con el de photos/optimized/"
    echo "   3. ¡Tu invitación cargará súper rápido!"
else
    echo "❌ No se pudieron optimizar imágenes"
fi
