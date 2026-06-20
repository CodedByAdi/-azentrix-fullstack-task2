import { useState, useEffect } from 'react';
import { X, Calendar, Users, AlignLeft, Flag } from 'lucide-react';
import { getUsers } from '../../api/users';

export default function TaskModal({ card, columnId, columns, onClose, onSave, onDelete }) {
  const isEdit = !!card;

  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [priority, setPriority] = useState(card?.priority || 'medium');
  const [dueDate, setDueDate] = useState(card?.due_date || '');
  const [selectedColumnId, setSelectedColumnId] = useState(card?.column_id || columnId);
  const [assignedUserIds, setAssignedUserIds] = useState(
    card?.assigned_users?.map((u) => u.id) || []
  );
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch available users for the assignment dropdown
  useEffect(() => {
    getUsers()
      .then((res) => setAllUsers(res.data))
      .catch(() => setAllUsers([]));
  }, []);

  const toggleUser = (userId) => {
    setAssignedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate || null,
        column_id: selectedColumnId,
        assigned_user_ids: assignedUserIds,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!card) return;
    setLoading(true);
    try {
      await onDelete(card.id, card.column_id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Card' : 'New Card'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-1.5">
              <AlignLeft className="w-3.5 h-3.5" /> Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more detail..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Priority + Column */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-1.5">
                <Flag className="w-3.5 h-3.5" /> Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Column</label>
              <select
                value={selectedColumnId}
                onChange={(e) => setSelectedColumnId(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>{col.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-1.5">
              <Calendar className="w-3.5 h-3.5" /> Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Assignees */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-1.5">
              <Users className="w-3.5 h-3.5" /> Assign Users
            </label>
            {allUsers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allUsers.map((u) => {
                  const selected = assignedUserIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleUser(u.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                        selected
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        selected ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {u.name[0].toUpperCase()}
                      </span>
                      {u.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No users available</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2.5 rounded-lg text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors font-medium text-sm"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-gray-400 bg-gray-800 hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition-colors"
            >
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
