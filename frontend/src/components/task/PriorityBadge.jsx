import { PRIORITY_COLORS } from '../../utils/priorityColors';

export default function PriorityBadge({ priority }) {
  const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {priority}
    </span>
  );
}
