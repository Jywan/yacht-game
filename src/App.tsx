import DiceTray from "./components/DiceTray";
import ScoreTable from "./components/ScoreTable";
import { useGameStore } from "./store/gameStore";

export default function App() {
  const rollsLeft = useGameStore((s) => s.rollsLeft);
  const roll = useGameStore((s) => s.roll);
  const initGame = useGameStore((s) => s.initGame);
  const turnIndex = useGameStore((s) => s.turnIndex);
  const maxTurns = useGameStore((s) => s.maxTurns);
  const phase = useGameStore((s) => s.phase);
  const totalScore = useGameStore((s) => s.totalScore);


  return (
    <div style={{ padding: 25, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>Yacht</h1>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div>
            Turn: <b>{phase === "finished" ? maxTurns : turnIndex + 1}</b> /{" "}
            {maxTurns}
          </div>
          <div>
            Rolls left: <b>{rollsLeft}</b>
          </div>
          <div>
            Total: <b>{totalScore()}</b>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <button onClick={roll} disabled={phase !== "rolling" || rollsLeft === 0} style={{ padding: "10px 14px", cursor: "pointer" }}>
            Roll
          </button>
          <button onClick={initGame} style={{ padding: "10px 14px", cursor: "pointer" }}>
            New Game
          </button>
        </div>
      </div>

      {phase === "finished" && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ccc", borderRadius: 12, maxWidth:520 }}>
          <b>Game Finished</b>
          <div style={{ marginTop: 6 }}>
            Final Score: <b>{totalScore()}</b>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <DiceTray />
      </div>

      <ScoreTable />
    </div>
  );
} 