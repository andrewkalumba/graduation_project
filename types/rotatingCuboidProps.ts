export interface RotatingCuboidProps {
  id: string;
  position: [number, number, number];
  dimensions: [number, number, number]; // [width, height, depth]
  color: string;
  label?: string;
  number?: number;
  onContextMenu?: (x: number, y: number, id: string, name: string) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}