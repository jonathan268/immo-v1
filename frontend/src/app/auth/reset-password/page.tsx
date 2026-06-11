'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageMeta } from '@/lib/seo';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const t = params.get('token');
    if (t) setToken(t);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Lien de réinitialisation invalide ou expiré.');
      return;
    }

    if (!email) {
      setError('Veuillez saisir votre email.');
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
      await authApi.resetPassword({ token, email, password });
      setSuccess(true);
    } catch {
      setError('Le lien est invalide ou a expiré. Veuillez refaire une demande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Réinitialiser le mot de passe" description="Choisissez un nouveau mot de passe sécurisé pour votre compte Immo." />
      {success ? (
        <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1600&q=80" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary-900/75" />
          </div>
          <div className="relative w-full max-w-sm rounded-2xl bg-white/85 backdrop-blur-xl border border-primary-200/50 shadow-xl shadow-primary-900/10 p-8 text-center animate-fade-in-up">
            <div className="absolute top-0 left-8 right-8 h-1 bg-primary-500 rounded-full" />
            <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-heading font-bold text-primary-800 mb-3">
              Mot de passe réinitialisé
            </h1>
            <p className="mb-6 text-sm text-primary-500">
              Votre mot de passe a été mis à jour avec succès.
            </p>
            <div className="w-full h-px bg-primary-200/50 mb-5" />
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-primary-600 hover:text-primary-500 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary-900/75" />
          </div>
      <div className="relative w-full max-w-sm rounded-2xl bg-white/85 backdrop-blur-xl border border-primary-200/50 shadow-xl shadow-primary-900/10 p-8 animate-fade-in-up">
        <div className="absolute top-0 left-8 right-8 h-1 bg-primary-500 rounded-full" />
        <h1 className="mb-2 text-center text-2xl font-heading font-bold text-primary-800">
          Réinitialiser le mot de passe
        </h1>
        <p className="mb-6 text-center text-sm text-primary-500">
          Choisissez un nouveau mot de passe sécurisé
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-400/15 backdrop-blur-sm border border-red-400/20 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!token && (
          <div className="mb-4 rounded-xl bg-amber-400/15 backdrop-blur-sm border border-amber-400/20 p-3 text-sm text-amber-700">
            Lien de réinitialisation invalide ou manquant.
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
            label="Nouveau mot de passe"
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

          <Button type="submit" loading={loading} className="mt-2">
            Réinitialiser
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-primary-200/50 text-center text-sm">
          <Link
            href="/auth/login"
            className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
      )}
    </>
  );
}
