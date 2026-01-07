import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, OrbitControls } from "@react-three/drei";
import { Physics, usePlane, useBox } from "@react-three/cannon";
import Die3D from "./Die3D";
import { useGameStore } from "../store/gameStore";

function Floor() {
    const [ref] = usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, 0, 0],
    }));

    return (
        <mesh ref={ref as any} receiveShadow>
            <planeGeometry args={[40, 20]} />
            <meshStandardMaterial color="#f6f7fb" />
        </mesh>
    );
}

function Wall({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
    const [ref] = useBox(() => ({
        type: "Static",
        args: size,
        position,
    }));

    return (
        <mesh ref={ref as any}>
            <boxGeometry args={size} />
            <meshStandardMaterial transparent opacity={0} />
        </mesh>
    );
}

export default function DiceTray3D() {
    const rollId = useGameStore((s) => s.rollId);

    return (
        <div style={{ height: 360, border: "1px solid #ebeef7", borderRadius: 18, overflow: "hidden" }}>
            <Canvas shadows>
                <OrthographicCamera makeDefault position={[0, 10, 0]} rotation={[-Math.PI / 2, 0, 0]} zoom={70} />
                <ambientLight intensity={0.7} />
                <directionalLight position={[6, 10, 6]} intensity={0.9} castShadow />

                <Physics gravity={[0, -9.81, 0]} allowSleep>
                    <Floor />

                    {/* walls */}
                    <Wall position={[7.5, 1.2, 0]} size={[0.4, 2.5, 12]} />
                    <Wall position={[-7.5, 1.2, 0]} size={[0.4, 2.5, 12]} />
                    <Wall position={[0, 1.2, 3.5]} size={[16, 2.5, 0.4]} />
                    <Wall position={[0, 1.2, -3.5]} size={[16, 2.5, 0.4]} />

                    <Die3D rollId={rollId} spawn={[6, 2.2, 0]} />
                </Physics>

                <OrbitControls enableRotate={false} enableZoom={false} enablePan={false} />
            </Canvas>
        </div>
    );
}