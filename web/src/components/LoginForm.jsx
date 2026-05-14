import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from './Input';
import Button from './Button';

const LoginForm = ({ onSubmit, isLoading, error }) => {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.identifier.trim()) e.identifier = 'Username or email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setErrors({});
    onSubmit(form.identifier, form.password);
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Username or Email"
        name="identifier"
        placeholder="Enter username or email"
        value={form.identifier}
        onChange={handleChange}
        error={errors.identifier}
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="Enter password"
        value={form.password}
        onChange={handleChange}
        error={errors.password}
        required
      />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <Button type="submit" isLoading={isLoading} fullWidth>
        Login
      </Button>
      <p className="text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline font-medium">
          Register
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
