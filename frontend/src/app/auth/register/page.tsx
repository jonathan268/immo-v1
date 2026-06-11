'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import type { Role } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageMeta } from '@/lib/seo';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('OWNER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      setError('Tous les champs sont requis.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      await register({
        full_name: fullName,
        email,
        phone,
        password,
        confirm_password: confirmPassword,
        role,
      });
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = err.data?.message || err.message;
        setError(msg);
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Inscription" description="Créez un compte Immo gratuit pour publier vos annonces immobilières et gérer vos biens au Cameroun." />
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary-900/75" />
      </div>
      <div className="relative w-full max-w-sm rounded-2xl bg-white/85 backdrop-blur-xl border border-primary-200/50 shadow-xl shadow-primary-900/10 p-8 animate-fade-in-up">
        <div className="absolute top-0 left-8 right-8 h-1 bg-primary-500 rounded-full" />
        <h1 className="mb-2 text-center text-2xl font-heading font-bold text-primary-800">
          Créer un compte
        </h1>
        <p className="mb-6 text-center text-sm text-primary-500">
          Rejoignez la plateforme immobilière
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-400/15 backdrop-blur-sm border border-red-400/20 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nom complet"
            type="text"
            name="full_name"
            placeholder="Jean Dupont"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="vous@exemple.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />

          <Input
            label="Téléphone"
            type="tel"
            name="phone"
            placeholder="+221 77 123 45 67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />

          <Input
            label="Mot de passe"
            type="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            name="confirm_password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-sm font-medium text-primary-700">
              Je suis
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="rounded-xl bg-white/60 backdrop-blur-md border border-primary-200/50 hover:border-primary-300 px-4 py-2.5 text-sm text-primary-900 outline-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30"
            >
              <option value="OWNER">Propriétaire</option>
              <option value="TENANT">Locataire</option>
            </select>
          </div>

          <Button type="submit" loading={loading} className="mt-2">
            S&apos;inscrire
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-primary-200/50 text-center text-sm text-primary-500">
          Déjà un compte ?{' '}
          <Link
            href="/auth/login"
            className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
