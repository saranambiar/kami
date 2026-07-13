import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions';

// camera pushes through the exiting scene; the next scene settles in from
// slightly behind. Continuous forward momentum instead of a slide wipe.
const ZoomThrough: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const exiting = presentationDirection === 'exiting';

  const scale = exiting
    ? interpolate(presentationProgress, [0, 1], [1, 1.45])
    : interpolate(presentationProgress, [0, 1], [0.92, 1]);
  const opacity = exiting
    ? interpolate(presentationProgress, [0, 0.7, 1], [1, 0.25, 0])
    : interpolate(presentationProgress, [0, 0.5, 1], [0, 0.9, 1]);
  const blur = exiting ? presentationProgress * 14 : (1 - presentationProgress) * 6;

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const zoomThrough = (): TransitionPresentation<Record<string, never>> => ({
  component: ZoomThrough,
  props: {},
});
