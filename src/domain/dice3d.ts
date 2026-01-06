import type { DieValue } from "./dice";

export const ROTATION_MAP: Record<DieValue, [number, number, number]> = {
    1: [0, 0, 0],                  // top already 1
    2: [-Math.PI / 2, 0, 0],       // front(+Z=2) -> top(+Y)
    3: [0, 0, Math.PI / 2],        // right(+X=3) -> top(+Y)
    4: [0, 0, -Math.PI / 2],       // left(-X=4) -> top(+Y)
    5: [Math.PI / 2, 0, 0],        // back(-Z=5) -> top(+Y)
    6: [Math.PI, 0, 0],            // bottom(-Y=6) -> top(+Y)
};

export const randomRotation = (): [number, number, number] => [
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
];