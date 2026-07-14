import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RiArrowLeftLine } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import projectApi from '../../api/projectApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import './Projects.css';

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isPM = user?.role === 'project_manager';

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProject() {
      const { data } = await projectApi.getById(id);
      if (!cancelled) {
        setProject(data.project);
        setLoading(false);
      }
    }

    loadProject();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDeleteConfirm() {
    try {
      await projectApi.remove(id);
      showToast('Project deleted', 'success');
      navigate('/projects');
    } catch {
      showToast('Failed to delete project', 'error');
    }
  }

  if (loading || !project) {
    return <LoadingSpinner fullScreen />;
  }

  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((task) => task.status === 'completed').length;

  return (
    <div className="project-detail-page">
      <Link to="/projects" className="back-link">
        <RiArrowLeftLine /> Back to Projects
      </Link>

      <div className="project-header-card">
        <div className="project-header-top">
          <div>
            <h1>{project.name}</h1>
            <div className="badge-row">
              <StatusBadge status={project.status} type="status" />
              <StatusBadge status={project.priority} type="priority" />
            </div>
          </div>
          {isPM && (
            <div className="project-header-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/projects/${id}/edit`)}
              >
                Edit Project
              </button>
              <button type="button" className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
                Delete Project
              </button>
            </div>
          )}
        </div>

        {project.description && <p className="project-description">{project.description}</p>}

        <div className="project-meta">
          <span>
            {formatDate(project.start_date)} — {formatDate(project.end_date)}
          </span>
          <span>Created by: {project.creator_name || '—'}</span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${project.progress}%` }} />
        </div>
        <span className="progress-text">
          {completedTasks} of {totalTasks} tasks completed
        </span>
      </div>

      <section className="tasks-section">
        <h2>Tasks</h2>

        {totalTasks === 0 ? (
          <EmptyState title="No tasks yet" message="Add your first task!" />
        ) : (
          <div className="table-wrapper">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {project.tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>
                      <StatusBadge status={task.status} type="status" />
                    </td>
                    <td>
                      <StatusBadge status={task.priority} type="priority" />
                    </td>
                    <td>{task.assignee_name || '—'}</td>
                    <td>{formatDate(task.due_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This will also delete all its tasks.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
