import { useState, useEffect, useCallback } from 'react';
import { projectAPI, authAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { PageLoader } from '../components/Spinner';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  RiFolderAddLine, RiSearchLine, RiFolderLine,
  RiEditLine, RiDeleteBinLine, RiUserAddLine, RiArrowRightLine,
} from 'react-icons/ri';

const STATUSES = ['Active', 'Completed', 'On Hold'];

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit]     = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [form, setForm] = useState({ title: '', description: '', members: [], status: 'Active' });
  const [saving, setSaving] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await projectAPI.getAll({ search, status: statusFilter, page, limit: 9 });
      setProjects(data.projects);
      setTotalPages(data.pages);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => {
    if (isAdmin) authAPI.getUsers().then(({ data }) => setUsers(data)).catch(() => {});
  }, [isAdmin]);

  const resetForm = () => setForm({ title: '', description: '', members: [], status: 'Active' });

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await projectAPI.create(form); toast.success('Project created!'); setShowCreate(false); resetForm(); fetchProjects(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };
  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await projectAPI.update(selected._id, form); toast.success('Project updated!'); setShowEdit(false); fetchProjects(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };
  const handleDelete = async () => {
    setSaving(true);
    try { await projectAPI.delete(selected._id); toast.success('Project deleted'); setShowDelete(false); fetchProjects(); }
    catch { toast.error('Delete failed'); } finally { setSaving(false); }
  };
  const openEdit = (p) => {
    setSelected(p);
    setForm({ title: p.title, description: p.description, members: p.members.map(m => m._id), status: p.status });
    setShowEdit(true);
  };
  const toggleMember = (id) => setForm(f => ({
    ...f, members: f.members.includes(id) ? f.members.filter(m => m !== id) : [...f.members, id],
  }));
  const handleAddMember = async (userId) => {
    try { const { data } = await projectAPI.addMember(selected._id, userId); setSelected(data); fetchProjects(); toast.success('Member added'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleRemoveMember = async (userId) => {
    try { const { data } = await projectAPI.removeMember(selected._id, userId); setSelected(data); fetchProjects(); toast.success('Member removed'); }
    catch { toast.error('Failed'); }
  };

  const ProjectForm = ({ onSubmit, btnLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="form-group">
        <label className="label">Title *</label>
        <input className="input" required placeholder="Project title" value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </div>
      <div className="form-group">
        <label className="label">Description</label>
        <textarea className="textarea" rows={3} placeholder="Optional description" value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="form-group">
        <label className="label">Status</label>
        <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      {users.length > 0 && (
        <div className="form-group">
          <label className="label">Members</label>
          <div className="max-h-36 overflow-y-auto space-y-1 rounded-lg border border-gray-200 p-2 bg-gray-50">
            {users.map(u => (
              <label key={u._id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">
                <input type="checkbox" checked={form.members.includes(u._id)} onChange={() => toggleMember(u._id)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-700">{u.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{u.role}</span>
              </label>
            ))}
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
        <h1 className="page-title flex items-center gap-2"><RiFolderLine className="text-primary-600" /> Projects</h1>
        {isAdmin && (
          <button className="btn-primary" onClick={() => { resetForm(); setShowCreate(true); }}>
            <RiFolderAddLine /> New Project
          </button>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search projects..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="select w-40" value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <PageLoader /> : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><RiFolderLine /></div>
          <p className="text-gray-500 font-medium">No projects found</p>
          {isAdmin && <button className="btn-primary mt-4" onClick={() => { resetForm(); setShowCreate(true); }}><RiFolderAddLine /> Create one</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p._id} className="card flex flex-col gap-3 hover:border-primary-300 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center flex-shrink-0">
                    <RiFolderLine className="text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{p.title}</h3>
                    <p className="text-xs text-gray-400">by {p.createdBy?.name}</p>
                  </div>
                </div>
                <span className={`badge flex-shrink-0 ${p.status === 'Active' ? 'badge-progress' : p.status === 'Completed' ? 'badge-done' : 'badge-todo'}`}>
                  {p.status}
                </span>
              </div>
              {p.description && <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>}
              <div className="flex items-center gap-1 mt-auto">
                <div className="flex -space-x-2">
                  {p.members?.slice(0, 4).map((m) => (
                    <div key={m._id} title={m.name} className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                      {m.name?.[0]?.toUpperCase()}
                    </div>
                  ))}
                  {p.members?.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs border-2 border-white">+{p.members.length - 4}</div>
                  )}
                </div>
                <span className="text-xs text-gray-400 ml-1">{p.members?.length} member{p.members?.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                <Link to={`/projects/${p._id}`} className="btn-secondary flex-1 justify-center text-xs py-1.5">View <RiArrowRightLine /></Link>
                {isAdmin && (
                  <>
                    <button className="btn-ghost p-2" onClick={() => { setSelected(p); setShowMembers(true); }}><RiUserAddLine /></button>
                    <button className="btn-ghost p-2" onClick={() => openEdit(p)}><RiEditLine /></button>
                    <button className="btn-ghost p-2 text-red-500 hover:bg-red-50" onClick={() => { setSelected(p); setShowDelete(true); }}><RiDeleteBinLine /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button className="btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button className="btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Project">
        <ProjectForm onSubmit={handleCreate} btnLabel="Create Project" />
      </Modal>
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Project">
        <ProjectForm onSubmit={handleEdit} btnLabel="Save Changes" />
      </Modal>
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Project"
        footer={<><button className="btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button><button className="btn-danger" onClick={handleDelete} disabled={saving}>{saving ? 'Deleting…' : 'Delete'}</button></>}>
        <p className="text-gray-600">Delete <strong className="text-gray-900">"{selected?.title}"</strong>? All tasks will also be deleted.</p>
      </Modal>
      <Modal isOpen={showMembers} onClose={() => setShowMembers(false)} title={`Members — ${selected?.title}`}>
        <div className="space-y-4">
          <div>
            <p className="label mb-2">Current Members</p>
            <div className="space-y-1">
              {selected?.members?.map(m => (
                <div key={m._id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">{m.name?.[0]?.toUpperCase()}</div>
                    <div><p className="text-sm text-gray-700">{m.name}</p><p className="text-xs text-gray-400">{m.role}</p></div>
                  </div>
                  <button onClick={() => handleRemoveMember(m._id)} className="btn-ghost p-1.5 text-red-500"><RiDeleteBinLine /></button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="label mb-2">Add Member</p>
            <div className="space-y-1 max-h-44 overflow-y-auto">
              {users.filter(u => !selected?.members?.some(m => m._id === u._id)).map(u => (
                <button key={u._id} onClick={() => handleAddMember(u._id)}
                  className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-50 text-left transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold">{u.name?.[0]?.toUpperCase()}</div>
                  <div><p className="text-sm text-gray-700">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div>
                  <RiUserAddLine className="ml-auto text-primary-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
