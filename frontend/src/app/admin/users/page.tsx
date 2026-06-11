'use client';

import { useEffect, useState } from 'react';
import { usersApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import type { User } from '@/lib/types';
import { PageMeta } from '@/lib/seo';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const limit = 15;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.list({ page, limit });
      setUsers(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleAction = async (userId: string, action: 'suspend' | 'unsuspend' | 'feature') => {
    setActionLoading(userId);
    try {
      if (action === 'suspend') await usersApi.suspend(userId);
      else if (action === 'unsuspend') await usersApi.unsuspend(userId);
      else if (action === 'feature') await usersApi.feature(userId);
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <PageMeta title="Gestion des Utilisateurs" description="Gérez les utilisateurs de la plateforme Immo." />
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-primary-800">Gestion des utilisateurs</h1>
        <p className="text-primary-500 mt-1">Gérez les comptes utilisateurs de la plateforme</p>
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
                <th className="text-left px-4 py-3 font-medium text-primary-600">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Rôle</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Premium</th>
                <th className="text-right px-4 py-3 font-medium text-primary-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors">
                  <td className="px-4 py-3 font-medium text-primary-800">{u.full_name}</td>
                  <td className="px-4 py-3 text-primary-600">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadge(u.role)}>{u.role}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge variant={u.is_suspended ? 'danger' : 'success'}>
                      {u.is_suspended ? 'Suspendu' : 'Actif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_featured ? <Badge variant="info">Premium</Badge> : <span className="text-primary-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {u.is_suspended ? (
                        <Button variant="ghost" size="sm" loading={actionLoading === u.id}
                          onClick={() => handleAction(u.id, 'unsuspend')}>Réactiver</Button>
                      ) : (
                        <Button variant="ghost" size="sm" loading={actionLoading === u.id}
                          onClick={() => handleAction(u.id, 'suspend')}>Suspendre</Button>
                      )}
                      <Button variant="ghost" size="sm" loading={actionLoading === u.id}
                        onClick={() => handleAction(u.id, 'feature')}>
                        {u.is_featured ? 'Retirer Premium' : 'Premium'}
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
