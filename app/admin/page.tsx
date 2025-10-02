import { requireAdminAccess } from './middleware'
import AdminDashboard from './components/AdminDashboard'

export default async function AdminPage() {
  await requireAdminAccess()

  return <AdminDashboard />
}
