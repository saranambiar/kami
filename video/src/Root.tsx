import {Composition} from 'remotion';
import {Montage, TOTAL_DURATION, FPS} from './Montage';

export const Root: React.FC = () => {
  return (
    <Composition
      id="Montage"
      component={Montage}
      durationInFrames={TOTAL_DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
