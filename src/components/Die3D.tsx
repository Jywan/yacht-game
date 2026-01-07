import { useEffect, useMemo, useRef } from "react";
import { useBox } from "@react-three/cannon";
import { useGLTF } from "@react-three/drei";

type Vec3 = [number, number, number];

type Props = {
    rollId: number;
    index: number;
    
    // 던질 때 시작 위치
    spawn: Vec3;
    
    // 우 -> 좌: x는 음수로
    impulseBase?: Vec3;
    torqueBase?: Vec3;

    // 모델/콜라이더 튜닝
    modelScale?: number;
    colliderSize?: Vec3;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export default function Die3D({
    rollId,
    index,
    spawn,
    impulseBase = [-10, 6, 0],
    torqueBase = [6, 10, 6],
    modelScale = 1,
    colliderSize = [1, 1, 1],
}: Props) {
    const { scene } = useGLTF("/assets/dice.glb");

    // glb 공유 방지
    const model = useMemo(() => scene.clone(), [scene]);

    // spawn이 리렌더 때마다 새 배열이 되지 않게 ref에 보관
    const spawnRef = useRef<Vec3>(spawn);
    useEffect(() => {
        spawnRef.current = spawn;
    }, [spawn]);

    const [ref, api] = useBox(() => ({
        mass: 1,
        args: colliderSize,
        position: spawn,
        linearDamping: 0.35,
        angularDamping: 0.35,
        material: { friction: 0.9, restitution: 0.2 },
    }));

    // Roll: 버튼으로 rollId가 바뀔 때만 동작
    useEffect(() => {
        if (rollId === 0) return;

        const [sx, sy, sz] = spawnRef.current;

        // 리셋
        api.position.set(sx, sy, sz);
        api.velocity.set(0, 0, 0);
        api.angularVelocity.set(0, 0, 0);

        // 우 -> 좌
        api.applyImpulse(
            [
                impulseBase[0] + rand(-1.2, 1.2),
                impulseBase[1] + rand(-0.6, 0.8),
                impulseBase[2] + rand(-1.0, 1.0),
            ],
            [0, 0, 0]
        );

        api.applyTorque(
            [
                impulseBase[0] + rand(-2.5, 2.5),
                impulseBase[1] + rand(-3.0, 3.0),
                impulseBase[2] + rand(-2.5, 2.5),
            ]
        );
    }, [rollId, api, impulseBase, torqueBase]);

    return (
        <group ref={ref as any} name={`die-${index}`}>
            <primitive object={model} scale={modelScale} />
        </group>
    );
}

useGLTF.preload("/assets/dice.glb")