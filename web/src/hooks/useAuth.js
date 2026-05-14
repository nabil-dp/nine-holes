import useAuthStore from '../store/authStore';

const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, error, login, register, logout, fetchMe, clearError } = useAuthStore();
  return { user, token, isAuthenticated, isLoading, error, login, register, logout, fetchMe, clearError };
};

export default useAuth;
