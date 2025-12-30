import { useGameStore } from "../store/gameStore";

export default function DiceTray() {
    const dice = useGameStore((s) => s.dice)
    const held = useGameStore((s) => s.held)
    const toggleHold = useGameStore((s) => s.toggleHold);

    return (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {dice.map((v, i) => (
                <button 
                    key={i} 
                    onClick={() => toggleHold(i)} 
                    style={{ width: 64, height: 64, borderRadius: 12, border: "1px solid #ccc", fontSize: 24, fontWeight: 700, cursor: "pointer", opacity: held[i] ? 0.6 : 1, }}
                    title={held[i] ? "Held" : "Click to hold"}>
                    {v}
                    <div style={{ fontSize: 12, fontWeight: 500, marginTop: 2 }}>
                        {held[i] ? "HOLD" : "-"}
                    </div>
                </button>
            ))}
        </div>
    );
}