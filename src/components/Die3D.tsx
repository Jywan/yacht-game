import { useEffect, useMemo, useRef } from "react";
import { Quaternion, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CuboidCollider, type RapierRigidBody } from "@react-three/rapier";
import { RigidBodyType } from "@dimforge/rapier3d-compat";
import type { DieValue } from "../domain/dice";

type Vec3 = [number, number, number];

type Props = {
	index: number;
	value: DieValue;
	held: boolean;
	rollId: number;
	alignTick: number;
	targetPosition: Vec3;
	spawnPosition: Vec3;
	onToggleHold?: (index: number) => void;

	// “이 주사위 값 확정” 콜백
	onValueFinalized?: (index: number, value: DieValue) => void;

	limits: { x: number; z: number };
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function getTopFaceValueFromQuat(q: { x: number; y: number; z: number; w: number }): DieValue {
	const quat = new Quaternion(q.x, q.y, q.z, q.w);

	// “물리적으로 위”는 월드 +Y
	const worldUp = new Vector3(0, 1, 0);

	// PIPS 배치 기준(face-value)
	const candidates: { normal: Vector3; value: DieValue }[] = [
		{ normal: new Vector3(0, 1, 0), value: 1 },   // +Y
		{ normal: new Vector3(0, -1, 0), value: 6 },  // -Y
		{ normal: new Vector3(0, 0, 1), value: 2 },   // +Z
		{ normal: new Vector3(0, 0, -1), value: 5 },  // -Z
		{ normal: new Vector3(1, 0, 0), value: 3 },   // +X
		{ normal: new Vector3(-1, 0, 0), value: 4 },  // -X
	];

	let bestVal: DieValue = 1;
	let bestDot = -Infinity;

	for (const c of candidates) {
		const worldNormal = c.normal.clone().applyQuaternion(quat);
		const d = worldNormal.dot(worldUp);
		if (d > bestDot) {
			bestDot = d;
			bestVal = c.value;
		}
	}

	return bestVal;
}

export default function Die3D({
	index,
	held,
	rollId,
	alignTick,
	targetPosition,
	spawnPosition,
	onToggleHold,
	onValueFinalized,
	limits,
}: Props) {
	const bodyRef = useRef<RapierRigidBody | null>(null);

	const heldRef = useRef<boolean>(held);
	const targetRef = useRef<Vec3>(targetPosition);
	const spawnRef = useRef<Vec3>(spawnPosition);

	// 이번 롤에서 확정됐는지
	const finalizedRef = useRef(false);

	// “충분히 멈춤” 연속 프레임 카운터
	const settleFramesRef = useRef(0);

	useEffect(() => {
		heldRef.current = held;
	}, [held]);

	useEffect(() => {
		targetRef.current = targetPosition;
	}, [targetPosition]);

	useEffect(() => {
		spawnRef.current = spawnPosition;
	}, [spawnPosition]);

	// rollId가 바뀌면(새로 던지기 시작) 상태 리셋 + 던지기
	useEffect(() => {
		const rb = bodyRef.current;
		if (!rb) return;

		settleFramesRef.current = 0;
		finalizedRef.current = false;

		if (heldRef.current) return;

		// Fixed였던 것도 다시 굴릴 수 있게 Dynamic으로 복구 + wake
		rb.setBodyType(RigidBodyType.Dynamic, true);
		rb.wakeUp?.();

		const [sx, sy, sz] = spawnRef.current;

		rb.setTranslation({ x: sx, y: sy, z: sz }, true);
		rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
		rb.setAngvel({ x: 0, y: 0, z: 0 }, true);

		rb.applyImpulse(
			{
				x: rand(5.2, 6.8),
				y: rand(0.9, 1.6),
				z: rand(-1.2, 1.2),
			},
			true
		);

		rb.applyTorqueImpulse(
			{
				x: rand(-2.4, 2.4),
				y: rand(-3.0, 3.0),
				z: rand(-2.4, 2.4),
			},
			true
		);
	}, [rollId]);

	/* =======================
		PIPS
	======================= */
	const pipMeshes = useMemo(() => {
		const PIPS: Record<DieValue, [number, number][]> = {
			1: [[2, 2]],
			2: [[1, 1], [3, 3]],
			3: [[1, 1], [2, 2], [3, 3]],
			4: [[1, 1], [1, 3], [3, 1], [3, 3]],
			5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
			6: [[1, 1], [1, 2], [1, 3], [3, 1], [3, 2], [3, 3]],
		};

		const FACE_VALUE: { face: "+X" | "-X" | "+Y" | "-Y" | "+Z" | "-Z"; value: DieValue }[] = [
			{ face: "+X", value: 3 },
			{ face: "-X", value: 4 },
			{ face: "+Y", value: 1 },
			{ face: "-Y", value: 6 },
			{ face: "+Z", value: 2 },
			{ face: "-Z", value: 5 },
		];

		const step = 0.24;
		const offset = 0.501;
		const r = 0.075;

		const toXY = (row: number, col: number) => [(col - 2) * step, (2 - row) * step] as const;

		return FACE_VALUE.flatMap(({ face, value }) =>
			PIPS[value].map(([row, col], i) => {
				const [x, y] = toXY(row, col);

				let pos: Vec3 = [0, 0, 0];
				let rot: Vec3 = [0, 0, 0];

				switch (face) {
					case "+Y":
						pos = [x, offset, y];
						rot = [-Math.PI / 2, 0, 0];
						break;
					case "-Y":
						pos = [x, -offset, -y];
						rot = [Math.PI / 2, 0, 0];
						break;
					case "+Z":
						pos = [x, y, offset];
						break;
					case "-Z":
						pos = [-x, y, -offset];
						rot = [0, Math.PI, 0];
						break;
					case "+X":
						pos = [offset, y, -x];
						rot = [0, Math.PI / 2, 0];
						break;
					case "-X":
						pos = [-offset, y, x];
						rot = [0, -Math.PI / 2, 0];
						break;
				}

				return (
					<mesh key={`${face}-${i}`} position={pos} rotation={rot}>
						<circleGeometry args={[r, 24]} />
						<meshStandardMaterial color="#111" roughness={0.55} metalness={0} />
					</mesh>
				);
			})
		);
	}, []);

	/* =======================
		held 처리
	======================= */
	useEffect(() => {
		const rb = bodyRef.current;
		if (!rb) return;

		if (held) {
			rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
			rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
			rb.setBodyType(RigidBodyType.KinematicPositionBased, true);
		} else {
			// held 해제하면 다시 굴릴 수 있어야 함
			rb.setBodyType(RigidBodyType.Dynamic, true);
			rb.wakeUp?.();
		}
	}, [held]);

	/* =======================
		프레임 루프
		- 경계 클램프(탈출 방지)
		- held는 keep 슬롯으로 이동
		- unheld는 “정착 판정” 후 값 확정
	======================= */
	useFrame(() => {
		const rb = bodyRef.current;
		if (!rb) return;

		// held: keep 슬롯으로 이동 (kinematic)
		if (heldRef.current) {
			const [tx, ty, tz] = targetRef.current;
			rb.setNextKinematicTranslation({ x: tx, y: ty, z: tz });
			return;
		}

		// unheld + 이미 확정이면 아무 것도 하지 않음 (Fixed로 잠겨 있음)
		if (finalizedRef.current) return;

		// 경계 클램프
		const t = rb.translation();
		const cx = Math.max(-limits.x, Math.min(limits.x, t.x));
		const cz = Math.max(-limits.z, Math.min(limits.z, t.z));
		if (cx !== t.x || cz !== t.z) {
			rb.setTranslation({ x: cx, y: t.y, z: cz }, true);
			const lv = rb.linvel();
			rb.setLinvel({ x: lv.x * 0.6, y: lv.y, z: lv.z * 0.6 }, true);
		}

		// 정착 판정(속도가 충분히 낮은 상태가 연속으로 유지될 때)
		const lv = rb.linvel();
		const av = rb.angvel();

		const linSpeed = Math.hypot(lv.x, lv.y, lv.z);
		const angSpeed = Math.hypot(av.x, av.y, av.z);

		const LIN_TH = 0.18;
		const ANG_TH = 0.25;
		const NEED_FRAMES = 18; // 약 0.3s 정도(60fps 기준)

		if (linSpeed < LIN_TH && angSpeed < ANG_TH) {
			settleFramesRef.current += 1;
		} else {
			settleFramesRef.current = 0;
		}

		if (settleFramesRef.current >= NEED_FRAMES) {
			// 값 확정
			const rot = rb.rotation();
			const topValue = getTopFaceValueFromQuat(rot);

			onValueFinalized?.(index, topValue);

			// 이후 흔들림/변조 방지: 완전 고정
			rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
			rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
			rb.setBodyType(RigidBodyType.Fixed, true);
			rb.sleep?.();

			finalizedRef.current = true;
		}
	});

	// alignTick(전부 정착 후) — 위치만 1열 정렬, 회전은 유지
	useEffect(() => {
		const rb = bodyRef.current;
		if (!rb) return;
		if (heldRef.current) return;

		const [tx, ty, tz] = targetRef.current;
		rb.setTranslation({ x: tx, y: ty, z: tz }, true);
	}, [alignTick]);

	return (
		<RigidBody
			ref={bodyRef}
			colliders={false}
			restitution={0.25}
			friction={0.9}
			linearDamping={0.45}
			angularDamping={0.35}
			ccd
		>
			{!held && <CuboidCollider args={[0.5, 0.5, 0.5]} />}

			<mesh
				castShadow={!held}
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
				<meshStandardMaterial color={held ? "#dcdfe6" : "#ffffff"} roughness={0.35} metalness={0.05} />
				{pipMeshes}
			</mesh>
		</RigidBody>
	);
}