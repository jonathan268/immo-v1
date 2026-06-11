'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { favoritesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Property } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { PageMeta } from '@/lib/seo';

const propertyTypeLabels: Record<string, string> = {
  MAISON: 'Maison',
  BUREAU: 'Bureau',
  ENTREPOT: 'Entrepôt',
  LOCAL_COMMERCIAL: 'Local commercial',
  TERRAIN: 'Terrain',
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    favoritesApi
      .list()
      .then((res) => setFavorites(res.data))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleRemove = async (propertyId: string) => {
    setRemoving(propertyId);
    try {
      await favoritesApi.remove(propertyId);
      setFavorites((prev) => prev.filter((p) => p.id !== propertyId));
    } catch {
      /* ignore */
    } finally {
      setRemoving(null);
    }
  };

  return (
    <>
      <PageMeta title="Mes Favoris" description="Retrouvez tous vos biens immobiliers favoris enregistrés sur Immo." />
      {authLoading || loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-3 text-primary-500">
            <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            Chargement…
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
          <h1 className="text-3xl font-heading font-bold text-primary-800 mb-8">
            Mes favoris
          </h1>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] flex items-center justify-center text-primary-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-primary-500 mb-4">
            Vous n&apos;avez pas encore de favoris.
          </p>
          <Link href="/properties">
            <Button>Parcourir les annonces</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <div
              key={property.id}
              className="group rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 overflow-hidden hover:shadow-xl hover:shadow-primary-900/10 hover:bg-[var(--glass-bg)] transition-all duration-500"
            >
              <Link href={`/properties/${property.id}`}>
                <div className="aspect-[4/3] bg-primary-100/50 relative overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0].image_url}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-300">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {property.is_featured && (
                    <span className="absolute top-3 left-3 bg-amber-400/80 backdrop-blur-sm text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-300/40">
                      À la une
                    </span>
                  )}
                  <Badge
                    variant={statusBadge(property.property_type)}
                    className="absolute top-3 right-3"
                  >
                    {propertyTypeLabels[property.property_type] ?? property.property_type}
                  </Badge>
                </div>
              </Link>
              <div className="p-5">
                <Link href={`/properties/${property.id}`}>
                  <h3 className="font-heading font-semibold text-primary-800 group-hover:text-primary-700 transition-colors truncate">
                    {property.title}
                  </h3>
                </Link>
                <p className="text-sm text-primary-500 mt-1.5">
                  {property.city}
                  {property.neighborhood && `, ${property.neighborhood}`}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-primary-700">
                    {formatPrice(property.price)}
                  </span>
                  <span className="text-xs text-primary-400">{property.size_m2} m²</span>
                </div>
                <Button
                  variant="danger"
                  className="w-full mt-3"
                  onClick={() => handleRemove(property.id)}
                  loading={removing === property.id}
                >
                  Retirer des favoris
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
      )}
    </>
  );
}
