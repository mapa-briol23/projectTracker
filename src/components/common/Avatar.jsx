import './Avatar.css';

const COLORS = ['blue', 'purple', 'green', 'amber', 'red', 'teal'];

function colorForName(name = '') {
  const code = name.trim().charCodeAt(0) || 0;
  return COLORS[code % COLORS.length];
}

export default function Avatar({ name = '', size = 'md' }) {
  const initials = name.trim().slice(0, 2).toUpperCase();

  return (
    <div className={`avatar avatar-${size} avatar-${colorForName(name)}`} title={name}>
      {initials}
    </div>
  );
}
