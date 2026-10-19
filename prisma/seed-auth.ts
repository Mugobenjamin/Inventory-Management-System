import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding auth data...')

  // Ensure roles exist
  const roles = ['OWNER','ADMIN','INVENTORY_MANAGER','SALES','AUDITOR'] as const
  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r as any },
      update: {},
      create: { name: r as any }
    })
  }

  // Create an owner/admin user if not exists
  const email = 'owner@example.com'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (!existing) {
    const hashed = await bcrypt.hash('ChangeMe123!', 12)
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Owner',
        hashedPassword: hashed,
      }
    })

    // Assign OWNER role
    const ownerRole = await prisma.role.findUnique({ where: { name: 'OWNER' } })
    if (ownerRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: ownerRole.id
        }
      })
    }
    console.log('Created owner user:', email)
  } else {
    console.log('Owner user already exists:', email)
  }

  console.log('Auth seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
