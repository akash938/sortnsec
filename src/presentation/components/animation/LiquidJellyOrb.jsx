"use client";
import React, { useEffect, useRef, useCallback } from "react";
const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;
const FRAGMENT_SHADER_SOURCE = `
precision highp float;

varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_phase;        // 0.0 = smooth, 1.0 = rippling jelly, 2.0 = ferrofluid spike
uniform float u_pulse;        // Absorption shockwave impulse
uniform float u_progress;     // Overall progress 0..1

// 3D Simplex noise for organic fluid dynamics
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Signed Distance Function (SDF) of the Black Liquid Jelly Orb
// Base radius is calibrated with camera distance to guarantee 100% unclipped bounds in all 3 phases
float map(vec3 p) {
  float baseRadius = 0.58;

  // Step 1: Smooth breathing idle wobble (Image 1 top)
  float breathe = sin(u_time * 2.0) * 0.012;

  // Step 2: Organic liquid jelly folds with multi-octave domain warping (Image 1 middle & Image 2)
  vec3 warp = vec3(
    snoise(p * 2.8 + vec3(u_time * 0.65, 0.0, 0.0)),
    snoise(p * 2.8 + vec3(0.0, u_time * 0.72, 1.4)),
    snoise(p * 2.8 + vec3(1.1, 0.0, u_time * 0.58))
  );
  vec3 q = p + warp * 0.28;
  float jellyFolds = snoise(q * 3.6 + u_time * 0.8) * 0.10 + snoise(q * 7.2 - u_time * 1.1) * 0.045;

  // Absorption impulse shockwave ripple
  float impulse = sin(length(p) * 16.0 - u_time * 10.0) * u_pulse * 0.06;

  // Step 3: Sharp 3D Ferrofluid Spikes (Image 1 bottom - magnetic cone tentacles)
  vec3 np = normalize(p);
  float spikeGrid = sin(np.x * 12.0 + u_time * 1.5) * sin(np.y * 12.0 - u_time * 1.2) * cos(np.z * 12.0);
  float radialSpikes1 = pow(max(0.0, spikeGrid), 2.8) * 0.40;
  float radialSpikes2 = pow(max(0.0, snoise(np * 10.5 + vec3(u_time * 2.2))), 3.0) * 0.36;
  float ferrofluidBloom = radialSpikes1 + radialSpikes2;

  // Phase interpolation: 0.0 (smooth) -> 1.0 (jelly folds) -> 2.0 (ferrofluid bloom)
  float smoothW = max(0.0, 1.0 - u_phase);
  float jellyW = clamp(u_phase, 0.0, 1.0) - clamp(u_phase - 1.0, 0.0, 1.0);
  float spikeW = clamp(u_phase - 1.0, 0.0, 1.0);

  float displacement = smoothW * breathe
                     + jellyW * (jellyFolds + impulse)
                     + spikeW * ferrofluidBloom;

  return length(p) - (baseRadius + displacement);
}

vec3 calcNormal(vec3 p) {
  const float h = 0.001;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * map(p + k.xyy * h) +
    k.yyx * map(p + k.yyx * h) +
    k.yxy * map(p + k.yxy * h) +
    k.xxx * map(p + k.xxx * h)
  );
}

void main() {
  // Normalize screen coordinates with 1:1 aspect ratio centered in canvas
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // Camera setup: generous FOV and distance so max spikes (radius ~0.84) NEVER clip canvas edge (bound ~1.2)
  vec3 ro = vec3(0.0, 0.0, 3.2);
  vec3 rd = normalize(vec3(uv, -1.4));

  float t = 0.0;
  float d = 0.0;
  bool hit = false;
  vec3 p = ro;

  for (int i = 0; i < 75; i++) {
    p = ro + rd * t;
    d = map(p);
    if (d < 0.001) {
      hit = true;
      break;
    }
    if (t > 5.0) break;
    t += d * 0.75;
  }

  if (!hit) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  vec3 n = calcNormal(p);
  vec3 v = -rd;

  // Studio Lighting Architecture (Apple Pro Hardware Polish)
  // Light 1: Primary overhead curved softbox (creates the iconic curved glass sheen in Image 1 top)
  vec3 lightDir1 = normalize(vec3(0.35, 0.95, 0.75));
  // Light 2: Fill softbox from bottom-left
  vec3 lightDir2 = normalize(vec3(-0.65, -0.45, 0.55));
  // Light 3: Crisp direct key light
  vec3 lightDir3 = normalize(vec3(0.0, 0.6, 0.9));

  // Half vectors
  vec3 h1 = normalize(lightDir1 + v);
  vec3 h2 = normalize(lightDir2 + v);
  vec3 h3 = normalize(lightDir3 + v);

  // High-Gloss Specular Reflections
  float specTopSoft = pow(max(dot(n, h1), 0.0), 42.0);      // Broad soft overhead sheen
  float specSharpGlint = pow(max(dot(n, h3), 0.0), 160.0);   // Crisp pinpoint glint
  float specFill = pow(max(dot(n, h2), 0.0), 24.0);         // Ambient fill reflection

  // Apple-grade Glassmorphic Fresnel Edge Rim
  float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.4);

  // Deep Obsidian / Liquid Black Core
  vec3 baseObsidian = vec3(0.02, 0.02, 0.025);
  // Studio ambient gradient reflecting grey/white horizon
  vec3 envLight = mix(vec3(0.05, 0.05, 0.06), vec3(0.25, 0.25, 0.28), smoothstep(-0.4, 0.9, n.y));

  vec3 col = baseObsidian * envLight;

  // Layered specular passes for pure glossy liquid glass feel
  col += vec3(0.98, 0.98, 1.0) * specTopSoft * 1.5;     // Clean curved Apple sheen
  col += vec3(1.0, 1.0, 1.0) * specSharpGlint * 1.4;    // Brilliant white hot glint
  col += vec3(0.65, 0.67, 0.72) * specFill * 0.45;     // Fill contour
  col += vec3(0.55, 0.58, 0.65) * fresnel * 1.25;      // Glassmorphic rim contour

  // Liquid internal density darkening
  float depth = clamp((t - 2.2) * 1.4, 0.0, 1.0);
  col = mix(col, col * 0.8, depth);

  gl_FragColor = vec4(col, 1.0);
}
`;
export function LiquidJellyOrb({ phase = 0.0, progress = 0.0, pulseTrigger = 0, size = 280, className = "", isProcessing = false, }) {
    const canvasRef = useRef(null);
    const glRef = useRef(null);
    const uniformsRef = useRef(null);
    const currentPhaseRef = useRef(phase);
    const pulseDecayRef = useRef(0.0);
    const animFrameRef = useRef(0);
    useEffect(() => {
        currentPhaseRef.current = phase;
    }, [phase]);
    useEffect(() => {
        if (pulseTrigger > 0) {
            pulseDecayRef.current = 1.0;
        }
    }, [pulseTrigger]);
    const initWebGL = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const gl = canvas.getContext("webgl", {
            alpha: true,
            antialias: true,
            premultipliedAlpha: true,
            powerPreference: "high-performance",
        });
        if (!gl)
            return;
        glRef.current = gl;
        const createShader = (type, source) => {
            const shader = gl.createShader(type);
            if (!shader)
                return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("Shader error:", gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };
        const vertShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
        const fragShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
        if (!vertShader || !fragShader)
            return;
        const program = gl.createProgram();
        if (!program)
            return;
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Program link error:", gl.getProgramInfoLog(program));
            return;
        }
        gl.useProgram(program);
        const quadVertices = new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0,
        ]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
        const posAttr = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(posAttr);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);
        uniformsRef.current = {
            resolution: gl.getUniformLocation(program, "u_resolution"),
            time: gl.getUniformLocation(program, "u_time"),
            phase: gl.getUniformLocation(program, "u_phase"),
            pulse: gl.getUniformLocation(program, "u_pulse"),
            progress: gl.getUniformLocation(program, "u_progress"),
        };
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }, []);
    useEffect(() => {
        initWebGL();
        const startTime = performance.now();
        let smoothPhase = currentPhaseRef.current;
        const render = () => {
            const gl = glRef.current;
            const uniforms = uniformsRef.current;
            const canvas = canvasRef.current;
            if (gl && uniforms && canvas) {
                const time = (performance.now() - startTime) * 0.001;
                // Smooth spring transition between phases (smooth -> jelly -> ferrofluid)
                smoothPhase += (currentPhaseRef.current - smoothPhase) * 0.085;
                if (pulseDecayRef.current > 0.01) {
                    pulseDecayRef.current *= 0.91;
                }
                else {
                    pulseDecayRef.current = 0.0;
                }
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                const displayWidth = Math.round(canvas.clientWidth * dpr);
                const displayHeight = Math.round(canvas.clientHeight * dpr);
                if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
                    canvas.width = displayWidth;
                    canvas.height = displayHeight;
                    gl.viewport(0, 0, displayWidth, displayHeight);
                }
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                if (uniforms.resolution)
                    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
                if (uniforms.time)
                    gl.uniform1f(uniforms.time, time);
                if (uniforms.phase)
                    gl.uniform1f(uniforms.phase, smoothPhase);
                if (uniforms.pulse)
                    gl.uniform1f(uniforms.pulse, pulseDecayRef.current);
                if (uniforms.progress)
                    gl.uniform1f(uniforms.progress, progress);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }
            animFrameRef.current = requestAnimationFrame(render);
        };
        animFrameRef.current = requestAnimationFrame(render);
        return () => {
            if (animFrameRef.current)
                cancelAnimationFrame(animFrameRef.current);
        };
    }, [initWebGL, progress]);
    return (<div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`} style={{ width: size, height: size }}>
      {/* Apple-grade Ambient Radial Backlight Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/40 via-neutral-800/30 to-white/10 dark:from-white/15 dark:via-neutral-700/20 dark:to-white/5 blur-2xl transform scale-90 opacity-70 pointer-events-none transition-transform duration-700" style={{
            transform: isProcessing ? "scale(1.15)" : "scale(0.9)",
        }}/>

      <canvas ref={canvasRef} className="relative z-10 w-full h-full aspect-square drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)]" style={{ width: size, height: size }}/>
    </div>);
}
