import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const ROLE_LABELS = {
  project_manager: 'Project Manager',
  app_support: 'App Support',
  dept_manager: 'Department Manager',
};

function getInitials(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function formatMemberSince(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Profile() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Profile | Project Tracker';
  }, []);

  if (!user) return null;

  return (
    <div className="profile-page">
      <h1>My Profile</h1>

      <div className="profile-card">
        <div className="profile-avatar">{getInitials(user.full_name)}</div>
        <div className="profile-name">{user.full_name}</div>
        <div className="profile-email">{user.email}</div>

        <div className="profile-details">
          <div className="profile-detail-row">
            <span className="profile-detail-label">Role</span>
            <span>{ROLE_LABELS[user.role] || user.role}</span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-detail-label">Status</span>
            <span
              className={`profile-status-badge ${user.status === 'active' ? 'is-active' : 'is-inactive'}`}
            >
              {user.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-detail-label">Member since</span>
            <span>{formatMemberSince(user.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
