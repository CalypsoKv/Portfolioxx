import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Local font files (OFL): Plus Jakarta Sans, Cormorant Garamond, JetBrains Mono.
// loadFont() blocks rendering until each face is ready.
export const fontsReady = Promise.all([
	loadFont({family: 'Plus Jakarta Sans', url: staticFile('fonts/PlusJakartaSans-500.ttf'), weight: '500'}),
	loadFont({family: 'Plus Jakarta Sans', url: staticFile('fonts/PlusJakartaSans-700.ttf'), weight: '700'}),
	loadFont({family: 'Plus Jakarta Sans', url: staticFile('fonts/PlusJakartaSans-800.ttf'), weight: '800'}),
	loadFont({
		family: 'Cormorant Garamond',
		url: staticFile('fonts/CormorantGaramond-600Italic.ttf'),
		weight: '600',
		style: 'italic',
	}),
	loadFont({
		family: 'Cormorant Garamond',
		url: staticFile('fonts/CormorantGaramond-700Italic.ttf'),
		weight: '700',
		style: 'italic',
	}),
	loadFont({family: 'JetBrains Mono', url: staticFile('fonts/JetBrainsMono-Medium.ttf'), weight: '500'}),
]);
