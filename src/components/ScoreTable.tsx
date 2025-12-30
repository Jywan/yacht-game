import { CATEGORIES, CATEGORY_LABEL, type Category } from "../domain/categories";
import { useGameStore } from "../store/gameStore";

export default function ScoreTable() {
    const scores = useGameStore((s) => s.scores);
    const previewScore = useGameStore((s) => s.previewScore);
    const commitScore = useGameStore((s) => s.commitScore);
    const phase = useGameStore((s) => s.phase);

    const isUsed = (c: Category) => scores[c] != null;

    return (
        <div style={{ marginTop: 20 }}>
            <h2 style={{ marginBottom: 8 }}>Score Table</h2>
            <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
                {CATEGORIES.map((c) => {
                    const used = isUsed(c);
                    const locked = phase !== "rolling";
                    const pv = previewScore(c);

                    return (
                        <button key={c} disabled={used || locked} onClick={() => commitScore(c)} 
                            style={{display: "flex", justifyContent: "space-between", padding: "10px, 12px", borderRadius: 10, border: "1px solid #ccc",
                                cursor: used || locked ? "not-allowed" : "pointer", opacity: used || locked ? 0.6 : 1, textAlign: "left",
                            }}
                            title={used ? "Already used" : "Click to commit"}
                        >
                            <span>
                                {CATEGORY_LABEL[c]}
                                {used ? " (used)" : ""}
                            </span>
                            <span style={{ fontVariantNumeric: "tabular-nums" }}>
                                {used ? scores[c] : pv}
                            </span>
                        </button>
                    );
                })}
            </div>

            <p style={{ marginTop: 10, color: "#666" }}>
                Tip: 버튼 오른쪽 숫자는 현재 주하위 기준 예상 점수입니다. 
                클릭하면 확정되고 다음턴으로 넘어갑니다.
            </p>
        </div>
    );
}