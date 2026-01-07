import { useEffect, useMemo, useRef } from "react";
import { Box3, Quaternion, Vector3 } from "three";
import { useBox } from "@react-three/cannon";
import { useGLTF } from "@react-three/drei";
import { topFaceFromQuaternion, topFaceIdFromQuaternion } from "../domain/diceMath";
import { useGameStore } from "../store/gameStore";

type Vec3 = [number, number, number];

type Props = {
    rollId: number;
    index: number;
    spawn: Vec3;

    modelScale?: number;

    impulseBase?: Vec3;
    torqueBase?: Vec3;

    colliderInflate?: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const sign = () => (Math.random() < 0.5 ? -1 : 1);

export default function Die3D({
    rollId,
    index,
    spawn,
    modelScale = 1,
    impulseBase = [-10, 6.2, 0],
    torqueBase = [14, 22, 14],
    colliderInflate = 1.08,
}: Props) {
    const { scene } = useGLTF("/assets/dice.glb");
    const model = useMemo(() => scene.clone(true), [scene]);

    const reportDieValue = useGameStore((s) => s.reportDieValue);

    const colliderSize: Vec3 = useMemo(() => {
        const box = new Box3().setFromObject(model);
        const size = new Vector3();
        box.getSize(size);

        const sx = size.x * modelScale * colliderInflate;
        const sy = size.y * modelScale * colliderInflate;
        const sz = size.z * modelScale * colliderInflate;

        return [
            Math.max(0.6, sx),
            Math.max(0.6, sy),
            Math.max(0.6, sz),
        ];
    }, [model, modelScale, colliderInflate]);

    const spawnRef = useRef<Vec3>(spawn);
    useEffect(() => {
        spawnRef.current = spawn;
    }, [spawn]);

    // useBox api가 리렌더에서 바뀌어도 로직이 흔들리지 않도록 ref로 고정
    const [ref, api] = useBox(() => ({
        mass: 1,
        args: colliderSize,
        position: spawn,
        linearDamping: 0.38,
        angularDamping: 0.22,
        material: { friction: 0.9, restitution: 0.45 },
        sleepSpeedLimit: 0.2,
        sleepTimeLimit: 0.8,
    }));

    const apiRef = useRef(api);
    useEffect(() => {
        apiRef.current = api;
    }, [api]);

    // rollId 기준 "던지기 1회" 보장
    const thrownRollIdRef = useRef<number>(-1);

    // settle 감지 관련
    const settledRollIdRef = useRef<number>(-1);
    const stillFramesRef = useRef(0);
    const rollStartRef = useRef(0);

    // roll (던지기) — rollId당 1회만
    useEffect(() => {
        if (rollId === 0) return;

        // ✅ 이미 이 rollId로 던졌으면 절대 재실행 금지
        if (thrownRollIdRef.current === rollId) return;
        thrownRollIdRef.current = rollId;

        // 이번 rollId settle 리셋
        settledRollIdRef.current = -1;
        stillFramesRef.current = 0;
        rollStartRef.current = performance.now();

        const a = apiRef.current;
        const [sx, sy, sz] = spawnRef.current;

        a.wakeUp();

        a.position.set(sx, sy, sz);
        a.velocity.set(0, 0, 0);
        a.angularVelocity.set(0, 0, 0);

        const hx = colliderSize[0] * 0.5;
        const hy = colliderSize[1] * 0.5;
        const hz = colliderSize[2] * 0.5;

        const hitOffset: Vec3 = [
            sign() * rand(hx * 0.85, hx * 0.98),
            rand(hy * 0.60, hy * 0.95),
            sign() * rand(hz * 0.85, hz * 0.98),
        ];

        const hitWorld: Vec3 = [
            sx + hitOffset[0],
            sy + hitOffset[1],
            sz + hitOffset[2],
        ];

        a.applyImpulse(
            [
                impulseBase[0] + rand(-2.5, 1.5),
                impulseBase[1] * 1.6 + rand(1.2, 2.4),
                impulseBase[2] + rand(-1.4, 1.4),
            ],
            hitWorld
        );

        a.applyTorque([
            torqueBase[0] * 1.8 + rand(-4.5, 4.5),
            torqueBase[1] * 1.1 + rand(-3.2, 3.2),
            torqueBase[2] * 1.8 + rand(-4.5, 4.5),
        ]);

        a.angularVelocity.set(
            rand(-28, 28),
            rand(-6, 6),
            rand(-28, 28)
        );
    }, [rollId, colliderSize, impulseBase, torqueBase]);

    // settle 감지 + 윗면 값 계산 (rollId당 1회 report)
    useEffect(() => {
        let v: Vec3 = [0, 0, 0];
        let av: Vec3 = [0, 0, 0];
        let p: Vec3 = spawn;
        let qArr: [number, number, number, number] = [0, 0, 0, 1];

        const a = apiRef.current;

        const unsubV = a.velocity.subscribe((x) => (v = x as any));
        const unsubAV = a.angularVelocity.subscribe((x) => (av = x as any));
        const unsubP = a.position.subscribe((x) => (p = x as any));
        const unsubQ = a.quaternion.subscribe((x) => (qArr = x as any));

        const id = window.setInterval(() => {
            if (rollId === 0) return;

            // ✅ 이미 이번 rollId settle 처리했다면 종료
            if (settledRollIdRef.current === rollId) return;

            const elapsed = performance.now() - rollStartRef.current;
            const lin = Math.hypot(v[0], v[1], v[2]);
            const ang = Math.hypot(av[0], av[1], av[2]);

            const onFloor = p[1] < 1.2;

            if (elapsed > 650 && onFloor && lin < 0.20 && ang < 0.24) {
                stillFramesRef.current += 1;
            } else {
                stillFramesRef.current = 0;
            }

            if (stillFramesRef.current >= 18) {
                settledRollIdRef.current = rollId;

                const q = new Quaternion(qArr[0], qArr[1], qArr[2], qArr[3]);
                const faceId = topFaceIdFromQuaternion(q);
                console.log(`Die ${index} faceId:`, faceId);

                const top = topFaceFromQuaternion(q);
                reportDieValue(index, top);
            }
        }, 16);

        return () => {
            window.clearInterval(id);
            unsubV();
            unsubAV();
            unsubP();
            unsubQ();
        };
    }, [rollId, index, reportDieValue, spawn]);

    return (
        <group ref={ref as any} name={`die-${index}`}>
            <primitive object={model} scale={modelScale} />
        </group>
    );
}

useGLTF.preload("/assets/dice.glb");