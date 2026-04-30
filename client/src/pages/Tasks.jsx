import { useState, useEffect, useCallback } from 'react';
import { taskAPI, projectAPI, authAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { PageLoader } from '../components/Spinner';
import { StatusBadge, PriorityBadge, DueDateBadge } from '../components/Badges';
import toast from 'react-hot-toast';
import { RiAddLine, RiSearchLine, RiTaskLine, RiEditLine, RiDeleteBinLine, RiFilterLine } from 'react-icons/ri';

const STATUSES  = ['To Do', 'In Progress', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const emptyForm = { title: '', description: '', project: '', assignedTo: '', status: 'To Do', priority: 'Medium', dueDate: '' };

export default function Tasks() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filters, setFilters]   = useState({ project: '', status: '', priority: '', assignedTo: '' });
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]       = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit]     = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected]     = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await taskAPI.getAll({ search, ...filters, page, limit: 15 });
      setTasks(data.tasks); setTotalPages(data.pages); setTotal(data.total);
    } catch { toast.error('Failed to load tasks'); } finally { setLoading(false); }
  }, [search, filters, page]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => {
    projectAPI.getAll({ limit: 100 }).then(({ data }) => setProjects(data.projects)).catch(() => {});
    if (isAdmin) authAPI.getUsers().then(({ data }) => setUsers(data)).catch(() => {});
  }, [isAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await taskAPI.create({ ...form, assignedTo: form.assignedTo || undefined, dueDate: form.dueDate || undefined }); toast.success('Task created!'); setShowCreate(false); setForm(emptyForm); fetchTasks(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };
  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await taskAPI.update(selected._id, form); toast.success('Task updated!'); setShowEdit(false); fetchTasks(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };
  const handleDelete = async () => {
    setSaving(true);
    try { await taskAPI.delete(selected._id); toast.success('Task deleted'); setShowDelete(false); fetchTasks(); }
    catch { toast.error('Delete failed'); } finally { setSaving(false); }
  };
  const handleStatusChange = async (task, status) => {
    try { await taskAPI.update(task._id, { status }); toast.success('Status updated'); fetchTasks(); }
    catch { toast.error('Failed'); }
  };
  const openEdit = (t) => {
    setSelected(t);
    setForm({ title: t.title, description: t.description, project: t.project?._id || '', assignedTo: t.assignedTo?._id || '', status: t.status, priority: t.priority, dueDate: t.dueDate ? t.dueDate.split('T')[0] : '' });
    setShowEdit(true);
  };
  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  const TaskForm = ({ onSubmit, btnLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="form-group">
        <label className="label">Title *</label>
        <input className="input" required placeholder="Task title" value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </div>
      <div className="form-group">
        <label className="label">Description</label>
        <textarea className="textarea" rows={2} placeholder="Optional description" value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      {isAdmin && (
        <div className="form-group">
          <label className="label">Project *</label>
          <select className="select" required value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))}>
            <option value="">Select project...</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="form-group mb-0">
          <label className="label">Status</label>
          <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group mb-0">
          <label className="label">Priority</label>
          <select className="select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      {isAdmin && (
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group mb-0">
            <label className="label">Assign To</label>
            <select className="select" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div className="form-group mb-0">
            <label className="label">Due Date</label>
            <input type="date" className="input" value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={() => { setShowCreate(false); setShowEdit(false); }}>Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : btnLabel}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2"><RiTaskLine className="text-primary-600" /> Tasks</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} task{total !== 1 ? 's' : ''} found</p>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { setForm(emptyForm); setShowCreate(true); }}>
            <RiAddLine /> New Task
          </button>
        )}
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3 text-gray-500">
          <RiFilterLine /> <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search tasks..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="select" value={filters.priority} onChange={e => setFilter('priority', e.target.value)}>
            <option value="">All Priority</option>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
          <select className="select" value={filters.project} onChange={e => setFilter('project', e.target.value)}>
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
        </div>
      </div>

      {loading ? <PageLoader /> : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><RiTaskLine /></div>
          <p className="text-gray-500 font-medium">No tasks found</p>
          {isAdmin && <button className="btn-primary mt-4" onClick={() => { setForm(emptyForm); setShowCreate(true); }}><RiAddLine /> Create one</button>}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr><th>Task</th><th>Project</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t._id}>
                  <td>
                    <div>
                      <p className="font-medium text-gray-800">{t.title}</p>
                      {t.description && <p className="text-xs text-gray-400 truncate max-w-xs">{t.description}</p>}
                    </div>
                  </td>
                  <td><span className="text-gray-600">{t.project?.title}</span></td>
                  <td>
                    {t.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                          {t.assignedTo.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-gray-600 text-sm">{t.assignedTo.name}</span>
                      </div>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td>
                    <select className="select text-xs py-1 px-2 w-32" value={t.status}
                      onChange={e => handleStatusChange(t, e.target.value)}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td><DueDateBadge dueDate={t.dueDate} status={t.status} /></td>
                  <td>
                    <div className="flex items-center gap-1">
                      {isAdmin && (
                        <>
                          <button className="btn-ghost p-1.5" onClick={() => openEdit(t)}><RiEditLine /></button>
                          <button className="btn-ghost p-1.5 text-red-500 hover:bg-red-50" onClick={() => { setSelected(t); setShowDelete(true); }}><RiDeleteBinLine /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button className="btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button className="btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Task">
        <TaskForm onSubmit={handleCreate} btnLabel="Create Task" />
      </Modal>
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Task">
        <TaskForm onSubmit={handleEdit} btnLabel="Save Changes" />
      </Modal>
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Task"
        footer={<><button className="btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button><button className="btn-danger" onClick={handleDelete} disabled={saving}>{saving ? 'Deleting…' : 'Delete'}</button></>}>
        <p className="text-gray-600">Delete task <strong className="text-gray-900">"{selected?.title}"</strong>? This cannot be undone.</p>
      </Modal>
    </div>
  );
}
