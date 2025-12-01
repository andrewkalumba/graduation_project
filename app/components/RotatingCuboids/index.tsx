"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls, Html } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useSchema } from "@/store/schemaStore";
import { RotatingCuboidProps } from "@/types/rotatingCuboidProps";

const RotatingCuboid = ({
  id,
  position,
  dimensions,
  color,
  label,
  number,
  onContextMenu,
  onDragStart,
  onDragEnd,
}: RotatingCuboidProps) => {
  const ref = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const dragOffset = useRef(new THREE.Vector3());
  const hasMoved = useRef(false);

  // Get store actions
  const selected = useSchema((s) => s.selected);
  const setSelected = useSchema((s) => s.setSelected);
  const connectMode = useSchema((s) => s.connectMode);
  const setConnectMode = useSchema((s) => s.setConnectMode);
  const addRelationship = useSchema((s) => s.addRelationship);
  const updateTablePosition = useSchema((s) => s.updateTablePosition);

  const isSelected = selected === id;
  const isConnectMode = connectMode === id;

  // Handle global pointer up to stop dragging even outside canvas
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDragging && groupRef.current) {
        setIsDragging(false);
        const finalPosition: [number, number, number] = [
          groupRef.current.position.x,
          groupRef.current.position.y,
          groupRef.current.position.z,
        ];
        updateTablePosition(id, finalPosition);
        onDragEnd?.();
      }
    };

    if (isDragging) {
      window.addEventListener('pointerup', handleGlobalPointerUp);
      return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
    }
  }, [isDragging, id, onDragEnd, updateTablePosition]);

  useFrame(() => {
    if (ref.current && !isDragging) {
      ref.current.rotation.x += 0.01;
      ref.current.rotation.y += 0.01;
    }
  });

  const handleClick = (e: any) => {
    // Don't trigger click if user was dragging
    if (hasMoved.current) {
      hasMoved.current = false;
      return;
    }

    e.stopPropagation();

    if (connectMode && connectMode !== id) {
      // Complete the connection
      console.log(`Creating relationship from ${connectMode} to ${id}`);
      addRelationship(connectMode, id);
      setConnectMode(null);
      setSelected(null);
    } else if (connectMode === id) {
      // Cancel connect mode
      console.log("Cancelled connect mode");
      setConnectMode(null);
    } else {
      // Select this cuboid
      console.log(`Selected ${id}`);
      setSelected(id);
    }
  };

  const handlePointerDown = (event: any) => {
    if (event.button === 2) { // Right click
      event.stopPropagation();
      console.log("Right-clicked cuboid:", id, label);
      if (onContextMenu && label) {
        // Convert 3D position to 2D screen position
        console.log("Triggering context menu at:", event.clientX, event.clientY);
        onContextMenu(event.clientX, event.clientY, id, label);
      } else {
        console.log("onContextMenu or label is missing:", { onContextMenu: !!onContextMenu, label });
      }
    } else if (event.button === 0 && groupRef.current) { // Left click - start dragging
      event.stopPropagation();

      // Set up drag plane at the cuboid's Z position
      const planeNormal = new THREE.Vector3(0, 0, 1);
      const planePoint = groupRef.current.position.clone();
      dragPlane.current.setFromNormalAndCoplanarPoint(planeNormal, planePoint);

      // Calculate intersection point
      const intersectionPoint = new THREE.Vector3();
      event.ray.intersectPlane(dragPlane.current, intersectionPoint);

      if (intersectionPoint) {
        dragOffset.current.copy(intersectionPoint).sub(groupRef.current.position);
        setIsDragging(true);
        hasMoved.current = false;
        onDragStart?.(); // Notify parent that dragging started
      }
    }
  };

  const handlePointerMove = (event: any) => {
    if (isDragging && groupRef.current) {
      event.stopPropagation();

      // Find intersection with drag plane
      const intersectionPoint = new THREE.Vector3();
      event.ray.intersectPlane(dragPlane.current, intersectionPoint);

      if (intersectionPoint) {
        hasMoved.current = true; // Mark that user has moved

        // Update position
        const newPosition = intersectionPoint.sub(dragOffset.current);
        groupRef.current.position.copy(newPosition);
      }
    }
  };

  const handlePointerUp = (event: any) => {
    if (isDragging && groupRef.current) {
      event.stopPropagation();
      setIsDragging(false);
      // Update the position in the store
      const finalPosition: [number, number, number] = [
        groupRef.current.position.x,
        groupRef.current.position.y,
        groupRef.current.position.z,
      ];
      updateTablePosition(id, finalPosition);
      onDragEnd?.(); // Notify parent that dragging ended
    }
  };

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={ref}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => {
          setHovered(true);
          if (e.object instanceof THREE.Mesh) {
            document.body.style.cursor = isDragging ? 'grabbing' : 'grab';
          }
        }}
        onPointerOut={(e) => {
          setHovered(false);
          if (e.object instanceof THREE.Mesh) {
            document.body.style.cursor = 'default';
          }
        }}
      >
        <boxGeometry args={dimensions} />
        <meshStandardMaterial
          color={
            isConnectMode
              ? "#ff6b00"
              : isSelected
                ? "#ffffff"
                : hovered
                  ? "#60a5fa"
                  : color
          }
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Label */}
      {(label || number) && (
        <Html position={[0, dimensions[1] / 2 + 1, 0]} center>
          <div className={`px-3 py-1 rounded-lg shadow-lg border-2 transition-all ${isSelected
              ? "bg-white border-gray-400"
              : isConnectMode
                ? "bg-orange-100 border-orange-500"
                : "bg-white border-gray-300"
            }`}
          >
            <span className="font-bold text-sm text-gray-800">
              {number && `#${number} `}
              {label}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

interface SceneProps {
  onContextMenu?: (x: number, y: number, id: string, name: string) => void;
}

const Scene = ({ onContextMenu }: SceneProps) => {
  // Get tables and relationships from store
  const tables = useSchema((s) => s.tables);
  const relationships = useSchema((s) => s.relationships);
  const orbitControlsRef = useRef<any>(null);

  // Global drag state to disable OrbitControls
  const [isDraggingAny, setIsDraggingAny] = useState(false);

  // Debug: Log relationships
  console.log("Current relationships:", relationships);
  console.log("Current tables:", tables);

  // Create position map from all tables
  const positionMap: { [key: string]: [number, number, number] } = {};
  tables.forEach((table) => {
    positionMap[table.id] = table.position;
  });

  return (
    <div
      className="w-full h-full"
      onContextMenu={(e) => {
        e.preventDefault();
        console.log("Context menu prevented on canvas container");
      }}
    >
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        onPointerMissed={() => {
          // Reset drag state if user clicks outside any mesh
          setIsDraggingAny(false);
        }}
      >
        {/* Enhanced lighting for better visibility */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />

        {/* Orbit controls for interactive camera */}
        <OrbitControls ref={orbitControlsRef} enableZoom={true} enabled={!isDraggingAny} />

        {/* Dynamically render all tables as cuboids */}
        {tables.map((table, index) => {
          // Default dimensions for different cuboids
          const dimensionsMap: { [key: number]: [number, number, number] } = {
            0: [4, 2, 2],
            1: [2, 4, 2],
            2: [2, 2, 4],
          };

          // Use predefined dimensions or default for new tables
          const dimensions = dimensionsMap[index] || [3, 3, 3];

          return (
            <RotatingCuboid
              key={table.id}
              id={table.id}
              position={table.position}
              dimensions={dimensions}
              color={table.color}
              label={table.name}
              onContextMenu={onContextMenu}
              onDragStart={() => setIsDraggingAny(true)}
              onDragEnd={() => setIsDraggingAny(false)}
            />
          );
        })}

        {/* Relationship lines - only show when user creates relationships */}
        {relationships.map((rel, i) => {
          const fromPos = positionMap[rel.from];
          const toPos = positionMap[rel.to];
          if (fromPos && toPos) {
            return (
              <Line key={`relationship-${i}`} points={[fromPos, toPos]} color="#fbbf24" lineWidth={5} />
            );
          }
          return null;
        })}
      </Canvas>
    </div>
  );
};

export default Scene;