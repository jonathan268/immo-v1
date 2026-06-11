'use client';

import { useEffect, useState } from 'react';
import { paymentsApi } from '@/lib/api';
import Pagination from '@/components/ui/Pagination';
import Badge, { statusBadge } from '@/components/ui/Badge';
import type { Payment } from '@/lib/types';
import { PageMeta } from '@/lib/seo';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const limit = 10;

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await paymentsApi.list({ page, limit });
        setPayments(res.data);
        setTotalPages(res.meta.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [page]);

  return (
    <div className="animate-fade-in-up">
      <PageMeta title="Mes Paiements" description="Consultez l'historique de vos paiements sur Immo." />
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-primary-800">Mes Paiements</h1>
        <p className="text-primary-500 mt-1">Historique de vos paiements</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]">
          <p className="text-primary-500">Aucun paiement pour le moment</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-[var(--glass-bg)]">
                <th className="text-left px-4 py-3 font-medium text-primary-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Annonce</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Montant</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Statut</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors">
                  <td className="px-4 py-3 text-primary-600 whitespace-nowrap">
                    {new Date(p.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-primary-800 max-w-[200px] truncate">{p.property?.title || '—'}</td>
                  <td className="px-4 py-3 font-medium text-primary-800">
                    {p.amount.toLocaleString()} {p.currency}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadge(p.status)}>{p.status}</Badge>
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
