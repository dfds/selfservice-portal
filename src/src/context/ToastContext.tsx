import React, { createContext, useContext, useState, useCallback } from "react";
import SuccessToast from "@/components/Toast/SuccessToast";
import { useRybbit } from "@/RybbitContext";

interface Toast {
  id: string;
  message: string;
  variant: "success" | "error";
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  success: () => {},
  error: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { trackEvent } = useRybbit();

  const success = useCallback(
    (message: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, variant: "success" }]);
      trackEvent("error:toast:shown", { kind: "success" });
    },
    [trackEvent],
  );

  const error = useCallback(
    (message: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, variant: "error" }]);
      trackEvent("error:toast:shown", { kind: "error" });
    },
    [trackEvent],
  );

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[95] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((toast) => (
          <SuccessToast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            onDismiss={() => remove(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
