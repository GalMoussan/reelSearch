"use client"

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
  visible: boolean
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_DURATION = 4000
const ANIMATION_DURATION = 300

const typeStyles: Record<ToastType, string> = {
  success:
    "border-green-500/30 bg-green-950/80 text-green-200",
  error:
    "border-red-500/30 bg-red-950/80 text-red-200",
  info:
    "border-blue-500/30 bg-blue-950/80 text-blue-200",
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
    )
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, ANIMATION_DURATION)
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = crypto.randomUUID()
      const newToast: Toast = { id, message, type, visible: false }

      setToasts((prev) => [...prev, newToast])

      // Trigger enter animation on next frame
      requestAnimationFrame(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: true } : t))
        )
      })

      setTimeout(() => removeToast(id), TOAST_DURATION)
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-md border px-4 py-3 text-sm shadow-lg transition-all duration-300 max-w-sm",
            typeStyles[t.type],
            t.visible
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          )}
          role="alert"
        >
          <div className="flex items-center justify-between gap-3">
            <span>{t.message}</span>
            <button
              onClick={() => onDismiss(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
