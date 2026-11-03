import './nohurry/fonts';
import React from 'react';
import {Composition, Folder} from 'remotion';
import {NoHurrySocial} from './NoHurrySocial';
import {NoHurrySocialMotion} from './NoHurrySocialMotion';
import {TitleCard} from './nohurry/Cards';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="NoHurrySocial"
				component={NoHurrySocial}
				width={1080}
				height={1920}
				fps={30}
				durationInFrames={4314}
			/>
			<Folder name="Side-experiments">
				<Composition
					id="NoHurrySocialMotion"
					component={NoHurrySocialMotion}
					width={1080}
					height={1920}
					fps={30}
					durationInFrames={4314}
				/>
			</Folder>
			<Folder name="Elements">
				<Composition
					id="TitleCard"
					component={TitleCard}
					width={1080}
					height={1920}
					fps={30}
					durationInFrames={36}
					defaultProps={{
						text: 'no hurry.',
						color: '#F4E9D8',
						size: 176,
						style: {backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center'},
					}}
				/>
			</Folder>
		</>
	);
};
