"use client";

const CHANNELS = [
  { key: "x", name: "X", blurb: "Post threads and reply to your ICP's conversations." },
  { key: "email", name: "Email", blurb: "Signal-based cold outreach, reviewed before send." },
  { key: "reddit", name: "Reddit", blurb: "Join the communities your buyers already trust." },
  { key: "discord", name: "Discord", blurb: "Show up where builder communities hang out." },
];

interface ChannelRailProps {
  connected: string[]; // platform keys
  onConnect: (platform: string) => void;
}

export default function ChannelRail({ connected, onConnect }: ChannelRailProps) {
  return (
    <aside>
      <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>
        Channels
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
        {CHANNELS.map((c) => {
          const isConnected = connected.includes(c.key);
          return (
            <div className="kraft-card" key={c.key} style={{ padding: "1rem" }}>
              <strong style={{ fontFamily: "var(--font-headline)" }}>{c.name}</strong>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0.4rem 0" }}>
                {c.blurb}
              </p>
              {isConnected ? (
                <span className="mono" style={{ color: "var(--moss)", fontWeight: 700 }}>
                  ✗ connected
                </span>
              ) : (
                <button
                  type="button"
                  className="mono"
                  onClick={() => onConnect(c.key)}
                  style={{
                    border: "1px solid var(--ink)",
                    background: "transparent",
                    padding: "0.3rem 0.7rem",
                    cursor: "pointer",
                  }}
                >
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
