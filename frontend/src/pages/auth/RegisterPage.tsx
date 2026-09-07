import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['PENDANA', 'UMKM']),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { register, handleSubmit, formState: { errors }, setError } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'PENDANA',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsRegistering(true);
    setSuccessMsg("");
    try {
      const payload = {
        name: data.name,
        username: data.username,
        password: data.password,
        role: data.role,
        ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}),
        ...(data.address?.trim() ? { address: data.address.trim() } : {}),
      };
      await registerUser(payload);
      setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke dasbor...");
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
    } catch (err: any) {
      const errorMsg =
        err?.message ||
        err?.response?.data?.message ||
        'Gagal mendaftar. Username mungkin sudah digunakan.';
      setError('root', { message: errorMsg });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-[var(--radius-l)] shadow-[var(--shadow-e1)] border border-[var(--color-neutral-200)] my-8 animate-in fade-in duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-[var(--text-h3)] font-bold text-[var(--color-neutral-900)] tracking-tight">
          Buat Akun
        </h1>
        <p className="text-[var(--text-body-s)] text-[var(--color-neutral-600)] mt-2">
          Bergabung dengan ekosistem AgroFund untuk mewujudkan ketahanan pangan.
        </p>
      </div>

      <div className="w-full">
        {errors.root && (
          <Alert variant="error" className="mb-6">
            {errors.root.message}
          </Alert>
        )}

        {successMsg && (
          <Alert variant="success" className="mb-6">
            {successMsg}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nama Lengkap"
            required
            placeholder="Masukkan nama lengkap"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Username"
            required
            placeholder="Pilih username"
            error={errors.username?.message}
            {...register('username')}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="Minimal 6 karakter"
            error={errors.password?.message}
            {...register('password')}
          />

          <Select
            label="Daftar Sebagai"
            required
            options={[
              { label: 'Investor (Pendana)', value: 'PENDANA' },
              { label: 'Pelaku Tani / Pekebun (UMKM)', value: 'UMKM' },
            ]}
            error={errors.role?.message}
            {...register('role')}
          />

          <Input
            label="Nomor Telepon"
            placeholder="Contoh: 08123456789"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Alamat"
            placeholder="Contoh: Jl. Pertanian No. 10"
            error={errors.address?.message}
            {...register('address')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-4"
            isLoading={isRegistering}
          >
            Daftar Sekarang
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--color-neutral-200)] flex items-center justify-center gap-2 text-[var(--text-body-s)] text-[var(--color-neutral-600)]">
          <span>Sudah punya akun?</span>
          <NavLink
            to="/login"
            className="text-[var(--color-primary-600)] font-[600] hover:text-[var(--color-primary-700)] transition-colors"
          >
            Masuk di sini
          </NavLink>
        </div>
      </div>
    </div>
  );
};
