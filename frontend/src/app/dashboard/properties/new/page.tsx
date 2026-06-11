'use client';

import { propertiesApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { PropertyType } from '@/lib/types';
import { PageMeta } from '@/lib/seo';

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'MAISON', label: 'Maison' },
  { value: 'BUREAU', label: 'Bureau' },
  { value: 'ENTREPOT', label: 'Entrepôt' },
  { value: 'LOCAL_COMMERCIAL', label: 'Local Commercial' },
  { value: 'TERRAIN', label: 'Terrain' },
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    country: '',
    city: '',
    neighborhood: '',
    address: '',
    property_type: '' as PropertyType | '',
    price: '',
    currency: 'XOF',
    size_m2: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await propertiesApi.create({
        title: form.title,
        description: form.description,
        country: form.country,
        city: form.city,
        neighborhood: form.neighborhood,
        address: form.address,
        property_type: form.property_type as PropertyType,
        price: Number(form.price),
        currency: form.currency,
        size_m2: Number(form.size_m2),
      });
      router.push('/dashboard/properties');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl animate-fade-in-up">
      <PageMeta title="Nouvelle Annonce" description="Publiez une nouvelle annonce immobilière sur Immo." />
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-primary-800">Nouvelle annonce</h1>
        <p className="text-primary-500 mt-1">Créez une nouvelle annonce immobilière</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-400/15 backdrop-blur-sm border border-red-400/20 text-sm text-red-700">{error}</div>
          )}

          <Input label="Titre" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
            required placeholder="Ex: Villa avec piscine" />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-primary-800/80">Description</label>
            <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)}
              required rows={4} placeholder="Décrivez votre bien en détail…"
              className="block w-full rounded-xl bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] px-4 py-2.5 text-sm text-primary-800 placeholder-primary-400 outline-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Pays" value={form.country} onChange={(e) => handleChange('country', e.target.value)} required placeholder="Cameroun" />
            <Input label="Ville" value={form.city} onChange={(e) => handleChange('city', e.target.value)} required placeholder="Douala" />
            <Input label="Quartier" value={form.neighborhood} onChange={(e) => handleChange('neighborhood', e.target.value)} required placeholder="Bonanjo" />
            <Input label="Adresse" value={form.address} onChange={(e) => handleChange('address', e.target.value)} required placeholder="123 Rue XYZ" />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-primary-800/80">Type de bien</label>
            <select value={form.property_type} onChange={(e) => handleChange('property_type', e.target.value)} required
              className="block w-full rounded-xl bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] px-4 py-2.5 text-sm text-primary-800 outline-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30">
              <option value="">Sélectionnez un type</option>
              {propertyTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Prix" type="number" min={0} value={form.price}
              onChange={(e) => handleChange('price', e.target.value)} required />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-primary-800/80">Devise</label>
              <select value={form.currency} onChange={(e) => handleChange('currency', e.target.value)}
                className="block w-full rounded-xl bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] px-4 py-2.5 text-sm text-primary-800 outline-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30">
                <option value="XOF">XOF</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <Input label="Superficie (m²)" type="number" min={0} value={form.size_m2}
              onChange={(e) => handleChange('size_m2', e.target.value)} required />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>Créer l&apos;annonce</Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>Annuler</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
