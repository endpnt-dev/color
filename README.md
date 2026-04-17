# Color API

Color conversions, palettes, and accessibility — with one API call.

## Features

- **Convert** colors between formats: hex, RGB, HSL, HSV, CMYK, LAB
- **Contrast** calculations with WCAG compliance checking
- **Color harmonies** (complementary, triadic, analogous, etc.)
- **Palette generation** with multiple algorithms
- **Tints, shades, and tones** generation
- **Color blindness simulation** for accessibility testing
- **Named color lookup** with closest match finding

## API Documentation

All endpoints require an API key passed via the `x-api-key` header.

Base URL: `https://color.endpnt.dev/api/v1/`

### Endpoints

- `POST /convert` - Convert between color formats
- `POST /contrast` - Calculate WCAG contrast ratio
- `POST /harmony` - Generate color harmonies
- `POST /palette` - Generate color palettes (Starter+ tier)
- `POST /tint` - Generate tints (lighter variations)
- `POST /shade` - Generate shades (darker variations)  
- `POST /tone` - Generate tones (desaturated variations)
- `POST /blindness` - Simulate color blindness
- `POST /name` - Find closest named color
- `GET /health` - API health check

### Demo Endpoints

Try the API without authentication at `/api/demo/*` endpoints.

## Development

```bash
npm install
npm run dev
```

Built with Next.js 14, colord, and TypeScript.
