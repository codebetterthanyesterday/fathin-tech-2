'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, ExternalLink, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { deleteCertification, reorderCertifications } from '@/app/actions/certification';
import {
  ReorderableList,
  useReorderableItem,
  ReorderableDragHandle,
  ReorderableFallbackControls,
} from '@/components/admin/shared/reorderable-list';
import DeleteConfirmModal from '@/components/admin/skills/delete-confirm-modal';
import { getAdminPath } from '@/lib/routes';

// ─── Expiry logic ─────────────────────────────────────────────────────────────

function getExpiryStatus(expiryDate: Date | null): 'valid' | 'expiring-soon' | 'expired' | 'no-expiry' {
  if (!expiryDate) return 'no-expiry';
  const now = new Date();
  const days = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'expired';
  if (days <= 60) return 'expiring-soon';
  return 'valid';
}

function ExpiryBadge({ expiryDate }: { expiryDate: Date | null }) {
  const status = getExpiryStatus(expiryDate);

  const config = {
    'no-expiry': { label: 'No Expiry', class: 'text-zinc-500 bg-zinc-800 border-zinc-700', Icon: CheckCircle2 },
    valid: { label: 'Valid', class: 'text-zinc-300 bg-zinc-800 border-zinc-700', Icon: CheckCircle2 },
    'expiring-soon': { label: 'Expiring Soon', class: 'text-amber-300 bg-amber-500/10 border-amber-500/20', Icon: Clock },
    expired: { label: 'Expired', class: 'text-zinc-500 bg-zinc-900 border-zinc-800 line-through', Icon: AlertCircle },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${config.class}`}
    >
      <config.Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function CertificationRow({
  cert,
  isFirst,
  isLast,
  onMove,
  onDelete,
  isProcessingId,
  isDragOverlay = false,
}: {
  cert: any;
  isFirst: boolean;
  isLast: boolean;
  onMove: (id: string, dir: 'up' | 'down') => void;
  onDelete: (cert: any) => void;
  isProcessingId: string | null;
  isDragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, style, isDragging } = useReorderableItem(cert.id);
  const isProcessing = isProcessingId === cert.id;

  const idTrans = cert.translations?.find((t: any) => t.locale === 'id');
  const title = idTrans?.title || cert.title;
  const issuingOrg = idTrans?.issuingOrg || cert.issuingOrg;

  if (isDragging && !isDragOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[88px] rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02]"
        aria-hidden
      />
    );
  }

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? undefined : style}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
        isDragOverlay
          ? 'bg-zinc-800 border-zinc-600 shadow-2xl rotate-1 scale-105'
          : 'bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700/80'
      } ${isProcessing ? 'opacity-60' : ''}`}
    >
      <ReorderableDragHandle attributes={attributes} listeners={listeners} isDragging={isDragOverlay} />

      {/* Badge image */}
      <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center">
        {cert.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cert.imageUrl} alt="" className="w-full h-full object-contain p-1" />
        ) : (
          <span className="text-zinc-600 text-xs font-bold">
            {title?.charAt(0)?.toUpperCase() || 'C'}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-white truncate">{title}</span>
          {!cert.isVisible && (
            <span className="text-[10px] bg-zinc-800 text-zinc-500 border border-zinc-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Hidden
            </span>
          )}
          {cert.isFeatured && (
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-zinc-500">{issuingOrg}</span>
          <span className="text-zinc-700">·</span>
          <ExpiryBadge expiryDate={cert.expiryDate ? new Date(cert.expiryDate) : null} />
        </div>
      </div>

      {/* Fallback reorder */}
      <ReorderableFallbackControls
        onMoveUp={() => onMove(cert.id, 'up')}
        onMoveDown={() => onMove(cert.id, 'down')}
        isFirst={isFirst}
        isLast={isLast}
        isProcessing={isProcessing}
      />

      {/* Actions */}
      <div className="flex items-center gap-1">
        {cert.credentialUrl && (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors rounded-md hover:bg-white/5"
            title="View credential"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <Link
          href={getAdminPath(`certifications/${cert.id}/edit`)}
          className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors rounded-md hover:bg-white/5"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(cert)}
          disabled={isProcessing}
          className="p-2 text-zinc-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-500/5 disabled:opacity-30"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main list ────────────────────────────────────────────────────────────────

export default function CertificationListClient({
  initialCertifications,
}: {
  initialCertifications: any[];
}) {
  const [certifications, setCertifications] = useState(initialCertifications);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleReorder = (newItems: any[]) => {
    setCertifications(newItems);
    startTransition(async () => {
      await reorderCertifications(newItems.map((c) => c.id));
    });
  };

  const handleMove = (id: string, dir: 'up' | 'down') => {
    const idx = certifications.findIndex((c) => c.id === id);
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === certifications.length - 1)) return;
    const newItems = [...certifications];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    [newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]];
    handleReorder(newItems);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsProcessingId(deleteTarget.id);
    setDeleteTarget(null);
    const result = await deleteCertification(deleteTarget.id);
    if (result.success) {
      setCertifications((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    }
    setIsProcessingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {certifications.length} certification{certifications.length !== 1 ? 's' : ''}
        </p>
        <Link
          href={getAdminPath('certifications/new')}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Certification
        </Link>
      </div>

      {certifications.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-600 text-sm">No certifications yet.</p>
          <Link
            href={getAdminPath('certifications/new')}
            className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" /> Add your first certification
          </Link>
        </div>
      ) : (
        <ReorderableList
          items={certifications}
          onReorder={handleReorder}
          renderOverlay={(activeId) => {
            const cert = certifications.find((c) => c.id === activeId);
            return cert ? (
              <CertificationRow
                cert={cert}
                isFirst={false}
                isLast={false}
                onMove={() => {}}
                onDelete={() => {}}
                isProcessingId={null}
                isDragOverlay
              />
            ) : null;
          }}
        >
          {certifications.map((cert, idx) => (
            <CertificationRow
              key={cert.id}
              cert={cert}
              isFirst={idx === 0}
              isLast={idx === certifications.length - 1}
              onMove={handleMove}
              onDelete={setDeleteTarget}
              isProcessingId={isProcessingId}
            />
          ))}
        </ReorderableList>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Certification"
        description={`Are you sure you want to delete "${deleteTarget?.translations?.find((t: any) => t.locale === 'id')?.title || deleteTarget?.title || 'this certification'}"? This action cannot be undone.`}
      />
    </div>
  );
}
