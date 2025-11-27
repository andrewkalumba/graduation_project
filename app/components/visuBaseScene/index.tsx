"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useSchema } from "@/store/schemaStore";
import InteractiveBox from "../InteractiveBox";
import RelationshipLine from "../RelationshipLine";

export default function VisuBaseScene() {
  const tables = useSchema((s) => s.tables);
  const relationships = useSchema((s) => s.relationships);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [6, 6, 6], fov: 40 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} />

        {tables.map((table) => (
          <InteractiveBox key={table.id} table={table} />
        ))}

        {relationships.map((rel, i) => (
          <RelationshipLine key={i} from={rel.from} to={rel.to} />
        ))}

        <OrbitControls />
      </Canvas>
    </div>
  );
}
