import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowRight, UserCheck, Shield } from 'lucide-react';
import { loginSchema, LoginFormData } from '../../lib/schemas';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { showToast } = useUIStore();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'alex@globetrotter.io',
      password: 'password123',
    },
  });

  const from = (location.state as any)?.from?.pathname || '/';

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      showToast('Welcome Aboard', `Passport verified for ${data.email}`, 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      showToast('Check-In Failed', err.message || 'Please check your email and password.', 'error');
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setValue('email', demoEmail);
    setValue('password', 'password123');
    try {
      await login(demoEmail, 'password123');
      showToast('Welcome Aboard', `Signed in as ${demoEmail}`, 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-2xl text-ink-navy">
          Traveler Check-In
        </h3>
        <p className="text-xs text-tarmac-grey mt-1">
          Welcome back! Sign in to access your voyages, flight paths, and budget breakdowns.
        </p>
      </div>

      {/* 1-Click Demo Profiles */}
      <div className="bg-cream-sand/60 p-3.5 rounded-xl border border-tarmac-grey/20 space-y-2">
        <span className="text-[10px] font-mono uppercase text-ink-navy block font-semibold">
          ⚡ Instant One-Click Accounts:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            leftIcon={<UserCheck className="w-3.5 h-3.5 text-signal-teal" />}
            onClick={() => handleDemoLogin('alex@globetrotter.io')}
            className="text-xs py-1.5 font-medium"
          >
            Alex (Traveler)
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            leftIcon={<Shield className="w-3.5 h-3.5 text-boarding-amber" />}
            onClick={() => handleDemoLogin('admin@globetrotter.io')}
            className="text-xs py-1.5 font-medium"
          >
            Admin (Ops Hub)
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Account Email"
          type="email"
          leftIcon={<Mail className="w-4 h-4" />}
          placeholder="e.g. alex@globetrotter.io"
          {...register('email')}
          error={errors.email?.message}
          monoLabel
        />

        <div>
          <Input
            label="Password"
            type="password"
            leftIcon={<Lock className="w-4 h-4" />}
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
            monoLabel
          />
          <div className="text-right mt-1.5">
            <button
              type="button"
              onClick={() => setForgotPasswordOpen(true)}
              className="text-xs text-signal-teal hover:underline font-mono"
            >
              Need assistance?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full font-bold"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Check In & Open Terminal
        </Button>
      </form>

      <div className="pt-4 border-t border-tarmac-grey/15 text-center text-xs text-tarmac-grey">
        <span>First time exploring GlobeTrotter? </span>
        <Link to="/signup" className="text-signal-teal font-semibold hover:underline">
          Create New Passport
        </Link>
      </div>

      {forgotPasswordOpen && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
          <p className="font-bold font-mono">Password Assistance:</p>
          <p>For quick access, you can use any existing account with password <code>password123</code> or use the instant buttons above.</p>
          <button
            type="button"
            onClick={() => setForgotPasswordOpen(false)}
            className="text-[11px] text-amber-900 font-bold underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
