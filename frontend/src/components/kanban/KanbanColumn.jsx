import { Plus } from 'lucide-react';
import KanbanCard from './KanbanCard';

const COLUMN_ACCENT = {
  'To Do': 'border-t-gray-500',
  'In Progress': 'border-t-amber-500',
  'Done': 'border-t-emerald-500',
};

export default function KanbanColumn({ column, onAddCard, onCardClick, onCardDelete }) {
  const accentClass = COLUMN_ACCENT[column.name] || 'border-t-indigo-500';

  return (
    <div className={`flex flex-col w-72 flex-shrink-0 bg-gray-800/50 rounded-xl border border-gray-700/50 border-t-2 ${accentClass}`}>
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-200">{column.name}</h3>
          <span className="text-xs bg-gray-700 text-gray-400 rounded-full px-2 py-0.5 font-medium">
            {column.cards?.length ?? 0}
          </span>
        </div>
        <button
          onClick={() => onAddCard(column.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
          title="Add card"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-3 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin">
        {column.cards && column.cards.length > 0 ? (
          column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onClick={onCardClick}
              onDelete={onCardDelete}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center mb-2">
              <Plus className="w-5 h-5 text-gray-500" />
            </div>
            <p className="text-xs text-gray-500">No cards yet</p>
            <button
              onClick={() => onAddCard(column.id)}
              className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 transition-colors"
            >
              Add one
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
