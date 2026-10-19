import prisma from '@/lib/prisma'

export async function getUserRoles(userId: string) {
  const roles = await prisma.userRole.findMany({ where: { userId }, include: { role: true } })
  return roles.map(r => r.role.name)
}

export async function userHasRole(userId: string, roleName: string) {
  const r = await prisma.userRole.findFirst({ where: { userId, role: { name: roleName } }, include: { role: true } })
  return !!r
}
