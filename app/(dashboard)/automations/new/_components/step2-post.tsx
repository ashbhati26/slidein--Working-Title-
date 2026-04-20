"use client";

import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckCircle, Grid3X3, Image } from "lucide-react";
import { NavButtons } from "./nav-buttons";

interface IgPost { id: string; caption: string; mediaType: string; thumbnailUrl: string | null; timestamp: string; permalink: string; }
interface Step2PostProps { selectedPostId: string | null; onSelect: (id: string | null) => void; onBack: () => void; onNext: () => void; }

export function Step2Post({ selectedPostId, onSelect, onBack, onNext }: Step2PostProps) {
  const fetchPosts = useAction(api.instagram.fetchMyPosts);
  const [posts, setPosts] = useState<IgPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPosts({ limit: 20 }).then(setPosts).catch(() => setError("Could not load posts. Make sure Instagram is connected.")).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.6, letterSpacing: "-0.005em" }}>
        Select the post or reel to capture comments on. Choose "Any post" to trigger on all your content.
      </p>

      <button onClick={() => onSelect(null)} style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%",
        padding: "11px 14px", borderRadius: 9, marginBottom: 14,
        border: `1px solid ${selectedPostId === null ? "var(--accent)" : "var(--rule-md)"}`,
        background: selectedPostId === null ? "var(--accent-muted)" : "var(--bg-subtle)",
        cursor: "pointer", transition: "all 0.12s ease", textAlign: "left",
      }}>
        <Grid3X3 size={16} color={selectedPostId === null ? "var(--accent)" : "var(--ink-3)"} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: selectedPostId === null ? "var(--accent)" : "var(--ink-1)", marginBottom: 1, letterSpacing: "-0.01em" }}>Any post or reel</p>
          <p style={{ fontSize: 11, color: "var(--ink-3)" }}>Triggers on comments from all your posts</p>
        </div>
        {selectedPostId === null && <CheckCircle size={15} color="var(--accent)" />}
      </button>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7 }}>
          {[1,2,3,4,5,6].map((i) => <div key={i} style={{ aspectRatio: "1", borderRadius: 9, background: "var(--rule)", animation: "sk 1.6s ease-in-out infinite", opacity: 1 - i * 0.1 }} />)}
        </div>
      ) : error ? (
        <p style={{ fontSize: 12, color: "var(--red)", padding: "16px 0" }}>{error}</p>
      ) : posts.length === 0 ? (
        <p style={{ fontSize: 12, color: "var(--ink-3)", padding: "16px 0" }}>No posts found on this account.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, maxHeight: 380, overflowY: "auto" }}>
          {posts.map((post) => {
            const sel = selectedPostId === post.id;
            return (
              <button key={post.id} onClick={() => onSelect(post.id)} style={{ position: "relative", aspectRatio: "1", borderRadius: 9, border: `2px solid ${sel ? "var(--accent)" : "transparent"}`, overflow: "hidden", cursor: "pointer", padding: 0, background: "var(--bg-subtle)" }}>
                {post.thumbnailUrl ? (
                  <img src={post.thumbnailUrl} alt={post.caption} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Image size={20} color="var(--ink-3)" /></div>
                )}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,.7))", padding: "16px 5px 5px" }}>
                  <p style={{ fontSize: 8, color: "#fff", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{post.caption || "No caption"}</p>
                </div>
                {sel && (
                  <div style={{ position: "absolute", top: 5, right: 5, width: 20, height: 20, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircle size={12} color="#fff" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <NavButtons onBack={onBack} onNext={onNext} />
      <style>{`@keyframes sk{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
    </div>
  );
}