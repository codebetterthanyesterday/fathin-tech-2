import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Clock, AlertCircle, ExternalLink, Shield } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

// ─── Expiry helpers ───────────────────────────────────────────────────────────

export type ExpiryStatus = 'valid' | 'expiring-soon' | 'expired' | 'no-expiry';

export function getExpiryStatus(expiryDate: Date | string | null): ExpiryStatus {
  if (!expiryDate) return 'no-expiry';
  const now = new Date();
  const expiry = new Date(expiryDate);
  const days = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'expired';
  if (days <= 60) return 'expiring-soon';
  return 'valid';
}

export function resolveCertification(cert: any, locale: string) {
  const trans = cert.translations?.find((t: any) => t.locale === locale);
  return {
    ...cert,
    title: trans?.title || cert.title,
    issuingOrg: trans?.issuingOrg || cert.issuingOrg,
    expiryStatus: getExpiryStatus(cert.expiryDate),
  };
}

// ─── Expiry badge (monochromatic, per design spec) ────────────────────────────

function ExpiryBadge({ status, t }: { status: ExpiryStatus; t: any }) {
  const config = {
    'no-expiry': { label: t('statusNoExpiry'), icon: CheckCircle2, cls: 'text-zinc-500 border-zinc-700' },
    valid: { label: t('statusValid'), icon: CheckCircle2, cls: 'text-zinc-400 border-zinc-700' },
    'expiring-soon': {
      label: t('statusExpiringSoon'),
      icon: Clock,
      cls: 'text-zinc-300 border-zinc-600',
    },
    expired: {
      label: t('statusExpired'),
      icon: AlertCircle,
      cls: 'text-zinc-600 border-zinc-800 opacity-60',
    },
  }[status];

  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-transparent ${config.cls}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function CertificationCard({ cert, locale, t }: { cert: any; locale: string; t: any }) {
  const resolved = resolveCertification(cert, locale);
  const categories = cert.categories?.map((c: any) => c.category) || [];

  return (
    <div className="group relative flex flex-col h-full p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)] transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5">
      {/* Badge image or placeholder */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0 group-hover:border-[var(--border-strong)] transition-colors">
          {resolved.imageUrl ? (
            <Image
              src={resolved.imageUrl}
              alt={resolved.title}
              width={56}
              height={56}
              className="object-contain p-1.5"
            />
          ) : (
            <Shield className="w-6 h-6 text-[var(--text-tertiary)]" />
          )}
        </div>
        <ExpiryBadge status={resolved.expiryStatus} t={t} />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1.5 mb-4">
        <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent-text)] transition-colors">
          {resolved.title}
        </h3>
        <p className="text-sm text-[var(--text-tertiary)]">
          {t('issuedBy')}{' '}
          <span className="text-[var(--text-secondary)]">{resolved.issuingOrg}</span>
        </p>
        <p className="text-xs text-[var(--text-tertiary)]">
          {new Date(resolved.issueDate).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
            year: 'numeric',
            month: 'short',
          })}
          {resolved.expiryDate && (
            <>
              {' '}—{' '}
              {new Date(resolved.expiryDate).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
                year: 'numeric',
                month: 'short',
              })}
            </>
          )}
        </p>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {categories.map((cat: any) => (
            <span
              key={cat.id}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-tertiary)]"
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}

      {/* Credential link */}
      {resolved.credentialUrl && (
        <a
          href={resolved.credentialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group/link"
        >
          {t('viewCredential')}
          <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
        </a>
      )}
    </div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

interface CertificationGridProps {
  certifications: any[];
  locale: string;
}

export default async function CertificationGrid({ certifications, locale }: CertificationGridProps) {
  const t = await getTranslations('certifications');

  if (certifications.length === 0) {
    return (
      <div className="py-20 text-center text-[var(--text-tertiary)]">
        <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p className="text-sm">{t('noCerts')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {certifications.map((cert) => (
        <CertificationCard key={cert.id} cert={cert} locale={locale} t={t} />
      ))}
    </div>
  );
}
