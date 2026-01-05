import { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";
import Die from "./Die";

export default function DiceTray() {
    const dice = useGameStore((s) => s.dice)
    const held = useGameStore((s) => s.held)
    const toggleHold = useGameStore((s) => s.toggleHold);
    const phase = useGameStore((s) => s.phase);
    const rollId = useGameStore((s) => s.rollId);

    const [animOn, setAnimOn] = useState(false);

    useEffect(() => {
        if (phase !== "rolling") return 
        setAnimOn(true);
        const t = window.setTimeout(() => setAnimOn(false), 320);
        return () => window.clearTimeout(t);
    }, [rollId, phase]);

    return (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {dice.map((v, i) => (
                <Die
                    key={i}
                    value={v}
                    held={held[i]}
                    disabled={phase !== "rolling"}
                    onClick={() => toggleHold(i)}
                    rollId={rollId}
                    shouldAnimate={animOn && !held[i]}
                />
            ))}
        </div>
    );
}