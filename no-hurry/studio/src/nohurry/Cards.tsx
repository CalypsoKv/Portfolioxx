import React from 'react';
import {AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FAMILY, FRAME_H, FRAME_W} from './theme';

const clampOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** "no hurry." - the title card: letters snap in one frame apart, then the word settles. */
const TitleCardInner: React.FC<{readonly text: string; readonly color?: string; readonly size?: number}> = ({
	text,
	color = C.cream,
	size = 176,
}) => {
	const frame = useCurrentFrame();
	const settle = interpolate(frame, [0, 22], [1.06, 1], {...clampOpts, easing: Easing.out(Easing.cubic)});
	return (
		<div
			style={{
				fontFamily: FAMILY.sans,
				fontWeight: 800,
				fontSize: size,
				letterSpacing: '-0.045em',
				color,
				scale: String(settle),
				whiteSpace: 'pre',
			}}
		>
			{text.split('').map((ch, i) => (
				<span key={i} style={{opacity: frame >= i ? 1 : 0}}>
					{ch}
				</span>
			))}
		</div>
	);
};

export const TitleCard = Interactive.create({
	Component: TitleCardInner,
	layout: 'absolute-fill',
	componentName: 'TitleCard',
	schema: {
		text: {type: 'string', default: 'no hurry.', description: 'Title'},
		color: {type: 'color', default: C.cream, description: 'Colour'},
		size: {type: 'number', min: 40, max: 400, step: 1, default: 176, description: 'Size', hiddenFromList: false},
	},
});

type Anchor = 'tl' | 'tr' | 'bl' | 'br' | 'tc' | 'bc';

const anchorStyle = (at: Anchor): React.CSSProperties => {
	const s: React.CSSProperties = {position: 'absolute'};
	if (at[0] === 't') {
		s.top = 128;
	} else {
		s.bottom = 330;
	}
	if (at[1] === 'l') {
		s.left = 81;
	} else if (at[1] === 'r') {
		s.right = 81;
		s.textAlign = 'right';
	} else {
		s.left = 0;
		s.right = 0;
		s.textAlign = 'center';
	}
	return s;
};

/** Small monospaced caption (names, dates, exhibits): types itself in. */
const MonoLabelInner: React.FC<{readonly text: string; readonly at: Anchor; readonly color?: string; readonly size?: number}> = ({
	text,
	at,
	color = C.white,
	size = 30,
}) => {
	const frame = useCurrentFrame();
	const n = Math.round(interpolate(frame, [2, 16], [0, text.length], clampOpts));
	return (
		<div
			style={{
				...anchorStyle(at),
				fontFamily: FAMILY.mono,
				fontWeight: 500,
				fontSize: size,
				letterSpacing: '0.12em',
				color,
				textShadow: '0px 2px 12px rgba(0,0,0,0.6)',
				whiteSpace: 'pre',
			}}
		>
			{text.slice(0, n)}
		</div>
	);
};

export const MonoLabel = Interactive.create({
	Component: MonoLabelInner,
	layout: 'absolute-fill',
	componentName: 'MonoLabel',
	schema: {
		text: {type: 'string', default: '', description: 'Text'},
		color: {type: 'color', default: C.white, description: 'Colour'},
	},
});

/** Chapter tag at the top of the frame: amber dot + spaced capitals; fades out at the end of its item. */
const ChapterTagInner: React.FC<{readonly text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const n = Math.round(interpolate(frame, [0, 14], [0, text.length], clampOpts));
	const fade = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], clampOpts);
	return (
		<div
			style={{
				position: 'absolute',
				top: 96,
				left: 0,
				right: 0,
				textAlign: 'center',
				fontFamily: FAMILY.mono,
				fontWeight: 500,
				fontSize: 28,
				letterSpacing: '0.24em',
				color: C.white,
				opacity: fade,
				textShadow: '0px 2px 12px rgba(0,0,0,0.6)',
				whiteSpace: 'pre',
			}}
		>
			<span style={{color: C.amber}}>● </span>
			{text.toUpperCase().slice(0, n)}
		</div>
	);
};

export const ChapterTag = Interactive.create({
	Component: ChapterTagInner,
	layout: 'absolute-fill',
	componentName: 'ChapterTag',
	schema: {text: {type: 'string', default: '', description: 'Chapter'}},
});

/** White flash centred on a cut. */
const FlashInner: React.FC<{readonly color?: string}> = ({color = '#FFFFFF'}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const mid = (durationInFrames - 1) / 2;
	const o = interpolate(frame, [0, mid, durationInFrames - 1], [0, 1, 0], {...clampOpts, easing: Easing.out(Easing.quad)});
	return <AbsoluteFill style={{backgroundColor: color, opacity: o}} />;
};

export const Flash = Interactive.create({
	Component: FlashInner,
	layout: 'absolute-fill',
	componentName: 'Flash',
	schema: {color: {type: 'color', default: '#FFFFFF', description: 'Colour'}},
});

/** Light leak made of moving warm gradients (CSS only; no GPU needed). */
const LightLeakInner: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const u = frame / Math.max(1, durationInFrames - 1);
	const o = Math.sin(Math.PI * u) ** 0.8;
	const x1 = -200 + 1500 * u;
	const x2 = 1300 - 1100 * u;
	return (
		<AbsoluteFill
			style={{
				mixBlendMode: 'screen',
				opacity: o,
				background: [
					`radial-gradient(ellipse 900px 1300px at ${x1}px ${520 + 300 * u}px, rgba(255,150,40,0.95), rgba(255,90,20,0.35) 45%, rgba(255,60,0,0) 75%)`,
					`radial-gradient(ellipse 700px 1000px at ${x2}px ${1400 - 400 * u}px, rgba(255,45,135,0.55), rgba(255,45,135,0) 70%)`,
					`linear-gradient(${100 + 40 * u}deg, rgba(255,220,180,0) 30%, rgba(255,230,190,0.35) 50%, rgba(255,220,180,0) 70%)`,
				].join(', '),
			}}
		/>
	);
};

export const LightLeak = Interactive.create({
	Component: LightLeakInner,
	layout: 'absolute-fill',
	componentName: 'LightLeak',
});

/** Film grain (6 cycled monochrome tiles, overlay blend) and a soft vignette over the whole film. */
const FinishInner: React.FC<{readonly grain?: number; readonly vignette?: number}> = ({grain = 0.12, vignette = 0.3}) => {
	const frame = useCurrentFrame();
	return (
		<>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 78% 62% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)`,
				}}
			/>
			<Img
				src={staticFile(`fx/grain_${Math.floor(frame / 2) % 6}.png`)}
				showInTimeline={false}
				style={{position: 'absolute', left: 0, top: 0, width: FRAME_W, height: FRAME_H, mixBlendMode: 'overlay', opacity: grain}}
			/>
		</>
	);
};

export const Finish = Interactive.create({
	Component: FinishInner,
	layout: 'absolute-fill',
	componentName: 'Finish',
	schema: {
		grain: {type: 'number', min: 0, max: 0.6, step: 0.01, default: 0.12, description: 'Grain', hiddenFromList: false},
		vignette: {type: 'number', min: 0, max: 0.9, step: 0.01, default: 0.3, description: 'Vignette', hiddenFromList: false},
	},
});

/** Legibility scrim: soft dark gradients behind type at the top and/or bottom of a photo. */
const ScrimInner: React.FC<{readonly top?: number; readonly bottom?: number}> = ({top = 0, bottom = 0}) => {
	const layers: string[] = [];
	if (top > 0) {
		layers.push(`linear-gradient(180deg, rgba(0,0,0,${top}) 0%, rgba(0,0,0,${(top * 0.55).toFixed(3)}) 18%, rgba(0,0,0,0) 38%)`);
	}
	if (bottom > 0) {
		layers.push(`linear-gradient(0deg, rgba(0,0,0,${bottom}) 0%, rgba(0,0,0,${(bottom * 0.6).toFixed(3)}) 24%, rgba(0,0,0,0) 46%)`);
	}
	return <AbsoluteFill style={{background: layers.length ? layers.join(', ') : undefined}} />;
};

export const Scrim = Interactive.create({
	Component: ScrimInner,
	layout: 'absolute-fill',
	componentName: 'Scrim',
	schema: {
		top: {type: 'number', min: 0, max: 1, step: 0.01, default: 0, description: 'Top', hiddenFromList: false},
		bottom: {type: 'number', min: 0, max: 1, step: 0.01, default: 0, description: 'Bottom', hiddenFromList: false},
	},
});
