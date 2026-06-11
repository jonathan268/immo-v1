'use client';

import { useEffect, useState } from 'react';
import { featureRequestsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Pagination from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import Badge, { statusBadge } from '@/components/ui/Badge';
import type { FeatureRequest } from '@/lib/types';
import { PageMeta } from '@/lib/seo';

export default function FeatureRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [target, setTarget] = useState<'PROPERTY' | 'AGENT' | 'SERVICE'>('PROPERTY');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const limit = 10;

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await featureRequestsApi.my({ page, limit });
      setRequests(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target || !targetId || !reason) {
      setSubmitError('Tous les champs sont requis');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await featureRequestsApi.create({
        target: target as FeatureRequest['target'],
        target_id: targetId,
        reason,
      });
      setShowForm(false);
      setTargetId('');
      setReason('');
      fetchRequests();
    } catch (err: any) {
      setSubmitError(err.message || 'Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <PageMeta title="Demandes de Fonctionnalités" description="Suggérez des améliorations pour la plateforme Immo." />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary-800">Mes Demandes</h1>
          <p className="text-primary-500 mt-1">Suggérez des améliorations ou signalez des biens</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : 'Nouvelle demande'}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 space-y-4">
          {submitError && (
            <div className="p-3 rounded-xl bg-red-400/15 backdrop-blur-sm border border-red-400/20 text-sm text-red-700">{submitError}</div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary-800/80">Type</label>
            <select value={target} onChange={(e) => setTarget(e.target.value as 'PROPERTY' | 'AGENT' | 'SERVICE')}
              className="rounded-xl bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] px-4 py-2.5 text-sm text-primary-800 outline-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30">
              <option value="PROPERTY">Bien immobilier</option>
              <option value="AGENT">Agent</option>
              <option value="SERVICE">Service</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary-800/80">ID du bien / agent</label>
            <input type="text" value={targetId} onChange={(e) => setTargetId(e.target.value)}
              placeholder="Ex: 123e4567-e89b-12d3-a456-426614174000"
              className="rounded-xl bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] px-4 py-2.5 text-sm text-primary-800 placeholder-primary-400 outline-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary-800/80">Raison</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
              placeholder="Décrivez votre demande…"
              className="rounded-xl bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] px-4 py-2.5 text-sm text-primary-800 placeholder-primary-400 outline-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 resize-none" />
          </div>
          <Button type="submit" loading={submitting}>Soumettre</Button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]">
          <p className="text-primary-500">Aucune demande pour le moment</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-[var(--glass-bg)]">
                <th className="text-left px-4 py-3 font-medium text-primary-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Cible</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Raison</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((fr) => (
                <tr key={fr.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors">
                  <td className="px-4 py-3 text-primary-800">{fr.target}</td>
                  <td className="px-4 py-3 text-primary-600 max-w-[200px] truncate">{fr.target_id}</td>
                  <td className="px-4 py-3 text-primary-600 max-w-[250px] truncate">{fr.reason}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadge(fr.status)}>{fr.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-primary-500 whitespace-nowrap">
                    {new Date(fr.created_at).toLocaleDateString('fr-FR')}
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
