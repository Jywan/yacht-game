import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useGameStore } from "../store/gameStore";
import Die3D from "./Die3D";

export default function DiceTray3D() {
    const dice = useGameStore((s) => s.dice);
    const held = useGameStore((s) => s.held);
    const rollId = useGameStore((s) => s.rollId);
    const toggleHold = useGameStore((s) => s.toggleHold);
    const phase = useGameStore((s) => s.phase);

    return (
        <div 
            style={{
                height: 240,
                borderRadius: 18,
                border: "1px solid #ebeef7",
                background: "liner-gradient(180deg, #f6f7fb 0%, #ffffff 70%)",
                overflow: "hidden",
            }}
        >
            <Canvas shadows camera={{ position: [0, 4, 7], fov: 45 }} >
                <ambientLight intensity={0.65} />
                <directionalLight position={[6, 10, 6]} intensity={0.9} castShadow />

                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} receiveShadow>
                    <planeGeometry args={[30, 30]}/>
                    <shadowMaterial opacity={0.18} />
                </mesh>

                {dice.map((v, i) => (
                    <Die3D 
                        key={i}
                        index={i}
                        value={v}
                        held={held[i]}
                        rollId={rollId}
                        position={[i * 1.45 - 2.9, 0, 0 ]}
                        onToggleHold={phase === "rolling" ? toggleHold : undefined}
                    />
                ))}

                <OrbitControls enableZoom={false} enableRotate={false} enablePan={false} />
            </Canvas>
        </div>
    );
}