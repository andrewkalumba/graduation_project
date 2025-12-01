export interface ContextMenuProps {
    x: number;
    y: number;
    tableId: string;
    tableName: string;
    onClose: () => void;
    onDelete: () => void;
    onConnect: () => void;
    onRename: () => void;
}