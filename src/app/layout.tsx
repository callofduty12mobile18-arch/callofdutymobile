import type { Metadata } from 'next';
import { Chakra_Petch, Inter } from 'next/font/google';
import './globals.css';
import { ScrollToTopHandler } from '@/components/common/ScrollToTopHandler';

const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-chakra',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | CallOfDutyMobile — Indian CODM',
    default: 'CallOfDutyMobile — Indian Call of Duty: Mobile Directory & Platform',
  },
  description:
    'The premier independent platform documenting the Indian Call of Duty: Mobile competitive scene. Explore verified player profiles, team rosters, tournament standings, and career achievements.',
  keywords: [
    'CODM India',
    'Call of Duty Mobile India',
    'Indian Gaming',
    'CODM Profiles',
    'Indian Competitive Gaming',
    'CODM Tournaments',
    'CODM Players Directory',
  ],
  authors: [{ name: 'CallOfDutyMobile Community' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'CallOfDutyMobile',
    title: 'CallOfDutyMobile — Indian CODM Platform',
    description:
      'Official directory and records of competitive Indian Call of Duty: Mobile players, teams, and tournament championships.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CallOfDutyMobile — Indian CODM Platform',
    description:
      'Official directory and records of competitive Indian Call of Duty: Mobile players, teams, and tournament championships.',
  },
  icons: {
    icon: '/photos/logo1.png',
    shortcut: '/photos/logo1.png',
    apple: '/photos/logo1.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${chakraPetch.variable} ${inter.variable} dark`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('scrollRestoration' in history){history.scrollRestoration='manual';}window.scrollTo(0,0);window.addEventListener('beforeunload',function(){window.scrollTo(0,0);});window.addEventListener('load',function(){window.scrollTo(0,0);});`,
          }}
        />
      </head>
      <body className="bg-black text-white antialiased min-h-screen selection:bg-[#FFE93B] selection:text-black">
        <ScrollToTopHandler />
        {children}
      </body>
    </html>
  );
}
