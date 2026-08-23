import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getPortfolioData } from '@/lib/data';
import { getPublicCertificationById } from '@/app/actions/certification';
import ThemeToggle from '@/components/public/layout/theme-toggle';
import SearchTrigger from '@/components/public/search/search-trigger';
import LanguageSwitcher from '@/components/public/layout/language-switcher';
import { Shield, ArrowLeft, ExternalLink, Calendar, Key, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CertificationDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: CertificationDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const { profile } = await getPortfolioData(locale);
  const cert = await getPublicCertificationById(id);
  const name = profile?.name || 'Portfolio';

  if (!cert) return { title: 'Not Found' };

  const trans = cert.translations?.find((t) => t.locale === locale);
  const title = trans?.title || cert.title;

  return {
    title: `${title} — ${name}`,
    description: `Certification details for ${title} from ${trans?.issuingOrg || cert.issuingOrg}.`,
    openGraph: {
      title: `${title} — ${name}`,
      url: `/${locale}/certifications/${id}`,
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `/${locale}/certifications/${id}`,
    },
  };
}

export default async function CertificationDetailPage({ params }: CertificationDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [t, cert] = await Promise.all([
    getTranslations('certifications'),
    getPublicCertificationById(id)
  ]);

  if (!cert) notFound();

  const trans = cert.translations?.find((t) => t.locale === locale);
  const title = trans?.title || cert.title;
  const issuingOrg = trans?.issuingOrg || cert.issuingOrg;
  const categories = cert.categories?.map((c) => c.category) || [];

  // Expiry calculation
  let expiryStatus: 'no-expiry' | 'valid' | 'expiring-soon' | 'expired' = 'no-expiry';
  if (cert.expiryDate) {
    const now = new Date();
    const expiry = new Date(cert.expiryDate);
    const days = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) expiryStatus = 'expired';
    else if (days <= 60) expiryStatus = 'expiring-soon';
    else expiryStatus = 'valid';
  }

  const ExpiryBadge = () => {
    const config = {
      'no-expiry': { label: t('statusNoExpiry'), icon: CheckCircle2, cls: 'text-[var(--text-tertiary)] border-[var(--border-subtle)] bg-[var(--bg-surface)]' },
      valid: { label: t('statusValid'), icon: CheckCircle2, cls: 'text-[var(--text-secondary)] border-[var(--border-subtle)] bg-[var(--bg-surface)]' },
      'expiring-soon': { label: t('statusExpiringSoon'), icon: Clock, cls: 'text-amber-500 border-amber-500/30 bg-amber-500/10' },
      expired: { label: t('statusExpired'), icon: AlertCircle, cls: 'text-red-500 border-red-500/30 bg-red-500/10' },
    }[expiryStatus];

    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.cls}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)]">
      {/* Floating controls */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <SearchTrigger variant="compact" className="shadow-lg backdrop-blur-xl bg-[var(--bg-elevated)]/85" />
        <LanguageSwitcher variant="minimal" />
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-24 pb-20">
        <Link
          href={`/${locale}/certifications`}
          className="inline-flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Certifications
        </Link>

        {/* Hero Card */}
        <div className="relative rounded-[2rem] overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl">
          {/* Glassmorphic decorative background element */}
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-[var(--text-primary)] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative p-8 sm:p-12 md:p-16 flex flex-col md:flex-row items-center md:items-start gap-10">
            
            {/* Image Section */}
            <div className="flex-shrink-0 w-48 h-48 md:w-64 md:h-64 rounded-3xl overflow-hidden bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center p-4 shadow-inner">
              {cert.imageUrl ? (
                <Image
                  src={cert.imageUrl}
                  alt={title}
                  width={224}
                  height={224}
                  className="w-full h-full object-contain filter drop-shadow-md"
                  unoptimized
                />
              ) : (
                <Shield className="w-24 h-24 text-[var(--text-tertiary)]" />
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 w-full text-center md:text-left flex flex-col items-center md:items-start">
              <div className="mb-4">
                <ExpiryBadge />
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-4 leading-tight">
                {title}
              </h1>
              
              <p className="text-lg text-[var(--text-secondary)] mb-8 flex items-center justify-center md:justify-start gap-2">
                <span className="text-[var(--text-tertiary)]">Issued by</span>
                <span className="font-semibold">{issuingOrg}</span>
              </p>

              {/* Tags */}
              {categories.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-10">
                  {categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Action */}
              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-medium hover:scale-105 hover:shadow-lg active:scale-95 transition-all w-full md:w-auto group"
                >
                  {t('viewCredential')}
                  <ExternalLink className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 border border-[var(--border-subtle)]">
              <Calendar className="w-5 h-5 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Issue Date</h3>
            <p className="text-sm text-[var(--text-secondary)]">{formatDate(cert.issueDate)}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 border border-[var(--border-subtle)]">
              <Clock className="w-5 h-5 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Expiry Date</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {cert.expiryDate ? formatDate(cert.expiryDate) : 'No Expiration Date'}
            </p>
          </div>

          {cert.credentialId && (
            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-colors sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 border border-[var(--border-subtle)]">
                <Key className="w-5 h-5 text-[var(--text-secondary)]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Credential ID</h3>
              <p className="text-sm text-[var(--text-secondary)] font-mono">{cert.credentialId}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
