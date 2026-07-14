import './LoadingSpinner.css';

export default function LoadingSpinner({ fullScreen = false }) {
  return (
    <div className={fullScreen ? 'spinner-fullscreen' : 'spinner-inline'}>
      <div className="spinner" />
    </div>
  );
}
