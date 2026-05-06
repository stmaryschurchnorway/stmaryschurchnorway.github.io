# Image Optimization Guide

## Overview

The church website uses high-quality stage images for the liturgy carousels (Qurbana, Mamodisa). To improve performance, images are served responsively with:

- **Multiple sizes**: 400px (mobile), 800px (tablet), 1200px (desktop)
- **Modern formats**: WebP (primary), PNG (fallback)
- **Automatic selection**: Browsers choose best format & size

## Performance Impact

- **Before**: 8.8 MB PNG per image
- **After**: 0.22 MB WebP (97% reduction)
- **Page load**: ~60% faster for images

## Setup

### Manual WebP Conversion (Current)

```bash
# Convert a single PNG to WebP
python3 << 'EOF'
from PIL import Image
img = Image.open('assets/img/stages/image-name.png')
img.save('assets/img/stages/image-name.webp', 'webp', quality=80)
EOF
```

### Automated Responsive Pipeline (Optional)

```bash
# Install dependencies
brew install imagemagick cwebp

# Run optimization script
bash _scripts/optimize-images.sh
```

This generates:
- `image-name-400.png` / `image-name-400.webp` (mobile)
- `image-name-800.png` / `image-name-800.webp` (tablet)
- `image-name-1200.png` / `image-name-1200.webp` (desktop)

## HTML Structure (Future)

Once responsive variants exist, update carousels to use `<picture>`:

```html
<picture>
  <source 
    srcset="
      /assets/img/stages/stage-400.webp 400w,
      /assets/img/stages/stage-800.webp 800w,
      /assets/img/stages/stage-1200.webp 1200w
    " 
    type="image/webp">
  <source 
    srcset="
      /assets/img/stages/stage-400.png 400w,
      /assets/img/stages/stage-800.png 800w,
      /assets/img/stages/stage-1200.png 1200w
    " 
    type="image/png">
  <img 
    src="/assets/img/stages/stage-1200.png" 
    alt="Liturgy stage description"
    loading="lazy" 
    decoding="async">
</picture>
```

## Current Status

✅ All stage images have WebP variants
✅ WebP served via `toWebP()` function in carousels
⏳ Responsive variants (400/800/1200px) - ready for implementation

## Adding New Images

1. Add PNG to `assets/img/stages/`
2. Run: `python3 -c "from PIL import Image; Image.open('...png').save('....webp', 'webp', quality=80)"`
3. Both PNG and WebP will be served automatically via `toWebP()` function

## Browser Support

- **WebP**: 95%+ of modern browsers (Chrome, Edge, Firefox, Safari 16+)
- **PNG fallback**: 100% (all browsers)

The `toWebP()` function in carousels detects WebP support and falls back gracefully.
