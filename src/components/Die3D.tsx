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

const PIPS: Record<DieValue, [number, number][]> = {
    1: [[2, 2]],
    2: [[1, 1], [3, 3]],
    3: [[1, 1], [2, 2], [3, 3]],
    4: [[1, 1], [1, 3], [3, 1], [3, 3]],
    5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
    6: [[1, 1], [1, 2], [1, 3], [3, 1], [3, 2], [3, 3]],
}

const FACE_VALUE: { face: "+X" | "-X" | "+Y" | "-Y" | "+Z" | "-Z"; value: DieValue }[] = [
    { face: "+X", value: 3 },
    { face: "-X", value: 4 },
    { face: "+Y", value: 1 },
    { face: "-Y", value: 6 },
    { face: "+Z", value: 2 },
    { face: "-Z", value: 5 },
];

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

    // 점 위치 계산: 3x3 그리드를 -1 ~ 1 좌표로 계산
    const pipMeshes = useMemo(() => {
        const step = 0.24;          // 점 간격
        const offset = 0.501;       // 면(0.5) + 살짝: z-fighting 방지
        const r = 0.075;            // 점 크기(원판 반지름)
        const color = "#111";

        const toXY = (row: number, col: number) => {
            const x = (col - 2) * step;
            const y = (2 - row) * step;
            return [x, y] as const;
        };

        const buildFacePips = (face: "+X" | "-X" | "+Y" | "-Y" | "+Z" | "-Z", faceValue: DieValue) => {
            const coords = PIPS[faceValue];

            return coords.map(([row, col], i) => {
                const [x, y] = toXY(row, col);

                let pos: [number, number, number] = [0, 0, 0];
            let rot: [number, number, number] = [0, 0, 0];

            switch (face) {
              case "+Y": // top
                pos = [x, offset, y];
                rot = [-Math.PI / 2, 0, 0];
                break;
              case "-Y": // bottom
                pos = [x, -offset, -y];
                rot = [Math.PI / 2, 0, 0];
                break;
              case "+Z": // front
                pos = [x, y, offset];
                rot = [0, 0, 0];
                break;
              case "-Z": // back
                pos = [-x, y, -offset];
                rot = [0, Math.PI, 0];
                break;
              case "+X": // right
                pos = [offset, y, -x];
                rot = [0, Math.PI / 2, 0];
                break;
              case "-X": // left
                pos = [-offset, y, x];
                rot = [0, -Math.PI / 2, 0];
                break;
            }

            return (
                <mesh key={`${face}-${i}`} position={pos} rotation={rot}>
                    <circleGeometry args={[r, 24]} />
                    <meshStandardMaterial
                        color={color}
                        roughness={0.55}
                        metalness={0}
                        polygonOffset
                        polygonOffsetFactor={-1}
                        polygonOffsetUnits={-1}
                    />
                </mesh>
                );
            });
        };
    
        return FACE_VALUE.flatMap((f) => buildFacePips(f.face, f.value));
    }, []);
    
    return (
        <mesh 
            ref={meshRef}
            position={position}
            castShadow
            receiveShadow
            onClick={() => onToggleHold?.(index)}
            onPointerOver={() => {
                document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
                document.body.style.cursor = "default";
            }}
        >   
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
                color={held ? "#dcdfe6" : "#ffffff"}
                roughness={0.35}
                metalness={0.05}
            />

            {pipMeshes}
        </mesh>
    )

}