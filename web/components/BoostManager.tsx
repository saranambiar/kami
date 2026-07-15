"use client";

import { useCallback, useEffect, useState } from "react";
import type { XPost, BoostCampaign } from "@/lib/marketingTypes";
import StatusChip from "@/components/StatusChip";

interface BoostManagerProps {
  sessionDbId: string | null;
}

export default function BoostManager({ sessionDbId }: BoostManagerProps) {
  const [posts, setPosts] = useState<XPost[]>([]);
  const [boosts, setBoosts] = useState<BoostCampaign[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(() => {
    setLoading(true);
    fetch("/api/x/posts")
      .then((r) => r.json())
      .then((j) => setPosts(j.posts ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function boost(post: XPost) {
    const res = await fetch("/api/x/boost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: post.id, post_text: post.text, session_id: sessionDbId }),
    });
    const json = await res.json();
    if (json.campaign) {
      setBoosts((prev) => [...prev, json.campaign]);
    }
  }

  const boostedIds = new Set(boosts.map((b) => b.post_id));

  return (
    <div style={{ marginBottom: "var(--stack-md)" }}>
      <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>Boost Posts</p>
      {loading && <p className="mono" style={{ color: "var(--ink-soft)" }}>Loading posts…</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
        {posts.filter((p) => !boostedIds.has(p.id)).slice(0, 5).map((post) => (
          <div className="kraft-card" key={post.id} style={{ padding: "0.75rem 1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <p style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {post.text.slice(0, 80)}{post.text.length > 80 ? "…" : ""}
              </p>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>
                {post.public_metrics.like_count} ♥ · {post.public_metrics.retweet_count} ↻
              </span>
              <button
                className="mono"
                onClick={() => boost(post)}
                style={{
                  border: "1px solid var(--ink)",
                  background: "transparent",
                  padding: "0.3rem 0.7rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Boost
              </button>
            </div>
          </div>
        ))}
      </div>
      {boosts.length > 0 && (
        <div style={{ marginTop: "var(--stack-md)" }}>
          <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>Active Boosts</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
            {boosts.map((b) => (
              <div className="kraft-card" key={b.id} style={{ padding: "0.75rem 1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                  <p style={{ flex: 1, fontSize: 13 }}>{b.post_text.slice(0, 60)}…</p>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                    ${b.spend ?? 0} / ${b.budget}
                  </span>
                  <StatusChip label={b.status} />
                </div>
                {(b.impressions != null || b.clicks != null) && (
                  <p className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: "0.3rem" }}>
                    {b.impressions ?? 0} impressions · {b.clicks ?? 0} clicks
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
