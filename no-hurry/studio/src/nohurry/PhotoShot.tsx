import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	Interactive,
	interpolate,
	random,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {kickScale} from './MotionPlate';
import {C, FAMILY, FRAME_H, FRAME_W, TICK_PERIOD, TICK_START, cover, kenBurns, type View} from './theme';

type Pt = readonly number[];

export type DiagramSpec = {
	/** distance: a line from the car to her · halves: Zeno's halvings · arrive: she covers the whole line */
	readonly kind: 'distance' | 'halves' | 'arrive';
	/** image-normalised point on the car (where the narrator sits) */
	readonly a: Pt;
	/** image-normalised point on her */
	readonly b: Pt;
	readonly label?: string;
	/** halves: how many halvings are marked (the newest one pops in) */
	readonly step?: number;
	/** arrive: local frame at which she reaches the car */
	readonly until?: number;
};

export type Punch = {
	readonly at: number;
	readonly src: string;
	readonly imgW: number;
	readonly imgH: number;
	readonly view: View;
};

type PlateProps = {
	readonly src: string;
	readonly imgW: number;
	readonly imgH: number;
	readonly view: View;
	readonly style?: React.CSSProperties;
};

/** A photo placed in the 9:16 frame for a given view (no animation of its own). */
export const Plate: React.FC<PlateProps> = ({src, imgW, imgH, view, style}) => {
	const g = cover(imgW, imgH, view);
	return (
		<Img
			src={staticFile(src)}
			showInTimeline={false}
			style={{
				position: 'absolute',
				left: g.left,
				top: g.top,
				width: g.w,
				height: g.h,
				maxWidth: 'none',
				...style,
			}}
		/>
	);
};

export const GLITCH_FRAMES = 9;
const GLITCH_AMP = [1, 0.55, 0.95, 0.3, 0.8, 0.2, 0.55, 0.12, 0];

/** RGB split + displaced slices of the same plate: a digital "error" lasting GLITCH_FRAMES frames. */
const Glitched: React.FC<PlateProps & {readonly k: number; readonly seed: string}> = ({k, seed, ...p}) => {
	const amp = GLITCH_AMP[k] ?? 0;
	const dx = 28 * amp;
	const id = `g${seed.replace(/[^a-z0-9]/gi, '')}`;
	const slices = [0, 1, 2, 3, 4].map((i) => {
		const y = random(`${seed}-y-${i}-${k}`) * FRAME_H;
		const h = 24 + random(`${seed}-h-${i}-${k}`) * 150;
		const off = (random(`${seed}-o-${i}-${k}`) - 0.5) * 190 * amp;
		return {y, h, off};
	});
	return (
		<>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<defs>
					<filter id={`${id}r`} colorInterpolationFilters="sRGB">
						<feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
					</filter>
					<filter id={`${id}gb`} colorInterpolationFilters="sRGB">
						<feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
					</filter>
				</defs>
			</svg>
			<AbsoluteFill style={{backgroundColor: '#000'}} />
			<AbsoluteFill style={{translate: `${dx}px 0px`, filter: `url(#${id}r)`, mixBlendMode: 'screen'}}>
				<Plate {...p} />
			</AbsoluteFill>
			<AbsoluteFill style={{translate: `${-dx}px 0px`, filter: `url(#${id}gb)`, mixBlendMode: 'screen'}}>
				<Plate {...p} />
			</AbsoluteFill>
			{slices.map((s, i) => (
				<AbsoluteFill
					key={i}
					style={{
						clipPath: `inset(${s.y}px 0px ${Math.max(0, FRAME_H - s.y - s.h)}px 0px)`,
						translate: `${s.off}px 0px`,
					}}
				>
					<Plate {...p} />
				</AbsoluteFill>
			))}
		</>
	);
};

/** Hazard lamp level on the relay grid: on at the tick, off (fast decay) at the tock. */
export const lampLevel = (absFrame: number, fps: number) => {
	const t = absFrame / fps - TICK_START;
	const ph = ((t % TICK_PERIOD) + TICK_PERIOD) % TICK_PERIOD;
	const half = TICK_PERIOD / 2;
	if (ph < half) {
		return 1 - 0.15 * (ph / half);
	}
	return 0.85 * Math.exp(-(ph - half) / 0.045);
};

const clampOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Diagram: React.FC<{
	readonly spec: DiagramSpec;
	readonly g: {left: number; top: number; w: number; h: number};
	readonly frame: number;
}> = ({spec, g, frame}) => {
	const P = (p: Pt) => [g.left + p[0] * g.w, g.top + p[1] * g.h];
	const [ax, ay] = P(spec.a);
	const [bx, by] = P(spec.b);
	const dotA = interpolate(frame, [0, 6], [0, 1], {...clampOpts, easing: Easing.out(Easing.back(2.2))});
	const dotB = interpolate(frame, [4, 10], [0, 1], {...clampOpts, easing: Easing.out(Easing.back(2.2))});
	const shadow = 'drop-shadow(0px 3px 10px rgba(0,0,0,0.55))';
	const children: React.ReactNode[] = [];
	if (spec.kind === 'distance') {
		const len = Math.hypot(bx - ax, by - ay);
		const draw = interpolate(frame, [3, 16], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.cubic)});
		const nx = -(by - ay) / len;
		const ny = (bx - ax) / len;
		children.push(
			<line
				key="l"
				x1={ax}
				y1={ay}
				x2={bx}
				y2={by}
				stroke={C.white}
				strokeWidth={6}
				strokeLinecap="round"
				strokeDasharray={`${len} ${len}`}
				strokeDashoffset={len * (1 - draw)}
			/>,
		);
		if (spec.label) {
			children.push(
				<text
					key="t"
					x={(ax + bx) / 2 + nx * 54}
					y={(ay + by) / 2 + ny * 54}
					fill={C.white}
					fontFamily={FAMILY.mono}
					fontSize={44}
					textAnchor="middle"
					opacity={interpolate(frame, [12, 18], [0, 1], clampOpts)}
				>
					{spec.label}
				</text>,
			);
		}
	}
	if (spec.kind === 'halves') {
		const step = spec.step ?? 0;
		const draw = interpolate(frame, [0, 8], [0, 1], {...clampOpts, easing: Easing.out(Easing.cubic)});
		children.push(
			<line key="all" x1={bx} y1={by} x2={bx + (ax - bx) * draw} y2={by + (ay - by) * draw} stroke={C.white} strokeOpacity={0.55} strokeWidth={5} strokeLinecap="round" strokeDasharray="2 14" />,
		);
		const f = 1 - 0.5 ** step;
		if (step > 0) {
			const grow = interpolate(frame, [3, 11], [0, 1], {...clampOpts, easing: Easing.out(Easing.cubic)});
			const prev = 1 - 0.5 ** (step - 1);
			const ff = prev + (f - prev) * grow;
			children.push(
				<line key="cov" x1={bx} y1={by} x2={bx + (ax - bx) * ff} y2={by + (ay - by) * ff} stroke={C.white} strokeWidth={7} strokeLinecap="round" />,
			);
		}
		for (let s = 1; s <= step; s++) {
			const fs = 1 - 0.5 ** s;
			const mx = bx + (ax - bx) * fs;
			const my = by + (ay - by) * fs;
			const pop = s === step ? interpolate(frame, [8, 14], [0, 1], {...clampOpts, easing: Easing.out(Easing.back(2.5))}) : 1;
			children.push(<circle key={`m${s}`} cx={mx} cy={my} r={17 * pop} fill="none" stroke={C.ink} strokeWidth={7} />);
			children.push(<circle key={`mw${s}`} cx={mx} cy={my} r={17 * pop} fill="none" stroke={C.white} strokeWidth={3} />);
			if (s === step) {
				children.push(
					<text key="frac" x={mx + 34} y={my + 14} fill={C.white} fontFamily={FAMILY.mono} fontSize={46} opacity={pop}>
						{['', '½', '¼', '⅛', '1/16'][s] ?? ''} left
					</text>,
				);
			}
		}
	}
	if (spec.kind === 'arrive') {
		const until = spec.until ?? 60;
		const u = interpolate(frame, [2, until], [0, 1], {...clampOpts, easing: Easing.inOut(Easing.sin)});
		const dx = bx + (ax - bx) * u;
		const dy = by + (ay - by) * u;
		children.push(
			<line key="rem" x1={dx} y1={dy} x2={ax} y2={ay} stroke={C.white} strokeOpacity={0.6} strokeWidth={5} strokeLinecap="round" strokeDasharray="2 14" />,
		);
		children.push(<line key="done" x1={bx} y1={by} x2={dx} y2={dy} stroke={C.amber} strokeWidth={8} strokeLinecap="round" />);
		children.push(<circle key="d" cx={dx} cy={dy} r={15} fill={C.amber} />);
		const ring = interpolate(frame, [until, until + 18], [0, 1], clampOpts);
		if (frame >= until) {
			children.push(<circle key="ring" cx={ax} cy={ay} r={16 + 70 * ring} fill="none" stroke={C.amber} strokeWidth={5} opacity={1 - ring} />);
		}
	}
	return (
		<svg width={FRAME_W} height={FRAME_H} style={{position: 'absolute', left: 0, top: 0, filter: shadow}}>
			{children}
			<circle cx={ax} cy={ay} r={15 * dotA} fill={C.white} />
			<circle cx={bx} cy={by} r={15 * dotB} fill={spec.kind === 'arrive' ? C.amber : C.white} />
		</svg>
	);
};

type PhotoShotProps = {
	/** public path of the finished photo */
	readonly src: string;
	readonly imgW: number;
	readonly imgH: number;
	/** Ken Burns from -> to, [cx, cy, zoom] */
	readonly fr: View;
	readonly to: View;
	/** brightness of the plate (type-behind-her beats dim the background, never her) */
	readonly dim?: number;
	/** zoom stutter: zoom values held 3 frames each, starting at local frame stutterAt */
	readonly stutter?: readonly number[];
	readonly stutterAt?: number;
	/** hard punch-in cuts to other plates at local frames */
	readonly punch?: readonly Punch[];
	/** local frame of a glitch hit */
	readonly glitchAt?: number;
	/** absolute frame where this clip starts: the hazard glow follows the real relay grid */
	readonly pulseOffset?: number;
	readonly pulseCenter?: Pt;
	readonly diagram?: DiagramSpec;
};

const PhotoShotInner: React.FC<PhotoShotProps> = ({
	src,
	imgW,
	imgH,
	fr,
	to,
	dim = 1,
	stutter,
	stutterAt = 0,
	punch,
	glitchAt,
	pulseOffset,
	pulseCenter = [0.5, 0.48],
	diagram,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();
	let plate: PlateProps = {src, imgW, imgH, view: kenBurns(fr, to, frame / Math.max(1, durationInFrames - 1))};
	if (stutter) {
		const k = Math.floor((frame - stutterAt) / 3);
		if (k >= 0 && k < stutter.length) {
			plate = {...plate, view: [plate.view[0], plate.view[1], stutter[k]]};
		}
	}
	if (punch) {
		for (let i = 0; i < punch.length; i++) {
			if (frame >= punch[i].at) {
				const next = i + 1 < punch.length ? punch[i + 1].at : durationInFrames;
				const u = (frame - punch[i].at) / Math.max(1, next - punch[i].at);
				const v = punch[i].view;
				plate = {src: punch[i].src, imgW: punch[i].imgW, imgH: punch[i].imgH, view: [v[0], v[1], v[2] * (1 + 0.035 * u)]};
			}
		}
	}
	const lamp = pulseOffset === undefined ? null : lampLevel(pulseOffset + frame, fps);
	const filter =
		lamp === null
			? dim === 1
				? undefined
				: `brightness(${dim})`
			: `brightness(${(dim * (0.58 + 0.52 * lamp)).toFixed(3)}) saturate(${(0.9 + 0.3 * lamp).toFixed(3)})`;
	const gk = glitchAt === undefined ? -1 : frame - glitchAt;
	const g = cover(plate.imgW, plate.imgH, plate.view);
	return (
		<>
			<AbsoluteFill style={{backgroundColor: '#000'}} />
			{gk >= 0 && gk < GLITCH_FRAMES ? (
				<Glitched {...plate} k={gk} seed={`${src}-${glitchAt}`} />
			) : (
				<Plate {...plate} style={filter ? {filter} : undefined} />
			)}
			{lamp === null ? null : (
				<AbsoluteFill
					style={{
						mixBlendMode: 'screen',
						opacity: 0.75 * lamp,
						background: `radial-gradient(circle at ${g.left + pulseCenter[0] * g.w}px ${g.top + pulseCenter[1] * g.h}px, rgba(255,70,30,0.85) 0px, rgba(255,40,20,0.35) 260px, rgba(255,30,10,0) 620px)`,
					}}
				/>
			)}
			{diagram ? <Diagram spec={diagram} g={g} frame={frame} /> : null}
		</>
	);
};

export const PhotoShot = Interactive.create({
	Component: PhotoShotInner,
	layout: 'absolute-fill',
	componentName: 'PhotoShot',
	schema: {
		dim: {type: 'number', min: 0.2, max: 1.4, step: 0.01, default: 1, description: 'Plate brightness', hiddenFromList: false},
	},
});

type CutoutProps = {
	/** public path of the plate-aligned cut-out (same size as the photo) */
	readonly src: string;
	readonly imgW: number;
	readonly imgH: number;
	/** must match the photo underneath */
	readonly fr: View;
	readonly to: View;
	readonly glitchAt?: number;
	/**
	 * Motion-plate beats: her rigid move in the depth camera (tools/motion_lab.py), so the cut-out stays on her.
	 * scale = 1 + s1 * e, translate = (x1, y1) * e about the frame centre, e = smoothstep over the clip;
	 * blur: [frame, px] keyframes of the rack focus on her.
	 */
	readonly rig?: {readonly s1: number; readonly x1: number; readonly y1: number; readonly blur?: readonly (readonly number[])[]};
	/** camera-kick frames of the motion plate underneath (the cut-out kicks with it) */
	readonly hits?: readonly number[];
};

const smoothstep = (u: number) => {
	const x = Math.min(1, Math.max(0, u));
	return x * x * (3 - 2 * x);
};

const rigBlur = (keys: readonly (readonly number[])[], frame: number) => {
	if (frame <= keys[0][0]) {
		return keys[0][1];
	}
	for (let i = 1; i < keys.length; i++) {
		if (frame <= keys[i][0]) {
			const [f0, b0] = keys[i - 1];
			const [f1, b1] = keys[i];
			return b0 + ((b1 - b0) * (frame - f0)) / Math.max(1, f1 - f0);
		}
	}
	return keys[keys.length - 1][1];
};

/** Her cut-out on top of the type: the plate's Ken Burns, repeated exactly, so the matte stays locked to her. */
const CutoutLayerInner: React.FC<CutoutProps> = ({src, imgW, imgH, fr, to, glitchAt, rig, hits}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const gk = glitchAt === undefined ? -1 : frame - glitchAt;
	if (gk >= 0 && gk < GLITCH_FRAMES) {
		return null; // the glitch frames show the whole plate scrambled; her layer rejoins after
	}
	if (rig) {
		const e = smoothstep(frame / Math.max(1, durationInFrames - 1));
		const blur = rig.blur ? rigBlur(rig.blur, frame) : 0;
		const k = kickScale(frame, hits ?? [], 0.035);
		return (
			<AbsoluteFill style={{scale: String(k), transformOrigin: `${FRAME_W / 2}px ${FRAME_H / 2}px`}}>
			<AbsoluteFill
				style={{
					transformOrigin: `${FRAME_W / 2}px ${FRAME_H / 2}px`,
					scale: String(1 + rig.s1 * e),
					translate: `${(rig.x1 * e).toFixed(2)}px ${(rig.y1 * e).toFixed(2)}px`,
					filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined,
				}}
			>
				<Plate src={src} imgW={imgW} imgH={imgH} view={fr} />
			</AbsoluteFill>
			</AbsoluteFill>
		);
	}
	const view = kenBurns(fr, to, frame / Math.max(1, durationInFrames - 1));
	return <Plate src={src} imgW={imgW} imgH={imgH} view={view} />;
};

export const CutoutLayer = Interactive.create({
	Component: CutoutLayerInner,
	layout: 'absolute-fill',
	componentName: 'CutoutLayer',
});
