import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {T} from './theme';
import {
  Bar,
  Button,
  Card,
  CheckDraw,
  Counter,
  Cursor,
  Kicker,
  Paper,
  Stamp,
  Typewriter,
  Window,
  WordReveal,
  useExpo,
  useSpring,
} from './ui';

// ---------------------------------------------------------------- camera

// slow dolly-in for the lifetime of a scene — nothing ever sits still
const Drift: React.FC<{children: React.ReactNode; from?: number; to?: number}> = ({
  children,
  from = 1,
  to = 1.055,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 90], [from, to], {
    extrapolateRight: 'extend',
  });
  return (
    <AbsoluteFill style={{transform: `scale(${scale})`, transformOrigin: '50% 46%'}}>
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- layout

// centered column: kicker → headline → demo. Same axis every beat, so cuts
// feel like moving deeper down one pipeline, not jumping between slides.
const Beat: React.FC<{
  index: number;
  label: string;
  headline: string;
  accentWords?: number[];
  size?: number;
  children?: React.ReactNode;
}> = ({index, label, headline, accentWords, size = 84, children}) => (
  <Paper>
    <Drift>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 46,
          paddingBottom: 30,
        }}
      >
        <Kicker text={`0${index} — ${label}`} />
        <div style={{display: 'flex', justifyContent: 'center', maxWidth: 1500}}>
          <WordReveal text={headline} size={size} delay={3} accentWords={accentWords} />
        </div>
        {children}
      </AbsoluteFill>
    </Drift>
  </Paper>
);

// ---------------------------------------------------------------- intro

export const Intro: React.FC = () => {
  const logoP = useSpring(2, 14);
  return (
    <Paper>
      <Drift from={1.02} to={1.09}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 44,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              opacity: Math.min(1, logoP * 1.4),
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                background: T.hanko,
                border: `2.5px solid ${T.ink}`,
                transform: `rotate(${interpolate(logoP, [0, 1], [-90, -6])}deg)`,
              }}
            />
            <span
              style={{
                fontFamily: T.mono,
                fontWeight: 700,
                fontSize: 34,
                letterSpacing: '0.3em',
                color: T.ink,
              }}
            >
              KAMI
            </span>
          </div>
          <div style={{textAlign: 'center', maxWidth: 1500}}>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <WordReveal text="Your marketing team," delay={10} size={124} stagger={4} />
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <WordReveal text="running itself." delay={26} size={124} stagger={4} accentWords={[1]} />
            </div>
          </div>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 25,
              letterSpacing: '0.14em',
              color: T.inkSoft,
              opacity: useExpo(48, 20),
            }}
          >
            WATCH WHAT IT DOES
          </div>
        </AbsoluteFill>
      </Drift>
    </Paper>
  );
};

// ---------------------------------------------------------------- beats

export const Research: React.FC = () => (
  <Beat index={1} label="RESEARCH" headline="It researches your market." accentWords={[2]}>
    <Window title="kami — intel" width={860}>
      <div style={{fontFamily: T.mono, fontSize: 22, color: T.inkSoft, lineHeight: 1.9}}>
        <Typewriter text="▸ scanning b2b saas · outbound · usa" delay={10} cps={2.4} />
      </div>
      <Bar w="92%" delay={18} />
      <Bar w="68%" delay={22} />
      <Bar w="81%" delay={26} color={T.moss} />
      <div style={{display: 'flex', gap: 40, marginTop: 24, fontFamily: T.mono}}>
        <div>
          <Counter to={1284} delay={22} style={{fontSize: 46, color: T.hanko}} />
          <div style={{fontSize: 17, color: T.inkSoft, letterSpacing: '0.1em'}}>SIGNALS</div>
        </div>
        <div>
          <Counter to={37} delay={26} style={{fontSize: 46, color: T.ink}} />
          <div style={{fontSize: 17, color: T.inkSoft, letterSpacing: '0.1em'}}>SEGMENTS</div>
        </div>
      </div>
    </Window>
  </Beat>
);

export const Companies: React.FC = () => (
  <Beat index={2} label="TARGETS" headline="Finds companies." accentWords={[1]}>
    <div style={{display: 'flex', gap: 24}}>
      {[
        ['Northwind', 'Series B · 140 ppl', 94],
        ['Acme Corp', 'Growth · 55 ppl', 88],
        ['Vantage AI', 'Seed · 12 ppl', 82],
      ].map(([name, meta, fit], i) => (
        <Card key={name as string} delay={8 + i * 5} width={330}>
          <div style={{fontFamily: T.serif, fontWeight: 700, fontSize: 30}}>{name}</div>
          <div style={{fontFamily: T.mono, fontSize: 16, color: T.inkSoft, marginTop: 6}}>{meta}</div>
          <div style={{marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 10}}>
            <Counter to={fit as number} delay={16 + i * 5} suffix="%" style={{fontSize: 38, color: T.moss}} />
            <span style={{fontFamily: T.mono, fontSize: 15, color: T.inkSoft, letterSpacing: '0.12em'}}>
              FIT
            </span>
          </div>
        </Card>
      ))}
    </div>
  </Beat>
);

export const People: React.FC = () => (
  <Beat index={3} label="PEOPLE" headline="Finds decision makers." accentWords={[1, 2]}>
    <div style={{display: 'flex', flexDirection: 'column', gap: 18, width: 700}}>
      {[
        ['SL', 'Sara Lin', 'VP Marketing · Northwind'],
        ['JF', 'James Ford', 'Head of Growth · Acme'],
      ].map(([initials, name, role], i) => (
        <Card key={name} delay={8 + i * 7} style={{display: 'flex', alignItems: 'center', gap: 26}}>
          <div
            style={{
              width: 62,
              height: 62,
              background: T.kraftLight,
              border: `2.5px solid ${T.ink}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: T.serif,
              fontWeight: 700,
              fontSize: 25,
            }}
          >
            {initials}
          </div>
          <div style={{flex: 1}}>
            <div style={{fontWeight: 700, fontSize: 28}}>{name}</div>
            <div style={{fontFamily: T.mono, fontSize: 18, color: T.hanko, marginTop: 3}}>{role}</div>
          </div>
          <CheckDraw delay={20 + i * 7} />
        </Card>
      ))}
    </div>
  </Beat>
);

export const Writes: React.FC = () => (
  <Beat index={4} label="OUTREACH" headline="Writes outreach." accentWords={[1]}>
    <Window title="kami — compose" width={880}>
      <div
        style={{
          fontFamily: T.mono,
          fontSize: 20,
          color: T.inkSoft,
          borderBottom: `2px solid ${T.kraftLight}`,
          paddingBottom: 14,
        }}
      >
        to: sara@northwind.com · subject: quick idea
      </div>
      <div style={{fontFamily: T.sans, fontSize: 27, marginTop: 18, minHeight: 128, lineHeight: 1.6}}>
        <Typewriter
          text="Hi Sara — noticed Northwind is scaling outbound this quarter. We help growth teams cut manual prospecting to zero..."
          delay={8}
          cps={3.6}
        />
      </div>
    </Window>
  </Beat>
);

export const Personalizes: React.FC = () => {
  const p = useSpring(20, 13);
  const Token: React.FC<{token: string; value: string}> = ({token, value}) => (
    <span
      style={{
        display: 'inline-block',
        fontFamily: T.mono,
        fontSize: 27,
        padding: '2px 12px',
        border: `2px dashed ${p < 0.5 ? T.outline : T.hanko}`,
        background: p < 0.5 ? T.kraftLight : 'rgba(180,71,42,0.09)',
        color: p < 0.5 ? T.outline : T.hanko,
        fontWeight: 700,
        transform: `scale(${1 + Math.sin(Math.min(p, 1) * Math.PI) * 0.12})`,
      }}
    >
      {p < 0.5 ? token : value}
    </span>
  );
  return (
    <Beat index={5} label="PERSONALIZE" headline="Personalizes every email." accentWords={[1]}>
      <Window title="kami — merge" width={880}>
        <div style={{fontFamily: T.sans, fontSize: 30, lineHeight: 2}}>
          Hi <Token token="{{first_name}}" value="Sara" /> — loved what{' '}
          <Token token="{{company}}" value="Northwind" /> shipped last week. Congrats on the{' '}
          <Token token="{{signal}}" value="Series B" />.
        </div>
      </Window>
    </Beat>
  );
};

export const Content: React.FC = () => (
  <Beat index={6} label="CONTENT" headline="Creates your content." accentWords={[1]}>
    <Window title="kami — studio" width={820}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 44, height: 44, background: T.hanko, border: `2px solid ${T.ink}`}} />
        <div>
          <div style={{fontWeight: 700, fontSize: 23}}>kami</div>
          <div style={{fontFamily: T.mono, fontSize: 16, color: T.inkSoft}}>draft · thread 1/4</div>
        </div>
      </div>
      <div style={{fontFamily: T.sans, fontSize: 27, marginTop: 18, minHeight: 96, lineHeight: 1.6}}>
        <Typewriter
          text="Most founders spend 20 hrs/week on outreach. Here's how we cut it to zero →"
          delay={8}
          cps={3.2}
        />
      </div>
      <Bar w="42%" delay={32} color={T.moss} />
    </Window>
  </Beat>
);

export const Posts: React.FC = () => (
  <Beat index={7} label="PUBLISH" headline="Posts it." accentWords={[0]}>
    <div style={{position: 'relative', width: 780}}>
      <Window title="x.com — kami" width={780}>
        <div style={{fontWeight: 700, fontSize: 24}}>
          kami{' '}
          <span style={{color: T.inkSoft, fontWeight: 400, fontFamily: T.mono, fontSize: 19}}>
            @kami_hq
          </span>
        </div>
        <div style={{fontFamily: T.sans, fontSize: 25, marginTop: 12, lineHeight: 1.55}}>
          Most founders spend 20 hrs/week on outreach. Here's how we cut it to zero →
        </div>
        <div style={{marginTop: 20, display: 'flex', justifyContent: 'flex-end'}}>
          <Button label="POST" pressAt={26} delay={6} />
        </div>
      </Window>
      <Cursor from={[60, 380]} to={[680, 300]} moveStart={8} clickAt={26} />
      <div style={{position: 'absolute', top: -50, right: -46}}>
        <Stamp text="POSTED" delay={32} />
      </div>
    </div>
  </Beat>
);

export const Sends: React.FC = () => (
  <Beat index={8} label="DELIVER" headline="Sends it." accentWords={[0]}>
    <div style={{display: 'flex', flexDirection: 'column', gap: 16, width: 680}}>
      {['Sara Lin', 'James Ford', 'Priya Nair'].map((name, i) => (
        <Card
          key={name}
          delay={6 + i * 6}
          style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px'}}
        >
          <span style={{fontSize: 26, fontWeight: 700}}>{name}</span>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <CheckDraw delay={16 + i * 6} />
            <span style={{fontFamily: T.mono, fontSize: 20, color: T.moss, fontWeight: 700}}>sent</span>
          </div>
        </Card>
      ))}
      <div
        style={{
          marginTop: 6,
          fontFamily: T.mono,
          fontSize: 21,
          color: T.inkSoft,
          opacity: useExpo(34, 16),
          textAlign: 'center',
        }}
      >
        <Counter to={142} delay={34} style={{color: T.hanko, fontSize: 27}} /> emails queued · 0 touched by you
      </div>
    </div>
  </Beat>
);

// ---------------------------------------------------------------- outro

export const Outro: React.FC = () => {
  const inkP = useExpo(0, 14);
  return (
    <AbsoluteFill style={{background: T.ink}}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${T.inkSoft} 1.2px, transparent 1.2px)`,
          backgroundSize: '44px 44px',
          opacity: 0.35,
        }}
      />
      <Drift from={1.04} to={1}>
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 42,
            opacity: inkP,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
            <div
              style={{
                width: 60,
                height: 60,
                background: T.hanko,
                transform: `rotate(${interpolate(useSpring(6, 13), [0, 1], [-90, -6])}deg)`,
              }}
            />
            <span
              style={{
                fontFamily: T.mono,
                fontWeight: 700,
                fontSize: 42,
                letterSpacing: '0.3em',
                color: T.paper,
              }}
            >
              KAMI
            </span>
          </div>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <WordReveal text="Marketing on autopilot." delay={10} size={104} color={T.paper} accentWords={[2]} />
          </div>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 27,
              letterSpacing: '0.12em',
              color: T.kraft,
              opacity: useExpo(34, 18),
              borderBottom: `3px solid ${T.hanko}`,
              paddingBottom: 8,
            }}
          >
            enter your domain → kami starts working
          </div>
        </AbsoluteFill>
      </Drift>
    </AbsoluteFill>
  );
};
