import { Quaternion, Vector3 } from "three";

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export type FaceId = "+X" | "-X" | "+Y" | "-Y" | "+Z" | "-Z";

const AXES = {
	X: new Vector3(1, 0, 0),
	Y: new Vector3(0, 1, 0),
	Z: new Vector3(0, 0, 1),
};

// 1) 먼저 "윗면이 어느 축 방향인지"만 판정
export const topFaceIdFromQuaternion = (q: Quaternion): FaceId => {
	const up = new Vector3(0, 1, 0);

	const x = AXES.X.clone().applyQuaternion(q);
	const y = AXES.Y.clone().applyQuaternion(q);
	const z = AXES.Z.clone().applyQuaternion(q);

	const dx = x.dot(up);
	const dy = y.dot(up);
	const dz = z.dot(up);

	const adx = Math.abs(dx);
	const ady = Math.abs(dy);
	const adz = Math.abs(dz);

	if (ady >= adx && ady >= adz) return dy > 0 ? "+Y" : "-Y";
	if (adz >= adx && adz >= ady) return dz > 0 ? "+Z" : "-Z";
	return dx > 0 ? "+X" : "-X";
};

// 2) 그 다음 "그 축 방향이 실제로 몇 점인지"를 GLB에 맞게 매핑
//    아래 값은 "당신 GLB에 맞게" 한 번만 수정하면 끝입니다.
const FACE_TO_VALUE: Record<FaceId, DieValue> = {
	"+Y": 1,
	"-Y": 6,
	"+Z": 2,
	"-Z": 5,
	"+X": 4,
	"-X": 3,
};

export const topFaceFromQuaternion = (q: Quaternion): DieValue => {
	const face = topFaceIdFromQuaternion(q);
	return FACE_TO_VALUE[face];
};