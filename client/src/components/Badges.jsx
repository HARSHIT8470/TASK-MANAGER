import { format, isPast, parseISO } from 'date-fns';

export const StatusBadge = ({ status }) => {
  const map = {
    'To Do':       'badge-todo',
    'In Progress': 'badge-progress',
    'Done':        'badge-done',
  };
  return <span className={map[status] || 'badge'}>{status}</span>;
};

export const PriorityBadge = ({ priority }) => {
  const map = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high' };
  return <span className={map[priority] || 'badge'}>{priority}</span>;
};

export const DueDateBadge = ({ dueDate, status }) => {
  if (!dueDate) return <span className="text-gray-400 text-sm">—</span>;
  const date = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const overdue = isPast(date) && status !== 'Done';
  return (
    <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
      {format(date, 'MMM d, yyyy')}
      {overdue && ' ⚠️'}
    </span>
  );
};
