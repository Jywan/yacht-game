import { useEffect, useRef } from "react";
import { Quaternion } from "three";
import { useBox } from "@react-three/cannon";
import { topFaceFromQuaternion } from "../domain/diceMath";
import { useGameStore } from "../store/gameStore";

type Props = {
    rollId: number;
    spawn: [number, number, number];
};

export default function Die3D({ rollId, spawn }: Props) {
    const reportTopValue = useGameStore((s) => s.reportTopValue);

    const settledRef = useRef(false);
    const stillFramesRef = useRef(0);
    const rollStartRef = useRef(0);

    const [ref, api] = useBox(() => ({
        mass: 1,
        args: [1, 1, 1],
        position: spawn,
        linearDamping: 0.35,
        angularDamping: 0.35,
    }));

    // roll
    useEffect(() => {
        settledRef.current = false;
        stillFramesRef.current = 0;
        rollStartRef.current = performance.now();

        api.position.set(spawn[0], spawn[1], spawn[2]);
        api.velocity.set(-7, 2, (Math.random() - 0.5) * 2);
        api.angularVelocity.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8
        );
    }, [rollId]);

    // settle detection
    useEffect(() => {
        let v: [number, number, number] = [0, 0, 0];
        let av: [number, number, number] = [0, 0, 0];
        let p: [number, number, number] = spawn;
        let qArr: [number, number, number, number] = [0, 0, 0, 1];

        const unsubV = api.velocity.subscribe((x) => (v = x as any));
        const unsubAV = api.angularVelocity.subscribe((x) => (av = x as any));
        const unsubP = api.position.subscribe((x) => (p = x as any));
        const unsubQ = api.quaternion.subscribe((x) => (qArr = x as any));

        const id = window.setInterval(() => {
        if (settledRef.current) return;

        const elapsed = performance.now() - rollStartRef.current;
        const lin = Math.hypot(v[0], v[1], v[2]);
        const ang = Math.hypot(av[0], av[1], av[2]);
        const onFloor = p[1] < 0.62;

        if (elapsed > 700 && onFloor && lin < 0.12 && ang < 0.18) {
            stillFramesRef.current += 1;
        } else {
            stillFramesRef.current = 0;
        }

        if (stillFramesRef.current >= 18) {
            settledRef.current = true;
            const q = new Quaternion(qArr[0], qArr[1], qArr[2], qArr[3]);
            reportTopValue(topFaceFromQuaternion(q));
        }
        }, 16);

        return () => {
        window.clearInterval(id);
        unsubV();
        unsubAV();
        unsubP();
        unsubQ();
        };
    }, []);

    return (
        <mesh ref={ref as any} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#fff" />
        </mesh>
    );
}