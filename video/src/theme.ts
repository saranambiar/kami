import {loadFont as loadDomine} from '@remotion/google-fonts/Domine';
import {loadFont as loadSourceSans} from '@remotion/google-fonts/SourceSans3';
import {loadFont as loadSpaceMono} from '@remotion/google-fonts/SpaceMono';

const domine = loadDomine('normal', {weights: ['700'], subsets: ['latin']});
const sourceSans = loadSourceSans('normal', {
  weights: ['400', '600', '700'],
  subsets: ['latin'],
});
const spaceMono = loadSpaceMono('normal', {
  weights: ['400', '700'],
  subsets: ['latin'],
});

// Kami Tactile Agency System — mirrors web/app/globals.css
export const T = {
  paper: '#fff9ec',
  ink: '#1d1c14',
  inkSoft: '#4b463f',
  hanko: '#b4472a',
  hankoDeep: '#a43c20',
  moss: '#7a8b7f',
  kraft: '#c9bfa8',
  kraftLight: '#f3ede0',
  outline: '#7c766e',
  serif: domine.fontFamily,
  sans: sourceSans.fontFamily,
  mono: spaceMono.fontFamily,
};

// expo-out — the "Linear" curve
export const EXPO = [0.16, 1, 0.3, 1] as const;
