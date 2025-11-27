"use client";

import { Line } from "@react-three/drei";
import { useSchema } from "@/store/schemaStore";

interface RelationshipLineProps {
  from: string;
  to: string;
}

const RelationshipLine = ({ from, to }: RelationshipLineProps) => {
  const tables = useSchema((item) => item.tables);

  const A = tables.find((table) => table.id === from);
  const B = tables.find((table) => table.id === to);

  if (!A || !B) return null;

  // Use the Line component from drei which handles dynamic updates
  return (
    <Line
      points={[A.position, B.position]}
      color="white"
      lineWidth={2}
    />
  );
}

export default RelationshipLine