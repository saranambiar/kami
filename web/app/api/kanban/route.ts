import { listKanbanTasks } from "@/lib/hermesDb";
import { supabaseServer } from "@/lib/supabase";

export interface BoardTask {
  id: string;
  title: string;
  status: "ready" | "running" | "blocked" | "done";
  meta: string;
  source: "hermes" | "kami";
}

const HERMES_STATUS: Record<string, BoardTask["status"]> = {
  ready: "ready",
  queued: "ready",
  claimed: "running",
  running: "running",
  in_progress: "running",
  blocked: "blocked",
  failed: "blocked",
  done: "done",
  completed: "done",
  archived: "done",
};

const OPP_STATUS: Record<string, BoardTask["status"]> = {
  proposed: "ready",
  approved: "running",
  dismissed: "done",
  executed: "done",
};

// Board = Hermes kanban tasks (when the local board is populated) + Kami
// opportunities from Supabase mapped onto the same columns.
export async function GET(): Promise<Response> {
  const tasks: BoardTask[] = [];

  for (const t of listKanbanTasks()) {
    tasks.push({
      id: `hermes-${t.id}`,
      title: t.title,
      status: HERMES_STATUS[t.status] ?? "ready",
      meta: [t.assignee, t.priority].filter(Boolean).join(" · "),
      source: "hermes",
    });
  }

  const sb = supabaseServer();
  if (sb) {
    const { data } = await sb
      .from("opportunities")
      .select("id, title, playbook, status, agent_sessions(domain)")
      .order("created_at", { ascending: false })
      .limit(100);
    for (const o of data ?? []) {
      const domain = (o.agent_sessions as unknown as { domain: string } | null)?.domain;
      tasks.push({
        id: `opp-${o.id}`,
        title: o.title,
        status: OPP_STATUS[o.status] ?? "ready",
        meta: [domain, o.playbook, o.status].filter(Boolean).join(" · "),
        source: "kami",
      });
    }
  }

  return Response.json({ tasks });
}
