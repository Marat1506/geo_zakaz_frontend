"use client"

import * as React from "react"
import { cn } from "@/lib/utils/cn"

type ToastVariant = "default" | "destructive" | "success"

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Set the global toast function
  React.useEffect(() => {
    setToastFunction(addToast);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

function ToastViewport() {
  const { toasts } = useToast()

  return (
    <div
      className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} {...toast} />
      ))}
    </div>
  )
}

type ToastComponentProps = Toast;

function ToastComponent({ id, title, description, variant = "default" }: ToastComponentProps) {
  const { removeToast } = useToast()

  const variantStyles = {
    default: "border border-orange-200 bg-white text-gray-900 shadow-lg",
    destructive: "border-amber-300 bg-amber-50 text-amber-900 shadow-lg group",
    success: "border-emerald-300 bg-emerald-50 text-emerald-900 shadow-lg",
  }

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all mb-2",
        variantStyles[variant]
      )}
      role="alert"
      aria-atomic="true"
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      <button
        onClick={() => removeToast(id)}
        className="absolute right-1 top-1 rounded-md p-1 text-gray-950/50 opacity-0 transition-opacity hover:text-gray-950 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Close notification"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  )
}

// Helper function for imperative toast calls
let toastFunction: ((toast: Omit<Toast, "id">) => void) | null = null;

export function setToastFunction(fn: (toast: Omit<Toast, "id">) => void) {
  toastFunction = fn;
}

export function toast(options: Omit<Toast, "id">) {
  if (toastFunction) {
    toastFunction(options);
  } else {
    console.warn('Toast function not initialized. Make sure ToastProvider is mounted.');
  }
}

export { ToastProvider, useToast }
