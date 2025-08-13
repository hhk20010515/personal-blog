import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('❌ 请提供邮箱地址')
    console.log('用法: tsx scripts/reset-user.ts your-email@example.com')
    process.exit(1)
  }

  try {
    // 删除现有用户记录（这样可以重新通过OAuth注册）
    const deletedUser = await prisma.user.delete({
      where: { email }
    })
    
    console.log('✅ 已删除用户记录:', deletedUser.email)
    console.log('🔄 现在可以通过Google OAuth重新注册')
    console.log('📝 注册后我们会自动设置管理员权限')

  } catch (error: any) {
    if (error.code === 'P2025') {
      console.log('ℹ️  用户记录不存在，可以直接进行OAuth注册')
    } else {
      console.error('❌ 删除用户失败:', error)
      process.exit(1)
    }
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