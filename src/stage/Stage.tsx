import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "../motion/clock";
import { S, notify, pointAt, registerStageHooks } from "./state";
import { PLATE_FOCUS } from "./registers";
import { fragment, vertex } from "./crt";

const cache = new Map<string, THREE.Texture>();
const pending = new Map<string, Promise<THREE.Texture>>();
const videos = new Map<string, HTMLVideoElement>();
const loader = new THREE.TextureLoader();
const isVideo = (url: string) => /\.(mp4|webm)$/.test(url);

const prep = <T extends THREE.Texture>(t: T) => {
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
};

/** A muted looping video becomes a texture once it has a frame to show (the Hardik Bhansali approach: video as the screen's picture). */
function loadVideo(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "auto";
    v.setAttribute("aria-hidden", "true");
    const fail = () => reject(new Error(`video ${url}`));
    const timer = window.setTimeout(fail, 8000);
    v.addEventListener("loadeddata", () => {
      clearTimeout(timer);
      videos.set(url, v);
      resolve(prep(new THREE.VideoTexture(v)));
    }, { once: true });
    v.addEventListener("error", () => {
      clearTimeout(timer);
      fail();
    }, { once: true });
    v.src = url;
    v.load();
  });
}

function load(url: string): Promise<THREE.Texture> {
  const hit = cache.get(url);
  if (hit) return Promise.resolve(hit);
  let p = pending.get(url);
  if (!p) {
    p = (isVideo(url) ? loadVideo(url) : new Promise<THREE.Texture>((resolve, reject) => loader.load(url, (t) => resolve(prep(t)), undefined, reject)))
      .then((t) => {
        cache.set(url, t);
        return t;
      })
      .finally(() => pending.delete(url));
    pending.set(url, p);
  }
  return p;
}

/** Only the loop on screen plays; the rest wait paused. A loop the browser refuses to play reports failure. */
async function play(url: string) {
  for (const [u, v] of videos) if (u !== url) v.pause();
  const v = videos.get(url);
  if (!v) return;
  try {
    await v.play();
  } catch {
    throw new Error(`play ${url}`);
  }
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
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseV: { value: 0 },
      uDrift: { value: 1 },
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
    const img = t.image as { width?: number; height?: number; videoWidth?: number; videoHeight?: number };
    u.uTexSize.value.set(img.videoWidth || img.width || 16, img.videoHeight || img.height || 9);
    u.uFocus.value = PLATE_FOCUS[url] ?? 0.5;
    u.uDrift.value = isVideo(url) ? 0 : 1;
  };

  // One clock: GSAP's ticker is the only thing that advances the render.
  useEffect(() => {
    const tick = () => advance(performance.now());
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [advance]);

  useEffect(() => {
    registerStageHooks({
      load: async (url) => {
        await load(url);
        if (isVideo(url)) await play(url);
      },
      apply: (url) => {
        const t = cache.get(url);
        if (!t) return;
        if (!isVideo(url)) for (const v of videos.values()) v.pause();
        setTexture(url, t);
      },
    });
    void load(S.src).then((t) => {
      setTexture(S.src, t);
      onReady();
    });
    const el = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      onLost();
    };
    const move = (e: PointerEvent) => e.pointerType === "mouse" && pointAt(e.clientX, e.clientY);
    // Hidden tabs keep nothing playing.
    const vis = () => {
      const v = videos.get(S.src);
      if (document.hidden) for (const x of videos.values()) x.pause();
      else if (v) void v.play().catch(() => {});
    };
    el.addEventListener("webglcontextlost", lost);
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", vis);
    return () => {
      registerStageHooks(null);
      el.removeEventListener("webglcontextlost", lost);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", vis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(({ size }) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value = gsap.ticker.time;
    S.progS += (S.prog - S.progS) * 0.08;
    S.mv *= 0.94;
    u.uGlitch.value = S.glitch;
    u.uProg.value = S.progS;
    u.uCRT.value = S.crt;
    u.uQ.value = S.q;
    u.uDuo.value = S.duo;
    u.uDim.value = S.dim;
    u.uMouse.value.set(S.mx, S.my);
    u.uMouseV.value = S.mv;
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
