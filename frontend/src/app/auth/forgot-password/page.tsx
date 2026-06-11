'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageMeta } from '@/lib/seo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Mot de passe oublié" description="Recevez un lien de réinitialisation de votre mot de passe Immo par email." />
      {sent ? (
        <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary-900/75" />
          </div>
          <div className="relative w-full max-w-sm rounded-2xl bg-white/85 backdrop-blur-xl border border-primary-200/50 shadow-xl shadow-primary-900/10 p-8 text-center animate-fade-in-up">
            <div className="absolute top-0 left-8 right-8 h-1 bg-primary-500 rounded-full" />
            <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-primary-600/10 border border-primary-400/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-heading font-bold text-primary-800 mb-3">
              Email envoyé
            </h1>
            <p className="mb-6 text-sm text-primary-500">
              Si cet email existe, un lien de réinitialisation a été envoyé.
            </p>
            <div className="w-full h-px bg-primary-200/50 mb-5" />
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-primary-600 hover:text-primary-500 transition-colors"
            >
              Retour à la connexion
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
          Mot de passe oublié
        </h1>
        <p className="mb-6 text-center text-sm text-primary-500">
          Saisissez votre email pour recevoir un lien de réinitialisation.
        </p>

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

          <Button type="submit" loading={loading} className="mt-2">
            Envoyer
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
