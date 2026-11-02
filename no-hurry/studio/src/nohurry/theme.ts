import {Easing} from 'remotion';

/** Palette of the social cut (also used by the storyboard sheets). */
export const C = {
	white: '#F7F3EC',
	amber: '#FFB000',
	ink: '#3D2BFF',
	magenta: '#FF2D87',
	cream: '#F4E9D8',
	black: '#050505',
} as const;

export const FAMILY = {
	sans: '"Plus Jakarta Sans", sans-serif',
	serif: '"Cormorant Garamond", serif',
	mono: '"JetBrains Mono", monospace',
} as const;

export type FontKind = keyof typeof FAMILY;

export const FRAME_W = 1080;
export const FRAME_H = 1920;

/** The hazard relay: tick (lamp on) every 0.72 s, tock (lamp off) half a period later. */
export const TICK_START = 0;
export const TICK_PERIOD = 0.72;

/** [cx, cy, zoom]: image-normalised centre of the view and zoom (1 = the photo covers the 9:16 frame). */
export type View = readonly number[];

export const clamp = (v: number, lo: number, hi: number) =>
	Math.min(Math.max(v, lo), hi);

/** Where a photo sits so that `view` is centred and the frame stays covered (same maths as the storyboard). */
export const cover = (
	imgW: number,
	imgH: number,
	view: View,
	frameW: number = FRAME_W,
	frameH: number = FRAME_H,
) => {
	const s = Math.max(frameW / imgW, frameH / imgH) * view[2];
	const w = imgW * s;
	const h = imgH * s;
	return {
		left: clamp(frameW / 2 - view[0] * w, frameW - w, 0),
		top: clamp(frameH / 2 - view[1] * h, frameH - h, 0),
		w,
		h,
	};
};

const kb = Easing.bezier(0.33, 0, 0.67, 1);

/** Ken Burns between two views; zoom is interpolated in log space so the push feels constant. */
export const kenBurns = (fr: View, to: View, t: number): View => {
	const e = kb(clamp(t, 0, 1));
	return [
		fr[0] + (to[0] - fr[0]) * e,
		fr[1] + (to[1] - fr[1]) * e,
		Math.exp(Math.log(fr[2]) + (Math.log(to[2]) - Math.log(fr[2])) * e),
	];
};
