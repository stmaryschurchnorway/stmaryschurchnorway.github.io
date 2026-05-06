#!/bin/bash
# Image Optimization Script
# Generates responsive image variants (WebP + PNG fallbacks)
# Requires: ImageMagick (convert command)

STAGES_DIR="assets/img/stages"
SIZES=(400 800 1200)

if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Install with: brew install imagemagick"
    exit 1
fi

echo "🖼️  Optimizing stage images for responsive delivery..."

for png_file in "$STAGES_DIR"/*.png; do
    [ -f "$png_file" ] || continue

    filename=$(basename "$png_file" .png)

    echo "  Processing: $filename"

    for size in "${SIZES[@]}"; do
        # Generate PNG variant
        convert "$png_file" -resize "${size}x" -quality 85 \
            "$STAGES_DIR/${filename}-${size}.png"

        # Generate WebP variant
        cwebp "$STAGES_DIR/${filename}-${size}.png" \
            -o "$STAGES_DIR/${filename}-${size}.webp" -quality 80 2>/dev/null || \
        convert "$STAGES_DIR/${filename}-${size}.png" -quality 80 \
            "$STAGES_DIR/${filename}-${size}.webp"
    done
done

echo "✅ Image optimization complete!"
echo ""
echo "Updated carousel templates to use:"
echo "  <picture>"
echo "    <source srcset=\"...\" type=\"image/webp\">"
echo "    <source srcset=\"...\" type=\"image/png\">"
echo "    <img src=\"...\">"
echo "  </picture>"
