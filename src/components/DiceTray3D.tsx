import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import Die3D from "./Die3D";
import { useGameStore } from "../store/gameStore";

type Vec3 = [number, number, number];

function seededRand01(seed: number) {
	const x = Math.sin(seed * 999.123) * 10000;
	return x - Math.floor(x);
}
function seededRand(seed: number, min: number, max: number) {
	return min + seededRand01(seed) * (max - min);
}

export default function DiceTray3D() {
	const dice = useGameStore((s) => s.dice);
	const held = useGameStore((s) => s.held);
	const rollId = useGameStore((s) => s.rollId);
	const toggleHold = useGameStore((s) => s.toggleHold);
	const phase = useGameStore((s) => s.phase);

	const [alignTick, setAlignTick] = useState(0);

	const heldIdx = useMemo(() => dice.map((_, i) => i).filter((i) => held[i]), [dice, held]);
	const freeIdx = useMemo(() => dice.map((_, i) => i).filter((i) => !held[i]), [dice, held]);

	// 이번 roll에서 “확정된” unheld 주사위 추적
	const finalizedSetRef = useRef<Set<number>>(new Set());

	useEffect(() => {
		finalizedSetRef.current = new Set();
	}, [rollId]);

	const spacing = 1.25;
	const slotX = (slot: number, total: number) => (slot - (total - 1) / 2) * spacing;

	const yDice = 0.0;

	const rollZ = 0.75;
	const keepZ = -1.35;

	const targets = new Map<number, Vec3>();
	freeIdx.forEach((i, s) => targets.set(i, [slotX(s, freeIdx.length), yDice, rollZ]));
	heldIdx.forEach((i, s) => targets.set(i, [slotX(s, heldIdx.length), yDice, keepZ]));

	const spawnX = -6.0;

	// 트레이 경계(벽 + 클램프)
	const LIMIT_X = 7.2;
	const LIMIT_Z = 2.9;

	const WALL_T = 0.9;
	const WALL_H = 4.0;

	const handleValueFinalized = (index: number, val: any) => {
		// store 반영
		useGameStore.getState().setDieValue(index, val);

		// 집계(held는 제외)
		if (held[index]) return;

		const set = finalizedSetRef.current;
		set.add(index);

		const allDone = freeIdx.every((i) => set.has(i));
		if (allDone) setAlignTick((t) => t + 1);
	};

	return (
		<div
			style={{
				height: 320,
				borderRadius: 18,
				border: "1px solid #ebeef7",
				background: "linear-gradient(180deg, #f6f7fb 0%, #ffffff 70%)",
				overflow: "hidden",
			}}
		>
			<Canvas shadows>
				<OrthographicCamera makeDefault position={[0, 10, 0]} rotation={[-Math.PI / 2, 0, 0]} zoom={62} />

				<ambientLight intensity={0.75} />

				<directionalLight
					position={[6, 10, 6]}
					intensity={0.9}
					castShadow
					shadow-mapSize-width={2048}
					shadow-mapSize-height={2048}
					shadow-bias={-0.0003}
					shadow-normalBias={0.02}
				/>

				<Physics gravity={[0, -9.81, 0]}>
					<RigidBody type="fixed" colliders={false}>
						<CuboidCollider args={[50, 0.3, 50]} position={[0, -0.85, 0]} />
					</RigidBody>

					<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} receiveShadow>
						<planeGeometry args={[60, 60]} />
						<shadowMaterial opacity={0.18} />
					</mesh>

					<RigidBody type="fixed" colliders={false}>
						<CuboidCollider args={[WALL_T, WALL_H, LIMIT_Z + 4]} position={[-LIMIT_X, 1, 0]} />
						<CuboidCollider args={[WALL_T, WALL_H, LIMIT_Z + 4]} position={[LIMIT_X, 1, 0]} />
						<CuboidCollider args={[LIMIT_X + 4, WALL_H, WALL_T]} position={[0, 1, LIMIT_Z]} />
						<CuboidCollider args={[LIMIT_X + 4, WALL_H, WALL_T]} position={[0, 1, -LIMIT_Z]} />
					</RigidBody>

					<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.81, keepZ]}>
						<planeGeometry args={[14, 2.8]} />
						<meshStandardMaterial color="#f0f2f7" roughness={1} metalness={0} />
					</mesh>
					<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.81, rollZ]}>
						<planeGeometry args={[14, 2.8]} />
						<meshStandardMaterial color="#ffffff" roughness={1} metalness={0} />
					</mesh>

					{dice.map((v, i) => {
						const seed = rollId * 100 + i * 7;
						const spawnZ = seededRand(seed, -1.6, 1.6);
						const spawnY = 0.35;

						const spawn: Vec3 = [spawnX, spawnY, spawnZ];
						const target: Vec3 = targets.get(i) ?? [0, yDice, rollZ];

						return (
							<Die3D
								key={i}
								index={i}
								value={v}
								held={held[i]}
								rollId={rollId}
								alignTick={alignTick}
								spawnPosition={spawn}
								targetPosition={target}
								onToggleHold={phase === "rolling" ? toggleHold : undefined}
								onValueFinalized={handleValueFinalized}
								limits={{ x: LIMIT_X, z: LIMIT_Z }}
							/>
						);
					})}
				</Physics>

				<OrbitControls enableZoom={false} enableRotate={false} enablePan={false} />
			</Canvas>
		</div>
	);
}