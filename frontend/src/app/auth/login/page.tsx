'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageMeta } from '@/lib/seo';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = err.data?.message || err.message;
        if (msg?.toLowerCase().includes('suspended')) {
          setError('Votre compte a été suspendu.');
        } else if (msg?.toLowerCase().includes('locked')) {
          setError('Votre compte est verrouillé.');
        } else {
          setError('Email ou mot de passe incorrect.');
        }
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Connexion" description="Connectez-vous à votre espace personnel Immo pour gérer vos annonces et vos favoris." />
      <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary-900/75" />
      </div>
      <div className="relative w-full max-w-sm rounded-2xl bg-white/85 backdrop-blur-xl border border-primary-200/50 shadow-xl shadow-primary-900/10 p-8 animate-fade-in-up">
        <div className="absolute top-0 left-8 right-8 h-1 bg-primary-500 rounded-full" />
        <h1 className="mb-2 text-center text-2xl font-heading font-bold text-primary-800">
          Connexion
        </h1>
        <p className="mb-6 text-center text-sm text-primary-500">
          Accédez à votre espace personnel
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-400/15 backdrop-blur-sm border border-red-400/20 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          <Button type="submit" loading={loading} className="mt-2">
            Se connecter
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3 text-sm">
          <Link
            href="/auth/forgot-password"
            className="text-primary-500 hover:text-primary-700 transition-colors"
          >
            Mot de passe oublié ?
          </Link>
          <div className="w-full h-px bg-primary-200/50" />
          <span className="text-primary-500">
            Pas encore de compte ?{' '}
            <Link
              href="/auth/register"
              className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
            >
              S&apos;inscrire
            </Link>
          </span>
        </div>
      </div>
    </div>
    </>
  );
}
