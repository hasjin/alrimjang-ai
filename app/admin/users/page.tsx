import { requireAdminAccess } from '../middleware'
import UsersManagement from './UsersManagement'

export default async function AdminUsersPage() {
  await requireAdminAccess()

  return <UsersManagement />
}
