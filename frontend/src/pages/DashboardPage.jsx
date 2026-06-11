import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../api/dashboard';
import { useBoards } from '../hooks/useBoards';
import Navbar from '../components/layout/Navbar';
import BoardCard from '../components/board/BoardCard';
import CreateBoardModal from '../components/board/CreateBoardModal';
import EditBoardModal from '../components/board/EditBoardModal';
import StatsCard from '../components/dashboard/StatsCard';
import BoardOverview from '../components/dashboard/BoardOverview';
import { LayoutDashboard, Plus, KanbanSquare, CheckSquare, Clock, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const { boards, loading: boardsLoading, addBoard, editBoard, removeBoard } = useBoards();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);

  // Poll stats every 30s — simple approach before websockets
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (err) {
        console.error('Stats load error:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateBoard = async (data) => {
    try {
      await addBoard(data);
      toast.success('Board created!');
      // Refresh stats after board creation
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to create board');
    }
  };

  const handleEditBoard = async (id, data) => {
    try {
      await editBoard(id, data);
      toast.success('Board updated!');
    } catch {
      toast.error('Failed to update board');
    }
  };

  const handleDeleteBoard = async (id) => {
    try {
      await removeBoard(id);
      toast.success('Board deleted');
    } catch {
      toast.error('Failed to delete board');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">Here's what's going on with your projects</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            New Board
          </button>
        </div>

        {/* Stats Row */}
        {!statsLoading && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard label="Total Boards" value={stats.total_boards} icon={LayoutDashboard} color="indigo" />
            <StatsCard label="Total Cards" value={stats.total_cards} icon={CheckSquare} color="purple" />
            <StatsCard label="In Progress" value={stats.cards_by_status?.['In Progress'] ?? 0} icon={Clock} color="amber" />
            <StatsCard label="High Priority" value={stats.cards_by_priority?.high ?? 0} icon={AlertCircle} color="red" />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Boards Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <KanbanSquare className="w-5 h-5 text-indigo-400" />
              Your Boards
            </h2>

            {boardsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              </div>
            ) : boards.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 border border-dashed border-gray-700 rounded-2xl text-center p-8">
                <LayoutDashboard className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-gray-400 font-medium">No boards yet</p>
                <p className="text-gray-500 text-sm mb-4">Create your first board to get started</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                >
                  Create Board
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {boards.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onEdit={setEditingBoard}
                    onDelete={handleDeleteBoard}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Sidebar */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Recent Boards</h2>
            <div className="bg-gray-800/30 border border-gray-700/40 rounded-xl p-4">
              <BoardOverview boards={stats?.recent_boards || []} />
            </div>

            {/* Priority Breakdown */}
            {stats && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-white mb-4">Priority Breakdown</h2>
                <div className="bg-gray-800/30 border border-gray-700/40 rounded-xl p-4 space-y-3">
                  {[
                    { label: 'High', value: stats.cards_by_priority?.high || 0, color: 'bg-red-500' },
                    { label: 'Medium', value: stats.cards_by_priority?.medium || 0, color: 'bg-amber-500' },
                    { label: 'Low', value: stats.cards_by_priority?.low || 0, color: 'bg-emerald-500' },
                  ].map(({ label, value, color }) => {
                    const total = stats.total_cards || 1;
                    const pct = Math.round((value / total) * 100);
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{label}</span>
                          <span className="text-white font-medium">{value}</span>
                        </div>
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreate && (
        <CreateBoardModal onClose={() => setShowCreate(false)} onCreate={handleCreateBoard} />
      )}
      {editingBoard && (
        <EditBoardModal
          board={editingBoard}
          onClose={() => setEditingBoard(null)}
          onUpdate={handleEditBoard}
        />
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
