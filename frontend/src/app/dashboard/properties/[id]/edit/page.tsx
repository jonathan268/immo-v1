'use client';

import { propertiesApi, mediaApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import type { Property, PropertyType, PropertyImage } from '@/lib/types';
import { PageMeta } from '@/lib/seo';

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'MAISON', label: 'Maison' },
  { value: 'BUREAU', label: 'Bureau' },
  { value: 'ENTREPOT', label: 'Entrepôt' },
  { value: 'LOCAL_COMMERCIAL', label: 'Local Commercial' },
  { value: 'TERRAIN', label: 'Terrain' },
];

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
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

  const [images, setImages] = useState<PropertyImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const fetchProperty = useCallback(async () => {
    setLoading(true);
    try {
      const res = await propertiesApi.get(id);
      const p = res.data;
      setForm({
        title: p.title,
        description: p.description,
        country: p.country,
        city: p.city,
        neighborhood: p.neighborhood,
        address: p.address,
        property_type: p.property_type,
        price: String(p.price),
        currency: p.currency,
        size_m2: String(p.size_m2),
      });
      setImages(p.images || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProperty(); }, [fetchProperty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await propertiesApi.update(id, {
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
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fileArray = Array.from(files);
      const res = await mediaApi.upload(id, fileArray);
      setImages((prev) => [
        ...prev,
        ...res.data.map((img, idx) => ({
          id: img.public_id || `temp-${Date.now()}-${idx}`,
          property_id: id,
          image_url: img.image_url,
          order: prev.length + idx,
          created_at: new Date().toISOString(),
        })),
      ]);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du téléchargement');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await mediaApi.delete(id, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    newImages.forEach((img, i) => (img.order = i));
    setImages(newImages);
    mediaApi.reorder(id, newImages.map((img) => ({ id: img.id, order: img.order }))).catch(console.error);
  };

  return (
    <>
      <PageMeta title="Modifier l'Annonce" description="Modifiez votre annonce immobilière sur Immo." />
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-2xl animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-primary-800">Modifier l&apos;annonce</h1>
        <p className="text-primary-500 mt-1">Modifiez les informations de votre annonce</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-400/15 backdrop-blur-sm border border-red-400/20 text-sm text-red-700">{error}</div>
          )}

          <Input label="Titre" value={form.title} onChange={(e) => handleChange('title', e.target.value)} required />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-primary-800/80">Description</label>
            <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} required rows={4}
              className="block w-full rounded-xl bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] px-4 py-2.5 text-sm text-primary-800 placeholder-primary-400 outline-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Pays" value={form.country} onChange={(e) => handleChange('country', e.target.value)} required />
            <Input label="Ville" value={form.city} onChange={(e) => handleChange('city', e.target.value)} required />
            <Input label="Quartier" value={form.neighborhood} onChange={(e) => handleChange('neighborhood', e.target.value)} required />
            <Input label="Adresse" value={form.address} onChange={(e) => handleChange('address', e.target.value)} required />
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
            <Input label="Prix" type="number" min={0} value={form.price} onChange={(e) => handleChange('price', e.target.value)} required />
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
            <Button type="submit" loading={saving}>Enregistrer</Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>Annuler</Button>
          </div>
        </form>
      </Card>

      <Card title="Images" className="mt-6">
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {images.map((img, index) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-[var(--glass-border)] bg-[var(--glass-bg)]">
                <img src={img.image_url} alt={`${form.title || 'Annonce'} - Image ${index + 1}`} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <button type="button" onClick={() => handleMoveImage(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 bg-white/80 rounded-lg hover:bg-white transition-colors disabled:opacity-30 cursor-pointer">
                    <svg className="w-4 h-4 text-primary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => handleMoveImage(index, 'down')}
                    disabled={index === images.length - 1}
                    className="p-1.5 bg-white/80 rounded-lg hover:bg-white transition-colors disabled:opacity-30 cursor-pointer">
                    <svg className="w-4 h-4 text-primary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => handleDeleteImage(img.id)}
                    className="p-1.5 bg-red-500/80 rounded-lg hover:bg-red-500 transition-colors cursor-pointer">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <span className="absolute top-2 left-2 bg-primary-900/60 text-white text-xs px-2 py-0.5 rounded-lg backdrop-blur-sm">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-primary-800/80 mb-1">Ajouter des images</label>
          <input type="file" multiple accept="image/*" onChange={handleUpload} disabled={uploading}
            className="block w-full text-sm text-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary-600/10 file:text-primary-700 hover:file:bg-primary-600/20 file:transition-colors file:cursor-pointer" />
          {uploading && <p className="text-sm text-primary-500 mt-1">Téléchargement en cours...</p>}
        </div>
      </Card>
    </div>
      )}
    </>
  );
}
