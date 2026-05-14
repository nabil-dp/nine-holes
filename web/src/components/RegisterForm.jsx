import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from './Input';
import Button from './Button';

const RegisterForm = ({ onSubmit, isLoading, error }) => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.username.trim() || form.username.length < 3) e.username = 'Username must be at least 3 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setErrors({});
    onSubmit(form.username, form.email, form.password);
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Username"
        name="username"
        placeholder="Choose a username"
        value={form.username}
        onChange={handleChange}
        error={errors.username}
        required
      />
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        value={form.email}
        onChange={handleChange}
        error={errors.email}
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="Create a password (min 6 chars)"
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
        Create Account
      </Button>
      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">
          Login
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
