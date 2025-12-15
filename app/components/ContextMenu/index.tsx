"use client";

import { ContextMenuProps } from "@/types/contextMenuProps";

export default function ContextMenu({ x, y, tableId, tableName, onClose, onDelete, onConnect, onRename }: ContextMenuProps) {
    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />

            <div className="fixed bg-gray-800 text-white rounded-lg shadow-2xl z-50 min-w-[200px] border border-gray-700"
                style={{ left: `${x}px`, top: `${y}px`, }}>
            
                <div className="px-4 py-2 border-b border-gray-700 bg-gray-900">
                    <p className="font-semibold text-sm truncate">{tableName}</p>
                    <p className="text-xs text-gray-400">{tableId}</p>
                </div>

                <div className="py-1">
                    <button onClick={() => { onRename(); onClose(); }} className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center gap-2" >
                        <span>✏️</span>
                        <span>Rename</span>
                    </button>

                    <button onClick={() => { onConnect(); onClose(); }} className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center gap-2" >
                        <span>🔗</span>
                        <span>Connect to...</span>
                    </button>

                    <div className="border-t border-gray-700 my-1" />

                    <button onClick={() => {
                            onDelete();
                            onClose();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-600 transition-colors flex items-center gap-2 text-red-400 hover:text-white"
                    >
                        <span>🗑️</span>
                        <span>Delete Table</span>
                    </button>
                </div>
            </div>
        </>
    );
}
