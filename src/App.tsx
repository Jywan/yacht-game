import DiceTray3D from "./components/DiceTray3D";
import { useGameStore } from "./store/gameStore";

export default function App() {
  const roll = useGameStore((s) => s.roll);

  return (
    <div style={{ padding: 24 }}>
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