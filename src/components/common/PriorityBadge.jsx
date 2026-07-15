import './PriorityBadge.css';

const PRIORITY_CONFIG = {
  low: { label: 'Low', variant: 'slate' },
  medium: { label: 'Medium', variant: 'yellow' },
  high: { label: 'High', variant: 'orange' },
};

export default function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority];
  const variant = config?.variant || 'slate';
  const label = config?.label || priority;

  return <span className={`priority-badge priority-${variant}`}>{label}</span>;
}
