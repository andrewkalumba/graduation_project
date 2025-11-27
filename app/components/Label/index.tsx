"use client";

import { Html } from "@react-three/drei";

interface LabelProps {
    text: string;
}

export default function Label({ text }: LabelProps) {
    return (
        <Html center>
            <div className="px-2 py-1 text-xs rounded bg-white/80 text-black" style={{ whiteSpace: "nowrap" }} >
                {text}
            </div>
        </Html>
    );
}
