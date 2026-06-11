'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usersApi, propertiesApi, featureRequestsApi, paymentsApi } from '@/lib/api';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Badge, { statusBadge } from '@/components/ui/Badge';
import type { Payment, Property, FeatureRequest } from '@/lib/types';
import { PageMeta } from '@/lib/seo';

export default function AdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [pendingFeatureRequests, setPendingFeatureRequests] = useState<FeatureRequest[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, propsRes, frRes, payRes] = await Promise.all([
          usersApi.list({ page: 1, limit: 1 }),
          propertiesApi.pending({ page: 1, limit: 5 }),
          featureRequestsApi.pending({ page: 1, limit: 5 }),
          paymentsApi.list({ page: 1, limit: 5 }),
        ]);
        setTotalUsers(usersRes.meta.total);
        setPendingProperties(propsRes.data);
        setPendingFeatureRequests(frRes.data);
        setRecentPayments(payRes.data);
      } catch {
        console.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <PageMeta title="Administration" description="Tableau de bord d'administration de la plateforme Immo." />
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-heading font-bold text-primary-800">Tableau de Bord</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">Utilisateurs</p>
              <p className="text-3xl font-bold text-primary-800 mt-1">{totalUsers}</p>
            </div>
            <div className="p-3 rounded-xl bg-primary-600/10 border border-primary-400/20">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Link href="/admin/properties">
          <Card className="cursor-pointer hover:bg-[var(--glass-bg)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-500">Annonces en attente</p>
                <p className="text-3xl font-bold text-primary-800 mt-1">{pendingProperties.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="mt-4 w-full">Voir les annonces</Button>
          </Card>
        </Link>

        <Link href="/admin/feature-requests">
          <Card className="cursor-pointer hover:bg-[var(--glass-bg)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-500">Feature Requests</p>
                <p className="text-3xl font-bold text-primary-800 mt-1">{pendingFeatureRequests.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-400/10 border border-purple-400/20">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="mt-4 w-full">Voir les demandes</Button>
          </Card>
        </Link>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-500">Paiements récents</p>
              <p className="text-3xl font-bold text-primary-800 mt-1">{recentPayments.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Annonces en attente">
          {pendingProperties.length === 0 ? (
            <p className="text-sm text-primary-500">Aucune annonce en attente.</p>
          ) : (
            <div className="space-y-3">
              {pendingProperties.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-[var(--glass-border)] last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-primary-800">{p.title}</p>
                    <p className="text-xs text-primary-500">{p.city} — {p.owner?.full_name}</p>
                  </div>
                  <Link href="/admin/properties"><Button variant="ghost" size="sm">Voir</Button></Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Feature Requests en attente">
          {pendingFeatureRequests.length === 0 ? (
            <p className="text-sm text-primary-500">Aucune demande en attente.</p>
          ) : (
            <div className="space-y-3">
              {pendingFeatureRequests.map((fr) => (
                <div key={fr.id} className="flex items-center justify-between py-2 border-b border-[var(--glass-border)] last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-primary-800">
                      {fr.agent?.full_name || fr.property?.title || fr.target_id}
                    </p>
                    <p className="text-xs text-primary-500">{fr.target} — {fr.requester.full_name}</p>
                  </div>
                  <Link href="/admin/feature-requests"><Button variant="ghost" size="sm">Voir</Button></Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Paiements récents">
        {recentPayments.length === 0 ? (
          <p className="text-sm text-primary-500">Aucun paiement récent.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--glass-border)]">
                  <th className="text-left py-2 px-3 font-medium text-primary-500">Date</th>
                  <th className="text-left py-2 px-3 font-medium text-primary-500">Propriétaire</th>
                  <th className="text-left py-2 px-3 font-medium text-primary-500">Montant</th>
                  <th className="text-left py-2 px-3 font-medium text-primary-500">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((pay) => (
                  <tr key={pay.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors">
                    <td className="py-2 px-3 text-primary-800">{new Date(pay.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="py-2 px-3 text-primary-800">{pay.owner.full_name}</td>
                    <td className="py-2 px-3 text-primary-800">{pay.amount.toLocaleString()} {pay.currency}</td>
                    <td className="py-2 px-3"><Badge variant={statusBadge(pay.status)}>{pay.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
      )}
    </>
  );
}
