'use client';

import { useEffect, useState } from 'react';
import { featureRequestsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import type { FeatureRequest } from '@/lib/types';
import { PageMeta } from '@/lib/seo';

export default function AdminFeatureRequestsPage() {
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');

  const limit = 15;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = filter === 'pending'
        ? await featureRequestsApi.pending({ page, limit })
        : await featureRequestsApi.my({ page, limit });
      setRequests(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [page, filter]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      if (action === 'approve') await featureRequestsApi.approve(id);
      else if (action === 'reject') await featureRequestsApi.reject(id);
      fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <PageMeta title="Demandes de Fonctionnalités" description="Approuvez ou refusez les suggestions d'amélioration de la plateforme." />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary-800">Demandes de Fonctionnalités</h1>
          <p className="text-primary-500 mt-1">Gérez les demandes de mise en avant</p>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === 'pending' ? 'primary' : 'ghost'} size="sm"
            onClick={() => { setFilter('pending'); setPage(1); }}>En attente</Button>
          <Button variant={filter === 'all' ? 'primary' : 'ghost'} size="sm"
            onClick={() => { setFilter('all'); setPage(1); }}>Toutes</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-[var(--glass-bg)]">
                <th className="text-left px-4 py-3 font-medium text-primary-600">Requérant</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Cible</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Raison</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Statut</th>
                <th className="text-right px-4 py-3 font-medium text-primary-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((fr) => (
                <tr key={fr.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors">
                  <td className="px-4 py-3 font-medium text-primary-800">{fr.requester.full_name}</td>
                  <td className="px-4 py-3 text-primary-600">{fr.target}</td>
                  <td className="px-4 py-3 text-primary-600 max-w-[200px] truncate">{fr.target_id}</td>
                  <td className="px-4 py-3 text-primary-600 max-w-[250px] truncate">{fr.reason}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(fr.status)}>{fr.status}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    {fr.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" loading={actionLoading === fr.id}
                          onClick={() => handleAction(fr.id, 'approve')}>Approuver</Button>
                        <Button variant="ghost" size="sm" loading={actionLoading === fr.id}
                          onClick={() => handleAction(fr.id, 'reject')}>Rejeter</Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
