import DiceTray3D from "./components/DiceTray3D";
import { useGameStore } from "./store/gameStore";

export default function App() {
    const roll = useGameStore((s) => s.roll);
    const dice = useGameStore((s) => s.dice);

    return (
        <div style={{ padding: 24, position: "relative" }}>
            {/* Debug HUD (주사위 윗면 값 확인용) */}
            <div
                style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    padding: 12,
                    borderRadius: 12,
                    background: "rgba(0, 0, 0, 0.75)",
                    color: "white",
                    fontWeight: 800,
                    zIndex: 20,
                    minWidth: 140,
                }}
            >
                {dice.map((v, i) => (
                    <div key={i}>
                        Die {i + 1}: {v}
                    </div>
                ))}
            </div>

            <div style={{ marginBottom: 12, position: "relative", zIndex: 10 }}>
                <button
                    onClick={roll}
                    style={{
                        padding: "10px 14px",
                        borderRadius: 999,
                        border: "1px solid #ccc",
                        background: "#111",
                        color: "white",
                        fontWeight: 800,
                        cursor: "pointer",
                    }}
                >
                    Roll (Right → Left)
                </button>
            </div>

            <DiceTray3D />
        </div>
    );
}