"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Draggable from "../DraggableTables";
import Label from "../Label";
import { useSchema } from "@/store/schemaStore";

//Three.js = 3D engine
//React = UI framework
//React Three Fiber = a bridge that allows you to write Three.js scenes using React

interface Table {
  id: string;
  name: string;
  color: string;
  position: [number, number, number];
}

interface InteractiveBoxProps {
  table: Table;
}

const InteractiveBox = ({ table }: InteractiveBoxProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Zustand actions(Zustand is a state management library used to manage your app's data in React and Next. js)
  const connectMode = useSchema((s) => s.connectMode);
  const setConnectMode = useSchema((s) => s.setConnectMode);
  const addRelationship = useSchema((s) => s.addRelationship);
  const setSelected = useSchema((s) => s.setSelected);
  const updateTablePosition = useSchema((s) => s.updateTablePosition);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
    }
  });

  return (
    <Draggable
      position={table.position}
      onDrag={(pos) => updateTablePosition(table.id, pos)}
    >
      <mesh
        ref={ref}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => {
          if (connectMode) {
            addRelationship(connectMode, table.id);
            setConnectMode(null);
          } else {
            setSelected(table.id);
          }
        }}
      >
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color={hovered ? "orange" : table.color} />
        <Label text={table.name} />
      </mesh>
    </Draggable>
  );
}

export default InteractiveBox