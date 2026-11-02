import React from 'react';
import {Easing, Interactive, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FAMILY, type FontKind} from './theme';

export type KWord = {
	readonly text: string;
	/** local frame at which the word is spoken (it appears then) */
	readonly at: number;
};

export type KRow = {
	readonly words: readonly KWord[];
	/** font size in px */
	readonly size: number;
	/** row height in px */
	readonly lh: number;
	readonly font: FontKind;
	readonly weight: number;
	readonly color: string;
	/** key word row: slams in instead of rising */
	readonly key?: boolean;
	/** letter spacing in em */
	readonly track?: number;
	/** highlight box behind each word (colour) */
	readonly box?: string;
};

type KineticPhraseProps = {
	readonly rows: readonly KRow[];
	/** top-left corner of the text block, px */
	readonly x: number;
	readonly y: number;
	readonly blockWidth: number;
	readonly align: 'left' | 'center' | 'right';
	/** strike a word through: row/word index and local frame */
	readonly strike?: {readonly row: number; readonly word: number; readonly at: number; readonly color: string};
	/** local frame of a glitch hit on the key words */
	readonly glitchAt?: number;
	/** 0..1, soft shadow for legibility over photographs */
	readonly shadow?: number;
};

const clampOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Word: React.FC<{
	readonly w: KWord;
	readonly row: KRow;
	readonly align: 'left' | 'center' | 'right';
	readonly strike: {readonly at: number; readonly color: string} | null;
	readonly glitch: number;
	readonly shadow: number;
	readonly seed: string;
}> = ({w, row, align, strike, glitch, shadow, seed}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const f = frame - w.at;
	let opacity: number;
	let translate = '0px 0px';
	let scale = 1;
	if (row.key) {
		const s = spring({frame: f, fps, config: {damping: 13, stiffness: 260, mass: 0.55}});
		opacity = interpolate(f, [0, 2], [0, 1], clampOpts);
		scale = 1.28 - 0.28 * s;
	} else {
		opacity = interpolate(f, [0, 3], [0, 1], clampOpts);
		const dy = interpolate(f, [0, 5], [row.size * 0.32, 0], {...clampOpts, easing: Easing.out(Easing.cubic)});
		translate = `0px ${dy.toFixed(2)}px`;
	}
	const shadows: string[] = [];
	if (shadow > 0) {
		shadows.push(`0px ${Math.round(row.size * 0.04)}px ${Math.round(row.size * 0.22)}px rgba(0,0,0,${(0.42 * shadow).toFixed(2)})`);
		shadows.push(`0px 1px 3px rgba(0,0,0,${(0.35 * shadow).toFixed(2)})`);
	}
	if (glitch > 0 && row.key) {
		const dx = Math.round(row.size * 0.05 * glitch);
		shadows.unshift(`${dx}px 0px 0px rgba(255,20,70,0.9)`, `${-dx}px 0px 0px rgba(0,230,255,0.9)`);
		translate = `${((random(`${seed}-${frame}`) - 0.5) * row.size * 0.12 * glitch).toFixed(1)}px 0px`;
	}
	const strikeP = strike ? interpolate(frame - strike.at, [0, 7], [0, 1], {...clampOpts, easing: Easing.out(Easing.cubic)}) : 0;
	return (
		<span
			style={{
				display: 'inline-block',
				position: 'relative',
				opacity,
				translate,
				scale: String(scale),
				transformOrigin: align === 'left' ? '0% 80%' : align === 'right' ? '100% 80%' : '50% 80%',
				textShadow: row.box ? undefined : shadows.length ? shadows.join(', ') : undefined,
				...(row.box
					? {
							backgroundColor: row.box,
							padding: '0.02em 0.15em 0.06em',
							lineHeight: 1.08,
							borderRadius: '0.06em',
							boxShadow: '0px 10px 30px rgba(0,0,0,0.3)',
						}
					: {}),
			}}
		>
			{w.text}
			{strike && strikeP > 0 ? (
				<span
					style={{
						position: 'absolute',
						left: '-3%',
						width: '106%',
						top: '54%',
						height: Math.max(6, Math.round(row.size * 0.085)),
						backgroundColor: strike.color,
						transformOrigin: '0% 50%',
						scale: `${strikeP} 1`,
						boxShadow: '0px 2px 10px rgba(0,0,0,0.35)',
					}}
				/>
			) : null}
		</span>
	);
};

const GLITCH = [1, 0.5, 0.9, 0.3, 0.7, 0.2, 0.5, 0.1, 0];

const KineticPhraseInner: React.FC<KineticPhraseProps> = ({rows, x, y, blockWidth, align, strike, glitchAt, shadow = 1}) => {
	const frame = useCurrentFrame();
	const gk = glitchAt === undefined ? -1 : frame - glitchAt;
	const glitch = gk >= 0 && gk < GLITCH.length ? GLITCH[gk] : 0;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: blockWidth}}>
			{rows.map((row, ri) => (
				<div
					key={ri}
					style={{
						height: row.lh,
						lineHeight: `${row.lh}px`,
						fontSize: row.size,
						fontFamily: FAMILY[row.font],
						fontWeight: row.weight,
						fontStyle: row.font === 'serif' ? 'italic' : 'normal',
						letterSpacing: `${row.track ?? 0}em`,
						color: row.color,
						textAlign: align,
						whiteSpace: 'nowrap',
					}}
				>
					{row.words.map((w, wi) => (
						<React.Fragment key={wi}>
							{wi > 0 ? ' ' : null}
							<Word
								w={w}
								row={row}
								align={align}
								strike={strike && strike.row === ri && strike.word === wi ? strike : null}
								glitch={glitch}
								shadow={shadow}
								seed={`${ri}-${wi}`}
							/>
						</React.Fragment>
					))}
				</div>
			))}
		</div>
	);
};

export const KineticPhrase = Interactive.create({
	Component: KineticPhraseInner,
	layout: 'absolute-fill',
	componentName: 'KineticPhrase',
	schema: {
		shadow: {type: 'number', min: 0, max: 1, step: 0.05, default: 1, description: 'Shadow', hiddenFromList: false},
	},
});
