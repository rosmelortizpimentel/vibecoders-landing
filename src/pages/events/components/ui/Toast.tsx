import { useState, useEffect, useCallback } from 'react';

interface ToastItem {
  id: number;
  message: string;
}

let toastId = 0;
const listeners: Set<(t: ToastItem) => void> = new Set();

export function fairToast(message: string) {
  const item: ToastItem = { id: ++toastId, message };
  listeners.forEach((fn) => fn(item));
}

export function FairToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((t: ToastItem) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, 3000);
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => { listeners.delete(addToast); };
  }, [addToast]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-white/95 text-slate-800 px-5 py-3 rounded-xl text-sm font-medium shadow-lg backdrop-blur-sm border border-black/5 animate-[slideDown_0.3s_ease-out]"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
