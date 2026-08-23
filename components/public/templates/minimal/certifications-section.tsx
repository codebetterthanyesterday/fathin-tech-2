'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Shield, ExternalLink, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { getExpiryStatus, type ExpiryStatus } from '../../certifications/certification-grid';

interface CertItem {
  id: string;
  title: string;
  issuingOrg: string;
  imageUrl?: string | null;
  credentialUrl?: string | null;
  expiryDate?: Date | null;
  issueDate: Date;
}

const statusConfig: Record<ExpiryStatus, { cls: string; Icon: any }> = {
  'no-expiry': { cls: 'text-zinc-400', Icon: CheckCircle2 },
  valid: { cls: 'text-zinc-300', Icon: CheckCircle2 },
  'expiring-soon': { cls: 'text-zinc-300', Icon: Clock },
  expired: { cls: 'text-zinc-600', Icon: AlertCircle },
};

export default function MinimalCertificationsSection({ certifications }: { certifications: CertItem[] }) {
  const t = useTranslations('certifications');

  if (certifications.length === 0) return null;

  return (
    <section className="py-24 px-4 sm:px-8 border-t border-[var(--border-subtle)]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              {t('minimalTitle')}
            </h2>
            <p className="text-[var(--text-secondary)] mt-2 max-w-xl">{t('minimalSubtitle')}</p>
          </div>
          <Link
            href="/certifications"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
          >
            {t('viewAll')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {certifications.map((cert, idx) => {
            const status = getExpiryStatus(cert.expiryDate ?? null);
            const { cls, Icon } = statusConfig[status];

            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)] transition-all duration-300 overflow-hidden"
              >
                <Link href={`/certifications/${cert.id}`} className="flex flex-col flex-1 p-5">
                  {/* Badge */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center mb-4 group-hover:border-[var(--border-strong)] transition-colors">
                    {cert.imageUrl ? (
                      <Image
                        src={cert.imageUrl}
                        alt={cert.title}
                        width={48}
                        height={48}
                        className="object-contain p-1"
                      />
                    ) : (
                      <Shield className="w-5 h-5 text-[var(--text-tertiary)]" />
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug mb-1 line-clamp-2">
                    {cert.title}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)] mb-3 line-clamp-1">{cert.issuingOrg}</p>

                  {/* Status */}
                  <div className={`mt-auto flex items-center gap-1 text-[10px] font-medium ${cls}`}>
                    <Icon className="w-3 h-3" />
                    {t(`status${status.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('')}` as any)}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
