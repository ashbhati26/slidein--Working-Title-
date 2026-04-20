import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";

interface NavButtonsProps {
  onBack?:       () => void;
  onNext?:       () => void;
  nextLabel?:    string;
  nextDisabled?: boolean;
  loading?:      boolean;
}

export function NavButtons({ onBack, onNext, nextLabel = "Continue", nextDisabled = false, loading = false }: NavButtonsProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: "0.5px solid var(--rule)" }}>
      {onBack ? (
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 5, height: 34, padding: "0 14px", borderRadius: 980, background: "transparent", color: "var(--ink-3)", border: "0.5px solid var(--rule-md)", cursor: "pointer", fontSize: 12 }}>
          <ArrowLeft size={13} /> Back
        </button>
      ) : <div />}
      {onNext && (
        <button onClick={onNext} disabled={nextDisabled || loading} style={{
          display: "flex", alignItems: "center", gap: 6,
          height: 34, padding: "0 18px", borderRadius: 980,
          background: nextDisabled || loading ? "var(--rule-md)" : "var(--accent)",
          color: nextDisabled || loading ? "var(--ink-3)" : "#fff",
          border: "none", cursor: nextDisabled || loading ? "not-allowed" : "pointer",
          fontSize: 13, fontWeight: 400, transition: "all 0.15s ease",
        }}>
          {loading && <Loader2 size={13} style={{ animation: "spin .7s linear infinite" }} />}
          {nextLabel} {!loading && <ChevronRight size={13} />}
        </button>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}