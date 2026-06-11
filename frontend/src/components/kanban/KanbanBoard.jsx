import KanbanColumn from './KanbanColumn';
import { Loader2 } from 'lucide-react';

export default function KanbanBoard({ columns, loading, onAddCard, onCardClick, onCardDelete }) {
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
  );
}
