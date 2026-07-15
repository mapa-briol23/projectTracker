import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RiCompass3Line } from 'react-icons/ri';
import './NotFound.css';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page Not Found | Project Tracker';
  }, []);

  return (
    <div className="not-found-page">
      <RiCompass3Line className="not-found-icon" />
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="btn btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
}
