import { AlertTriangle, X } from 'lucide-react';

interface ConfirmActionModalProps {
  open: boolean;
  title: string;
  description: string;
  consequenceNote: string;
  confirmLabel: string;
  cancelLabel: string;
  closeAriaLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmActionModal({
  open,
  title,
  description,
  consequenceNote,
  confirmLabel,
  cancelLabel,
  closeAriaLabel = 'Close confirmation dialog',
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#091D13]/65 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-md rounded-lg border border-[#9EC4A8] bg-[#E9F2EA] p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-[#B45309] shrink-0" aria-hidden="true" />
            <h2 id="confirm-modal-title" className="font-display text-lg font-semibold text-[#14291D]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label={closeAriaLabel}
            className="rounded-md p-1.5 text-[#355240] hover:bg-[#D8E7DA] hover:text-[#14291D]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-[#243F2F]">{description}</p>

        <div className="mt-4 rounded-md border border-[#D3C49E] bg-[#EFEAD6] p-3 text-xs leading-relaxed text-[#5C4315]">
          {consequenceNote}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[40px] rounded-md border border-[#9EC4A8] bg-[#DCEADD] px-4 py-2 text-sm font-medium text-[#14291D] hover:bg-[#CFE1D2] whitespace-nowrap shrink-0"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[40px] rounded-md bg-[#143D2B] px-4 py-2 text-sm font-medium text-white hover:bg-[#0F2D20] whitespace-nowrap shrink-0"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
