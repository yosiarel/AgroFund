import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

const loginSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoggingIn(true);
    try {
      await login(data);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError('root', {
        message: err?.message || err?.response?.data?.message || 'Username atau password salah',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-[var(--radius-l)] shadow-[var(--shadow-e1)] border border-[var(--color-neutral-200)] animate-in fade-in duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-[var(--text-h3)] font-bold text-[var(--color-neutral-900)] tracking-tight">
          Masuk ke AgroFund
        </h1>
        <p className="text-[var(--text-body-s)] text-[var(--color-neutral-600)] mt-2">
          Selamat datang kembali di ekosistem P2P Lending Syariah Agrikultur.
        </p>
      </div>

      <div className="w-full">
        {errors.root && (
          <Alert variant="error" className="mb-6">
            {errors.root.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Username"
            required
            placeholder="Masukkan username"
            error={errors.username?.message}
            {...register('username')}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="Masukkan password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoggingIn || isLoading}
          >
            Masuk
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--color-neutral-200)] flex items-center justify-center gap-2 text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
          <span>Belum punya akun?</span>
          <NavLink
            to="/register"
            className="text-[var(--color-primary-600)] font-[600] hover:text-[var(--color-primary-700)] transition-colors"
          >
            Daftar sekarang
          </NavLink>
        </div>
      </div>
    </div>
  );
};
