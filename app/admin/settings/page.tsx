import { requireAdminAccess } from '../middleware'
import TwoFactorSettings from './TwoFactorSettings'

export default async function AdminSettingsPage() {
  await requireAdminAccess()

  return <TwoFactorSettings />
}
