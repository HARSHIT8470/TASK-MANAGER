import { useState, useEffect } from 'react';
import { taskAPI, projectAPI } from '../api/services';
import { PageLoader } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import {
  RiTaskLine, RiCheckboxCircleLine, RiTimeLine, RiAlertLine,
  RiFolderLine, RiArrowRightLine,
} from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge, DueDateBadge } from '../components/Badges';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="stat-card animate-slide-up">
    <div className={`stat-icon ${bg}`}>
      <Icon className={`text-2xl ${color}`} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats]     = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ project: '', status: '', assignedTo: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, tasksRes, projRes] = await Promise.all([
          taskAPI.getStats(),
          taskAPI.getAll({ limit: 8, ...filters }),
          projectAPI.getAll({ limit: 5 }),
        ]);
        setStats(statsRes.data);
        setTasks(tasksRes.data.tasks);
        setProjects(projRes.data.projects);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [filters]);

  const applyFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={RiTaskLine}          label="Total Tasks"     value={stats?.total ?? 0}     color="text-primary-600" bg="bg-primary-50" />
        <StatCard icon={RiCheckboxCircleLine} label="Completed"       value={stats?.completed ?? 0} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={RiTimeLine}           label="Pending"         value={stats?.pending ?? 0}   color="text-amber-600"   bg="bg-amber-50" />
        <StatCard icon={RiAlertLine}          label="Overdue"         value={stats?.overdue ?? 0}   color="text-red-600"     bg="bg-red-50" />
      </div>

      {stats?.total > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Overall Progress</span>
            <span className="text-sm font-bold text-primary-600">
              {Math.round(((stats.completed ?? 0) / stats.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.round(((stats.completed ?? 0) / stats.total) * 100)}%` }}
            />
          </div>
          <div className="flex gap-6 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> To Do: {stats?.toDo ?? 0}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> In Progress: {stats?.inProgress ?? 0}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Done: {stats?.completed ?? 0}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <RiTaskLine className="text-primary-600" /> Recent Tasks
            </h2>
            <div className="flex gap-2">
              <select className="select text-xs py-1 px-2 w-32" value={filters.status}
                onChange={(e) => applyFilter('status', e.target.value)}>
                <option value="">All Status</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
              {isAdmin && (
                <select className="select text-xs py-1 px-2 w-32" value={filters.project}
                  onChange={(e) => applyFilter('project', e.target.value)}>
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><RiTaskLine /></div>
              <p className="text-gray-500 font-medium">No tasks yet</p>
              <p className="text-gray-400 text-sm mt-1">
                {isAdmin ? 'Create a project and add tasks to get started.' : 'No tasks assigned to you yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 hover:border-gray-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{task.project?.title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    <DueDateBadge dueDate={task.dueDate} status={task.status} />
                  </div>
                </div>
              ))}
              <Link to="/tasks" className="flex items-center justify-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 pt-2 font-medium">
                View all tasks <RiArrowRightLine />
              </Link>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <RiFolderLine className="text-primary-600" /> Projects
            </h2>
            <Link to="/projects" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <RiArrowRightLine />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><RiFolderLine /></div>
              <p className="text-gray-400 text-sm">No projects yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <Link key={p._id} to={`/projects/${p._id}`}
                  className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-primary-200 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.members?.length ?? 0} member{p.members?.length !== 1 ? 's' : ''}</p>
                    </div>
                    <span className={`badge text-xs flex-shrink-0 ${
                      p.status === 'Active' ? 'badge-progress' : p.status === 'Completed' ? 'badge-done' : 'badge-todo'
                    }`}>{p.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
