import React from 'react';
import {
  AbsoluteFill,
  Series,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const FPS = 30;

// Kami Tactile Agency System tokens (web/app/globals.css)
const T = {
  paper: '#fff9ec',
  ink: '#1d1c14',
  inkSoft: '#4b463f',
  hanko: '#b4472a',
  moss: '#7a8b7f',
  kraft: '#c9bfa8',
  kraftLight: '#f3ede0',
  outline: '#7c766e',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Courier New", monospace',
  sans: '-apple-system, "Helvetica Neue", sans-serif',
};

// ---------- shared bits ----------

const useEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 200}});
};

const Headline: React.FC<{text: string}> = ({text}) => {
  const p = useEnter();
  return (
    <div
      style={{
        fontFamily: T.serif,
        fontWeight: 700,
        fontSize: 110,
        letterSpacing: '-0.02em',
        color: T.ink,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
      }}
    >
      {text}
    </div>
  );
};

const Card: React.FC<{
  delay?: number;
  width?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({delay = 0, width, children, style}) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        width,
        background: '#fff',
        border: `2px solid ${T.ink}`,
        boxShadow: `6px 6px 0 ${T.kraft}`,
        padding: '24px 28px',
        fontFamily: T.sans,
        color: T.ink,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Bar: React.FC<{w: number | string; color?: string; h?: number}> = ({
  w,
  color = T.kraftLight,
  h = 14,
}) => (
  <div style={{width: w, height: h, background: color, marginTop: 10}} />
);

// hanko-style ink stamp
const Stamp: React.FC<{text: string; delay?: number}> = ({text, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping: 14, stiffness: 200}});
  return (
    <div
      style={{
        display: 'inline-block',
        border: `4px solid ${T.hanko}`,
        color: T.hanko,
        fontFamily: T.mono,
        fontWeight: 700,
        fontSize: 36,
        letterSpacing: '0.15em',
        padding: '8px 22px',
        transform: `rotate(-6deg) scale(${interpolate(p, [0, 1], [2.2, 1])})`,
        opacity: p,
      }}
    >
      {text}
    </div>
  );
};

const Scene: React.FC<{headline: string; children?: React.ReactNode}> = ({
  headline,
  children,
}) => (
  <AbsoluteFill
    style={{
      background: T.paper,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 60,
      flexDirection: 'column',
    }}
  >
    <Headline text={headline} />
    {children}
  </AbsoluteFill>
);

const Typewriter: React.FC<{text: string; delay?: number; cps?: number; style?: React.CSSProperties}> = ({
  text,
  delay = 0,
  cps = 1.6,
  style,
}) => {
  const frame = useCurrentFrame();
  const chars = Math.max(0, Math.floor((frame - delay) * cps));
  return <span style={style}>{text.slice(0, chars)}</span>;
};

// ---------- beats ----------

const Research: React.FC = () => (
  <Scene headline="It researches your market.">
    <Card width={760}>
      <div style={{fontFamily: T.mono, fontSize: 24, color: T.inkSoft}}>
        <Typewriter text="▸ scanning: b2b saas · outbound tools · usa" delay={8} cps={2} />
      </div>
      <Bar w="90%" />
      <Bar w="70%" />
      <Bar w="80%" color={T.moss} />
    </Card>
  </Scene>
);

const Companies: React.FC = () => (
  <Scene headline="Finds companies.">
    <div style={{display: 'flex', gap: 28}}>
      {['Northwind', 'Acme Corp', 'Vantage AI'].map((name, i) => (
        <Card key={name} width={330} delay={4 + i * 4}>
          <div style={{fontFamily: T.serif, fontWeight: 700, fontSize: 30}}>{name}</div>
          <Bar w="80%" />
          <Bar w="55%" />
        </Card>
      ))}
    </div>
  </Scene>
);

const People: React.FC = () => (
  <Scene headline="Finds decision makers.">
    <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
      {[
        ['Sara Lin', 'VP Marketing'],
        ['James Ford', 'Head of Growth'],
      ].map(([name, role], i) => (
        <Card key={name} width={640} delay={4 + i * 5} style={{display: 'flex', alignItems: 'center', gap: 24}}>
          <div style={{width: 56, height: 56, background: T.kraft, border: `2px solid ${T.ink}`}} />
          <div>
            <div style={{fontWeight: 700, fontSize: 28}}>{name}</div>
            <div style={{fontFamily: T.mono, fontSize: 20, color: T.hanko}}>{role}</div>
          </div>
        </Card>
      ))}
    </div>
  </Scene>
);

const Writes: React.FC = () => (
  <Scene headline="Writes outreach.">
    <Card width={860}>
      <div style={{fontFamily: T.mono, fontSize: 22, color: T.inkSoft, borderBottom: `2px solid ${T.kraftLight}`, paddingBottom: 12}}>
        subject: quick idea for your pipeline
      </div>
      <div style={{fontFamily: T.sans, fontSize: 26, marginTop: 16, minHeight: 80, lineHeight: 1.5}}>
        <Typewriter text="Hi Sara — noticed Northwind is scaling outbound. We help teams like yours..." delay={6} cps={2.4} />
      </div>
    </Card>
  </Scene>
);

const Personalizes: React.FC = () => {
  const p = useEnter(14);
  const swap = (token: string, value: string) => (
    <span style={{position: 'relative', fontFamily: T.mono}}>
      <span style={{opacity: 1 - p, color: T.outline}}>{p < 0.5 ? token : ''}</span>
      <span style={{opacity: p, color: T.hanko, fontWeight: 700}}>{p >= 0.5 ? value : ''}</span>
    </span>
  );
  return (
    <Scene headline="Personalizes every email.">
      <Card width={860}>
        <div style={{fontFamily: T.sans, fontSize: 30, lineHeight: 1.7}}>
          Hi {swap('{{first_name}}', 'Sara')} — loved what{' '}
          {swap('{{company}}', 'Northwind')} shipped last week.
        </div>
      </Card>
    </Scene>
  );
};

const Content: React.FC = () => (
  <Scene headline="Creates your content.">
    <Card width={720}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 48, height: 48, background: T.hanko}} />
        <div style={{fontWeight: 700, fontSize: 26}}>kami · draft</div>
      </div>
      <div style={{fontFamily: T.sans, fontSize: 26, marginTop: 18, minHeight: 70, lineHeight: 1.5}}>
        <Typewriter text="Most founders spend 20 hrs/week on outreach. Here's how we cut it to zero →" delay={6} cps={2.6} />
      </div>
      <Bar w="40%" color={T.moss} />
    </Card>
  </Scene>
);

const Posts: React.FC = () => (
  <Scene headline="Posts it.">
    <div style={{position: 'relative'}}>
      <Card width={680}>
        <div style={{fontWeight: 700, fontSize: 26}}>kami @kami_hq</div>
        <div style={{fontFamily: T.sans, fontSize: 26, marginTop: 12, lineHeight: 1.5}}>
          Most founders spend 20 hrs/week on outreach...
        </div>
      </Card>
      <div style={{position: 'absolute', top: -40, right: -60}}>
        <Stamp text="POSTED" delay={10} />
      </div>
    </div>
  </Scene>
);

const Sends: React.FC = () => (
  <Scene headline="Sends it.">
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {['Sara Lin', 'James Ford', 'Priya Nair'].map((name, i) => (
        <Card key={name} width={620} delay={4 + i * 4} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{fontSize: 26, fontWeight: 700}}>{name}</span>
          <span style={{fontFamily: T.mono, fontSize: 22, color: T.moss, fontWeight: 700}}>✓ sent</span>
        </Card>
      ))}
    </div>
  </Scene>
);

// ---------- assembly ----------

const BEATS: {C: React.FC; frames: number}[] = [
  {C: Research, frames: 55},
  {C: Companies, frames: 40},
  {C: People, frames: 40},
  {C: Writes, frames: 55},
  {C: Personalizes, frames: 45},
  {C: Content, frames: 50},
  {C: Posts, frames: 40},
  {C: Sends, frames: 50},
];

export const TOTAL_DURATION = BEATS.reduce((sum, b) => sum + b.frames, 0);

export const Montage: React.FC = () => (
  <Series>
    {BEATS.map(({C, frames}, i) => (
      <Series.Sequence key={i} durationInFrames={frames}>
        <C />
      </Series.Sequence>
    ))}
  </Series>
);
