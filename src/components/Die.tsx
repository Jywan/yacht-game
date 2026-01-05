import { animate, motion } from "framer-motion";
import type { DieValue } from "../domain/dice";
import { div } from "framer-motion/client";

const PIPS: Record<DieValue, [number, number][]> = {
    1: [[2, 2]],
    2: [[1, 1], [3, 3]],
    3: [[1, 1], [2, 2], [3, 3]],
    4: [[1, 1], [1, 3], [3, 1], [3, 3]],
    5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
    6: [[1, 1], [1, 2], [1, 3], [3, 1], [3, 2], [3, 3]],
};

type Props = {
    value: DieValue;
    held: boolean;
    disabled?: boolean;
    onClick?: () => void;

    rollId: number;
    shouldAnimate: boolean;
};

export default function Die({ value, held, disabled, onClick, rollId, shouldAnimate }: Props) {
    const pips = PIPS[value];
    
    return (
        <motion.button 
            type="button" 
            onClick={onClick} 
            disabled={disabled} 
            whileTap={disabled ? undefined : { scale: 0.98 }}
            animate={shouldAnimate ? {
                    rotate: [0, 90, 180, 270, 360], 
                    y: [0, -10, 0], 
                    scale: [1, 1.03, 1],
                } : {
                    rotate: 0,
                    y: 0, 
                    scale: 1 
                }
            }
            transition={{ 
                duration: shouldAnimate ? 0.28 : 0, 
                ease: "easeOut", 
            }} 
            key={`${rollId}-${held ? "H" : "R"}`}
            style={{ 
                width: 72, 
                height: 72, 
                borderRadius: 14, 
                border: "1px solid #cfcfcf", 
                background: held ? "#f3f3f3" : "whtie", 
                cursor: disabled ? "not-allowed" : "pointer",
                position: "relative",
                opacity: held ? 0.7 : 1,
                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)"
            }}
            title={held ? "Held" : "Click to Held"}
        >
            {/* 3x3 그리드 pips */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gridTemplateRows: "repeat(3, 1fr)",
                    width: "100%",
                    height: "100%",
                    padding: 10,
                    boxSizing: "border-box",
                    gap: 4,
                }}
            >
                {Array.from({ length: 9 }).map((_, idx) => {
                    const r = Math.floor(idx / 3) + 1;
                    const c = (idx % 3) + 1;
                    const on = pips.some(([pr, pc]) => pr === r && pc === c);

                    return (
                        <div
                        key={idx}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        >
                            <div
                                style={{
                                width: 10,
                                height: 10,
                                borderRadius: 999,
                                background: on ? "#111" : "transparent",
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* HOLD 라벨 */}
            {held && (
                <div
                    style={{
                        position: "absolute",
                        bottom: 6,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#555",
                        letterSpacing: 0.6
                    }}
                >
                    HOLD
                </div>
            )}
        </motion.button>
    );
}