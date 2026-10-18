import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    if (!message) return;
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, message, type };

    setToasts((prev) => [...prev.slice(-3), newToast]); // Keep max 4 toasts stacked

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, dur) => showToast(msg, 'success', dur),
    error: (msg, dur) => showToast(msg, 'error', dur),
    info: (msg, dur) => showToast(msg, 'info', dur),
    custom: (msg, type, dur) => showToast(msg, type, dur)
  };

  return (
    <ToastContext.Provider value={{ toast, showToast, removeToast }}>
      {children}
      {/* Editorial Toast Container (Bottom-Right on Desktop, Bottom-Center on Mobile) */}
      <aside
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-4 sm:right-6 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-sm shadow-md border text-xs leading-relaxed transition-all duration-300 animate-slideUp ${
              t.type === 'error'
                ? 'bg-neutral-900 text-white border-neutral-700'
                : t.type === 'info'
                ? 'bg-neutral-900 text-white border-neutral-700'
                : 'bg-neutral-900 text-white border-neutral-700'
            }`}
          >
            <span className="shrink-0 mt-0.5">
              {t.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400" />
              ) : t.type === 'info' ? (
                <Info className="w-4 h-4 text-amber-300" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </span>
            <div className="flex-1 font-medium">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-0.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: {
        success: () => {},
        error: () => {},
        info: () => {}
      },
      showToast: () => {}
    };
  }
  return context;
}
