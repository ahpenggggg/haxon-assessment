import { useEffect, useEffectEvent } from 'react';

type PopupVariant = 'success' | 'error';

interface TimedPopupProps {
  variant: PopupVariant;
  title: string;
  message: string;
  durationMs: number;
  onClose: () => void;
}

const VARIANT_CLASSES: Record<PopupVariant, string> = {
  success: 'border-success bg-success-soft text-success',
  error: 'border-danger bg-danger-soft text-danger',
};

export function TimedPopup({ variant, title, message, durationMs, onClose }: TimedPopupProps) {
  const close = useEffectEvent(onClose);

  useEffect(() => {
    const timer = window.setTimeout(close, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-text/40 p-4">
      <div
        role={variant === 'error' ? 'alert' : 'status'}
        className={`w-full max-w-sm rounded-lg border-l-4 bg-surface p-5 shadow-xl ${VARIANT_CLASSES[variant]}`}
      >
        <p className="text-base font-semibold">{title}</p>
        <p className="mt-1 text-sm text-text">{message}</p>
      </div>
    </div>
  );
}
