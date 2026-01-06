import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import Die3D from "./Die3D";
import { useGameStore } from "../store/gameStore";

type Vec3 = [number, number, number];

export default function DiceTray3D() {
    const dice = useGameStore((s) => s.dice);
    const held = useGameStore((s) => s.held);
    const rollId = useGameStore((s) => s.rollId);
    const toggleHold = useGameStore((s) => s.toggleHold);
    const phase = useGameStore((s) => s.phase);

    const heldIndices = dice.map((_, i) => i).filter((i) => held[i]);
    const freeIndices = dice.map((_, i) => i).filter((i) => !held[i]);

    const spacing = 1.35;

    // top-down 기준: X/Z는 바닥 평면, Y는 높이
    // 보이는 “구역 분리”는 Z로(화면 상/하), 높이는 주사위가 뜨지 않게 동일하게 유지
    const yDice = 0;          // 주사위 높이(고정)
    const rollRowZ = 0.9;     // 아래쪽(roll 구역)
    const keepRowZ = -0.9;    // 위쪽(keep 구역)

    const slotX = (slot: number, total: number) => (slot - (total - 1) / 2) * spacing;

    const targetPosByIndex = new Map<number, Vec3>();

    freeIndices.forEach((idx, slot) => {
        targetPosByIndex.set(idx, [slotX(slot, freeIndices.length), yDice, rollRowZ]);
    });

    heldIndices.forEach((idx, slot) => {
        targetPosByIndex.set(idx, [slotX(slot, heldIndices.length), yDice, keepRowZ]);
    });

    return (
        <div
            style={{
                height: 260,
                borderRadius: 18,
                border: "1px solid #ebeef7",
                background: "linear-gradient(180deg, #f6f7fb 0%, #ffffff 70%)",
                overflow: "hidden",
            }}
        >
            <Canvas shadows>
                {/* 위에서 내려다보는 고정 카메라 */}
                <OrthographicCamera
                    makeDefault
                    position={[0, 10, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    zoom={65}
                />

                <ambientLight intensity={0.75} />
                <directionalLight position={[6, 10, 6]} intensity={0.9} castShadow />

                {/* 바닥(그림자) */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} receiveShadow>
                    <planeGeometry args={[30, 30]} />
                    <shadowMaterial opacity={0.18} />
                </mesh>

                {/* Keep 구역 가이드: "바닥 위"로 올리면 주사위를 가리므로, 바닥보다 더 아래에 깔기 */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.805, keepRowZ]} receiveShadow>
                    <planeGeometry args={[12, 2.6]} />
                    <meshStandardMaterial color="#f0f2f7" roughness={1} metalness={0} />
                </mesh>

                {/* Roll 구역 가이드(선택): roll도 같이 깔아주면 구역 인지가 좋아짐 */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.805, rollRowZ]} receiveShadow>
                    <planeGeometry args={[12, 2.6]} />
                    <meshStandardMaterial color="#ffffff" roughness={1} metalness={0} />
                </mesh>

                {dice.map((v, i) => (
                    <Die3D
                        key={i}
                        index={i}
                        value={v}
                        held={held[i]}
                        rollId={rollId}
                        targetPosition={targetPosByIndex.get(i) ?? [0, yDice, rollRowZ]}
                        onToggleHold={phase === "rolling" ? toggleHold : undefined}
                    />
                ))}

                <OrbitControls enableZoom={false} enableRotate={false} enablePan={false} />
            </Canvas>
        </div>
    );
}