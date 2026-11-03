import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Easing, Interactive, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FRAME_H, FRAME_W} from './theme';

/** Camera kick: on each key word the frame bumps in a few percent and settles, like a hand reacting to the beat. */
export const kickScale = (frame: number, hits: readonly number[], amount: number) => {
	let s = 1;
	for (const h of hits) {
		const f = frame - h;
		if (f >= -1 && f < 9) {
			s += amount * interpolate(f, [-1, 1, 8], [0, 1, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
				easing: Easing.out(Easing.cubic),
			});
		}
	}
	return s;
};

/** Handheld drift: a slow, deterministic sway (px, deg), so no frame of a plate is ever dead still. */
export const handheld = (frame: number, amount: number) => {
	const t = frame / 30;
	const tau = Math.PI * 2;
	return {
		x: amount * (Math.sin(tau * 0.31 * t + 0.4) + 0.6 * Math.sin(tau * 0.83 * t + 1.7)),
		y: amount * (Math.sin(tau * 0.27 * t + 2.1) + 0.5 * Math.sin(tau * 0.71 * t + 0.3)),
		r: amount * 0.025 * Math.sin(tau * 0.19 * t + 0.9),
	};
};

type MotionPlateProps = {
	/** public path of the moving plate (tools/motion_lab.py) */
	readonly src: string;
	/** first frame of this beat inside the plate (one plate can span several beats) */
	readonly plateFrom: number;
	/** local frames of the key words: the camera kicks there */
	readonly hits?: readonly number[];
	readonly kick?: number;
	/** handheld drift amplitude in px (0 = locked off) */
	readonly drift?: number;
};

const MotionPlateInner: React.FC<MotionPlateProps> = ({src, plateFrom, hits = [], kick = 0.035, drift = 5}) => {
	const frame = useCurrentFrame();
	const s = kickScale(frame, hits, kick) * (1 + drift / 400);
	const h = handheld(frame + plateFrom, drift);
	return (
		<AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					scale: String(s),
					translate: `${h.x.toFixed(2)}px ${h.y.toFixed(2)}px`,
					rotate: `${h.r.toFixed(3)}deg`,
					transformOrigin: `${FRAME_W / 2}px ${FRAME_H / 2}px`,
				}}
			>
				<Video src={staticFile(src)} trimBefore={plateFrom} muted objectFit="cover" showInTimeline={false} style={{width: FRAME_W, height: FRAME_H}} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const MotionPlate = Interactive.create({
	Component: MotionPlateInner,
	layout: 'absolute-fill',
	componentName: 'MotionPlate',
	schema: {
		kick: {type: 'number', min: 0, max: 0.2, step: 0.005, default: 0.035, description: 'Camera kick', hiddenFromList: false},
		drift: {type: 'number', min: 0, max: 30, step: 0.5, default: 5, description: 'Handheld drift (px)', hiddenFromList: false},
	},
});
