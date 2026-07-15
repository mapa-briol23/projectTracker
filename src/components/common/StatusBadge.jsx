import './StatusBadge.css';

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', variant: 'blue' },
  to_do: { label: 'To Do', variant: 'gray' },
  in_progress: { label: 'In Progress', variant: 'amber' },
  completed: { label: 'Completed', variant: 'green' },
  on_hold: { label: 'On Hold', variant: 'gray' },
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
  if (type === 'priority') {
    const config = PRIORITY_CONFIG[status];
    const variant = config?.variant || 'neutral';
    return <span className={`status-badge status-badge-${variant}`}>{toTitleCase(status || '')}</span>;
  }

  const config = STATUS_CONFIG[status];
  const variant = config?.variant || 'gray';
  const label = config?.label || toTitleCase(status || '');

  return (
    <span className={`status-badge status-badge-dot status-${variant}`}>
      <span className="status-dot-marker" />
      {label}
    </span>
  );
}
