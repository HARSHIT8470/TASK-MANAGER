import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectAPI, taskAPI, authAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { PageLoader } from '../components/Spinner';
import { StatusBadge, PriorityBadge, DueDateBadge } from '../components/Badges';
import toast from 'react-hot-toast';
import {
  RiArrowLeftLine, RiFolderLine, RiAddLine,
  RiEditLine, RiDeleteBinLine, RiUserLine,
} from 'react-icons/ri';

const STATUSES   = ['To Do', 'In Progress', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const emptyTask  = { title: '', description: '', assignedTo: '', status: 'To Do', priority: 'Medium', dueDate: '' };

export default function ProjectDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit]     = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected]     = useState(null);
  const [form, setForm] = useState(emptyTask);
  const [saving, setSaving] = useState(false);

  const fetchProject = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        projectAPI.getById(id), taskAPI.getAll({ project: id, limit: 100 }),
      ]);
      setProject(projRes.data); setTasks(tasksRes.data.tasks);
    } catch (err) {
      toast.error('Failed to load project');
      if (err.response?.status === 403 || err.response?.status === 404) navigate('/projects');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProject(); }, [id]);
  useEffect(() => {
    if (isAdmin) authAPI.getUsers().then(({ data }) => setUsers(data)).catch(() => {});
  }, [isAdmin]);

  const handleCreateTask = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await taskAPI.create({ ...form, project: id, assignedTo: form.assignedTo || undefined, dueDate: form.dueDate || undefined }); toast.success('Task created!'); setShowCreate(false); setForm(emptyTask); fetchProject(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };
  const handleEditTask = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await taskAPI.update(selected._id, form); toast.success('Task updated!'); setShowEdit(false); fetchProject(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };
  const handleDeleteTask = async () => {
    setSaving(true);
    try { await taskAPI.delete(selected._id); toast.success('Task deleted'); setShowDelete(false); fetchProject(); }
    catch { toast.error('Delete failed'); } finally { setSaving(false); }
  };
  const handleStatusChange = async (task, status) => {
    try { await taskAPI.update(task._id, { status }); toast.success('Status updated'); fetchProject(); }
    catch { toast.error('Failed to update status'); }
  };
  const openEdit = (t) => {
    setSelected(t);
    setForm({ title: t.title, description: t.description, assignedTo: t.assignedTo?._id || '', status: t.status, priority: t.priority, dueDate: t.dueDate ? t.dueDate.split('T')[0] : '' });
    setShowEdit(true);
  };

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
              {(project?.members || []).map(m => (<option key={m._id} value={m._id}>{m.name}</option>))}
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

  const grouped = STATUSES.reduce((acc, s) => { acc[s] = tasks.filter(t => t.status === s); return acc; }, {});
  const colStyle = { 'To Do': 'border-gray-200', 'In Progress': 'border-amber-200', 'Done': 'border-emerald-200' };
  const colHeader = { 'To Do': 'text-gray-600', 'In Progress': 'text-amber-600', 'Done': 'text-emerald-600' };
  const colBg = { 'To Do': 'bg-gray-50', 'In Progress': 'bg-amber-50', 'Done': 'bg-emerald-50' };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link to="/projects" className="btn-ghost p-2 mt-0.5 flex-shrink-0"><RiArrowLeftLine className="text-lg" /></Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <RiFolderLine className="text-primary-600" />
                <h1 className="page-title">{project?.title}</h1>
                <span className={`badge ${project?.status === 'Active' ? 'badge-progress' : project?.status === 'Completed' ? 'badge-done' : 'badge-todo'}`}>
                  {project?.status}
                </span>
              </div>
              {project?.description && <p className="text-gray-500 text-sm">{project.description}</p>}
            </div>
            {isAdmin && (
              <button className="btn-primary flex-shrink-0" onClick={() => { setForm(emptyTask); setShowCreate(true); }}>
                <RiAddLine /> Add Task
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <RiUserLine className="text-gray-400 text-sm" />
            <div className="flex items-center gap-1.5">
              {project?.members?.map(m => (
                <div key={m._id} title={`${m.name} (${m.role})`}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                    {m.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-600">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {STATUSES.map(s => (
          <div key={s} className={`card border ${colStyle[s]} text-center`}>
            <p className={`text-2xl font-bold ${colHeader[s]}`}>{grouped[s].length}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s}</p>
          </div>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><span className="text-2xl">📋</span></div>
          <p className="text-gray-500 font-medium">No tasks yet</p>
          {isAdmin && (
            <button className="btn-primary mt-4" onClick={() => { setForm(emptyTask); setShowCreate(true); }}>
              <RiAddLine /> Add first task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {STATUSES.map(status => (
            <div key={status} className={`rounded-xl border ${colStyle[status]} overflow-hidden bg-white`}>
              <div className={`px-4 py-3 border-b ${colStyle[status]} ${colBg[status]} flex items-center justify-between`}>
                <span className={`text-sm font-semibold ${colHeader[status]}`}>{status}</span>
                <span className="badge bg-white text-gray-500 border border-gray-200">{grouped[status].length}</span>
              </div>
              <div className="p-3 space-y-2 min-h-32 bg-gray-50/50">
                {grouped[status].map(t => (
                  <div key={t._id} className="bg-white rounded-lg border border-gray-200 p-3 space-y-2 hover:border-gray-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800 leading-snug">{t.title}</p>
                      {isAdmin && (
                        <div className="flex gap-0.5 flex-shrink-0">
                          <button className="btn-ghost p-1 text-xs" onClick={() => openEdit(t)}><RiEditLine /></button>
                          <button className="btn-ghost p-1 text-xs text-red-500" onClick={() => { setSelected(t); setShowDelete(true); }}><RiDeleteBinLine /></button>
                        </div>
                      )}
                    </div>
                    {t.description && <p className="text-xs text-gray-400 line-clamp-2">{t.description}</p>}
                    <div className="flex items-center flex-wrap gap-1.5">
                      <PriorityBadge priority={t.priority} />
                      <DueDateBadge dueDate={t.dueDate} status={t.status} />
                    </div>
                    {t.assignedTo && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                          {t.assignedTo.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-500">{t.assignedTo.name}</span>
                      </div>
                    )}
                    <select className="select text-xs py-1 px-2 w-full" value={t.status}
                      onChange={e => handleStatusChange(t, e.target.value)}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Task to Project">
        <TaskForm onSubmit={handleCreateTask} btnLabel="Create Task" />
      </Modal>
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Task">
        <TaskForm onSubmit={handleEditTask} btnLabel="Save Changes" />
      </Modal>
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Task"
        footer={<><button className="btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button><button className="btn-danger" onClick={handleDeleteTask} disabled={saving}>{saving ? 'Deleting…' : 'Delete'}</button></>}>
        <p className="text-gray-600">Delete task <strong className="text-gray-900">"{selected?.title}"</strong>? This cannot be undone.</p>
      </Modal>
    </div>
  );
}
