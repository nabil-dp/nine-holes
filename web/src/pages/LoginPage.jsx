import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import Card from '../components/Card';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (identifier, password) => {
    clearError();
    const result = await login(identifier, password);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">⚫</div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Login to continue playing</p>
        </div>
        <Card>
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
