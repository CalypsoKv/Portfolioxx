import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "../motion/clock";
import { S, notify, registerStageHooks } from "./state";
import { PLATE_FOCUS } from "./registers";
import { fragment, vertex } from "./crt";

const cache = new Map<string, THREE.Texture>();
const pending = new Map<string, Promise<THREE.Texture>>();
const loader = new THREE.TextureLoader();
function load(url: string): Promise<THREE.Texture> {
  const hit = cache.get(url);
  if (hit) return Promise.resolve(hit);
  let p = pending.get(url);
  if (!p) {
    p = new Promise((resolve, reject) =>
      loader.load(
        url,
        (t) => {
          t.minFilter = THREE.LinearFilter;
          t.magFilter = THREE.LinearFilter;
          t.generateMipmaps = false;
          cache.set(url, t);
          resolve(t);
        },
        undefined,
        reject,
      ),
    );
    pending.set(url, p);
  }
  return p;
}

function Screen({ onLost, onReady }: { onLost: () => void; onReady: () => void }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { advance, setDpr, gl } = useThree();
  const frames = useRef({ n: 0, acc: 0, t: performance.now() });

  const uniforms = useMemo(
    () => ({
      uTex: { value: null as THREE.Texture | null },
      uRes: { value: new THREE.Vector2(1, 1) },
      uTexSize: { value: new THREE.Vector2(1672, 941) },
      uTime: { value: 0 },
      uGlitch: { value: 0 },
      uProg: { value: 0 },
      uCRT: { value: 1 },
      uQ: { value: 1 },
      uDuo: { value: 0 },
      uDim: { value: 0 },
      uFocus: { value: 0.5 },
      uC0: { value: new THREE.Color() },
      uC1: { value: new THREE.Color() },
      uC2: { value: new THREE.Color() },
    }),
    [],
  );

  // R3F copies the uniforms prop into its own object, so every read and write goes through the material ref.
  const setTexture = (url: string, t: THREE.Texture) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTex.value = t;
    const img = t.image as { width: number; height: number };
    u.uTexSize.value.set(img.width, img.height);
    u.uFocus.value = PLATE_FOCUS[url] ?? 0.5;
  };

  // One clock: GSAP's ticker is the only thing that advances the render.
  useEffect(() => {
    const tick = () => advance(performance.now());
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [advance]);

  useEffect(() => {
    registerStageHooks({
      load: async (url) => void (await load(url)),
      apply: (url) => {
        const t = cache.get(url);
        if (t) setTexture(url, t);
      },
    });
    void load(S.plate).then((t) => {
      setTexture(S.plate, t);
      onReady();
    });
    const el = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      onLost();
    };
    el.addEventListener("webglcontextlost", lost);
    return () => {
      registerStageHooks(null);
      el.removeEventListener("webglcontextlost", lost);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(({ size }) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value = gsap.ticker.time;
    S.progS += (S.prog - S.progS) * 0.08;
    u.uGlitch.value = S.glitch;
    u.uProg.value = S.progS;
    u.uCRT.value = S.crt;
    u.uQ.value = S.q;
    u.uDuo.value = S.duo;
    u.uDim.value = S.dim;
    u.uC0.value.setRGB(S.c0[0], S.c0[1], S.c0[2]);
    u.uC1.value.setRGB(S.c1[0], S.c1[1], S.c1[2]);
    u.uC2.value.setRGB(S.c2[0], S.c2[1], S.c2[2]);
    const dpr = gl.getPixelRatio();
    u.uRes.value.set(size.width * dpr, size.height * dpr);

    // Adaptive quality: measured frame time picks the render scale and effect strength.
    const f = frames.current;
    const now = performance.now();
    f.acc += now - f.t;
    f.t = now;
    if (++f.n >= 90) {
      const fps = 1000 / (f.acc / f.n);
      f.n = 0;
      f.acc = 0;
      const next = fps < 30 ? "low" : fps < 45 ? "medium" : "high";
      if (next !== S.quality && !(S.mode === "full" && new URLSearchParams(location.search).get("quality"))) {
        S.quality = next;
        S.q = next === "high" ? 1 : next === "medium" ? 0.6 : 0;
        notify();
        const scale = next === "high" ? 1 : next === "medium" ? 0.85 : 0.7;
        const cap = S.mode === "lite" ? 1.25 : 1.5;
        const big = window.innerWidth >= 3840 || window.innerHeight >= 2160 ? 0.5 : 1;
        setDpr(Math.min(window.devicePixelRatio || 1, cap) * scale * big);
      }
    }
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

export default function Stage({ mode, onLost, onReady }: { mode: "full" | "lite"; onLost: () => void; onReady: () => void }) {
  const cap = mode === "lite" ? 1.25 : 1.5;
  return (
    <Canvas
      className="stage-canvas"
      frameloop="never"
      dpr={Math.min(window.devicePixelRatio || 1, cap)}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 1] }}
      aria-hidden="true"
    >
      <Screen onLost={onLost} onReady={onReady} />
    </Canvas>
  );
}
