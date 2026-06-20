import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBoard } from '../api/boards';
import { useCards } from '../hooks/useCards';
import Navbar from '../components/layout/Navbar';
import KanbanBoard from '../components/kanban/KanbanBoard';
import TaskModal from '../components/task/TaskModal';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [boardLoading, setBoardLoading] = useState(true);
  const { columns, loading, fetchBoard, addCard, editCard, removeCard, moveCard } = useCards(boardId);

  // Modal state
  const [modalConfig, setModalConfig] = useState(null); // { mode: 'create'|'edit', card?, columnId? }

  useEffect(() => {
    const loadBoard = async () => {
      try {
        const res = await getBoard(boardId);
        setBoard(res.data);
      } catch {
        toast.error('Board not found');
        navigate('/dashboard');
      } finally {
        setBoardLoading(false);
      }
    };
    loadBoard();

    let timeoutId;
    let isMounted = true;

    const startPolling = async () => {
      if (!isMounted) return;
      await fetchBoard();
      if (isMounted) {
        timeoutId = setTimeout(startPolling, 5000); // 5s polling interval
      }
    };

    startPolling();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [boardId, fetchBoard, navigate]);

  const handleAddCard = (columnId) => {
    setModalConfig({ mode: 'create', columnId });
  };

  const handleCardClick = (card) => {
    setModalConfig({ mode: 'edit', card, columnId: card.column_id });
  };

  const handleCardDelete = async (card) => {
    try {
      await removeCard(card.id, card.column_id);
      toast.success('Card deleted');
    } catch {
      toast.error('Failed to delete card');
    }
  };

  const handleSave = async (data) => {
    try {
      if (modalConfig.mode === 'edit') {
        await editCard(modalConfig.card.id, data);
        toast.success('Card updated!');
      } else {
        await addCard(data);
        toast.success('Card created!');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async (cardId, columnId) => {
    await removeCard(cardId, columnId);
    toast.success('Card deleted');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />

      <div className="max-w-full px-6 py-5 flex-1 flex flex-col">
        {/* Board Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {board && (
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-8 rounded-full"
                style={{ backgroundColor: board.color }}
              />
              <div>
                <h1 className="text-xl font-bold text-white">{board.title}</h1>
                {board.description && (
                  <p className="text-gray-400 text-sm">{board.description}</p>
                )}
              </div>
            </div>
          )}

          <button
            onClick={fetchBoard}
            className="ml-auto p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Kanban Board */}
        <KanbanBoard
          columns={columns}
          loading={loading && !columns.length}
          onAddCard={handleAddCard}
          onCardClick={handleCardClick}
          onCardDelete={handleCardDelete}
          moveCard={moveCard}
        />
      </div>

      {/* Task Modal */}
      {modalConfig && (
        <TaskModal
          card={modalConfig.mode === 'edit' ? modalConfig.card : null}
          columnId={modalConfig.columnId}
          columns={columns}
          onClose={() => setModalConfig(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
