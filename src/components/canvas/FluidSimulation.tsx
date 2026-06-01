"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

const VERTEX_SHADER_SOURCE = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    vUv.y = 1.0 - vUv.y; // Flip Y
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform vec3 u_color_base;
  uniform vec3 u_color_accent;
  uniform float u_accent_weight;

  // Simplex Noise Generator for GPU Fluid Simulation
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx) ;
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0) )
    + i.x + vec3(0.0, i1.x, 1.0) );
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 a0 = x - floor(x + 0.5);
    vec3 diag = 1.0 - 2.0 * a0 * a0 - 2.0 * h * h;
    vec3 norm = inversesqrt(a0*a0 + h*h + diag*diag);
    vec3 g = a0 * norm;
    g.z = h.z * norm.z;
    vec3 vec = vec3(0.0);
    vec.x = dot(g.xy, x0);
    vec.y = dot(g.yz, x12.xy);
    vec.z = dot(g.xz, x12.zw);
    return 130.0 * dot(m, vec);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    
    // Fluid turbulence algorithm based on time and mouse vectors
    vec2 uv = vUv;
    float dist = distance(u_mouse, st);
    float force = smoothstep(0.4, 0.0, dist) * 0.15;
    
    // Flow fields
    float n1 = snoise(uv * 3.0 + vec2(u_time * 0.05, u_time * 0.03)) * 0.5;
    float n2 = snoise(uv * 6.0 - vec2(u_time * 0.04, -u_time * 0.06)) * 0.25;
    
    // Distort coordinates dynamically creating realistic vortices
    uv.x += n1 + force * (st.x - u_mouse.x);
    uv.y += n2 + force * (st.y - u_mouse.y);
    
    float fluidPattern = snoise(uv * 2.0 + u_time * 0.08);
    fluidPattern += snoise(uv * 4.0 - u_time * 0.12) * 0.5;
    fluidPattern = fluidPattern * 0.5 + 0.5; // Norm to [0, 1]

    // Deep luxury space color gradient mixing
    vec3 deepBg = vec3(0.066, 0.066, 0.066); // Antrasit Siyahı
    
    // Dynamic color lerping based on store hover state (Sage vs Amber)
    vec3 activeFluidColor = mix(u_color_base, u_color_accent, u_accent_weight);
    
    // Swirling light effect
    vec3 finalColor = mix(deepBg, activeFluidColor, fluidPattern * 0.12);
    
    // Ambient soft backlight glowing highlight
    float glow = smoothstep(1.0, 0.0, dist) * 0.08;
    finalColor += activeFluidColor * glow;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function FluidSimulation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const state = useRef({
    time: 0,
    mouseX: 0.5,
    mouseY: 0.5,
    targetMouseX: 0.5,
    targetMouseY: 0.5,
    accentWeight: 0,
    targetAccentWeight: 0,
  });

  const hoveredProduct = useStore((s) => s.hoveredProduct);

  useEffect(() => {
    // Dynamic HSL to GLSL RGB values
    // Sage Green: #5E6D62 => rgb(0.368, 0.427, 0.384)
    // Himalayan Gold: #C29F68 => rgb(0.76, 0.623, 0.407)
    const baseColor = [0.368, 0.427, 0.384]; // Sage
    const accentColor = [0.76, 0.623, 0.407]; // Amber Gold

    if (hoveredProduct === "perfume") {
      state.current.targetAccentWeight = 1.0; // Fully Amber
    } else if (hoveredProduct === "polo") {
      state.current.targetAccentWeight = 0.0; // Fully Sage
    } else {
      state.current.targetAccentWeight = 0.5; // Neutral balance
    }
  }, [hoveredProduct]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = canvas.getContext("webgl");
    if (!gl) {
      // Fallback: 2D Canvas animation if WebGL is unsupported
      let ctx = canvas.getContext("2d");
      if (!ctx) return;
      let frameId: number;

      const render2D = () => {
        if (!ctx) return;
        state.current.time += 0.01;
        state.current.accentWeight += (state.current.targetAccentWeight - state.current.accentWeight) * 0.05;
        
        ctx.fillStyle = "#111111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Render soft romantic gradient backdrop
        const grad = ctx.createRadialGradient(
          canvas.width * state.current.mouseX,
          canvas.height * (1 - state.current.mouseY),
          10,
          canvas.width * 0.5,
          canvas.height * 0.5,
          canvas.width
        );
        
        const r = Math.round((0.368 * (1 - state.current.accentWeight) + 0.76 * state.current.accentWeight) * 255);
        const g = Math.round((0.427 * (1 - state.current.accentWeight) + 0.623 * state.current.accentWeight) * 255);
        const b = Math.round((0.384 * (1 - state.current.accentWeight) + 0.407 * state.current.accentWeight) * 255);
        
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`);
        grad.addColorStop(1, "rgba(17, 17, 17, 1)");
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        frameId = requestAnimationFrame(render2D);
      };
      
      render2D();
      return () => cancelAnimationFrame(frameId);
    }

    // Shader compilation
    const compileShader = (source: string, type: number) => {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error(gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(VERTEX_SHADER_SOURCE, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(FRAGMENT_SHADER_SOURCE, gl.FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Geometry buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Shader uniforms
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uColorBase = gl.getUniformLocation(program, "u_color_base");
    const uColorAccent = gl.getUniformLocation(program, "u_color_accent");
    const uAccentWeight = gl.getUniformLocation(program, "u_accent_weight");

    const resize = () => {
      // Downscale performance optimization to run 60 FPS smoothly on high-DPI screens
      const scale = window.devicePixelRatio > 1.5 ? 0.75 : 1.0;
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      gl!.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener("resize", resize);
    resize();

    // Mouse movement listeners
    const handleMouseMove = (e: MouseEvent) => {
      state.current.targetMouseX = e.clientX / window.innerWidth;
      state.current.targetMouseY = 1.0 - e.clientY / window.innerHeight; // Flip Y
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        state.current.targetMouseX = e.touches[0].clientX / window.innerWidth;
        state.current.targetMouseY = 1.0 - e.touches[0].clientY / window.innerHeight;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    let animationFrameId: number;

    const render = () => {
      // Visibility checks to save user CPU/Battery when tab is backgrounded (Phase 7 Optimization)
      if (document.visibilityState === "hidden") {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      state.current.time += 0.012;
      
      // Interpolate states smoothly (lerp)
      state.current.mouseX += (state.current.targetMouseX - state.current.mouseX) * 0.08;
      state.current.mouseY += (state.current.targetMouseY - state.current.mouseY) * 0.08;
      state.current.accentWeight += (state.current.targetAccentWeight - state.current.accentWeight) * 0.05;

      gl!.clearColor(0.066, 0.066, 0.066, 1.0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      gl!.uniform2f(uResolution, canvas.width, canvas.height);
      gl!.uniform2f(uMouse, state.current.mouseX, state.current.mouseY);
      gl!.uniform1f(uTime, state.current.time);
      gl!.uniform3f(uColorBase, 0.231, 0.268, 0.241); // Sage Green
      gl!.uniform3f(uColorAccent, 0.76, 0.623, 0.407); // Amber Gold
      gl!.uniform1f(uAccentWeight, state.current.accentWeight);

      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-50 h-screen w-screen object-cover opacity-90 transition-opacity duration-1000 pointer-events-none"
    />
  );
}
