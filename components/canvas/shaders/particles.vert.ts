/**
 * Particle Void — Vertex Shader
 *
 * Each particle is a point whose world-space position is computed entirely
 * on the GPU based on:
 *   - aOffset:   per-particle random seed [0,1]^3 (set once at init)
 *   - uFormation: which formation to render (0–6)
 *   - uTime:     elapsed seconds, drives organic drift
 *
 * Formations lerp between uPrevFormation and uFormation using
 * uTransitionProgress (0→1), giving smooth page-to-page transitions.
 */
export const vertexShader = /* glsl */ `
  // ── Per-particle attributes (static, set once) ─────────────────────────
  attribute vec3  aOffset;     // [0,1]^3 random seed — unique per particle
  attribute float aSize;       // size multiplier 0.4–2.0
  attribute float aColorMix;   // 0=primary, ~0.85=secondary, >0.9=rare

  // ── Uniforms ───────────────────────────────────────────────────────────
  uniform float uTime;
  uniform float uFormation;            // current  formation index (float for mix)
  uniform float uPrevFormation;        // previous formation index
  uniform float uTransitionProgress;   // 0=prev, 1=current
  uniform vec3  uColorPrimary;
  uniform vec3  uColorSecondary;
  uniform vec3  uColorRare;
  uniform vec2  uCursorNDC;            // cursor in NDC [-1,1]
  uniform float uCursorInfluence;      // repulsion radius in NDC space
  uniform float uSpeed;                // global animation speed multiplier
  uniform float uParticleSize;         // global size multiplier
  uniform float uDensity;              // 0–1, fades outer particles
  uniform float uBirthProgress;       // 0→1, particles emerge from cosmic origin

  // ── Varyings ───────────────────────────────────────────────────────────
  varying vec3  vColor;
  varying float vOpacity;

  // ═══════════════════════════════════════════════════════════════════════
  //  NOISE — compact 3D value noise (no texture needed)
  // ═══════════════════════════════════════════════════════════════════════

  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  float noise3(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);          // smoothstep
    float n = p.x + p.y * 57.0 + p.z * 113.0;
    return mix(
      mix( mix(hash(n+  0.0), hash(n+  1.0), f.x),
           mix(hash(n+ 57.0), hash(n+ 58.0), f.x), f.y),
      mix( mix(hash(n+113.0), hash(n+114.0), f.x),
           mix(hash(n+170.0), hash(n+171.0), f.x), f.y), f.z
    );
  }

  // 3 noise lookups — organic breathing motion without true curl overhead
  vec3 organicDrift(vec3 seed, float t) {
    return vec3(
      noise3(seed * 0.45 + vec3(0.00, 0.00, t)) - 0.5,
      noise3(seed * 0.45 + vec3(1.73, 9.21, t)) - 0.5,
      noise3(seed * 0.45 + vec3(3.40, 5.63, t)) - 0.5
    ) * 2.8;
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  FORMATIONS — each maps aOffset [0,1]^3 → world-space vec3
  // ═══════════════════════════════════════════════════════════════════════

  // 0 · Default — uniform sphere, gently scattered
  vec3 defaultPos(vec3 o, float t) {
    float phi  = o.x * 6.28318;
    float cosT = 2.0 * o.y - 1.0;
    float sinT = sqrt(max(0.0, 1.0 - cosT * cosT));
    float r    = pow(o.z, 0.33333) * 22.0;
    return vec3(r * sinT * cos(phi), r * sinT * sin(phi), r * cosT - 10.0);
  }

  // 1 · Cosmic — torus-knot clusters, wraps multiple times
  vec3 cosmicPos(vec3 o, float t) {
    float angle = o.x * 18.8496; // 6π — several knot wraps
    float R = 7.0, r = 3.5;
    float p = 3.0, q = 2.0;
    vec3 knot = vec3(
      (R + r * cos(q / p * angle)) * cos(angle),
      (R + r * cos(q / p * angle)) * sin(angle),
      r * sin(q / p * angle)
    );
    return knot + (o - 0.5) * 7.0;
  }

  // 2 · Scattered — loose constellation, no tight grouping
  vec3 scatteredPos(vec3 o, float t) {
    return (o - 0.5) * vec3(55.0, 35.0, 45.0);
  }

  // 3 · Orbit — concentric tilted rings, each at different speed
  vec3 orbitPos(vec3 o, float t) {
    float ring   = floor(o.x * 6.0);
    float radius = (ring + 1.0) * 4.0;
    float speed  = (0.06 - ring * 0.008) * uSpeed;
    float angle  = o.y * 6.28318 + t * speed;
    float incline = (ring - 2.5) * 0.35;
    return vec3(
      cos(angle) * radius,
      sin(angle) * radius * sin(incline) + (o.z - 0.5) * 4.0,
      sin(angle) * radius * cos(incline) - 6.0
    );
  }

  // 4 · Grid — 3-D lattice that breathes
  vec3 gridPos(vec3 o, float t) {
    float id  = floor(o.x * 864.0); // 12×8×9 grid
    float col = mod(id, 12.0);
    float row = mod(floor(id / 12.0), 8.0);
    float dep = floor(id / 96.0);
    vec3 base = vec3(
      (col / 11.0 - 0.5) * 24.0,
      (row /  7.0 - 0.5) * 16.0,
      (dep /  8.0 - 0.5) * 12.0 - 5.0
    );
    float b = sin(t * 0.4 * uSpeed + o.z * 6.28 + o.x * 3.14) * 0.5;
    return base + vec3(b * 0.4, b * 0.3, b * 0.2);
  }

  // 5 · Pulse — organic blob, radial sine waves
  vec3 pulsePos(vec3 o, float t) {
    float phi  = o.x * 6.28318;
    float cosT = 2.0 * o.y - 1.0;
    float sinT = sqrt(max(0.0, 1.0 - cosT * cosT));
    // wave: avoid acos — use cosT directly for cheap angular variation
    float wave = sin(t * 1.1 * uSpeed + phi * 2.5 + (1.0 - cosT) * 3.14159);
    float r    = 3.5 + o.z * 9.0 + wave * 2.5;
    return vec3(r * sinT * cos(phi), r * sinT * sin(phi) * 0.65, r * cosT - 4.0);
  }

  // 6 · Converge — inward spiral drawn to a point
  vec3 convergePos(vec3 o, float t) {
    float phi  = o.x * 6.28318 + t * 0.18 * uSpeed;
    float cosT = 2.0 * o.y - 1.0;
    float sinT = sqrt(max(0.0, 1.0 - cosT * cosT));
    float r    = 0.8 + o.z * 4.0;
    float spin = phi + o.z * 5.0;
    return vec3(r * sinT * cos(spin), r * cosT * 0.25, r * sinT * sin(spin));
  }

  // Dispatcher — float index so we can mix two formations
  vec3 getFormPos(float f, vec3 o, float t) {
    float fi = floor(f + 0.5);
    if (fi < 0.5) return defaultPos(o, t);
    if (fi < 1.5) return cosmicPos(o, t);
    if (fi < 2.5) return scatteredPos(o, t);
    if (fi < 3.5) return orbitPos(o, t);
    if (fi < 4.5) return gridPos(o, t);
    if (fi < 5.5) return pulsePos(o, t);
    return convergePos(o, t);
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  MAIN
  // ═══════════════════════════════════════════════════════════════════════

  void main() {
    float t = uTime;

    // ── 1. Formation position (lerped between prev and current) ──────────
    vec3 prevPos = getFormPos(uPrevFormation, aOffset, t);
    vec3 currPos = getFormPos(uFormation,     aOffset, t);
    vec3 pos     = mix(prevPos, currPos, uTransitionProgress);

    // ── 2. Organic drift ─────────────────────────────────────────────────
    pos += organicDrift(aOffset * 5.3, t * 0.12 * uSpeed);

    // ── 2.5. Birth — particles emerge from cosmic origin ─────────────────
    // Each particle has a unique delay (aOffset.x), so they don't all
    // appear at once — the void fills like stars igniting across the sky.
    float birthDelay = aOffset.x * 0.5;
    float birthEased = smoothstep(birthDelay, birthDelay + 0.5, uBirthProgress);
    pos = mix(vec3(0.0), pos, birthEased);

    // ── 3. Density fade (outer particles soften) ─────────────────────────
    float spread = length(pos.xy);
    float densityFade = 1.0 - smoothstep(18.0 * uDensity, 30.0, spread);

    // ── 4. Project to NDC for cursor repulsion ───────────────────────────
    vec4 mvPos   = modelViewMatrix * vec4(pos, 1.0);
    vec4 projPos = projectionMatrix * mvPos;
    vec2 ndc     = projPos.xy / projPos.w;

    // ── 5. Cursor repulsion ───────────────────────────────────────────────
    if (uCursorInfluence > 0.001) {
      vec2 toCursor  = ndc - uCursorNDC;
      float cDist    = length(toCursor);
      if (cDist < uCursorInfluence) {
        float force = (1.0 - cDist / uCursorInfluence);
        force = force * force * 4.5;
        // Push in screen-plane direction (NDC approx → world is good enough)
        pos  += normalize(vec3(toCursor, 0.0)) * force;
        mvPos = modelViewMatrix * vec4(pos, 1.0);
      }
    }

    // ── 6. Color ──────────────────────────────────────────────────────────
    if (aColorMix > 0.9) {
      vColor = uColorRare;
    } else if (aColorMix > 0.5) {
      vColor = mix(uColorSecondary, uColorRare, (aColorMix - 0.5) * 2.0);
    } else {
      vColor = mix(uColorPrimary, uColorSecondary, aColorMix * 2.0);
    }

    // ── 7. Opacity ────────────────────────────────────────────────────────
    float depthFade = 1.0 - smoothstep(40.0, 85.0, -mvPos.z);
    vOpacity = densityFade * depthFade * 0.88 * birthEased;
    if (aColorMix > 0.9) vOpacity = min(1.0, vOpacity * 1.6); // rare = brighter

    // ── 8. Point size with perspective attenuation ────────────────────────
    float rawSize = aSize * uParticleSize * 120.0 / max(0.001, -mvPos.z);
    gl_PointSize  = clamp(rawSize, 0.5, 10.0);

    gl_Position = projectionMatrix * mvPos;
  }
`
