'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { Shield, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { getExpiryStatus } from '../../certifications/certification-grid';

interface CertItem {
  id: string;
  title: string;
  issuingOrg: string;
  imageUrl?: string | null;
  credentialUrl?: string | null;
  expiryDate?: Date | null;
  issueDate: Date;
}

export default function ImmersiveCertificationsSection({ certifications }: { certifications: CertItem[] }) {
  const t = useTranslations('certifications');

  if (certifications.length === 0) return null;

  return (
    <section className="relative py-32 px-4 sm:px-8 border-t border-white/5 overflow-hidden">
      {/* Atmospheric bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-white/[0.015] rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-white/[0.01] rounded-full blur-3xl translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400 mb-6">
            <Sparkles className="w-3 h-3" />
            {t('immersiveBadge')}
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]">
              {t('immersiveTitle')}
            </h2>
            <Link
              href="/certifications"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors group"
            >
              {t('viewAll')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <p className="text-zinc-500 mt-4 max-w-2xl text-base leading-relaxed">
            {t('immersiveSubtitle')}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {certifications.map((cert, idx) => {
            const status = getExpiryStatus(cert.expiryDate ?? null);
            const isExpired = status === 'expired';

            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.09, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative flex flex-col p-6 rounded-2xl border transition-all duration-300 ${
                  isExpired
                    ? 'bg-white/[0.01] border-white/5 opacity-50'
                    : 'bg-white/[0.03] border-white/8 hover:bg-white/[0.07] hover:border-white/15'
                }`}
              >
                {/* Subtle shine on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Badge image */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:border-white/20 transition-colors">
                  {cert.imageUrl ? (
                    <Image
                      src={cert.imageUrl}
                      alt={cert.title}
                      width={48}
                      height={48}
                      className="object-contain p-1"
                    />
                  ) : (
                    <Shield className="w-5 h-5 text-zinc-600" />
                  )}
                </div>

                <h3 className="text-sm font-semibold text-white leading-snug mb-1.5 line-clamp-2">
                  {cert.title}
                </h3>
                <p className="text-xs text-zinc-600 line-clamp-1">{cert.issuingOrg}</p>

                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-zinc-700 font-mono">
                    {new Date(cert.issueDate).getFullYear()}
                  </span>

                  {/* Status dot */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isExpired
                        ? 'bg-zinc-700'
                        : status === 'expiring-soon'
                        ? 'bg-zinc-400'
                        : 'bg-zinc-500'
                    }`}
                    title={status}
                  />
                </div>

                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-white"
                    aria-label="View credential"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
