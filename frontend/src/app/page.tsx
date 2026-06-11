'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { propertiesApi, usersApi, statsApi } from '@/lib/api';
import type { Property, User, DashboardStats } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { PropertyCardSkeleton, AgentCardSkeleton, CityCardSkeleton, StatSkeleton } from '@/components/ui/Skeleton';
import { Reveal, Stagger, CountUp, useInView } from '@/components/ui/Animations';
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

const heroImages = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
  'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1600&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80',
];

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export default function HomePage() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [heroIdx, setHeroIdx] = useState(0);

  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [topAgents, setTopAgents] = useState<User[]>([]);
  const [agentPropertyCounts, setAgentPropertyCounts] = useState<Record<string, number>>({});

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIdx(i => {
        let next: number;
        do { next = Math.floor(Math.random() * heroImages.length); } while (next === i);
        return next;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [propsRes, usersRes, statsRes] = await Promise.all([
          propertiesApi.list({ limit: 50, sort: 'newest' }),
          usersApi.list({ page: 1, limit: 50, role: 'OWNER' }),
          statsApi.dashboard(),
        ]);

        if (cancelled) return;

        setStats(statsRes.data);

        const allProperties = propsRes.data;

        const recent = allProperties.slice(0, 6);
        const featured = allProperties
          .filter(p => p.is_featured)
          .slice(0, 6)
          .length > 0
          ? allProperties.filter(p => p.is_featured).slice(0, 6)
          : allProperties.slice(6, 12);

        setRecentProperties(recent);
        setFeaturedProperties(featured.length > 0 ? featured : allProperties.slice(0, 6));

        // Build owner → property count
        const counts: Record<string, number> = {};
        allProperties.forEach(p => {
          counts[p.owner_id] = (counts[p.owner_id] || 0) + 1;
        });

        // Sort owners by property count, take top 3
        const owners = usersRes.data
          .filter(u => counts[u.id])
          .sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0))
          .slice(0, 3);

        setTopAgents(owners);
        setAgentPropertyCounts(counts);
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (propertyType) params.set('property_type', propertyType);
    router.push(`/properties${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <div>
      <PageMeta title="Accueil - Plateforme Immobilière au Cameroun" description="Trouvez votre prochain bien immobilier au Cameroun. Parcourez des milliers d'annonces de vente et location de maisons, appartements, terrains et bureaux." />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Immo',
        url: 'https://immo.cm',
        description: 'Plateforme immobilière au Cameroun',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://immo.cm/properties?city={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      }} />
      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {heroImages.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: i === heroIdx ? 1 : 0, transition: 'opacity 2s ease-in-out' }}
            />
          ))}
          <div className="absolute inset-0 bg-primary-900/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-heading font-bold tracking-tight text-white leading-[1.1] px-2">
              Trouvez votre
              <br />
              <span className="text-primary-300">
                bien idéal
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mt-4 sm:mt-6 mb-8 sm:mb-10 font-light px-4">
              Parcourez des milliers d&apos;annonces de vente et location partout au Cameroun
            </p>

            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto p-2.5 sm:p-3 rounded-2xl bg-[var(--glass-bg)] backdrop-blur-2xl border border-[var(--glass-border)] shadow-xl shadow-primary-900/10"
            >
              <div className="flex-1 min-w-0">
                <Input
                  type="text"
                  placeholder="Ville, quartier…"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full !bg-[var(--glass-bg)] !border-[var(--glass-border)] !backdrop-blur-md h-12 sm:h-auto text-base"
                />
              </div>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full sm:w-auto rounded-xl bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--glass-border)] px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white outline-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30"
              >
                <option value="">Tous types</option>
                {Object.entries(propertyTypeLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <Button type="submit" size="lg" className="h-12 sm:h-auto whitespace-nowrap">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden xs:inline">Rechercher</span>
                <span className="xs:hidden">OK</span>
              </Button>
            </form>

            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 flex-wrap text-sm text-white/70 px-2">
              <span className="hidden sm:inline text-white/70">Recherches populaires :</span>
              {['Douala', 'Yaoundé', 'Maison', 'Terrain'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setCity(tag); }}
                  className="px-3 py-1 rounded-full bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)] text-white hover:bg-[var(--glass-bg-hover)] transition-all cursor-pointer text-xs"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

      
      </section>

      {/* ── Stats ── */}
      <StatsSection loading={loading} stats={stats} />

      {/* ── Propriétés récentes ── */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-primary-800">
              Propriétés récentes
            </h2>
            <p className="text-primary-500 mt-3 max-w-lg mx-auto text-sm sm:text-base">
              Les tout derniers biens mis en ligne sur notre plateforme
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : (
            <>
              <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" baseDelay={0} stepDelay={120}>
                {recentProperties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/properties/${property.id}`}
                    className="group rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 overflow-hidden hover:shadow-xl hover:shadow-primary-900/10 hover:bg-[var(--glass-bg-hover)] transition-all duration-500"
                  >
                    <div className="aspect-[4/3] bg-primary-100/50 relative overflow-hidden">
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
                    </div>
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-heading font-semibold text-primary-800 group-hover:text-primary-700 transition-colors truncate text-sm sm:text-base">
                          {property.title}
                        </h3>
                        {property.is_featured && (
                          <span className="shrink-0 bg-amber-400/80 backdrop-blur-sm text-amber-900 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border border-amber-300/40">
                            Une
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-primary-500 mt-1.5 flex items-center gap-1.5 truncate">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {property.city}{property.neighborhood && `, ${property.neighborhood}`}
                      </p>
                      <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--glass-border)]">
                        <span className="text-base sm:text-lg lg:text-xl font-bold text-primary-700">
                          {formatPrice(property.price)}
                        </span>
                        <Badge variant={statusBadge(property.property_type)} className="text-[10px] sm:text-xs">
                          {propertyTypeLabels[property.property_type] ?? property.property_type}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </Stagger>
              <div className="text-center mt-10 sm:mt-12">
                <Link href="/properties">
                  <Button variant="secondary" size="lg">
                    Voir toutes les annonces
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </>
          )}
        </section>
      </Reveal>

      {/* ── Villes les plus populaires ── */}
      <section className="bg-[var(--section-alt-bg)] backdrop-blur-sm border-y border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Reveal>
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-primary-800">
                Villes les plus populaires
              </h2>
              <p className="text-primary-500 mt-3 max-w-lg mx-auto text-sm sm:text-base">
                Découvrez les biens disponibles dans les grandes villes du Cameroun
              </p>
            </div>
          </Reveal>

          {loading || !stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <CityCardSkeleton key={i} />)}
            </div>
          ) : (
            <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" baseDelay={0} stepDelay={100}>
              {stats.cities.slice(0, 6).map((c) => (
                <Link
                  key={c.name}
                  href={`/properties?city=${encodeURIComponent(c.name)}`}
                  className="group rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 overflow-hidden hover:bg-[var(--glass-bg-hover)] transition-all duration-500"
                >
                  <div className="aspect-[16/9] bg-primary-200/40 relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary-900/40" />
                    <svg className="w-16 h-16 sm:w-20 sm:h-20 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                      <h3 className="text-lg sm:text-xl font-heading font-bold text-white">{c.name}</h3>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-sm text-primary-600">{c.count} annonces</span>
                    <svg className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      {/* ── Top 3 Meilleurs Agents ── */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-primary-800">
              Meilleurs agents immobiliers
            </h2>
            <p className="text-primary-500 mt-3 max-w-lg mx-auto text-sm sm:text-base">
              Les propriétaires les plus actifs de notre plateforme
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {[1, 2, 3].map(i => <AgentCardSkeleton key={i} />)}
            </div>
          ) : topAgents.length > 0 ? (
            <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto" baseDelay={0} stepDelay={140} from="scale">
              {topAgents.map((agent, idx) => (
                <div
                  key={agent.id}
                  className="relative rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 p-6 sm:p-8 text-center hover:bg-[var(--glass-bg-hover)] hover:shadow-xl hover:shadow-primary-900/10 transition-all duration-500"
                >
                  {idx === 0 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400/80 backdrop-blur-sm text-amber-900 text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full border border-amber-300/40">
                      #1 — Plus actif
                    </div>
                  )}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-primary-600 flex items-center justify-center text-white font-heading font-bold text-xl sm:text-2xl">
                    {getInitials(agent.full_name)}
                  </div>
                  <h3 className="font-heading font-semibold text-primary-800 text-base sm:text-lg truncate">
                    {agent.full_name}
                  </h3>
                  <p className="text-xs sm:text-sm text-primary-500 mt-1">
                    {agent.phone || 'Propriétaire'}
                  </p>
                  <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-[var(--glass-border)]">
                    <div className="text-center">
                      <p className="text-lg sm:text-xl font-bold text-primary-700">{agentPropertyCounts[agent.id] || 0}</p>
                      <p className="text-[10px] sm:text-xs text-primary-400">Annonces</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg sm:text-xl font-bold text-primary-700">
                        {agent.is_featured ? 'Premium' : 'Standard'}
                      </p>
                      <p className="text-[10px] sm:text-xs text-primary-400">Compte</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg sm:text-xl font-bold text-primary-700">
                        {agent.is_verified ? 'Oui' : 'Non'}
                      </p>
                      <p className="text-[10px] sm:text-xs text-primary-400">Vérifié</p>
                    </div>
                  </div>
                </div>
              ))}
            </Stagger>
          ) : null}
        </section>
      </Reveal>

      {/* ── Annonces à la une ── */}
      {!loading && featuredProperties.length > 0 && (
        <Reveal>
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-primary-800">
                Annonces à la une
              </h2>
              <p className="text-primary-500 mt-3 max-w-lg mx-auto text-sm sm:text-base">
                Les biens les plus remarquables de notre plateforme
              </p>
            </div>

            <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" baseDelay={0} stepDelay={120}>
              {featuredProperties.map((property) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="group rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 overflow-hidden hover:shadow-xl hover:shadow-primary-900/10 hover:bg-[var(--glass-bg-hover)] transition-all duration-500"
                >
                  <div className="aspect-[4/3] bg-primary-100/50 relative overflow-hidden">
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
                    <div className="absolute top-3 left-3">
                      <span className="bg-amber-400/80 backdrop-blur-sm text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-300/40">
                        À la une
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-heading font-semibold text-primary-800 group-hover:text-primary-700 transition-colors truncate">
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
            </Stagger>
          </section>
        </Reveal>
      )}

      {/* ── Trust / Why us ── */}
      <section className="bg-[var(--section-alt-bg)] backdrop-blur-sm border-y border-[var(--glass-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Reveal>
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-primary-800">
                Pourquoi choisir Immo ?
              </h2>
            </div>
          </Reveal>

          <Stagger className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8" baseDelay={0} stepDelay={120}>
            {[
              {
                icon: (
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Transactions sécurisées',
                desc: 'Toutes les transactions sont protégées et vérifiées pour votre tranquillité d\'esprit.',
              },
              {
                icon: (
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: 'Recherche intelligente',
                desc: 'Filtres avancés pour trouver exactement le bien qui correspond à vos critères.',
              },
              {
                icon: (
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Accompagnement dédié',
                desc: 'Une équipe professionnelle vous guide à chaque étape de votre projet immobilier.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 sm:p-8 rounded-2xl bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-lg shadow-black/5 text-center hover:bg-[var(--glass-bg-hover)] transition-all duration-300"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 sm:mb-5 rounded-xl bg-primary-600/10 border border-primary-400/20 flex items-center justify-center text-primary-600">
                  {item.icon}
                </div>
                <h3 className="font-heading font-semibold text-primary-800 mb-2 text-base sm:text-lg">{item.title}</h3>
                <p className="text-xs sm:text-sm text-primary-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── CTA ── */}
      <Reveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-primary-700 p-8 sm:p-12 lg:p-16 text-center">
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white mb-3 sm:mb-4">
                Vous êtes propriétaire ?
              </h2>
              <p className="text-primary-100 max-w-xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">
                Publiez votre annonce et touchez des milliers d&apos;acheteurs potentiels dès aujourd&apos;hui.
              </p>
              <Link href="/dashboard/properties/new">
                <Button
                  size="lg"
                  className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] text-white hover:bg-[var(--glass-bg-hover)] animate-pulse-glow w-full sm:w-auto"
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Publiez votre annonce
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

function StatsSection({ loading, stats }: { loading: boolean; stats: DashboardStats | null }) {
  const { ref, inView } = useInView(0.3);
  const items = stats ? [
    { label: 'Annonces', end: stats.total_properties, suffix: '+' },
    { label: 'Villes', end: stats.total_cities, suffix: '+' },
    { label: 'Propriétaires', end: stats.total_owners, suffix: '+' },
    { label: 'Demandes reçues', end: stats.total_inquiries, suffix: '+' },
  ] : [];

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl bg-[var(--glass-bg)] backdrop-blur-2xl border border-[var(--glass-border)] shadow-lg shadow-black/5">
        {loading || !stats ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            {items.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-primary-700">
                  <CountUp end={stat.end} suffix={stat.suffix} inView={inView} />
                </p>
                <p className="text-xs sm:text-sm text-primary-500 mt-0.5 sm:mt-1">{stat.label}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
