'use client';

import { propertiesApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { Property } from '@/lib/types';
import { PageMeta } from '@/lib/seo';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const limit = 10;

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await propertiesApi.myListings({ page, limit });
      setProperties(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await propertiesApi.delete(id);
      setConfirmDelete(null);
      fetchProperties();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price);
  };

  return (
    <div className="animate-fade-in-up">
      <PageMeta title="Mes Annonces" description="Gérez toutes vos annonces immobilières sur Immo." />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary-800">Mes Annonces</h1>
          <p className="text-primary-500 mt-1">Gérez vos annonces immobilières</p>
        </div>
        <Link href="/dashboard/properties/new">
          <Button>Nouvelle annonce</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]">
          <p className="text-primary-500">Aucune annonce pour le moment</p>
          <Link href="/dashboard/properties/new">
            <Button className="mt-4">Créer une annonce</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--glass-border)] bg-[var(--glass-bg)]">
                  <th className="text-left px-4 py-3 font-medium text-primary-600">Titre</th>
                  <th className="text-left px-4 py-3 font-medium text-primary-600">Ville</th>
                  <th className="text-left px-4 py-3 font-medium text-primary-600">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-primary-600">Premium</th>
                  <th className="text-right px-4 py-3 font-medium text-primary-600">Prix</th>
                  <th className="text-left px-4 py-3 font-medium text-primary-600">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-primary-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors">
                    <td className="px-4 py-3 font-medium text-primary-800 max-w-[200px] truncate">{p.title}</td>
                    <td className="px-4 py-3 text-primary-600">{p.city}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadge(p.status)}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {p.is_featured ? <Badge variant="info">Premium</Badge> : <span className="text-primary-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-primary-800">{formatPrice(p.price, p.currency)}</td>
                    <td className="px-4 py-3 text-primary-500">
                      {new Date(p.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/properties/${p.id}/edit`}>
                          <Button variant="ghost" size="sm">Modifier</Button>
                        </Link>
                        {confirmDelete === p.id ? (
                          <div className="flex gap-1">
                            <Button variant="danger" size="sm" loading={deleting === p.id}
                              onClick={() => handleDelete(p.id)}>Confirmer</Button>
                            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>Annuler</Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(p.id)}>Supprimer</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
