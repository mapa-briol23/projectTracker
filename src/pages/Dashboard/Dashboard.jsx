import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiFolderLine,
  RiTimeLine,
  RiCheckDoubleLine,
  RiTaskLine,
  RiInboxLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import dashboardApi from '../../api/dashboardApi';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import './Dashboard.css';

const STAT_CARDS = [
  { key: 'totalProjects', label: 'Total Projects', icon: RiFolderLine, accent: 'primary' },
  { key: 'activeProjects', label: 'Active', icon: RiTimeLine, accent: 'info' },
  { key: 'completedProjects', label: 'Completed', icon: RiCheckDoubleLine, accent: 'success' },
  { key: 'totalTasks', label: 'Total Tasks', icon: RiTaskLine, accent: 'primary' },
];

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      const { data } = await dashboardApi.getStats();
      if (!cancelled) {
        setStats(data);
        setLoading(false);
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !stats) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p className="dashboard-welcome">Welcome back, {user?.full_name}!</p>

      <div className="stats-grid">
        {STAT_CARDS.map(({ key, label, icon: Icon, accent }) => (
          <div key={key} className={`stat-card stat-card-${accent}`}>
            <Icon className="stat-card-icon" />
            <div className="stat-card-count">{stats[key]}</div>
            <div className="stat-card-label">{label}</div>
          </div>
        ))}
      </div>

      <section className="recent-projects">
        <h2>Recent Projects</h2>

        {stats.recentProjects.length === 0 ? (
          <EmptyState
            icon={<RiInboxLine />}
            title="No projects yet"
            message="Create your first project to get started."
          />
        ) : (
          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentProjects.map((project) => (
                  <tr key={project.id} onClick={() => navigate(`/projects/${project.id}`)}>
                    <td>{project.name}</td>
                    <td>
                      <StatusBadge status={project.status} type="status" />
                    </td>
                    <td>
                      <StatusBadge status={project.priority} type="priority" />
                    </td>
                    <td>{formatDate(project.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
