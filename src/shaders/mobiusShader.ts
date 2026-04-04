/** Iridescent shift shader for Möbius Strip */

export const mobiusVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`

export const mobiusFrag = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  vec3 iridescentPalette(float t) {
    // Cosine palette that cycles through violet-cyan-gold
    vec3 a = vec3(0.5);
    vec3 b = vec3(0.5);
    vec3 c = vec3(1.0, 1.0, 0.5);
    vec3 d = vec3(0.8, 0.2, 0.0);
    return a + b * cos(6.28318 * (c * t + d));
  }

  void main() {
    float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.0);
    float t = vUv.x + vUv.y * 0.5 + uTime * 0.15 + fresnel * 0.5;
    vec3 col = iridescentPalette(t) * (0.4 + fresnel * 0.8);
    gl_FragColor = vec4(col, 1.0);
  }
`
