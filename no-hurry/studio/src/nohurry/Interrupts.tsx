import {Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	Interactive,
	interpolate,
	random,
	Sequence,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {Plate} from './PhotoShot';
import {C, FAMILY, FRAME_H, FRAME_W, cover, type View} from './theme';

const clampOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------------------------------------------------------------- evidence board

export type EvidenceCard = {
	readonly src: string;
	readonly imgW: number;
	readonly imgH: number;
	/** crop inside the polaroid, [cx, cy, zoom] */
	readonly view: View;
	/** local frame when it slams onto the board */
	readonly at: number;
	readonly caption: string;
	readonly rot: number;
	/** centre of the card, as a fraction of the frame */
	readonly pos: readonly number[];
};

const CARD_W = 480;
const PHOTO = 430;

const Polaroid: React.FC<{readonly card: EvidenceCard}> = ({card}) => {
	const frame = useCurrentFrame();
	const f = frame - card.at;
	if (f < 0) {
		return null;
	}
	const slam = interpolate(f, [0, 7], [0, 1], {...clampOpts, easing: Easing.out(Easing.cubic)});
	const g = cover(card.imgW, card.imgH, card.view, PHOTO, PHOTO);
	return (
		<div
			style={{
				position: 'absolute',
				left: card.pos[0] * FRAME_W - CARD_W / 2,
				top: card.pos[1] * FRAME_H - (PHOTO + 150) / 2,
				width: CARD_W,
				height: PHOTO + 150,
				backgroundColor: '#F1ECE2',
				boxShadow: `0px ${30 * slam}px ${70 * slam}px rgba(0,0,0,0.55)`,
				rotate: `${card.rot + 9 * (1 - slam)}deg`,
				scale: String(1.45 - 0.45 * slam),
				opacity: interpolate(f, [0, 2], [0, 1], clampOpts),
			}}
		>
			<div style={{position: 'absolute', left: 25, top: 25, width: PHOTO, height: PHOTO, overflow: 'hidden', backgroundColor: '#000'}}>
				<Img
					src={staticFile(card.src)}
					showInTimeline={false}
					style={{position: 'absolute', left: g.left, top: g.top, width: g.w, height: g.h, maxWidth: 'none'}}
				/>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 30,
					right: 24,
					top: PHOTO + 52,
					fontFamily: FAMILY.mono,
					fontWeight: 500,
					fontSize: 28,
					color: '#1C1A18',
					whiteSpace: 'nowrap',
				}}
			>
				{card.caption}
			</div>
		</div>
	);
};

/** Polaroids slam onto a dark board, one per noun. */
const EvidenceBoardInner: React.FC<{readonly bg: string; readonly cards: readonly EvidenceCard[]}> = ({bg, cards}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const drift = interpolate(frame, [0, durationInFrames], [1.04, 1.1]);
	let shake = 0;
	for (const c of cards) {
		const f = frame - c.at - 6;
		if (f >= 0 && f < 6) {
			shake = (6 - f) * 2.2 * (f % 2 === 0 ? 1 : -1);
		}
	}
	return (
		<>
			<AbsoluteFill style={{backgroundColor: '#000'}} />
			<Img
				src={staticFile(bg)}
				showInTimeline={false}
				style={{position: 'absolute', left: 0, top: 0, width: FRAME_W, height: FRAME_H, scale: String(drift)}}
			/>
			<AbsoluteFill style={{translate: `0px ${shake}px`}}>
				{cards.map((c, i) => (
					<Polaroid key={i} card={c} />
				))}
			</AbsoluteFill>
		</>
	);
};

export const EvidenceBoard = Interactive.create({
	Component: EvidenceBoardInner,
	layout: 'absolute-fill',
	componentName: 'EvidenceBoard',
});

// ---------------------------------------------------------------- flicker

export type FlickerItem = {readonly src: string; readonly imgW: number; readonly imgH: number};

/** Rapid stop-motion through many arrivals, with an optional count-up. */
const FlickerShotInner: React.FC<{
	readonly items: readonly FlickerItem[];
	readonly every: number;
	readonly counter?: readonly number[];
}> = ({items, every, counter}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const k = Math.floor(frame / every);
	const it = items[k % items.length];
	const jx = (random(`fx-${k}`) - 0.5) * 0.02;
	const jy = (random(`fy-${k}`) - 0.5) * 0.02;
	const value = counter
		? Math.round(counter[0] + (counter[1] - counter[0]) * Math.pow(Math.min(1, frame / Math.max(1, durationInFrames - 6)), 1.7))
		: 0;
	return (
		<>
			<AbsoluteFill style={{backgroundColor: '#000'}} />
			<Plate src={it.src} imgW={it.imgW} imgH={it.imgH} view={[0.5 + jx, 0.5 + jy, 1.05]} />
			{counter ? (
				<div
					style={{
						position: 'absolute',
						top: 118,
						right: 81,
						fontFamily: FAMILY.mono,
						fontWeight: 500,
						fontSize: 64,
						color: C.amber,
						letterSpacing: '0.04em',
						textShadow: '0px 2px 16px rgba(0,0,0,0.6)',
					}}
				>
					×{String(value).padStart(3, '0')}
				</div>
			) : null}
		</>
	);
};

export const FlickerShot = Interactive.create({
	Component: FlickerShotInner,
	layout: 'absolute-fill',
	componentName: 'FlickerShot',
});

// ---------------------------------------------------------------- collage

export type CollageItem = {readonly src: string; readonly w: number; readonly h: number};

/** Her cut-outs swapping every few frames, paper-sticker style; put the background and behind-type under it. */
const CollageCutoutsInner: React.FC<{readonly items: readonly CollageItem[]; readonly every: number; readonly figure?: number}> = ({
	items,
	every,
	figure = 0.7,
}) => {
	const frame = useCurrentFrame();
	const k = Math.floor(frame / every);
	const it = items[k % items.length];
	let h = FRAME_H * figure;
	let w = (it.w * h) / it.h;
	if (w > FRAME_W * 0.96) {
		w = FRAME_W * 0.96;
		h = (it.h * w) / it.w;
	}
	const rot = (random(`cr-${k}`) - 0.5) * 7;
	const dx = (random(`cx-${k}`) - 0.5) * 70;
	const s = 0.97 + random(`cs-${k}`) * 0.06;
	return (
		<Img
			src={staticFile(it.src)}
			showInTimeline={false}
			style={{
				position: 'absolute',
				left: (FRAME_W - w) / 2 + dx,
				top: FRAME_H - h + 10,
				width: w,
				height: h,
				rotate: `${rot}deg`,
				scale: String(s),
				transformOrigin: '50% 100%',
				filter:
					'drop-shadow(5px 0px 0px #FFFFFF) drop-shadow(-5px 0px 0px #FFFFFF) drop-shadow(0px 5px 0px #FFFFFF) drop-shadow(0px -5px 0px #FFFFFF) drop-shadow(0px 26px 40px rgba(0,0,0,0.35))',
			}}
		/>
	);
};

export const CollageCutouts = Interactive.create({
	Component: CollageCutoutsInner,
	layout: 'absolute-fill',
	componentName: 'CollageCutouts',
});

// ---------------------------------------------------------------- montage

export type MontageItem = {
	readonly src: string;
	readonly kind: 'image' | 'video';
	readonly imgW: number;
	readonly imgH: number;
	/** video only: source frame to start from (at the composition's fps) */
	readonly trimBefore?: number;
	readonly date: string;
	readonly dur: number;
};

const DateStamp: React.FC<{readonly text: string}> = ({text}) => (
	<div
		style={{
			position: 'absolute',
			right: 96,
			bottom: 380,
			fontFamily: FAMILY.mono,
			fontWeight: 500,
			fontSize: 40,
			letterSpacing: '0.06em',
			color: '#FF9A2E',
			textShadow: '0px 0px 10px rgba(255,120,30,0.75), 0px 0px 2px rgba(255,170,80,0.9)',
			whiteSpace: 'pre',
		}}
	>
		{text}
	</div>
);

const MontageFrame: React.FC<{readonly item: MontageItem}> = ({item}) => {
	const frame = useCurrentFrame();
	const z = interpolate(frame, [0, item.dur], [1.07, 1.0], {...clampOpts, easing: Easing.out(Easing.quad)});
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{item.kind === 'image' ? (
				<Plate src={item.src} imgW={item.imgW} imgH={item.imgH} view={[0.5, 0.45, z]} />
			) : (
				<AbsoluteFill style={{scale: String(z)}}>
					<Video
						src={staticFile(item.src)}
						trimBefore={item.trimBefore ?? 0}
						muted
						objectFit="cover"
						showInTimeline={false}
						style={{width: FRAME_W, height: FRAME_H}}
					/>
				</AbsoluteFill>
			)}
			<DateStamp text={item.date} />
		</AbsoluteFill>
	);
};

/** Memories on the beat, each with a camera date stamp. */
const MontageShotInner: React.FC<{readonly items: readonly MontageItem[]}> = ({items}) => {
	let from = 0;
	return (
		<>
			{items.map((it, i) => {
				const el = (
					<Sequence key={i} from={from} durationInFrames={it.dur} name={it.date} showInTimeline={false}>
						<MontageFrame item={it} />
					</Sequence>
				);
				from += it.dur;
				return el;
			})}
		</>
	);
};

export const MontageShot = Interactive.create({
	Component: MontageShotInner,
	layout: 'absolute-fill',
	componentName: 'MontageShot',
});
