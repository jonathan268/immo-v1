'use client';

import { inquiriesApi, propertiesApi } from '@/lib/api';
import Pagination from '@/components/ui/Pagination';
import { useState, useEffect } from 'react';
import type { Inquiry, Property } from '@/lib/types';
import { PageMeta } from '@/lib/seo';

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterPropertyId, setFilterPropertyId] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);

  const limit = 10;

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await inquiriesApi.getReceived({ page, limit, property_id: filterPropertyId || undefined });
      setInquiries(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await propertiesApi.myListings({ limit: 100 });
      setProperties(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchProperties(); }, []);
  useEffect(() => { fetchInquiries(); }, [page, filterPropertyId]);

  return (
    <div className="animate-fade-in-up">
      <PageMeta title="Mes Demandes" description="Consultez les demandes de contact reçues pour vos annonces immobilières." />
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-primary-800">Mes Demandes</h1>
        <p className="text-primary-500 mt-1">Demandes de renseignements reçues</p>
      </div>

      <div className="mb-4">
        <select
          value={filterPropertyId}
          onChange={(e) => { setFilterPropertyId(e.target.value); setPage(1); }}
          className="rounded-xl bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] px-4 py-2.5 text-sm text-primary-800 outline-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30"
        >
          <option value="">Toutes les annonces</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)]">
          <p className="text-primary-500">Aucune demande reçue</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-[var(--glass-bg)]">
                <th className="text-left px-4 py-3 font-medium text-primary-600">Annonce</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Expéditeur</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Téléphone</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Message</th>
                <th className="text-left px-4 py-3 font-medium text-primary-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => (
                <tr key={inq.id} className="border-b border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors cursor-pointer"
                  onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}>
                  <td className="px-4 py-3 text-primary-800 max-w-[150px] truncate">{inq.property?.title || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-primary-800">{inq.name}</span>
                  </td>
                  <td className="px-4 py-3 text-primary-600">{inq.phone_number}</td>
                  <td className="px-4 py-3 max-w-[250px]">
                    <p className={`text-primary-600 truncate ${expanded === inq.id ? '' : 'truncate'}`}>
                      {inq.message}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-primary-500 whitespace-nowrap">
                    {new Date(inq.created_at).toLocaleDateString('fr-FR')}
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
