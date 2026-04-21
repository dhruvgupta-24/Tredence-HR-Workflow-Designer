import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastState {
  toasts: ToastItem[]
  push: (message: string, variant?: ToastVariant) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, variant = 'info') => {
    const id = `t${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }))
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      4000,
    )
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

// Call outside React - handy for store actions etc.
export const toast = {
  success: (msg: string) => useToastStore.getState().push(msg, 'success'),
  error:   (msg: string) => useToastStore.getState().push(msg, 'error'),
  warning: (msg: string) => useToastStore.getState().push(msg, 'warning'),
  info:    (msg: string) => useToastStore.getState().push(msg, 'info'),
}
