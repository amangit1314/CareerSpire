"use client";

import { useEffect, useRef } from "react";

/**
 * "Ink × Prism" hero shader — approved in the standalone Shader Lab preview
 * before this ever touched a real page (see docs/DECISIONS.md). Raw WebGL,
 * zero dependencies: a full-screen triangle + one fragment shader.
 *
 * Hard lessons from the first attempt, baked in on purpose:
 * - Palette is hardcoded here as plain hex, NEVER read from CSS custom
 *   properties (`--primary` etc). That's what let a shader tweak leak into
 *   the whole app's brand color last time. This component cannot do that
 *   again structurally, not just by convention.
 * - The canvas is fully opaque (alpha 1) and paints its own dark ground —
 *   no low-alpha blending over page content, which is what turned the
 *   first version into a muddy gray-purple smear.
 * - A fixed radial+linear vignette (`.scrim`, rendered as a sibling div,
 *   not part of the shader) sits over the text zone so copy contrast never
 *   depends on where a bright color band happens to drift.
 * - Simplex noise (not hash-based value noise) + a dither pass to prevent
 *   gradient banding.
 * - Respects `prefers-reduced-motion` (one static frame, no rAF loop),
 *   pauses via IntersectionObserver (off-screen) and `visibilitychange`
 *   (backgrounded tab), and caps devicePixelRatio at 1.5.
 *
 * Scoped to the hero only — not a global background, not wired to theme.
 */

const VERTEX_SRC = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

const NOISE_LIB = `
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * snoise(p); p *= 2.02; a *= 0.5; }
  return v;
}
float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
`;

const FRAGMENT_SRC = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uBg;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
${NOISE_LIB}
void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 1.9;
  float t = uTime * 0.035;

  vec2 warp = vec2(fbm(p + t), fbm(p - t + 6.1));
  float n = fbm(p + warp * 1.4);
  n = (n + 1.0) * 0.5;
  n = pow(n, mix(1.0, 2.2, 0.72));

  vec3 col = uBg;
  col = mix(col, uColorA, smoothstep(0.15, 0.55, n));
  col = mix(col, uColorB, smoothstep(0.5, 0.85, n) * smoothstep(0.2, 0.6, warp.x + 0.5));
  col = mix(col, uColorC, smoothstep(0.6, 0.95, warp.y + 0.5));

  float grain = (hash13(vec3(gl_FragCoord.xy, uTime)) - 0.5) / 64.0;
  col += grain;

  gl_FragColor = vec4(col, 1.0);
}
`;

// Ink x Prism palette — approved in Shader Lab, fixed here as plain values.
const BG: [number, number, number] = [0x06 / 255, 0x06 / 255, 0x0c / 255];
const COLOR_A: [number, number, number] = [0x4b / 255, 0x6e / 255, 0xf5 / 255]; // blue
const COLOR_B: [number, number, number] = [0x6d / 255, 0x5f / 255, 0xd1 / 255]; // violet
const COLOR_C: [number, number, number] = [0x2f / 255, 0xb8 / 255, 0xb0 / 255]; // teal

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function ShaderBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false });
    if (!gl) return; // falls back to the plain dark bg set on the wrapper

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    gl.uniform3f(gl.getUniformLocation(program, "uBg"), ...BG);
    gl.uniform3f(gl.getUniformLocation(program, "uColorA"), ...COLOR_A);
    gl.uniform3f(gl.getUniformLocation(program, "uColorB"), ...COLOR_B);
    gl.uniform3f(gl.getUniformLocation(program, "uColorC"), ...COLOR_C);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let rafId = 0;
    let visible = true;

    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
      }
    };

    const draw = (now: number) => {
      resize();
      gl.uniform1f(uTime, now / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      if (!visible) return;
      draw(now);
      rafId = requestAnimationFrame(loop);
    };

    resize();
    draw(performance.now());
    if (!reduceMotion) rafId = requestAnimationFrame(loop);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && !document.hidden;
        cancelAnimationFrame(rafId);
        if (visible && !reduceMotion) rafId = requestAnimationFrame(loop);
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(canvas);

    const onVisibilityChange = () => {
      visible = !document.hidden;
      cancelAnimationFrame(rafId);
      if (visible && !reduceMotion) rafId = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-[#06060c] ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      {/* Fixed vignette — independent of shader motion, keeps text
                contrast constant regardless of what color drifts underneath.
                Sized in px, not %: the hero is min-h-screen (~3x taller than
                the tile this was tuned in), and a percentage-sized ellipse
                scales up with it — which is what was crushing the whole
                shader to near-black instead of just dimming behind the copy. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 680px 360px at 50% 50%, rgba(3,4,8,0.5) 0%, rgba(3,4,8,0.22) 55%, rgba(3,4,8,0) 80%)," +
            "linear-gradient(to bottom, rgba(3,4,8,0.1), rgba(3,4,8,0) 20%, rgba(3,4,8,0) 80%, rgba(3,4,8,0.15))",
        }}
      />
    </div>
  );
}
