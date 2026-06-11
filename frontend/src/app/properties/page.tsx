'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { propertiesApi } from '@/lib/api';
import type { Property, PropertiesListQuery } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Badge, { statusBadge } from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { PropertyCardSkeleton } from '@/components/ui/Skeleton';
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

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <PropertyCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <PropertiesContent />
    </Suspense>
  );
}

function FilterSidebar({
  city, setCity,
  propertyType, setPropertyType,
  priceMin, setPriceMin,
  priceMax, setPriceMax,
  sizeMin, setSizeMin,
  sizeMax, setSizeMax,
  sort, setSort,
  onApply, onReset,
  open, onClose,
}: {
  city: string; setCity: (v: string) => void;
  propertyType: string; setPropertyType: (v: string) => void;
  priceMin: string; setPriceMin: (v: string) => void;
  priceMax: string; setPriceMax: (v: string) => void;
  sizeMin: string; setSizeMin: (v: string) => void;
  sizeMax: string; setSizeMax: (v: string) => void;
  sort: string; setSort: (v: string) => void;
  onApply: (e: React.FormEvent) => void;
  onReset: () => void;
  open: boolean;
  onClose: () => void;
}) {
  const content = (
    <form onSubmit={onApply} className="space-y-5">
      <div className="flex items-center justify-between lg:hidden">
        <h3 className="font-heading font-semibold text-primary-800 text-lg">Filtres</h3>
        <button type="button" onClick={onClose}
          className="p-2 rounded-xl text-primary-500 hover:bg-[var(--glass-bg)] transition-colors cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <Input
        label="Ville"
        type="text"
        placeholder="Douala, Yaoundé…"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-primary-700">Type de bien</label>
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="w-full rounded-xl bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] px-4 py-3 sm:py-2.5 text-base sm:text-sm text-primary-800 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 min-h-[44px]"
        >
          <option value="">Tous</option>
          {Object.entries(propertyTypeLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-primary-700 block mb-1.5">Prix (FCFA)</label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="Min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
          <Input type="number" placeholder="Max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-primary-700 block mb-1.5">Surface (m²)</label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="Min" value={sizeMin} onChange={(e) => setSizeMin(e.target.value)} />
          <Input type="number" placeholder="Max" value={sizeMax} onChange={(e) => setSizeMax(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-primary-700">Trier par</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full rounded-xl bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] px-4 py-3 sm:py-2.5 text-base sm:text-sm text-primary-800 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 min-h-[44px]"
        >
          <option value="newest">Plus récentes</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">Appliquer</Button>
        <Button type="button" variant="ghost" onClick={onReset}>Effacer</Button>
      </div>
    </form>
  );

  return (
    <>
      {/* Mobile overlay drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-primary-900/30 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-[var(--body-bg)] overflow-y-auto animate-slide-in-left shadow-2xl">
            <div className="p-5 border-b border-primary-200/30 bg-[var(--glass-bg)] backdrop-blur-md sticky top-0 z-10">
              <h3 className="font-heading font-bold text-primary-800 text-lg">Filtres</h3>
            </div>
            <div className="p-5">
              {content}
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 p-5 sticky top-20">
          <h2 className="font-heading font-semibold text-primary-800 mb-5">Filtres</h2>
          {content}
        </div>
      </aside>
    </>
  );
}

function PropertiesContent() {
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [city, setCity] = useState(searchParams.get('city') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('property_type') || '');
  const [priceMin, setPriceMin] = useState(searchParams.get('price_min') || '');
  const [priceMax, setPriceMax] = useState(searchParams.get('price_max') || '');
  const [sizeMin, setSizeMin] = useState(searchParams.get('size_min') || '');
  const [sizeMax, setSizeMax] = useState(searchParams.get('size_max') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const query: PropertiesListQuery = { page, limit: 12, sort: sort as PropertiesListQuery['sort'] };
      if (city) query.city = city;
      if (propertyType) query.property_type = propertyType as PropertiesListQuery['property_type'];
      if (priceMin) query.price_min = Number(priceMin);
      if (priceMax) query.price_max = Number(priceMax);
      if (sizeMin) query.size_min = Number(sizeMin);
      if (sizeMax) query.size_max = Number(sizeMax);

      const res = await propertiesApi.list(query);
      setProperties(res.data);
      setTotalPages(res.meta.totalPages);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [page, city, propertyType, priceMin, priceMax, sizeMin, sizeMax, sort]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSidebarOpen(false);
  };

  const handleReset = () => {
    setCity('');
    setPropertyType('');
    setPriceMin('');
    setPriceMax('');
    setSizeMin('');
    setSizeMax('');
    setSort('newest');
    setPage(1);
    setSidebarOpen(false);
  };

  const activeFilters = [city, propertyType, priceMin, priceMax, sizeMin, sizeMax].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <PageMeta title="Annonces Immobilières au Cameroun" description="Consultez toutes les annonces immobilières au Cameroun. Filtrez par ville, type de bien et prix pour trouver la maison, l'appartement ou le terrain de vos rêves." />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary-800">
            Annonces Immobilières au Cameroun
          </h1>
          {!loading && (
            <p className="text-sm text-primary-500 mt-1">
              {properties.length} résultat{properties.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Button
          variant="secondary"
          size="md"
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filtres
          {activeFilters > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </Button>
      </div>

      <div className="flex gap-8">
        <FilterSidebar
          city={city} setCity={setCity}
          propertyType={propertyType} setPropertyType={setPropertyType}
          priceMin={priceMin} setPriceMin={setPriceMin}
          priceMax={priceMax} setPriceMax={setPriceMax}
          sizeMin={sizeMin} setSizeMin={setSizeMin}
          sizeMax={sizeMax} setSizeMax={setSizeMax}
          sort={sort} setSort={setSort}
          onApply={handleFilter}
          onReset={handleReset}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary-100/30 border border-primary-200/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-primary-600 font-medium mb-1">Aucune annonce trouvée</p>
              <p className="text-sm text-primary-400 mb-4">Essayez de modifier vos filtres</p>
              <Button variant="secondary" onClick={handleReset}>Réinitialiser les filtres</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {properties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/properties/${property.id}`}
                    className="group rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 overflow-hidden hover:shadow-xl hover:shadow-primary-900/10 hover:bg-[var(--glass-bg)] transition-all duration-500"
                  >
                    <div className="aspect-[4/3] bg-primary-100/40 relative overflow-hidden">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0].image_url}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary-300">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-1">
                        {property.is_featured && (
                          <span className="bg-amber-400/80 backdrop-blur-sm text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-300/40">
                            À la une
                          </span>
                        )}
                      </div>
                      <Badge variant={statusBadge(property.property_type)} className="absolute top-3 right-3">
                        {propertyTypeLabels[property.property_type] ?? property.property_type}
                      </Badge>
                    </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="font-heading font-semibold text-primary-800 group-hover:text-primary-600 transition-colors truncate">
                        {property.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-primary-500 mt-1.5 flex items-center gap-1.5 truncate">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {property.city}{property.neighborhood && `, ${property.neighborhood}`}
                      </p>
                      <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--glass-border)]">
                        <span className="text-base sm:text-lg lg:text-xl font-bold text-primary-700">
                          {formatPrice(property.price)}
                        </span>
                        <span className="text-[10px] sm:text-xs text-primary-400">{property.size_m2} m²</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8 sm:mt-10">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
