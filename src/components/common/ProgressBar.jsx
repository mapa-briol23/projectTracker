import './ProgressBar.css';

function progressColorClass(value) {
  if (value >= 100) return 'progressbar-green';
  if (value >= 60) return 'progressbar-blue';
  if (value >= 30) return 'progressbar-amber';
  return 'progressbar-red';
}

export default function ProgressBar({ value = 0, size = 'md' }) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={`progressbar-track progressbar-${size}`}>
      <div
        className={`progressbar-fill ${progressColorClass(clamped)}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
