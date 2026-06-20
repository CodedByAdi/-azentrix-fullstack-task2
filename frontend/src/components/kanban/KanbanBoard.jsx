import KanbanColumn from './KanbanColumn';
import { Loader2 } from 'lucide-react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export default function KanbanBoard({ columns, loading, onAddCard, onCardClick, onCardDelete, moveCard }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // allows clicks on cards to work without triggering drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    let sourceCol = null;
    let targetCol = null;

    // Find source column
    for (const col of columns) {
      if (col.cards.some((c) => c.id === activeId)) {
        sourceCol = col;
        break;
      }
    }

    // Find target column (dropped over a column area, or a card within a column)
    for (const col of columns) {
      if (col.id === overId || col.cards.some((c) => c.id === overId)) {
        targetCol = col;
        break;
      }
    }

    if (!sourceCol || !targetCol) return;

    const isDroppingOnColumn = overId === targetCol.id;
    
    // Determine the new position index
    let newPosition = targetCol.cards.length;
    if (!isDroppingOnColumn) {
      const overCardIndex = targetCol.cards.findIndex((c) => c.id === overId);
      newPosition = overCardIndex !== -1 ? overCardIndex : targetCol.cards.length;
    }

    moveCard(activeId, sourceCol.id, targetCol.id, newPosition);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!columns || columns.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>No columns found for this board.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-5 overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            onAddCard={onAddCard}
            onCardClick={onCardClick}
            onCardDelete={onCardDelete}
          />
        ))}
      </div>
    </DndContext>
  );
}
