'use client';

import { useEffect, useState } from 'react';
import { paymentsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import type { Payment } from '@/lib/types';
import { PageMeta } from '@/lib/seo';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const limit = 15;

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

  useEffect(() => { fetchPayments(); }, [page]);

  const handleConfirm = async (paymentId: string) => {
    setActionLoading(paymentId);
    try {
      await paymentsApi.confirm(paymentId);
      fetchPayments();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <PageMeta title="Gestion des Paiements" description="Administrez les paiements sur la plateforme Immo." />
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-primary-800">Gestion des paiements</h1>
        <p className="text-primary-500 mt-1">Confirmez ou vérifiez les paiements</p>
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
                <th className="text-left px-4 py-3 font-medium text-primary-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Propriétaire</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Montant</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Statut</th>
                <th className="text-right px-4 py-3 font-medium text-primary-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pay) => (
                <tr key={pay.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors">
                  <td className="px-4 py-3 text-primary-600 whitespace-nowrap">
                    {new Date(pay.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 font-medium text-primary-800">{pay.owner.full_name}</td>
                  <td className="px-4 py-3 text-primary-800">{pay.amount.toLocaleString()} {pay.currency}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(pay.status)}>{pay.status}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    {pay.status === 'PENDING' && (
                      <Button variant="ghost" size="sm" loading={actionLoading === pay.id}
                        onClick={() => handleConfirm(pay.id)}>Confirmer</Button>
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
