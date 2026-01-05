import { useRef, useEffect } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";

type Props = {
    value: number;
    held: boolean;
    rollid: number;
    position: [number, number, number];
};
