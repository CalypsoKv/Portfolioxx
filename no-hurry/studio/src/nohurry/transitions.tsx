import type {TransitionPresentation, TransitionPresentationComponentProps} from '@remotion/transitions';
import React, {useId} from 'react';
import {AbsoluteFill, Easing} from 'remotion';

// CSS-only transitions (no WebGL), so they render on a CPU-only machine.
// Each one hard-switches at the midpoint, hidden by motion: a cut, not a cross-fade.

type WhipProps = {readonly direction: 'left' | 'right'; readonly blur?: number};

const WhipPresentation: React.FC<TransitionPresentationComponentProps<WhipProps>> = ({
	children,
	presentationDirection,
	presentationProgress,
	passedProps,
}) => {
	const id = `whip${useId().replace(/[^a-z0-9]/gi, '')}`;
	const dir = passedProps.direction === 'right' ? 1 : -1;
	const maxBlur = passedProps.blur ?? 90;
	const p = presentationProgress;
	const exiting = presentationDirection === 'exiting';
	const u = exiting ? Math.min(1, p / 0.5) : Math.min(1, (1 - p) / 0.5);
	const visible = exiting ? p < 0.5 : p >= 0.5;
	const shift = 1080 * 0.42 * Easing.in(Easing.quad)(u) * (exiting ? dir : -dir);
	const blur = maxBlur * u;
	return (
		<AbsoluteFill style={{opacity: visible ? 1 : 0, overflow: 'hidden'}}>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<defs>
					<filter id={id} x="-20%" y="0%" width="140%" height="100%">
						<feGaussianBlur stdDeviation={`${blur.toFixed(1)} 0`} edgeMode="duplicate" />
					</filter>
				</defs>
			</svg>
			<AbsoluteFill style={{translate: `${shift.toFixed(1)}px 0px`, scale: String(1 + 0.08 * u), filter: blur > 0.5 ? `url(#${id})` : undefined}}>
				{children}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const whip = (props: WhipProps): TransitionPresentation<WhipProps> => ({component: WhipPresentation, props});

type ZoomProps = {readonly strength?: number};

const ZoomPunchPresentation: React.FC<TransitionPresentationComponentProps<ZoomProps>> = ({
	children,
	presentationDirection,
	presentationProgress,
	passedProps,
}) => {
	const k = passedProps.strength ?? 1;
	const p = presentationProgress;
	const exiting = presentationDirection === 'exiting';
	const u = exiting ? Math.min(1, p / 0.5) : Math.min(1, (1 - p) / 0.5);
	const visible = exiting ? p < 0.5 : p >= 0.5;
	const e = Easing.in(Easing.cubic)(u);
	const scale = exiting ? 1 + 0.75 * k * e : 1 + 0.45 * k * e;
	return (
		<AbsoluteFill style={{opacity: visible ? 1 : 0, overflow: 'hidden'}}>
			<AbsoluteFill style={{scale: String(scale), filter: e > 0.02 ? `blur(${(22 * e).toFixed(1)}px)` : undefined}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const zoomPunch = (props: ZoomProps = {}): TransitionPresentation<ZoomProps> => ({component: ZoomPunchPresentation, props});

type DipProps = {readonly color?: string};

const DipPresentation: React.FC<TransitionPresentationComponentProps<DipProps>> = ({
	children,
	presentationDirection,
	presentationProgress,
	passedProps,
}) => {
	const p = presentationProgress;
	const exiting = presentationDirection === 'exiting';
	const o = exiting ? 1 - Math.min(1, p / 0.5) : Math.max(0, (p - 0.5) / 0.5);
	// the entering scene sits on top: it must stay transparent until the exiting one has gone to black
	const bg = exiting || p >= 0.5 ? (passedProps.color ?? '#000') : 'transparent';
	return (
		<AbsoluteFill style={{backgroundColor: bg}}>
			<AbsoluteFill style={{opacity: Easing.inOut(Easing.quad)(o)}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const dip = (props: DipProps = {}): TransitionPresentation<DipProps> => ({component: DipPresentation, props});
