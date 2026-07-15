import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RiEyeLine, RiPencilLine, RiDeleteBinLine, RiFolderLine } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import projectApi from '../../api/projectApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import './Projects.css';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ProjectList() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const isPM = user?.role === 'project_manager';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    document.title = 'Projects | Project Tracker';
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (priority) params.priority = priority;
    try {
      const { data } = await projectApi.getAll(params);
      setProjects(data.projects);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, priority]);

  useEffect(() => {
    const timer = setTimeout(fetchProjects, 300);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  async function handleDeleteConfirm() {
    try {
      await projectApi.remove(deleteTarget.id);
      showToast('Project deleted', 'success');
      setDeleteTarget(null);
      fetchProjects();
    } catch {
      showToast('Failed to delete project', 'error');
    }
  }

  return (
    <div className="projects-page">
      <h1>Projects</h1>

      <div className="projects-toolbar">
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="projects-search"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {isPM && (
          <button type="button" className="btn btn-primary" onClick={() => navigate('/projects/new')}>
            + New Project
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : loadError ? (
        <EmptyState
          title="Something went wrong"
          message="We couldn't load your projects."
          actionLabel="Retry"
          onAction={fetchProjects}
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<RiFolderLine />}
          title="No projects found"
          message="Create your first project!"
          actionLabel={isPM ? '+ New Project' : undefined}
          onAction={isPM ? () => navigate('/projects/new') : undefined}
        />
      ) : (
        <div className="table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <Link to={`/projects/${project.id}`} className="project-name-link">
                      {project.name}
                    </Link>
                  </td>
                  <td>
                    <StatusBadge status={project.status} type="status" />
                  </td>
                  <td>
                    <StatusBadge status={project.priority} type="priority" />
                  </td>
                  <td>{formatDate(project.start_date)}</td>
                  <td>{formatDate(project.end_date)}</td>
                  <td>{project.creator_name || '—'}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        title="View"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <RiEyeLine />
                      </button>
                      {isPM && (
                        <>
                          <button
                            type="button"
                            className="icon-btn"
                            title="Edit"
                            onClick={() => navigate(`/projects/${project.id}/edit`)}
                          >
                            <RiPencilLine />
                          </button>
                          <button
                            type="button"
                            className="icon-btn icon-btn-danger"
                            title="Delete"
                            onClick={() => setDeleteTarget(project)}
                          >
                            <RiDeleteBinLine />
                          </button>
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

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete all its tasks.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
