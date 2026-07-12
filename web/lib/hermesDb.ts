import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// Read-only access to local Hermes SQLite state. Server-side only.
// Returns [] when the databases don't exist (e.g. deployed off-box) so the
// UI degrades gracefully.

export interface HermesRun {
  id: string;
  source: string;
  started_at: number;
  ended_at: number | null;
  message_count: number;
  tool_call_count: number;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number;
  model: string | null;
}

export interface HermesKanbanTask {
  id: number;
  title: string;
  status: string;
  assignee: string | null;
  priority: string | null;
  created_at: string | null;
  completed_at: string | null;
}

function openReadonly(file: string): DatabaseSync | null {
  const path = join(homedir(), ".hermes", file);
  if (!existsSync(path)) return null;
  try {
    return new DatabaseSync(path, { readOnly: true });
  } catch {
    return null;
  }
}

export function listRuns(limit = 50): HermesRun[] {
  const db = openReadonly("state.db");
  if (!db) return [];
  try {
    return db
      .prepare(
        `select id, source, started_at, ended_at, message_count, tool_call_count,
                input_tokens, output_tokens, estimated_cost_usd, model
         from sessions
         where id like 'kami-%'
         order by started_at desc limit ?`,
      )
      .all(limit) as unknown as HermesRun[];
  } finally {
    db.close();
  }
}

export function listKanbanTasks(): HermesKanbanTask[] {
  const db = openReadonly("kanban.db");
  if (!db) return [];
  try {
    return db
      .prepare(
        `select id, title, status, assignee, priority, created_at, completed_at
         from tasks order by created_at desc limit 100`,
      )
      .all() as unknown as HermesKanbanTask[];
  } finally {
    db.close();
  }
}
