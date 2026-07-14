import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isForbidden = !loading && user && allowedRoles && !allowedRoles.includes(user.role);

  useEffect(() => {
    if (isForbidden) {
      showToast("You don't have permission to access this page", 'warning');
      navigate('/dashboard', { replace: true });
    }
  }, [isForbidden, navigate, showToast]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isForbidden) {
    return null;
  }

  return children;
}
