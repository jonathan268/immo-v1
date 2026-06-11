'use client';

import { useEffect, useState } from 'react';
import { propertiesApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import type { Property } from '@/lib/types';
import { PageMeta } from '@/lib/seo';

const statusMap: Record<string, string> = {
  APPROVED: 'Approuvé',
  PENDING: 'En attente',
  REJECTED: 'Rejeté',
};

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending'>('all');

  const limit = 15;

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = filter === 'pending'
        ? await propertiesApi.pending({ page, limit })
        : await propertiesApi.list({ page, limit, sort: 'newest' });
      setProperties(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, [page, filter]);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'feature') => {
    setActionLoading(id);
    try {
      if (action === 'approve') await propertiesApi.updateStatus(id, 'APPROVED');
      else if (action === 'reject') await propertiesApi.updateStatus(id, 'REJECTED');
      else if (action === 'feature') await propertiesApi.feature(id);
      fetchProperties();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <PageMeta title="Modération des Annonces" description="Modérez les annonces immobilières sur la plateforme Immo." />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary-800">Modération des annonces</h1>
          <p className="text-primary-500 mt-1">Approuvez ou rejetez les annonces</p>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === 'all' ? 'primary' : 'ghost'} size="sm" onClick={() => { setFilter('all'); setPage(1); }}>
            Toutes
          </Button>
          <Button variant={filter === 'pending' ? 'primary' : 'ghost'} size="sm" onClick={() => { setFilter('pending'); setPage(1); }}>
            En attente
          </Button>
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
                <th className="text-left px-4 py-3 font-medium text-primary-600">Titre</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Propriétaire</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Ville</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Prix</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Premium</th>
                <th className="text-right px-4 py-3 font-medium text-primary-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors">
                  <td className="px-4 py-3 font-medium text-primary-800 max-w-[200px] truncate">{p.title}</td>
                  <td className="px-4 py-3 text-primary-600">{p.owner?.full_name || '—'}</td>
                  <td className="px-4 py-3 text-primary-600">{p.city}</td>
                  <td className="px-4 py-3 text-primary-800">{p.price.toLocaleString()} {p.currency}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(p.status)}>{statusMap[p.status] || p.status}</Badge></td>
                  <td className="px-4 py-3">
                    {p.is_featured ? <Badge variant="info">Premium</Badge> : <span className="text-primary-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {p.status === 'PENDING' && (
                        <>
                          <Button variant="ghost" size="sm" loading={actionLoading === p.id}
                            onClick={() => handleAction(p.id, 'approve')}>Approuver</Button>
                          <Button variant="ghost" size="sm" loading={actionLoading === p.id}
                            onClick={() => handleAction(p.id, 'reject')}>Rejeter</Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" loading={actionLoading === p.id}
                        onClick={() => handleAction(p.id, 'feature')}>
                        {p.is_featured ? 'Retirer Premium' : 'Premium'}
                      </Button>
                    </div>
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
