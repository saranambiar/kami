const MOTION_LABELS: Record<string, string> = {
  signal_outreach: "Research-based cold email",
  outbound_email: "Direct email outreach",
  x_dm: "X direct messages",
  multi_channel: "Email plus social follow-up",
};

export function motionLabel(motion: string): string {
  return MOTION_LABELS[motion] ?? motion.replace(/_/g, " ");
}

export function channelLabel(channel: string): string {
  if (channel === "email") return "Email";
  if (channel === "x") return "X";
  return channel;
}

export function scoreLabel(factor: string, value: number): string {
  const pct = Math.round(value * 100);
  if (factor === "fit") return `Fit ${pct}%`;
  if (factor === "intent") return `Timing ${pct}%`;
  if (factor === "contactability") return `Reachable ${pct}%`;
  if (factor === "priority") return `Priority ${pct}%`;
  return `${factor} ${pct}%`;
}
