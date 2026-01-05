import { useMemo } from "react";
import { type Category, CATEGORY_LABEL } from "../domain/categories";
import { useGameStore } from "../store/gameStore";

const UPPER: Category[] = ["ACES", "DEUCES", "THREES", "FOURS", "FIVES", "SIXES"];
const LOWER: Category[] = ["CHOICE", "FOUR_KIND", "FULL_HOUSE", "SMALL_STRAIGHT", "LARGE_STRAIGHT", "YACHT"];

export default function ScoreTableV2() {
    const scores = useGameStore((s) => s.scores);
    const previewScore = useGameStore((s) => s.previewScore);
    const commitScore = useGameStore((s) => s.commitScore);
    const phase = useGameStore((s) => s.phase);

    const upperSum = useMemo(() => UPPER.reduce((acc, c) => acc + (scores[c] ?? 0), 0), [scores]);
    const lowerSum = useMemo(() => LOWER.reduce((acc, c) => acc + (scores[c] ?? 0), 0), [scores]);

    return (
        <div style={{ display: "grid", gap: 14 }}>
            <Group title="Upper" subtitle={`Subtotal: ${upperSum}`}>
                {UPPER.map((c) => (
                    <ScoreRow key={c} category={c} usedValue={scores[c]} preview={previewScore(c)} disabled={phase !== "rolling" || scores[c] !== null} onCommit={() => commitScore(c)}/>
                ))}
            </Group>
            
            <Group title="Lower" subtitle={`Subtotal: ${lowerSum}`}>
                {LOWER.map((c) => (
                    <ScoreRow key={c} category={c} usedValue={scores[c]} preview={previewScore(c)} disabled={phase !== "rolling" || scores[c] !== null} onCommit={() => commitScore(c)}/>
                ))}
            </Group>
        </div>
    );
}

function Group({ title, subtitle, children, }: { title: string; subtitle: string; children: React.ReactNode; }) {
    return (
        <div style={{ 
            border: "1px solid #ebeef7", 
            background: "#f6f7fb", 
            borderRadius: 16, 
            padding: 12, 
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontWeight: 900, fontSize: 14 }}>{title}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{subtitle}</div>
            </div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>{children}</div>
        </div>
    );
}

function ScoreRow({ category, usedValue, preview, disabled, onCommit, }: { category: Category; usedValue: number | null; preview: number; disabled: boolean; onCommit: () => void; }) {
    const used = usedValue !== null;

    return (
        <button type="button" disabled={disabled} onClick={onCommit} title={used ? "Already used": "Click to commit"}
            style={{ 
                width: "100%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between", 
                gap: 10, 
                padding: "10px 12px", 
                borderRadius: 14,
                border: "1px solid #dfe3ef", 
                background: used ? "rgba(255, 255, 255, 0.7)" : "white",
                cursor: disabled ? "not-allowed" : "pointer", 
                opacity: disabled ? 0.72 : 1,
            }}>
            <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{CATEGORY_LABEL[category]}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                    {used ? "Committed" : "Preview"}
                </div>
            </div>

            <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 900, fontSize: 18, fontVariantNumeric: "tabular-nums" }}>
                    {used ? usedValue : preview}
                </div>
            </div>
        </button>
    );
} 