import { useNavigate } from 'react-router-dom';
import { ArrowRight, LayoutDashboard } from 'lucide-react';

export default function BoardOverview({ boards }) {
  const navigate = useNavigate();

  if (!boards || boards.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm">
        No recent boards — create one to get started!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {boards.map((board) => (
        <div
          key={board.id}
          className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-800/40 border border-gray-700/40 hover:border-indigo-500/30 hover:bg-gray-800 cursor-pointer transition-all group"
          onClick={() => navigate(`/board/${board.id}`)}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-8 rounded-full"
              style={{ backgroundColor: board.color }}
            />
            <div>
              <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">
                {board.title}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(board.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
        </div>
      ))}
    </div>
  );
}
