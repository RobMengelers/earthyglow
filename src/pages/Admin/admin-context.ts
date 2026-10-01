import { createContext, useContext } from 'react'
import type { AdminOverview } from '../../admin/api'

export type AdminStatus = 'checking' | 'signed-out' | 'signed-in'

export type AdminContextValue = {
  token: string | null
  status: AdminStatus
  /** Shared by the layout (nav badge) and the overview page: one fetch. */
  overview: AdminOverview | null
  overviewError: string
  overviewLoading: boolean
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => void
  /** Re-runs the overview fetch; used by the dashboard's retry button. */
  refreshOverview: () => void
}

export const AdminContext = createContext<AdminContextValue | null>(null)

export function useAdmin(): AdminContextValue {
  const value = useContext(AdminContext)
  if (!value) {
    throw new Error('useAdmin must be used inside the admin layout')
  }
  return value
}
