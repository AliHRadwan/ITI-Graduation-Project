import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authAPI } from '@/api';
import useAuthStore from '@/store/authStore';
import { isAdmin, isManagerOrAdmin } from '@/utils/permissions';
import { Button, Input, Card } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';
import PageTransition from '@/components/animations/PageTransition';

const inviteSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(8, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export default function AcceptInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const email = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inviteSchema),
  });

  const onSubmit = async (values) => {
    if (!email || !token) {
      toast.error('Invite link is missing email or token');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        email,
        token,
        password: values.password,
        password_confirmation: values.password_confirmation,
      };
      const response = await authAPI.acceptInvite(payload);
      toast.success(response?.message || 'Invitation accepted');

      if (response?.token) {
        localStorage.setItem('token', response.token);
        const me = await authAPI.me();
        const user = me.user || me;
        localStorage.setItem('user', JSON.stringify(user));
        useAuthStore.setState({
          user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        if (isAdmin(user) || isManagerOrAdmin(user)) {
          navigate('/admin/dashboard');
        } else {
          navigate('/staff/queue');
        }
        return;
      }

      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept invite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-900"
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
        <Card className="w-full p-8 dark:bg-slate-900 dark:border-slate-800">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Accept Invite</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Set your password to activate your account.
            </p>
          </div>

          {!email || !token ? (
            <div className="text-sm text-red-600 dark:text-red-400 space-y-2">
              <p>Invite link is invalid or missing required parameters.</p>
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Go to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input label="Email" value={email} disabled />
              <Input
                label="Password"
                type="password"
                placeholder="Create a password"
                error={errors.password?.message}
                {...register('password')}
              />
              <Input
                label="Confirm password"
                type="password"
                placeholder="Confirm your password"
                error={errors.password_confirmation?.message}
                {...register('password_confirmation')}
              />
              <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
                Activate account
              </Button>
            </form>
          )}
        </Card>
      </div>
    </PageTransition>
  );
}
