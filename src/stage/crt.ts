export const vertex = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }
`;

/**
 * The whole viewport is the screen: barrel curve with black rounded corners, stepped grain (8 steps a second),
 * scanlines, glitch bands with RGB split, and a three-tone register map over the engraved plate.
 */
export const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes, uTexSize;
uniform float uTime, uGlitch, uProg, uCRT, uQ, uDuo, uDim, uFocus;
uniform vec3 uC0, uC1, uC2;
varying vec2 vUv;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 barrel(vec2 uv, float k){ vec2 p = uv * 2. - 1.; float r2 = dot(p, p); p /= (1. - k * r2); return .5 * (p + 1.); }
vec2 cover(vec2 uv, float zoom, vec2 pan){
  float ra = uRes.x / uRes.y, rt = uTexSize.x / uTexSize.y;
  vec2 s = ra > rt ? vec2(1., rt / ra) : vec2(ra / rt, 1.);
  return (uv - .5) * s / zoom + .5 + pan;
}
void main(){
  vec2 d = mix(vUv, barrel(vUv, .11), uCRT);
  float inside = step(0., d.x) * step(d.x, 1.) * step(0., d.y) * step(d.y, 1.);
  vec2 e = min(d, 1. - d);
  float corner = smoothstep(0., .035, min(e.x, e.y));
  float ts = floor(uTime * 8.) / 8.;
  float row = floor(d.y * 48.);
  float tg = floor(uTime * 12.);
  float gate = step(.95 - .45 * uGlitch, hash(vec2(row, tg)));
  d.x += (hash(vec2(row, tg + 13.7)) - .5) * .2 * (uGlitch * 2. + .04 * uQ) * gate;
  float eps = (.0014 + .014 * uGlitch) * uQ;
  vec2 pan = mix(vec2(-.07, .08), vec2(.07, -.08), uProg);
  float ra = uRes.x / uRes.y;
  float portrait = step(ra, uTexSize.x / uTexSize.y * .6);
  pan.x += portrait * (uFocus - .5);
  vec2 p = cover(d, mix(1.2, 1.02, portrait) + .3 * uProg, pan);
  vec3 col = vec3(texture2D(uTex, p + vec2(eps, 0.)).r, texture2D(uTex, p).g, texture2D(uTex, p - vec2(eps, 0.)).b);
  float lum = dot(col, vec3(.299, .587, .114));
  vec3 tri = lum < .5 ? mix(uC0, uC1, lum * 2.) : mix(uC1, uC2, (lum - .5) * 2.);
  col = mix(col, tri, uDuo);
  col *= 1. - .08 * uCRT * (.5 + .5 * sin(d.y * uRes.y * 3.14159));
  col += (hash(d * uRes + ts * 91.) - .5) * .11 * uQ * uCRT;
  col += uGlitch * .18 * hash(vec2(row, tg + 3.));
  col *= 1. - uDim;
  col *= mix(1., corner, uCRT);
  col *= mix(1., inside, uCRT);
  gl_FragColor = vec4(col, 1.);
}
`;
