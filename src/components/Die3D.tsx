import { useRef, useMemo, useEffect } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import type { DieValue } from "../domain/dice";
import { ROTATION_MAP, randomRotation } from "../domain/dice3d";

type Vec3 = [number, number, number];

type Props = {
    index: number;
    value: DieValue;
    held: boolean;
    rollId: number;
    position: Vec3;
    onToggleHold?: (index: number) => void;
    lerp?: number;
};

export default function Die3D({ index, value, held, rollId, position, onToggleHold, lerp = 0.16 }: Props) {
    const meshRef = useRef<Mesh>(null!);
    const targetRot = useRef<Vec3>(ROTATION_MAP[value]);

    useEffect(() => {
        targetRot.current = ROTATION_MAP[value];
        if (held) return;

        const [rx, ry, rz] = randomRotation();
        meshRef.current.rotation.set(rx, ry, rz);
    }, [rollId, value, held]);

    useFrame(() => {
        const m = meshRef.current;
        const [tx, ty, tz] = targetRot.current;

        m.rotation.x += (tx - m.rotation.x) * lerp;
        m.rotation.y += (ty - m.rotation.y) * lerp;
        m.rotation.z += (tz - m.rotation.z) * lerp;
    });

    const handlers = useMemo(() => ({
            onClick: () => onToggleHold?.(index),
        }),
        [index, onToggleHold]
    );

    return (
        <mesh ref={meshRef} position={position} castShadow receiveShadow {...handlers}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={held ? "#dcdfe6" : "#ffffff"} roughness={0.35} metalness={0.05} />
        </mesh>
    );
}