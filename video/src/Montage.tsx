import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {zoomThrough} from './zoomThrough';
import {T} from './theme';
import {
  Companies,
  Content,
  Intro,
  Outro,
  People,
  Personalizes,
  Posts,
  Research,
  Sends,
  Writes,
} from './scenes';

export const FPS = 30;

const TRANS = 14; // overlap per zoom-through cut

const SCENES: {C: React.FC; frames: number}[] = [
  {C: Intro, frames: 95},
  {C: Research, frames: 70},
  {C: Companies, frames: 62},
  {C: People, frames: 62},
  {C: Writes, frames: 72},
  {C: Personalizes, frames: 68},
  {C: Content, frames: 66},
  {C: Posts, frames: 74},
  {C: Sends, frames: 78},
  {C: Outro, frames: 110},
];

export const TOTAL_DURATION =
  SCENES.reduce((sum, s) => sum + s.frames, 0) - TRANS * (SCENES.length - 1);

// global start frame of each scene (accounting for overlaps)
const STARTS = SCENES.reduce<number[]>((acc, _, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].frames - TRANS);
  return acc;
}, []);

// one rail for the whole film — never resets, so it reads as one journey
const Rail: React.FC = () => {
  const frame = useCurrentFrame();
  // step = index of current beat (scenes 1..8); -1 during intro, 9 at outro
  const sceneIdx = STARTS.filter((s) => frame >= s).length - 1;
  const step = sceneIdx; // 0=intro
  const visible = interpolate(
    frame,
    [STARTS[1] - 6, STARTS[1] + 10, STARTS[9] - 12, STARTS[9]],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 54,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 12,
        alignItems: 'center',
        opacity: visible,
      }}
    >
      {Array.from({length: 8}).map((_, i) => (
        <div
          key={i}
          style={{
            width: i + 1 === step ? 36 : 12,
            height: 5,
            background: i + 1 <= step ? T.hanko : T.kraft,
          }}
        />
      ))}
    </div>
  );
};

export const Montage: React.FC = () => (
  <AbsoluteFill style={{background: T.paper}}>
    <TransitionSeries>
      {SCENES.map(({C, frames}, i) => (
        <React.Fragment key={i}>
          {i > 0 ? (
            <TransitionSeries.Transition
              presentation={zoomThrough()}
              timing={linearTiming({durationInFrames: TRANS})}
            />
          ) : null}
          <TransitionSeries.Sequence durationInFrames={frames}>
            <C />
          </TransitionSeries.Sequence>
        </React.Fragment>
      ))}
    </TransitionSeries>
    <Rail />
  </AbsoluteFill>
);
