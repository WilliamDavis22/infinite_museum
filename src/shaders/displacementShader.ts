/** Vertex displacement + Fresnel fragment for icosahedron sculpture */

export const displacementVert = /* glsl */ `
  uniform float uTime;
  uniform float uDisplacement;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize(normalMatrix * normal);

    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);

    // Breathe: displace along normal using layered sine
    float disp = sin(position.x * 3.0 + uTime)
               * sin(position.y * 2.0 + uTime * 0.7)
               * sin(position.z * 2.5 + uTime * 0.5)
               * uDisplacement;
    vec3 displaced = position + normal * disp;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`

export const displacementFrag = /* glsl */ `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    // Fresnel rim glow
    float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 3.0);
    // Normal-based color mix
    float t = dot(vNormal, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5;
    t += sin(uTime * 0.4) * 0.1;
    vec3 col = mix(uColor1, uColor2, clamp(t, 0.0, 1.0));
    // Add rim glow in accent color
    col += uColor2 * fresnel * 1.5;
    gl_FragColor = vec4(col, 1.0);
  }
`
