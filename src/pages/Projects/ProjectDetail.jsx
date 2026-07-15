import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RiArrowLeftLine, RiPencilLine, RiDeleteBinLine } from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import projectApi from '../../api/projectApi';
import taskApi from '../../api/taskApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import TaskModal from './TaskModal';
import './Projects.css';

const NEXT_STATUS = {
  to_do: 'in_progress',
  in_progress: 'completed',
  completed: 'to_do',
};

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
  const canManageTasks = user?.role === 'project_manager' || user?.role === 'app_support';

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskDeleteTarget, setTaskDeleteTarget] = useState(null);

  async function loadProject() {
    setLoading(true);
    setLoadError(false);
    try {
      const { data } = await projectApi.getById(id);
      setProject(data.project);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    document.title = project ? `${project.name} | Project Tracker` : 'Project | Project Tracker';
  }, [project]);

  async function handleDeleteConfirm() {
    try {
      await projectApi.remove(id);
      showToast('Project deleted', 'success');
      navigate('/projects');
    } catch {
      showToast('Failed to delete project', 'error');
    }
  }

  function openCreateTaskModal() {
    setEditingTask(null);
    setTaskModalOpen(true);
  }

  function openEditTaskModal(task) {
    setEditingTask(task);
    setTaskModalOpen(true);
  }

  async function handleTaskSubmit(payload) {
    try {
      if (editingTask) {
        await taskApi.update(editingTask.id, payload);
        showToast('Task updated', 'success');
      } else {
        await taskApi.create(id, payload);
        showToast('Task added', 'success');
      }
      setTaskModalOpen(false);
      await loadProject();
    } catch {
      showToast(editingTask ? 'Failed to update task' : 'Failed to add task', 'error');
    }
  }

  async function handleTaskDeleteConfirm() {
    try {
      await taskApi.remove(taskDeleteTarget.id);
      showToast('Task deleted', 'success');
      setTaskDeleteTarget(null);
      await loadProject();
    } catch {
      showToast('Failed to delete task', 'error');
    }
  }

  async function handleStatusCycle(task) {
    try {
      await taskApi.update(task.id, {
        title: task.title,
        description: task.description,
        status: NEXT_STATUS[task.status] || 'to_do',
        priority: task.priority,
        assigned_to: task.assigned_to,
        due_date: task.due_date,
      });
      await loadProject();
    } catch {
      showToast('Failed to update task status', 'error');
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (loadError || !project) {
    return (
      <EmptyState
        title="Something went wrong"
        message="We couldn't load this project."
        actionLabel="Retry"
        onAction={loadProject}
      />
    );
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
        <div className="tasks-section-header">
          <h2>Tasks</h2>
          {canManageTasks && (
            <button type="button" className="btn btn-primary" onClick={openCreateTaskModal}>
              + Add Task
            </button>
          )}
        </div>

        {totalTasks === 0 ? (
          <EmptyState
            title="No tasks yet"
            message="Add your first task!"
            actionLabel={canManageTasks ? '+ Add Task' : undefined}
            onAction={canManageTasks ? openCreateTaskModal : undefined}
          />
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
                  {canManageTasks && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {project.tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>
                      {canManageTasks ? (
                        <button
                          type="button"
                          className="status-cycle-btn"
                          title="Click to change status"
                          onClick={() => handleStatusCycle(task)}
                        >
                          <StatusBadge status={task.status} type="status" />
                        </button>
                      ) : (
                        <StatusBadge status={task.status} type="status" />
                      )}
                    </td>
                    <td>
                      <StatusBadge status={task.priority} type="priority" />
                    </td>
                    <td>{task.assignee_name || '—'}</td>
                    <td>{formatDate(task.due_date)}</td>
                    {canManageTasks && (
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            title="Edit"
                            onClick={() => openEditTaskModal(task)}
                          >
                            <RiPencilLine />
                          </button>
                          <button
                            type="button"
                            className="icon-btn icon-btn-danger"
                            title="Delete"
                            onClick={() => setTaskDeleteTarget(task)}
                          >
                            <RiDeleteBinLine />
                          </button>
                        </div>
                      </td>
                    )}
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

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        initialTask={editingTask}
      />

      <ConfirmModal
        isOpen={!!taskDeleteTarget}
        onClose={() => setTaskDeleteTarget(null)}
        onConfirm={handleTaskDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskDeleteTarget?.title}"?`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
