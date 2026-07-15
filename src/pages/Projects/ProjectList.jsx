import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiSearchLine,
  RiGridFill,
  RiListUnordered,
  RiFolderLine,
  RiFilter3Line,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import projectApi from '../../api/projectApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import ProgressBar from '../../components/common/ProgressBar';
import Avatar from '../../components/common/Avatar';
import ProjectFormModal from './ProjectFormModal';
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

const SORT_OPTIONS = [
  { value: 'due_date', label: 'Due Date' },
  { value: 'progress', label: 'Progress' },
  { value: 'priority', label: 'Priority' },
  { value: 'name', label: 'Name' },
];

const PRIORITY_ORDER = { low: 0, medium: 1, high: 2 };

const SORT_FNS = {
  due_date: (a, b) => {
    if (!a.end_date && !b.end_date) return 0;
    if (!a.end_date) return 1;
    if (!b.end_date) return -1;
    return new Date(a.end_date) - new Date(b.end_date);
  },
  progress: (a, b) => (b.progress || 0) - (a.progress || 0),
  priority: (a, b) => (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0),
  name: (a, b) => a.name.localeCompare(b.name),
};

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getTeamMembers(project) {
  const map = new Map();
  if (project.created_by) {
    map.set(project.created_by, { id: project.created_by, name: project.creator_name || 'Unknown' });
  }
  (project.tasks || []).forEach((task) => {
    if (task.assigned_to && !map.has(task.assigned_to)) {
      map.set(task.assigned_to, { id: task.assigned_to, name: task.assignee_name || 'Unknown' });
    }
  });
  return Array.from(map.values());
}

function getDaysInfo(project) {
  if (project.status === 'completed') {
    return { text: 'Completed', className: '' };
  }
  if (!project.end_date) {
    return { text: 'No due date', className: '' };
  }
  const daysLeft = Math.ceil((new Date(project.end_date) - Date.now()) / 86400000);
  if (daysLeft < 0) {
    return { text: `${Math.abs(daysLeft)}d overdue`, className: 'days-red' };
  }
  if (daysLeft <= 14) {
    return { text: `${daysLeft}d left`, className: 'days-amber' };
  }
  return { text: `${daysLeft}d left`, className: 'days-gray' };
}

export default function ProjectList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPM = user?.role === 'project_manager';

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('due_date');
  const [view, setView] = useState('grid');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    document.title = 'Projects | Project Tracker';
  }, []);

  async function fetchProjects() {
    setLoading(true);
    setLoadError(false);
    const params = {};
    if (status) params.status = status;
    if (priority) params.priority = priority;
    try {
      const { data } = await projectApi.getAll(params);
      const enriched = await Promise.all(
        data.projects.map(async (project) => {
          const { data: detail } = await projectApi.getById(project.id);
          return {
            ...project,
            tasks: detail.project.tasks,
            progress: detail.project.progress,
          };
        })
      );
      setProjects(enriched);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, [status, priority]);

  const visibleProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? projects.filter(
          (p) =>
            p.name.toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term)
        )
      : projects;
    return [...filtered].sort(SORT_FNS[sort]);
  }, [projects, search, sort]);

  return (
    <div className="projects-page">
      <div className="pl-header">
        <div>
          <h1>Projects</h1>
          <p className="pl-subtitle">
            {visibleProjects.length} of {projects.length} projects
          </p>
        </div>
        {isPM && (
          <button type="button" className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
            + New Project
          </button>
        )}
      </div>

      <div className="pl-filter-bar">
        <div className="pl-search">
          <RiSearchLine className="pl-search-icon" />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
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
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
        <div className="pl-view-toggle">
          <button
            type="button"
            className={view === 'grid' ? 'pl-view-btn active' : 'pl-view-btn'}
            title="Grid view"
            onClick={() => setView('grid')}
          >
            <RiGridFill />
          </button>
          <button
            type="button"
            className={view === 'list' ? 'pl-view-btn active' : 'pl-view-btn'}
            title="List view"
            onClick={() => setView('list')}
          >
            <RiListUnordered />
          </button>
        </div>
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
          onAction={isPM ? () => setCreateModalOpen(true) : undefined}
        />
      ) : visibleProjects.length === 0 ? (
        <EmptyState icon={<RiFilter3Line />} title="No projects match your filters" />
      ) : view === 'grid' ? (
        <div className="pl-grid">
          {visibleProjects.map((project) => {
            const done = (project.tasks || []).filter((t) => t.status === 'completed').length;
            const total = (project.tasks || []).length;
            const team = getTeamMembers(project);
            const daysInfo = getDaysInfo(project);
            return (
              <button
                key={project.id}
                type="button"
                className="pl-card"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="pl-card-top">
                  <div className="pl-card-title-wrap">
                    <p className="pl-card-name">{project.name}</p>
                    <p className="pl-card-subline">By {project.creator_name || '—'}</p>
                  </div>
                  <PriorityBadge priority={project.priority} />
                </div>

                {project.description && <p className="pl-card-description">{project.description}</p>}

                <div>
                  <div className="pl-card-progress-row">
                    <span>Progress</span>
                    <span>{project.progress || 0}%</span>
                  </div>
                  <ProgressBar value={project.progress || 0} size="sm" />
                </div>

                <div className="pl-card-status-row">
                  <StatusBadge status={project.status} type="status" />
                  <div className="pl-card-avatars">
                    {team.slice(0, 3).map((member) => (
                      <Avatar key={member.id} name={member.name} size="sm" />
                    ))}
                    {team.length > 3 && <span className="pl-card-avatar-overflow">+{team.length - 3}</span>}
                  </div>
                </div>

                <div className="pl-card-footer">
                  <span>
                    {done}/{total} tasks
                  </span>
                  <span className={daysInfo.className}>{daysInfo.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="pl-list">
          {visibleProjects.map((project) => {
            const daysInfo = getDaysInfo(project);
            return (
              <button
                key={project.id}
                type="button"
                className="pl-row"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="pl-row-main">
                  <p className="pl-row-name">{project.name}</p>
                  <p className="pl-row-subline">Created by {project.creator_name || '—'}</p>
                </div>
                <div className="pl-row-meta">
                  <StatusBadge status={project.status} type="status" />
                  <PriorityBadge priority={project.priority} />
                  <div className="pl-row-progress">
                    <ProgressBar value={project.progress || 0} size="sm" />
                  </div>
                  <span className="pl-row-progress-pct">{project.progress || 0}%</span>
                  <span className={`pl-row-due ${daysInfo.className}`}>{formatDate(project.end_date)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <ProjectFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        initialProject={null}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
