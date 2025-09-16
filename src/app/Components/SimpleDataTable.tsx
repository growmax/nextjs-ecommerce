"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const mockData = [
  { id: "1", name: "Order A", status: "completed", amount: "₹1000" },
  { id: "2", name: "Order B", status: "pending", amount: "₹2000" },
];

const initialColumns = [
  { id: "name", header: "Name" },
  { id: "status", header: "Status" },
  { id: "amount", header: "Amount" },
];

export default function SimpleDataTable() {
  const [columns, setColumns] = useState(initialColumns);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem) return;
    const newColumns = [...columns];
    const dragIndex = newColumns.findIndex(col => col.id === draggedItem);
    const targetIndex = newColumns.findIndex(col => col.id === targetId);
    const removedArr = newColumns.splice(dragIndex, 1);
    if (removedArr.length === 0) {
      setDraggedItem(null);
      return;
    }
    if (removedArr[0]) {
      newColumns.splice(targetIndex, 0, removedArr[0]);
      setColumns(newColumns);
    }
    setDraggedItem(null);
  };

  return (
    <div className="flex gap-4 p-4">
      <div className="flex-1">
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">
                <Checkbox />
              </th>
              {columns.map(col => (
                <th key={col.id} className="border p-2">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockData.map(row => (
              <tr key={row.id}>
                <td className="border p-2">
                  <Checkbox />
                </td>
                {columns.map(col => (
                  <td key={col.id} className="border p-2">
                    {row[col.id as keyof typeof row]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-48 space-y-2">
        {columns.map(col => (
          <div
            key={col.id}
            className="flex items-center gap-2 p-2 border rounded cursor-move"
            draggable
            onDragStart={() => setDraggedItem(col.id)}
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, col.id)}
          >
            <div className="grid grid-cols-3 gap-0.5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={`dot-${col.id}-${i}`}
                  className="w-1 h-1 bg-gray-400 rounded-full"
                />
              ))}
            </div>
            <span>{col.header}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
