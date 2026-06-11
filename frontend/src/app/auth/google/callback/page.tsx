'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokenStorage } from '@/lib/api';
import { PageMeta } from '@/lib/seo';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      setError('Aucun token reçu.');
      return;
    }

    const params = new URLSearchParams(hash.replace('#', '?'));
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken || !refreshToken) {
      setError('Tokens manquants dans l\'URL.');
      return;
    }

    tokenStorage.setTokens(accessToken, refreshToken);
    router.push('/dashboard');
  }, [router]);

  return (
    <>
      <PageMeta title="Connexion Google" description="Connexion en cours avec Google..." />
      {error ? (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <h1 className="mb-3 text-xl font-bold text-red-600">
              Erreur
            </h1>
            <p className="text-sm text-zinc-600">{error}</p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50">
      <svg
        className="h-8 w-8 animate-spin text-primary-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <h1 className="sr-only">Connexion en cours</h1>
    </div>
      )}
    </>
  );
}
