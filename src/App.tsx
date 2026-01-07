import DiceTray3D from "./components/DiceTray3D";
import { useGameStore } from "./store/gameStore";

export default function App() {
  const roll = useGameStore((s) => s.roll);
  const topValue = useGameStore((s) => s.topValue);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <button
          onClick={roll}
          style={{
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid #ccc",
            background: "#111",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Roll (Right → Left)
        </button>

        <div style={{ fontWeight: 700 }}>
          Top value: {topValue}
        </div>
      </div>

      <DiceTray3D />
    </div>
  );
}