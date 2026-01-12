import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authAPI } from '@/api';
import { Button, Input, Card } from '@/components/ui';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import PageTransition from '@/components/animations/PageTransition';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(data.email);
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <Card className="w-full max-w-md p-8 dark:bg-slate-900 dark:border-slate-800">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Forgot Password</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {emailSent
              ? 'Check your email for reset instructions'
              : 'Enter your email to receive reset instructions'}
          </p>
        </div>

        {!emailSent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              Send Reset Link
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <Button onClick={() => setEmailSent(false)} variant="secondary">
              Try another email
            </Button>
            <div className="mt-4">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            </div>
          </div>
        )}
      </Card>
    </PageTransition>
  );
}
