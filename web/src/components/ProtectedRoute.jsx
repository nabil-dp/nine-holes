import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loading from './Loading';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loading fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
