import type { SalesSegment } from "@/lib/salesSegments";

/** B2B segments need at least one candidate company domain. PLG needs a persona. */
export function validateSegmentsForConfirm(segments: SalesSegment[]): string | null {
  if (!segments.length) return "Add at least one segment before confirming.";
  for (const s of segments) {
    if (s.motion === "b2b_sales_assisted" && (!s.candidate_companies || s.candidate_companies.length < 1)) {
      return `Segment "${s.name}" needs at least one candidate company domain before confirm.`;
    }
    if (s.motion === "plg_self_serve" && (!s.example_user_personas || s.example_user_personas.length < 1)) {
      return `PLG segment "${s.name}" needs at least one example user persona.`;
    }
  }
  return null;
}
