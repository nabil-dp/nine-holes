import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import Card from '../components/Card';
import useAuth from '../hooks/useAuth';

const RegisterPage = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (username, email, password) => {
    clearError();
    const result = await register(username, email, password);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">⚪</div>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">Join and start playing Nine Holes</p>
        </div>
        <Card>
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} error={error} />
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
