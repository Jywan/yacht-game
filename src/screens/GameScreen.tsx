// import DiceTray from "../components/DiceTray";
import DiceTray3D from "../components/DiceTray3D"
import ScoreTableV2 from "../components/ScoreTableV2";
import { useGameStore } from "../store/gameStore";

export default function GameScreen() {
    const rollsLeft = useGameStore((s) => s.rollsLeft);
    const roll = useGameStore((s) => s.roll);
    const initGame = useGameStore((s) => s.initGame);
    const turnIndex = useGameStore((s) => s.turnIndex);
    const maxTurns = useGameStore((s) => s.maxTurns);
    const phase = useGameStore((s) => s.phase);
    // const totalScore = useGameStore((s) => s.totalScore);  // v1 or v2
    const total = useGameStore((s) => s.totalScore()); // v3

    return (
        <div style={{ 
                minHeight: "100vh", 
                padding: 24, 
                boxSizing: "border-box", 
                fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
                background: "linear-gradient(180deg, #f6f7fb 0%, #ffffff 60%)",
            }}>
            {/* HUD */}
            <div style={{ 
                    display: "flex", 
                    gap: 16, 
                    alignItems: "center", 
                    justifyContent: "space-between", 
                    padding: 16, 
                    borderRadius: 18, 
                    border: "1px solid #e6e8ee", 
                    background: "rgba(255, 255, 255, 0.9)", 
                    boxShadow: "0, 12px 30px rgba(0, 0, 0, 0.06)",
                    backdropFilter: "blur(6px)",
                }}
            >
                <div>
                    <div style={{ fontSize: 14, color: "#666" }}>Yacht</div>
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.2 }}>
                        Turn {phase === "finished" ? maxTurns : turnIndex + 1} / {maxTurns}
                    </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <HudPill label="Rolls Left" value={`${rollsLeft}`} />
                    {/* <HudPill label="Total" value={`${totalScore()}`} /> */}
                    <HudPill label="Total" value={`${total}`} />
                    {phase === "finished" && <HudPill label="Status" value="Finished" />}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={roll} disabled={phase !== "rolling" || rollsLeft === 0} 
                        style={{ 
                            padding: "12px 16px", 
                            borderRadius: 999, 
                            border: "1px solid #d7dbe6", 
                            background: phase !== "rolling" || rollsLeft === 0 ? "#f0f2f7" : "#111",
                            color: phase !== "rolling" || rollsLeft === 0 ? "#666" : "white",
                            fontWeight: 800,
                            cursor: phase !== "rolling" || rollsLeft === 0 ? "not-allowed" : "pointer",
                            boxShadow: phase !== "rolling" || rollsLeft === 0 ? "none" : "0 10px 24px rgba(0, 0, 0, 0.18)",
                            transform: "translateY(0)",
                        }}>
                        Roll
                    </button>
                    <button
                        onClick={initGame}
                        style={{
                            padding: "12px 16px",
                            borderRadius: 999,
                            border: "1px solid #d7dbe6",
                            background: "white",
                            color: "#111",
                            fontWeight: 800,
                            cursor: "pointer",
                        }}
                    >
                        New Game
                    </button>
                </div>
            </div>
            {/* Main Board */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.1fr 0.9fr",
                    gap: 16,
                    marginTop: 16,
                }}
            >
                {/* Left: Dice + guidance */}
                <div
                    style={{
                        borderRadius: 20,
                        border: "1px solid #e6e8ee",
                        background: "white",
                        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.06)",
                        padding: 18,
                    }}
                >
                    <SectionTitle title="Dice" subtitle="Click a die to hold it. Roll up to 3 times."/>
                    <div style={{ marginTop: 12 }}>
                    {/* <DiceTray /> */}
                        <DiceTray3D />
                    </div>

                    <div
                        style={{
                            marginTop: 16,
                            padding: 12,
                            borderRadius: 16,
                            background: "#f6f7fb",
                            border: "1px solid #ebeef7",
                            color: "#444",
                            lineHeight: 1.35,
                        }}
                    >
                        <b>How to play</b>
                        <div style={{ marginTop: 6, fontSize: 13 }}>
                            Roll, hold, then choose one score category. Each category can be used once.
                        </div>
                    </div>
                </div>
                
                {/* Right: Score */}
                <div
                    style={{
                        borderRadius: 20,
                        border: "1px solid #e6e8ee",
                        background: "white",
                        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.06)",
                        padding: 18,
                    }}
                >
                    <SectionTitle title="Score Card" subtitle="Right side shows preview. Click to commit." />
                    <div style={{ marginTop: 12 }}>
                        <ScoreTableV2 />
                    </div>
                </div>
            </div>
        </div>
    );
}

function HudPill({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ padding: "10px 12px", borderRadius: 999, border: "1px solid #e6e8ee", background: "white", minWidth: 110, }}>
            <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#111" }}>{value}</div>
        </div>
    );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#111" }}>{title}</div>
            <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{subtitle}</div>
        </div>
    );
}