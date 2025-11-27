"use client";

import { useRef, ReactNode } from "react";
import { useDrag } from "@use-gesture/react";
import * as THREE from "three";

interface DraggableProps {
  children: ReactNode;
  position: [number, number, number];
  onDrag: (pos: [number, number, number]) => void;
}

export default function Draggable({ children, position, onDrag }: DraggableProps) {
  const ref = useRef<THREE.Group>(null);

  const bind = useDrag(({ movement: [mx, my] }) => {
    const x = position[0] + mx / 100;
    const y = position[1];
    const z = position[2] + my / 100;

    onDrag([x, y, z]);
  });

  return (
    <group ref={ref} {...bind()} position={position}>
      {children}
    </group>
  );
}
