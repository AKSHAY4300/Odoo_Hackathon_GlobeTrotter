import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { signupSchema, SignupFormData } from '../../lib/schemas';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuthStore();
  const { showToast } = useUIStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup(data.name, data.email, data.password);
      showToast('Passport Issued!', `Welcome to GlobeTrotter, ${data.name}.`, 'success');
      navigate('/');
    } catch (err: any) {
      showToast('Registration Error', err.message || 'Could not issue passport', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-2xl text-ink-navy">
          Issue New Passport
        </h3>
        <p className="text-xs text-tarmac-grey mt-1">
          Create your personal traveler profile to build and share multi-city itineraries.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Legal Name"
          type="text"
          leftIcon={<User className="w-4 h-4" />}
          placeholder="e.g. Jordan Lee"
          {...register('name')}
          error={errors.name?.message}
          monoLabel
        />

        <Input
          label="Email Address"
          type="email"
          leftIcon={<Mail className="w-4 h-4" />}
          placeholder="e.g. jordan@example.com"
          {...register('email')}
          error={errors.email?.message}
          monoLabel
        />

        <Input
          label="Security Passcode"
          type="password"
          leftIcon={<Lock className="w-4 h-4" />}
          placeholder="At least 6 characters"
          {...register('password')}
          error={errors.password?.message}
          monoLabel
        />

        <Input
          label="Confirm Security Passcode"
          type="password"
          leftIcon={<Lock className="w-4 h-4" />}
          placeholder="Re-enter security passcode"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          monoLabel
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full font-bold mt-2"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Issue Passport & Start Planning
        </Button>
      </form>

      <div className="pt-4 border-t border-tarmac-grey/15 text-center text-xs text-tarmac-grey">
        <span>Already have a traveler pass? </span>
        <Link to="/login" className="text-signal-teal font-semibold hover:underline">
          Traveler Check-In
        </Link>
      </div>
    </div>
  );
};
