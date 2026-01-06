import type { DieValue } from "./dice";

export const ROTATION_MAP: Record<DieValue, [number, number, number]> = {
    1: [0, 0, 0],
    2: [0, 0, Math.PI / 2],
    3: [0, 0, Math.PI],
    4: [0, 0, -Math.PI / 2],
    5: [Math.PI / 2, 0, 0],
    6: [-Math.PI / 2, 0, 0],
};

export const randomRotation = (): [number, number, number] => [
  Math.random() * Math.PI * 2,
  Math.random() * Math.PI * 2,
  Math.random() * Math.PI * 2,
];