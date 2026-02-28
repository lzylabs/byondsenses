/**
 * Particle Void — Fragment Shader
 *
 * Renders each point as a soft-edged circle with a glowing halo.
 * Additive blending (set in ShaderMaterial) means overlapping particles
 * accumulate into bright nebula-like clusters.
 */
export const fragmentShader = /* glsl */ `
  varying vec3  vColor;
  varying float vOpacity;

  void main() {
    // gl_PointCoord: [0,1] across the point sprite
    vec2  coord = gl_PointCoord - 0.5;   // centre at (0,0)
    float dist  = length(coord);

    // Discard corners — make it a circle
    if (dist > 0.5) discard;

    // Hard inner core — bright centre
    float core = 1.0 - smoothstep(0.10, 0.28, dist);

    // Soft outer glow — extends to full radius
    float glow = (1.0 - smoothstep(0.0, 0.5, dist)) * 0.4;

    float alpha = (core * 0.85 + glow) * vOpacity;
    if (alpha < 0.004) discard;

    // Slightly boost core brightness for that particle-light feel
    vec3 color = vColor + core * vColor * 0.5;

    gl_FragColor = vec4(color, alpha);
  }
`
