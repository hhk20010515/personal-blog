import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('❌ 请提供邮箱地址')
    console.log('用法: tsx scripts/create-admin.ts your-email@example.com')
    process.exit(1)
  }

  try {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // 更新现有用户为管理员
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          isBlocked: false
        }
      })
      console.log('✅ 用户已更新为管理员:', updatedUser.email)
    } else {
      // 创建新的管理员用户
      const newUser = await prisma.user.create({
        data: {
          email,
          name: '管理员',
          role: 'ADMIN',
          bio: '博客管理员账户',
          isBlocked: false
        }
      })
      console.log('✅ 管理员用户已创建:', newUser.email)
    }

    console.log('🎉 管理员设置完成！')
    console.log('📝 提醒：')
    console.log('   1. 请使用此邮箱登录网站')
    console.log('   2. 登录后即可访问管理后台 /admin')
    console.log('   3. 可以管理用户、文章和系统设置')

  } catch (error) {
    console.error('❌ 创建管理员失败:', error)
    process.exit(1)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })