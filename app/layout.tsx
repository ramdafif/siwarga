import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIWARGA - Sistem Informasi & Pengaduan Warga RT/RW',
  description: 'Sistem Informasi dan Pengaduan Masyarakat terintegrasi berbasis wilayah RW/RT dengan multi-role RBAC, tracking status pengaduan, pengumuman, dan kegiatan warga.',
  openGraph: {
    title: 'SIWARGA - Sistem Informasi & Pengaduan Warga RT/RW',
    description: 'Sistem Informasi dan Pengaduan Masyarakat terintegrasi berbasis wilayah RW/RT.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SIWARGA - Sistem Informasi & Pengaduan Warga RT/RW',
    description: 'Sistem Informasi dan Pengaduan Masyarakat terintegrasi berbasis wilayah RW/RT.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
