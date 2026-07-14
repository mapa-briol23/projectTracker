import { useEffect, useState } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import './Toast.css';

const AUTO_DISMISS_MS = 4000;
const EXIT_DURATION_MS = 150;

export default function Toast({ message, type, onClose }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(handleClose, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, EXIT_DURATION_MS);
  }

  return (
    <div className={`toast toast-${type}${closing ? ' toast-exit' : ''}`}>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={handleClose} aria-label="Close">
        <RiCloseLine />
      </button>
    </div>
  );
}
