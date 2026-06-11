import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit2, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function BoardCard({ board, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(board.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      className="group relative bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-gray-800 transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/board/${board.id}`)}
      style={{ borderTop: `3px solid ${board.color}` }}
    >
      {/* Board Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: `${board.color}20` }}
      >
        <LayoutDashboard className="w-5 h-5" style={{ color: board.color }} />
      </div>

      <h3 className="text-white font-semibold text-lg leading-tight mb-1 group-hover:text-indigo-300 transition-colors">
        {board.title}
      </h3>
      {board.description && (
        <p className="text-gray-400 text-sm line-clamp-2 mb-4">{board.description}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-500">
          {new Date(board.created_at).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(board); }}
            className="p-1.5 rounded-md text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className={`p-1.5 rounded-md transition-all ${
              confirmDelete
                ? 'text-red-400 bg-red-500/20'
                : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <ArrowRight className="w-4 h-4 text-gray-500 ml-1" />
        </div>
      </div>
    </div>
  );
}
