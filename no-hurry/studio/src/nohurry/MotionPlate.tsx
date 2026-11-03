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

type MotionPlateProps = {
	/** public path of the moving plate (tools/motion_lab.py) */
	readonly src: string;
	/** first frame of this beat inside the plate (one plate can span several beats) */
	readonly plateFrom: number;
	/** local frames of the key words: the camera kicks there */
	readonly hits?: readonly number[];
	readonly kick?: number;
};

const MotionPlateInner: React.FC<MotionPlateProps> = ({src, plateFrom, hits = [], kick = 0.035}) => {
	const frame = useCurrentFrame();
	const s = kickScale(frame, hits, kick);
	return (
		<AbsoluteFill style={{backgroundColor: '#000', overflow: 'hidden'}}>
			<AbsoluteFill style={{scale: String(s), transformOrigin: `${FRAME_W / 2}px ${FRAME_H / 2}px`}}>
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
	},
});
