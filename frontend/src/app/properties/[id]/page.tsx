'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { propertiesApi, inquiriesApi, favoritesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Property, CreateInquiryDto } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { PageMeta, JsonLd } from '@/lib/seo';

const propertyTypeLabels: Record<string, string> = {
  MAISON: 'Maison',
  BUREAU: 'Bureau',
  ENTREPOT: 'Entrepôt',
  LOCAL_COMMERCIAL: 'Local commercial',
  TERRAIN: 'Terrain',
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  const fetchProperty = useCallback(async () => {
    try {
      const res = await propertiesApi.get(id);
      setProperty(res.data);
    } catch {
      router.push('/properties');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  useEffect(() => {
    if (user) setInquiryName(user.full_name);
  }, [user]);

  useEffect(() => {
    if (!user || !id) return;
    favoritesApi.check(id).then((res) => setIsFavorite(res.data.isFavorite)).catch(() => {});
  }, [user, id]);

  const handleFavoriteToggle = async () => {
    if (!user) { router.push('/auth/login'); return; }
    setFavoriteLoading(true);
    try {
      if (isFavorite) { await favoritesApi.remove(id); setIsFavorite(false); }
      else { await favoritesApi.add(id); setIsFavorite(true); }
    } catch { /* ignore */ }
    finally { setFavoriteLoading(false); }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim() || !inquiryMessage.trim()) {
      setInquiryError('Veuillez remplir tous les champs');
      return;
    }
    setInquirySubmitting(true);
    setInquiryError('');
    try {
      const dto: CreateInquiryDto = {
        name: inquiryName.trim(),
        phone_number: inquiryPhone.trim(),
        message: inquiryMessage.trim(),
      };
      await inquiriesApi.create(id, dto);
      setInquirySuccess(true);
      setInquiryName(user?.full_name || '');
      setInquiryPhone('');
      setInquiryMessage('');
    } catch (err: any) {
      setInquiryError(err?.message || 'Une erreur est survenue');
    } finally {
      setInquirySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center gap-3 text-primary-500">
          <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          Chargement…
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-primary-500">
        Annonce introuvable.
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      <PageMeta title={`${property.title} - ${property.city || 'Cameroun'}`} description={`Annonce immobilière : ${property.title} à ${property.city || 'Cameroun'}. ${property.size_m2} m², ${formatPrice(property.price)}.`} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: property.title,
        description: property.description?.slice(0, 200) || 'Annonce immobilière au Cameroun',
        category: property.property_type.replace(/_/g, ' '),
        offers: {
          '@type': 'Offer',
          price: property.price,
          priceCurrency: 'XAF',
          availability: 'https://schema.org/InStock',
        },
      }} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <div className="rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 overflow-hidden">
            <div className="aspect-[16/9] bg-primary-100/50 relative">
              {images.length > 0 ? (
                <img
                  src={images[mainImageIndex].image_url}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary-300">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                {property.is_featured && (
                  <span className="bg-amber-400/80 backdrop-blur-sm text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-300/40">
                    À la une
                  </span>
                )}
                <Badge variant={statusBadge(property.status)}>
                  {property.status === 'APPROVED' ? 'Approuvé' : property.status === 'PENDING' ? 'En attente' : 'Rejeté'}
                </Badge>
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setMainImageIndex(idx)}
                    className={`w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 cursor-pointer ${
                      idx === mainImageIndex
                        ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                        : 'border-transparent hover:border-primary-300/50'
                    }`}
                  >
                    <img src={img.image_url} alt={property.title + ' - Vue ' + (idx + 1)} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary-800">
                  {property.title}
                </h1>
                <p className="text-primary-500 mt-1.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.address}, {property.city}
                  {property.neighborhood && `, ${property.neighborhood}`}
                </p>
              </div>
              <span className="text-3xl font-bold text-primary-700 whitespace-nowrap">
                {formatPrice(property.price)}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-1.5 text-sm text-primary-600 bg-[var(--glass-bg)] backdrop-blur-sm px-3 py-1.5 rounded-full border border-[var(--glass-border)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                {property.size_m2} m²
              </div>
              <Badge variant={statusBadge(property.property_type)}>
                {propertyTypeLabels[property.property_type] ?? property.property_type}
              </Badge>
              {property.country && (
                <div className="inline-flex items-center gap-1.5 text-sm text-primary-600 bg-[var(--glass-bg)] backdrop-blur-sm px-3 py-1.5 rounded-full border border-[var(--glass-border)]">
                  {property.country}
                </div>
              )}
            </div>

            <div className="pt-2">
              <h2 className="font-heading font-semibold text-primary-800 mb-3">Description</h2>
              <p className="text-primary-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card title="Propriétaire">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--glass-border)]">
                <div className="w-10 h-10 rounded-full bg-primary-600/10 border border-primary-400/20 flex items-center justify-center text-primary-700 font-heading font-semibold">
                  {property.owner.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-primary-800">{property.owner.full_name}</p>
                  <p className="text-primary-500 text-xs">Propriétaire</p>
                </div>
              </div>
              <p>
                <span className="font-medium text-primary-800">Email :</span>{' '}
                <span className="text-primary-600">{property.owner.email}</span>
              </p>
              {property.owner.phone && (
                <p>
                  <span className="font-medium text-primary-800">Téléphone :</span>{' '}
                  <span className="text-primary-600">{property.owner.phone}</span>
                </p>
              )}
            </div>
          </Card>

          {user && user.id === property.owner_id && (
            <Link href={`/dashboard/properties/${id}/edit`}>
              <Button variant="secondary" className="w-full">Modifier l&apos;annonce</Button>
            </Link>
          )}

          {user && (
            <Button
              variant={isFavorite ? 'danger' : 'secondary'}
              onClick={handleFavoriteToggle}
              loading={favoriteLoading}
              className="w-full"
            >
              <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </Button>
          )}

          <Card title="Contacter le propriétaire">
            {inquirySuccess ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-emerald-700 font-medium mb-3">Message envoyé avec succès !</p>
                <Button variant="ghost" onClick={() => setInquirySuccess(false)}>
                  Envoyer un autre message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <Input label="Nom" type="text" value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)} placeholder="Votre nom" />
                <Input label="Téléphone" type="tel" value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)} placeholder="Votre numéro" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-primary-800/80">Message</label>
                  <textarea
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Bonjour, je suis intéressé par ce bien…"
                    rows={4}
                    className="rounded-xl bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] px-4 py-2.5 text-sm text-primary-800 placeholder-primary-400 outline-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 resize-none"
                  />
                </div>
                {inquiryError && <p className="text-xs text-red-500 font-medium">{inquiryError}</p>}
                <Button type="submit" loading={inquirySubmitting} className="w-full">Envoyer</Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
