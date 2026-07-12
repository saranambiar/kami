"use client";

import { useEffect, useRef } from "react";

interface AgentTraceProps {
  text: string;
  running: boolean;
}

export default function AgentTrace({ text, running }: AgentTraceProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [text]);

  return (
    <section id="trace" style={{ marginTop: "var(--stack-lg)" }}>
      <p className="mono label-caps" style={{ marginBottom: "var(--stack-sm)" }}>
        AGENT TRACE {running ? "· RUNNING" : "· COMPLETE"}
      </p>
      <div className="trace" ref={ref}>
        {text || "» dispatching manager…"}
        {running && <span style={{ opacity: 0.6 }}>▊</span>}
      </div>
    </section>
  );
}
