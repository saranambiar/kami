import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {EXPO, T} from './theme';

// ---------------------------------------------------------------- easing

export const useExpo = (delay = 0, dur = 20) => {
  const frame = useCurrentFrame();
  return interpolate(frame - delay, [0, dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...EXPO),
  });
};

export const useSpring = (delay = 0, damping = 18) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, stiffness: 160}});
};

// ---------------------------------------------------------------- backdrop

// paper + faint grain + vignette, shared by every scene
export const Paper: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: T.paper}}>
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(${T.kraft} 1.2px, transparent 1.2px)`,
        backgroundSize: '44px 44px',
        opacity: 0.25,
      }}
    />
    {children}
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse at center, transparent 55%, rgba(29,28,20,0.10) 100%)',
        pointerEvents: 'none',
      }}
    />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- typography

// per-word rise-and-reveal, masked — the kinetic headline
export const WordReveal: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  stagger?: number;
  color?: string;
  accentWords?: number[]; // indices rendered in hanko red
}> = ({text, delay = 0, size = 108, stagger = 3, color = T.ink, accentWords = []}) => {
  const words = text.split(' ');
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', columnGap: size * 0.26}}>
      {words.map((word, i) => (
        <span key={i} style={{overflow: 'hidden', display: 'inline-block', paddingBottom: '0.1em'}}>
          <Word
            word={word}
            delay={delay + i * stagger}
            size={size}
            color={accentWords.includes(i) ? T.hanko : color}
          />
        </span>
      ))}
    </div>
  );
};

const Word: React.FC<{word: string; delay: number; size: number; color: string}> = ({
  word,
  delay,
  size,
  color,
}) => {
  const p = useExpo(delay, 22);
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: T.serif,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: '-0.02em',
        color,
        transform: `translateY(${interpolate(p, [0, 1], [110, 0])}%)`,
      }}
    >
      {word}
    </span>
  );
};

// mono kicker label, e.g. "01 — RESEARCH"
export const Kicker: React.FC<{text: string; delay?: number}> = ({text, delay = 0}) => {
  const p = useExpo(delay, 16);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [-24, 0])}px)`,
      }}
    >
      <div style={{width: 34, height: 4, background: T.hanko}} />
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: '0.22em',
          color: T.hanko,
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const Typewriter: React.FC<{
  text: string;
  delay?: number;
  cps?: number;
  style?: React.CSSProperties;
  cursor?: boolean;
}> = ({text, delay = 0, cps = 2, style, cursor = true}) => {
  const frame = useCurrentFrame();
  const chars = Math.max(0, Math.floor((frame - delay) * cps));
  const done = chars >= text.length;
  const blink = Math.floor(frame / 12) % 2 === 0;
  return (
    <span style={style}>
      {text.slice(0, chars)}
      {cursor && !done && frame >= delay ? (
        <span style={{opacity: blink ? 1 : 0, color: T.hanko}}>▍</span>
      ) : null}
    </span>
  );
};

// ---------------------------------------------------------------- surfaces

export const Card: React.FC<{
  delay?: number;
  width?: number | string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  lift?: number; // shadow depth
}> = ({delay = 0, width, children, style, lift = 8}) => {
  const p = useExpo(delay, 24);
  return (
    <div
      style={{
        width,
        background: '#fffdf6',
        border: `2px solid ${T.ink}`,
        boxShadow: `${lift * p}px ${lift * p}px 0 ${T.kraft}`,
        padding: '26px 30px',
        fontFamily: T.sans,
        color: T.ink,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [46, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Bar: React.FC<{
  w: number | string;
  color?: string;
  h?: number;
  delay?: number;
}> = ({w, color = T.kraftLight, h = 13, delay = 0}) => {
  const p = useExpo(delay, 18);
  return (
    <div style={{width: w, height: h, marginTop: 11, overflow: 'hidden'}}>
      <div style={{width: `${p * 100}%`, height: '100%', background: color}} />
    </div>
  );
};

// browser-chrome frame around mock UI
export const Window: React.FC<{
  delay?: number;
  width?: number;
  title?: string;
  children: React.ReactNode;
}> = ({delay = 0, width = 780, title = 'kami', children}) => {
  const p = useExpo(delay, 26);
  return (
    <div
      style={{
        width,
        border: `2.5px solid ${T.ink}`,
        background: '#fffdf6',
        boxShadow: `${12 * p}px ${12 * p}px 0 ${T.kraft}`,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [60, 0])}px) scale(${interpolate(
          p,
          [0, 1],
          [0.96, 1],
        )})`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 18px',
          borderBottom: `2.5px solid ${T.ink}`,
          background: T.kraftLight,
        }}
      >
        {[T.hanko, T.kraft, T.moss].map((c, i) => (
          <div key={i} style={{width: 13, height: 13, background: c, border: `1.5px solid ${T.ink}`}} />
        ))}
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 17,
            color: T.inkSoft,
            marginLeft: 12,
            letterSpacing: '0.06em',
          }}
        >
          {title}
        </span>
      </div>
      <div style={{padding: '26px 30px'}}>{children}</div>
    </div>
  );
};

// ---------------------------------------------------------------- flourishes

// hand-drawn checkmark, stroke animates on
export const CheckDraw: React.FC<{delay?: number; size?: number; color?: string}> = ({
  delay = 0,
  size = 34,
  color = T.moss,
}) => {
  const p = useExpo(delay, 14);
  const LEN = 40;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <path
        d="M6 17 L13 24 L26 8"
        fill="none"
        stroke={color}
        strokeWidth={4.5}
        strokeLinecap="square"
        strokeDasharray={LEN}
        strokeDashoffset={LEN * (1 - p)}
      />
    </svg>
  );
};

// hanko ink stamp — slams in with overshoot
export const Stamp: React.FC<{text: string; delay?: number; rotate?: number}> = ({
  text,
  delay = 0,
  rotate = -7,
}) => {
  const p = useSpring(delay, 11);
  return (
    <div
      style={{
        display: 'inline-block',
        border: `5px solid ${T.hanko}`,
        color: T.hanko,
        fontFamily: T.mono,
        fontWeight: 700,
        fontSize: 40,
        letterSpacing: '0.18em',
        padding: '10px 26px',
        background: 'rgba(255,249,236,0.85)',
        transform: `rotate(${rotate}deg) scale(${interpolate(p, [0, 1], [2.4, 1])})`,
        opacity: Math.min(1, p * 1.6),
        boxShadow: `0 0 0 2px ${T.paper}`,
      }}
    >
      {text}
    </div>
  );
};

// animated cursor that travels to a point, then click-pulses
export const Cursor: React.FC<{
  from: [number, number];
  to: [number, number];
  moveStart: number;
  moveDur?: number;
  clickAt: number;
}> = ({from, to, moveStart, moveDur = 18, clickAt}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - moveStart, [0, moveDur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...EXPO),
  });
  const x = interpolate(t, [0, 1], [from[0], to[0]]);
  const y = interpolate(t, [0, 1], [from[1], to[1]]);
  const click = interpolate(frame - clickAt, [0, 4, 9], [1, 0.82, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ripple = interpolate(frame - clickAt, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div style={{position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 10}}>
      {frame >= clickAt ? (
        <div
          style={{
            position: 'absolute',
            left: -28 * ripple + 8,
            top: -28 * ripple + 8,
            width: 56 * ripple,
            height: 56 * ripple,
            border: `3px solid ${T.hanko}`,
            borderRadius: '50%',
            opacity: 1 - ripple,
          }}
        />
      ) : null}
      <svg width={38} height={38} viewBox="0 0 24 24" style={{transform: `scale(${click})`}}>
        <path
          d="M5 3 L19 12.5 L12.5 13.8 L9.5 20 Z"
          fill={T.ink}
          stroke={T.paper}
          strokeWidth={1.4}
        />
      </svg>
    </div>
  );
};

// pill button the cursor presses
export const Button: React.FC<{
  label: string;
  pressAt?: number;
  delay?: number;
}> = ({label, pressAt, delay = 0}) => {
  const frame = useCurrentFrame();
  const p = useExpo(delay, 18);
  const pressed =
    pressAt !== undefined
      ? interpolate(frame - pressAt, [0, 4, 9], [0, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 0;
  return (
    <div
      style={{
        display: 'inline-block',
        fontFamily: T.mono,
        fontWeight: 700,
        fontSize: 22,
        letterSpacing: '0.1em',
        color: T.paper,
        background: T.hanko,
        border: `2.5px solid ${T.ink}`,
        padding: '12px 30px',
        boxShadow: `${interpolate(pressed, [0, 1], [5, 0])}px ${interpolate(
          pressed,
          [0, 1],
          [5, 0],
        )}px 0 ${T.ink}`,
        transform: `translate(${pressed * 5}px, ${pressed * 5}px)`,
        opacity: p,
      }}
    >
      {label}
    </div>
  );
};

// count-up number
export const Counter: React.FC<{
  to: number;
  delay?: number;
  dur?: number;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({to, delay = 0, dur = 24, suffix = '', style}) => {
  const p = useExpo(delay, dur);
  return (
    <span style={{fontFamily: T.mono, fontWeight: 700, ...style}}>
      {Math.round(p * to)}
      {suffix}
    </span>
  );
};
