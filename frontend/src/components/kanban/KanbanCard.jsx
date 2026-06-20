import { formatDate, isPastDue } from '../../utils/formatDate';
import PriorityBadge from '../task/PriorityBadge';
import { Calendar, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function KanbanCard({ card, onClick, onDelete }) {
  const pastDue = isPastDue(card.due_date);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group bg-gray-900 border ${
        isDragging ? 'border-indigo-500 ring-2 ring-indigo-500/20 z-10' : 'border-gray-700/60 hover:border-indigo-500/50'
      } rounded-xl p-4 cursor-grab active:cursor-grabbing hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200`}
      onClick={() => onClick(card)}
    >
      {/* Priority + Delete */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <PriorityBadge priority={card.priority} />
        <button
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on button click
          onClick={(e) => {
            e.stopPropagation();
            onDelete(card);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all pointer-events-auto cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Title */}
      <h4 className="text-white text-sm font-medium leading-snug mb-3">{card.title}</h4>

      {/* Description snippet */}
      {card.description && (
        <p className="text-gray-400 text-xs line-clamp-2 mb-3">{card.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        {/* Assigned users avatars */}
        {card.assigned_users && card.assigned_users.length > 0 && (
          <div className="flex -space-x-1.5">
            {card.assigned_users.slice(0, 3).map((u) => (
              <div
                key={u.id}
                className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-gray-900 flex items-center justify-center"
                title={u.name}
              >
                <span className="text-[9px] font-bold text-white">{u.name[0].toUpperCase()}</span>
              </div>
            ))}
            {card.assigned_users.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center">
                <span className="text-[9px] text-gray-300">+{card.assigned_users.length - 3}</span>
              </div>
            )}
          </div>
        )}

        {/* Due date */}
        {card.due_date && (
          <span className={`flex items-center gap-1 text-xs ml-auto ${pastDue ? 'text-red-400' : 'text-gray-500'}`}>
            <Calendar className="w-3 h-3" />
            {formatDate(card.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}
