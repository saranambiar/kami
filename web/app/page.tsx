"use client";

import { useRef, useState } from "react";
import DomainForm from "@/components/DomainForm";
import AgentTrace from "@/components/AgentTrace";
import Dossier from "@/components/Dossier";
import CmoChat from "@/components/CmoChat";
import { newSessionId, parseDossier, streamChat, type Dossier as DossierData } from "@/lib/hermes";
import { executePrompt, onboardingPrompt } from "@/lib/prompts";

type Phase = "idle" | "tracing" | "done";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [trace, setTrace] = useState("");
  const [dossier, setDossier] = useState<DossierData | null>(null);
  const [executing, setExecuting] = useState(false);
  const sessionRef = useRef(newSessionId());

  async function begin(domain: string) {
    setPhase("tracing");
    setTrace("");
    setDossier(null);
    sessionRef.current = newSessionId();
    try {
      const full = await streamChat(onboardingPrompt(domain), sessionRef.current, (delta) =>
        setTrace((t) => t + delta),
      );
      setDossier(parseDossier(full)); // null → raw trace stays visible as fallback
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "request failed";
      setTrace((t) => t + `\n\n⚠ ${msg}`);
    } finally {
      setPhase("done");
    }
  }

  async function execute(title: string, playbook: string) {
    setExecuting(true);
    setTrace((t) => t + `\n\n» EXECUTE (dry run): ${title}\n`);
    try {
      await streamChat(executePrompt(title, playbook), sessionRef.current, (delta) =>
        setTrace((t) => t + delta),
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "request failed";
      setTrace((t) => t + `\n⚠ ${msg}`);
    } finally {
      setExecuting(false);
    }
  }

  return (
    <main className="container" style={{ paddingBottom: "var(--stack-lg)" }}>
      <DomainForm onSubmit={begin} busy={phase === "tracing"} />
      {phase !== "idle" && <AgentTrace text={trace} running={phase === "tracing"} />}
      {dossier && <Dossier dossier={dossier} onExecute={execute} executing={executing} />}
      {dossier && <CmoChat sessionId={sessionRef.current} />}
    </main>
  );
}
