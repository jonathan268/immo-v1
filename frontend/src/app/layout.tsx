import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const BASE_URL = 'https://immo.cm';

export const metadata: Metadata = {
  title: {
    default: 'Immo - Plateforme Immobilière au Cameroun',
    template: '%s | Immo',
  },
  description: 'Trouvez votre prochain bien immobilier au Cameroun. Consultez des milliers d\'annonces de vente et location de maisons, appartements, terrains et bureaux.',
  keywords: ['immobilier Cameroun', 'annonces immobilières', 'vente maison Cameroun', 'location Cameroun', 'agence immobilière', 'appartement Cameroun', 'terrain Cameroun'],
  authors: [{ name: 'Immo' }],
  openGraph: {
    title: 'Immo - Plateforme Immobilière au Cameroun',
    description: 'Trouvez votre prochain bien immobilier au Cameroun.',
    url: BASE_URL,
    siteName: 'Immo',
    locale: 'fr_FR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Immo',
              url: BASE_URL,
              description: 'Plateforme immobilière au Cameroun',
              areaServed: { '@type': 'Country', name: 'Cameroun' },
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col text-primary-800 antialiased font-body"
        style={{ backgroundColor: 'var(--body-bg)' }}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
