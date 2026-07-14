import './StatusBadge.css';

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', variant: 'neutral' },
  to_do: { label: 'To Do', variant: 'neutral' },
  in_progress: { label: 'In Progress', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  on_hold: { label: 'On Hold', variant: 'warning' },
};

const PRIORITY_CONFIG = {
  low: { variant: 'neutral' },
  medium: { variant: 'warning' },
  high: { variant: 'danger' },
};

function toTitleCase(value) {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function StatusBadge({ status, type }) {
  const config = type === 'priority' ? PRIORITY_CONFIG[status] : STATUS_CONFIG[status];
  const variant = config?.variant || 'neutral';
  const label = config?.label || toTitleCase(status);

  return <span className={`status-badge status-badge-${variant}`}>{label}</span>;
}
