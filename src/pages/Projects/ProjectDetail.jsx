import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  RiArrowLeftLine,
  RiCalendarLine,
  RiFlagLine,
  RiTeamLine,
  RiCheckboxLine,
  RiCheckboxBlankLine,
  RiExternalLinkLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import projectApi from '../../api/projectApi';
import taskApi from '../../api/taskApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import Avatar from '../../components/common/Avatar';
import ProgressBar from '../../components/common/ProgressBar';
import TaskModal from './TaskModal';
import ProjectFormModal from './ProjectFormModal';
import './Projects.css';

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getDaysRemaining(project) {
  if (project.status === 'completed') {
    return { text: 'Done', className: '' };
  }
  if (!project.end_date) {
    return { text: '—', className: '' };
  }
  const daysLeft = Math.ceil((new Date(project.end_date) - Date.now()) / 86400000);
  if (daysLeft < 0) {
    return { text: `${Math.abs(daysLeft)}d overdue`, className: 'info-card-red' };
  }
  if (daysLeft <= 14) {
    return { text: `${daysLeft} days`, className: 'info-card-amber' };
  }
  return { text: `${daysLeft} days`, className: '' };
}

function getTeamMembers(project) {
  const map = new Map();
  if (project.created_by) {
    map.set(project.created_by, {
      id: project.created_by,
      name: project.creator_name || 'Unknown',
      isCreator: true,
    });
  }
  (project.tasks || []).forEach((task) => {
    if (task.assigned_to && !map.has(task.assigned_to)) {
      map.set(task.assigned_to, {
        id: task.assigned_to,
        name: task.assignee_name || 'Unknown',
        isCreator: false,
      });
    }
  });
  return Array.from(map.values());
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
  const [tab, setTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

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

  async function handleStatusChange(newStatus) {
    try {
      await projectApi.update(id, {
        name: project.name,
        description: project.description,
        status: newStatus,
        priority: project.priority,
        start_date: project.start_date,
        end_date: project.end_date,
        smartsheet_url: project.smartsheet_url,
      });
      showToast('Project status updated', 'success');
      await loadProject();
    } catch {
      showToast('Failed to update project status', 'error');
    }
  }

  function openCreateTaskModal() {
    setTaskModalOpen(true);
  }

  async function handleTaskSubmit(payload) {
    try {
      await taskApi.create(id, payload);
      showToast('Task added', 'success');
      setTaskModalOpen(false);
      await loadProject();
    } catch {
      showToast('Failed to add task', 'error');
    }
  }

  async function handleTaskToggle(task) {
    if (!canManageTasks) return;
    try {
      await taskApi.update(task.id, {
        title: task.title,
        description: task.description,
        status: task.status === 'completed' ? 'to_do' : 'completed',
        priority: task.priority,
        assigned_to: task.assigned_to,
        due_date: task.due_date,
      });
      await loadProject();
    } catch {
      showToast('Failed to update task', 'error');
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
  const daysInfo = getDaysRemaining(project);
  const team = getTeamMembers(project);

  return (
    <div className="project-detail-page">
      <Link to="/projects" className="back-link">
        <RiArrowLeftLine /> Back to Projects
      </Link>

      <div className="pd-header">
        <div className="pd-header-top">
          <div>
            <div className="pd-title-row">
              <h1>{project.name}</h1>
              <StatusBadge status={project.status} type="status" />
            </div>
            <p className="pd-subline">Started {formatDate(project.start_date)}</p>
          </div>
          {isPM && (
            <div className="project-header-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditModalOpen(true)}>
                Edit
              </button>
              <button type="button" className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="pd-progress-banner">
        <div className="pd-progress-row">
          <span>Overall Progress</span>
          <span className="pd-progress-pct">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} />
      </div>

      <div className="pd-tabs">
        <button
          type="button"
          className={tab === 'overview' ? 'pd-tab active' : 'pd-tab'}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={tab === 'tasks' ? 'pd-tab active' : 'pd-tab'}
          onClick={() => setTab('tasks')}
        >
          Tasks ({completedTasks}/{totalTasks})
        </button>
      </div>

      <div className="pd-tab-content">
        {tab === 'overview' ? (
          <div className="pd-overview">
            {project.description && <p className="pd-description">{project.description}</p>}

            {project.smartsheet_url && (
              <a
                href={project.smartsheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="pd-smartsheet-link"
              >
                <RiExternalLinkLine /> Open in Smartsheet
              </a>
            )}

            <div className="pd-info-grid">
              <div className="info-card">
                <div className="info-card-label">
                  <RiCalendarLine /> Start Date
                </div>
                <p>{formatDate(project.start_date)}</p>
              </div>
              <div className="info-card">
                <div className="info-card-label">
                  <RiCalendarLine /> End Date
                </div>
                <p>{formatDate(project.end_date)}</p>
              </div>
              <div className="info-card">
                <div className="info-card-label">
                  <RiFlagLine /> Days Remaining
                </div>
                <p className={daysInfo.className}>{daysInfo.text}</p>
              </div>
              <div className="info-card">
                <div className="info-card-label">
                  <RiFlagLine /> Priority
                </div>
                <p>{project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}</p>
              </div>
            </div>

            <div className="pd-team-section">
              <h3>
                <RiTeamLine /> Team
              </h3>
              {team.length === 0 ? (
                <p className="pd-team-empty">No team members yet.</p>
              ) : (
                <div className="pd-team-list">
                  {team.map((member) => (
                    <div className="pd-team-row" key={member.id}>
                      <Avatar name={member.name} size="md" />
                      <span className="pd-team-name">{member.name}</span>
                      {member.isCreator && <span className="pd-creator-badge">Creator</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isPM && (
              <div className="pd-status-section">
                <h3>Update Status</h3>
                <div className="pd-status-buttons">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={project.status === opt.value ? 'pd-status-btn active' : 'pd-status-btn'}
                      onClick={() => handleStatusChange(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="pd-tasks">
            {canManageTasks && (
              <button type="button" className="btn btn-primary pd-add-task-btn" onClick={openCreateTaskModal}>
                + Add Task
              </button>
            )}

            {totalTasks === 0 ? (
              <p className="pd-tasks-empty">No tasks added yet.</p>
            ) : (
              <div className="pd-task-list">
                {project.tasks.map((task) => {
                  const done = task.status === 'completed';
                  return (
                    <div className="pd-task-row" key={task.id}>
                      <button
                        type="button"
                        className={`pd-task-checkbox ${canManageTasks ? '' : 'pd-task-checkbox-disabled'}`}
                        onClick={() => handleTaskToggle(task)}
                        disabled={!canManageTasks}
                        aria-label={done ? 'Mark as pending' : 'Mark as completed'}
                      >
                        {done ? (
                          <RiCheckboxLine className="pd-checkbox-done" />
                        ) : (
                          <RiCheckboxBlankLine className="pd-checkbox-pending" />
                        )}
                      </button>
                      <div className="pd-task-main">
                        <p className={done ? 'pd-task-title done' : 'pd-task-title'}>{task.title}</p>
                        <p className="pd-task-subline">
                          {task.assignee_name || 'Unassigned'} · Due {formatDate(task.due_date)}
                        </p>
                      </div>
                      <span className={done ? 'pd-task-pill done' : 'pd-task-pill'}>
                        {done ? 'Done' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This will also delete all its tasks.`}
        confirmText="Delete"
        variant="danger"
      />

      <ProjectFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        initialProject={project}
        onSuccess={loadProject}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        initialTask={null}
      />
    </div>
  );
}
