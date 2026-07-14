import { NavLink } from 'react-router-dom';
import {
  RiDashboardLine,
  RiFolderLine,
  RiUserLine,
  RiLogoutBoxRLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const ROLE_LABELS = {
  project_manager: 'Project Manager',
  app_support: 'App Support',
  dept_manager: 'Department Manager',
};

function linkClass({ isActive }) {
  return `sidebar-link${isActive ? ' active' : ''}`;
}

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <RiDashboardLine size={22} />
        <span>Project Tracker</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={linkClass}>
          <RiDashboardLine />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/projects" className={linkClass}>
          <RiFolderLine />
          <span>Projects</span>
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <RiUserLine />
          <span>Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-name">{user?.full_name}</div>
          <div className="sidebar-user-role">{ROLE_LABELS[user?.role] || user?.role}</div>
        </div>
        <button type="button" className="sidebar-logout" onClick={logout}>
          <RiLogoutBoxRLine />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
