import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, OrbitControls } from "@react-three/drei";
import { Physics, usePlane, useBox } from "@react-three/cannon";
import { useGameStore } from "../store/gameStore";
import Die3D from "./Die3D";

type Vec3 = [number, number, number];

function Floor() {
    const [ref] = usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, 0, 0],
    }));

    return (
        <mesh ref={ref as any} receiveShadow>
            <planeGeometry />
            <meshStandardMaterial color="#f6f7fb" roughness={1} metalness={0} />
        </mesh>
    );
}

function StaticBox({ position, size }: { position: Vec3; size: Vec3 }) {
    const [ref] = useBox(() => ({
        type: "Static",
        args: size,
        position,
    }));

    return (
        <mesh ref={ref as any}>
            <boxGeometry />
            <meshStandardMaterial transparent opacity={0} />
        </mesh>
    );
}

export default function DiceTray3D() {
    const rollId = useGameStore((s) => s.rollId);

    // 트레이 경계
    const L = 9.0;
    const Z = 4.0;
    const H = 4.0;
    const T = 0.6;

    // 우 -> 좌 주사위 던지기를 위한 스폰
    const spawns = useMemo<Vec3[]>(() => {
        return Array.from({ length: 5 }, (_, i) => {
            const x = L - 1.3 +i * 0.15;
            const y = 2.0 + i * 0.18;
            const z = (i - 2) * 0.65;
            return [x, y, z];
        });
    }, []);

    return (
        <div
            style={{
                height: 420,
                borderRadius: 18,
                border: "1px solid #ebeef7",
                overflow: "hidden",
                background: "linear-grandient(180deg, #f6f7fb 0%, #ffffff 70%)",
            }}
        >
            <Canvas shadows>
                {/* Top-Down */}
                <OrthographicCamera
                    makeDefault
                    position={[0, 12, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    zoom={70}
                />

                <ambientLight intensity={0.7}/>
                <directionalLight position={[6, 10, 6]} intensity={0.9} castShadow />

                <Physics gravity={[0, -9.81, 0]} allowSleep>
                    <Floor />
                    
                    {/* wall */}
                    <StaticBox position={[L, H / 2, 0]} size={[T, H, Z * 2 + 10]} />
                    <StaticBox position={[-L, H / 2, 0]} size={[T, H, Z * 2 + 10]} />
                    <StaticBox position={[0, H / 2, Z]}  size={[L * 2 + 10, H, T]} />
                    <StaticBox position={[0, H / 2, -Z]}  size={[L * 2 + 10, H, T]} />

                    {/* ceiling */}
                    <StaticBox position={[0, H + 0.7, 0]} size={[L * 2 + 10, T, Z * 2 + 10]} />

                    {spawns.map((spawn, i) => (
                        <Die3D
                            key={i}
                            index={i}
                            rollId={rollId}
                            spawn={spawn}
                            modelScale={1}
                            colliderSize={[1, 1, 1]}
                            impulseBase={[-10, 6, 0]}
                            torqueBase={[6, 10, 6]}
                        />
                    ))}
                </Physics>

                <OrbitControls enableRotate={false} enableZoom={false} enablePan={false} />
            </Canvas>
        </div>
    );
}