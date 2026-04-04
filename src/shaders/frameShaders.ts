/** Shared vertex shader for all frame artworks */
export const frameVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/** 1. Plasma Membrane — shifting violet/teal layered sine plasma */
export const plasmaFrag = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.0, 0.33, 0.67);
    return a + b * cos(6.28318 * (c * t + d));
  }

  void main() {
    vec2 uv = vUv - 0.5;
    float t = uTime * 0.5;
    float v = sin(uv.x * 10.0 + t)
            + sin(uv.y * 10.0 - t * 0.7)
            + sin(length(uv) * 20.0 + t)
            + sin((uv.x + uv.y) * 8.0 - t * 1.3);
    vec3 col = palette(v * 0.25 + 0.5);
    gl_FragColor = vec4(col * 0.8, 1.0);
  }
`

/** 2. Voronoi Erosion — cracked obsidian glowing at seams */
export const voronoiFrag = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv * 4.0;
    vec2 p = floor(uv);
    vec2 f = fract(uv);
    float minDist1 = 8.0, minDist2 = 8.0;

    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 b = vec2(float(i), float(j));
        vec2 o = hash2(p + b);
        o = 0.5 + 0.5 * sin(uTime * 0.3 + 6.28318 * o);
        vec2 r = b + o - f;
        float d = dot(r, r);
        if (d < minDist1) { minDist2 = minDist1; minDist1 = d; }
        else if (d < minDist2) { minDist2 = d; }
      }
    }

    float edge = sqrt(minDist2) - sqrt(minDist1);
    float glow = pow(1.0 - clamp(edge * 3.0, 0.0, 1.0), 4.0);
    vec3 col = mix(vec3(0.03, 0.02, 0.05), vec3(1.0, 0.55, 0.1), glow);
    gl_FragColor = vec4(col, 1.0);
  }
`

/** 3. Domain Warp Landscape — churning dark landscape with red-amber peaks */
export const domainWarpFrag = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1,0));
    float c = hash(i + vec2(0,1));
    float d = hash(i + vec2(1,1));
    return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p); p *= 2.1; a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv * 3.0;
    float t = uTime * 0.08;
    vec2 q = vec2(fbm(uv + t), fbm(uv + vec2(1.7, 9.2) + t));
    vec2 r = vec2(fbm(uv + 4.0 * q + vec2(1.7, 9.2)), fbm(uv + 4.0 * q + vec2(8.3, 2.8)));
    float f = fbm(uv + 4.0 * r);
    vec3 col = mix(vec3(0.02, 0.02, 0.03), vec3(0.6, 0.1, 0.02), clamp(f * 2.0 - 0.5, 0.0, 1.0));
    col = mix(col, vec3(1.0, 0.7, 0.1), clamp(f * f * 4.0 - 3.0, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
  }
`

/** 4. Cellular Automata Ghost — evolving grid of white squares on black */
export const cellularFrag = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    vec2 uv = vUv;
    vec2 grid = floor(uv * 14.0);
    vec2 cell = fract(uv * 14.0);

    float id = grid.x + grid.y * 14.0;
    float step = floor(uTime * 1.5);
    float alive = step(0.72, hash(id + step * 97.0));

    float border = smoothstep(0.05, 0.12, min(min(cell.x, 1.0 - cell.x), min(cell.y, 1.0 - cell.y)));
    float glow = alive * border;

    // Neighbor influence hint for visual texture
    float neighbors = 0.0;
    for (int dx = -1; dx <= 1; dx++) {
      for (int dy = -1; dy <= 1; dy++) {
        if (dx == 0 && dy == 0) continue;
        float nid = (grid.x + float(dx)) + (grid.y + float(dy)) * 14.0;
        neighbors += step(0.72, hash(nid + step * 97.0));
      }
    }
    float ambient = neighbors * 0.008;

    vec3 col = vec3(glow * 0.9 + ambient) + vec3(0.0, 0.0, glow * 0.3);
    gl_FragColor = vec4(col, 1.0);
  }
`

/** 5. Magnetic Field — iron filings around a rotating dipole */
export const magneticFrag = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv - 0.5;

    // Rotating dipole angle
    float angle = uTime * 0.15;
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    uv = rot * uv;

    // Dipole field: two poles at ±0.2
    vec2 p1 = vec2( 0.2, 0.0);
    vec2 p2 = vec2(-0.2, 0.0);
    vec2 field = normalize(uv - p1) / max(dot(uv - p1, uv - p1), 0.001)
               - normalize(uv - p2) / max(dot(uv - p2, uv - p2), 0.001);

    float fieldAngle = atan(field.y, field.x);
    float intensity = length(field) * 0.04;
    intensity = clamp(intensity, 0.0, 1.0);

    vec3 col = mix(
      vec3(0.0, 0.02, 0.12),
      vec3(0.5, 0.9, 1.0),
      pow(intensity, 0.4)
    );
    // Add field-line stripes
    float stripes = sin(fieldAngle * 12.0) * 0.5 + 0.5;
    col *= 0.6 + stripes * 0.4;

    gl_FragColor = vec4(col, 1.0);
  }
`

/** 6. Caustic Depth — underwater light refraction */
export const causticFrag = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.25;
    float c1 = abs(sin(fbm(uv * 7.0 + t) * 3.14159 * 3.0));
    float c2 = abs(sin(fbm(uv * 5.0 - t * 0.7 + vec2(1.3, 0.9)) * 3.14159 * 2.5));
    float caustic = pow(c1 * c2, 0.6);
    vec3 col = mix(vec3(0.0, 0.08, 0.15), vec3(0.1, 0.9, 1.0), caustic);
    gl_FragColor = vec4(col, 1.0);
  }
`

export const FRAME_SHADERS = [
  { frag: plasmaFrag,     name: 'Plasma Membrane' },
  { frag: voronoiFrag,    name: 'Voronoi Erosion' },
  { frag: domainWarpFrag, name: 'Domain Warp' },
  { frag: cellularFrag,   name: 'Cellular Automata' },
  { frag: magneticFrag,   name: 'Magnetic Field' },
  { frag: causticFrag,    name: 'Caustic Depth' },
]
