import { Quaternion, Vector3 } from "three";
import type { DieValue } from "./dice";

/**
 * 주사위 로컬 기준 면
 * +Y:1, -Y:6, +Z:2, -Z:5, +X:3, -X:4
 */
const FACES: { normal: Vector3; value: DieValue }[] = [
    { normal: new Vector3(0, 1, 0), value: 1 },
    { normal: new Vector3(0, -1, 0), value: 6 },
    { normal: new Vector3(0, 0, 1), value: 2 },
    { normal: new Vector3(0, 0, -1), value: 5 },
    { normal: new Vector3(1, 0, 0), value: 3 },
    { normal: new Vector3(-1, 0, 0), value: 4 },
];

export function topFaceFromQuaternion(q: Quaternion): DieValue {
    const up = new Vector3(0, 1, 0); // 월드 기준 위

    let bestVal: DieValue = 1;
    let bestDot = -Infinity;

    for (const f of FACES) {
        const worldNormal = f.normal.clone().applyQuaternion(q);
        const dot = worldNormal.dot(up);

        if (dot > bestDot) {
            bestDot = dot;
            bestVal = f.value;
        }
    }

    return bestVal;
}