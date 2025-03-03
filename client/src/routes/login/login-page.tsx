import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '../../api/api';
import Button from '../../components/button';

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      // Pre-populate the user query cache
      queryClient.setQueryData(["user"], user);
      
      if (user.userAccount?.isTemporaryPassword) {
        navigate('/change-password');
      } else {
        navigate('/projects');
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-sims-green-600 focus:border-sims-green-600"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 