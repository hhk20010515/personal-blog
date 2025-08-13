import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始填充数据库...')

  // 创建默认分类
  const categories = [
    {
      name: '技术',
      slug: 'tech',
      description: '编程、开发经验和技术趋势分享',
      icon: 'Code',
      color: '#3B82F6',
      sortOrder: 1,
    },
    {
      name: '摄影',
      slug: 'photography',
      description: '摄影作品展示和技巧分享',
      icon: 'Camera',
      color: '#8B5CF6',
      sortOrder: 2,
    },
    {
      name: '生活',
      slug: 'life',
      description: '生活感悟和个人思考',
      icon: 'Heart',
      color: '#EF4444',
      sortOrder: 3,
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
    console.log(`✅ 创建分类: ${category.name}`)
  }

  // 创建默认标签
  const tags = [
    { name: 'React', slug: 'react' },
    { name: 'Next.js', slug: 'nextjs' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: '前端开发', slug: 'frontend' },
    { name: '后端开发', slug: 'backend' },
    { name: '全栈开发', slug: 'fullstack' },
    { name: '人工智能', slug: 'ai' },
    { name: '机器学习', slug: 'machine-learning' },
    { name: '街头摄影', slug: 'street-photography' },
    { name: '风光摄影', slug: 'landscape-photography' },
    { name: '人像摄影', slug: 'portrait-photography' },
    { name: '摄影技巧', slug: 'photography-tips' },
    { name: '生活感悟', slug: 'life-thoughts' },
    { name: '个人成长', slug: 'personal-growth' },
    { name: '读书笔记', slug: 'reading-notes' },
    { name: '旅行', slug: 'travel' },
  ]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    })
  }
  console.log('✅ 创建标签')

  // 检查是否已有管理员用户
  const adminExists = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  })

  if (!adminExists) {
    // 创建默认管理员用户（需要通过邮箱登录激活）
    console.log('ℹ️  请通过邮箱登录创建管理员账户')
    console.log('ℹ️  首个用户将自动设置为管理员')
  }

  // 创建示例订阅用户（可选）
  const sampleSubscribers = [
    'user1@example.com',
    'user2@example.com',
  ]

  for (const email of sampleSubscribers) {
    await prisma.subscriber.upsert({
      where: { email },
      update: {},
      create: {
        email,
        preferences: {
          categories: ['tech', 'photography', 'life'],
          frequency: 'weekly',
        },
      },
    })
  }
  console.log('✅ 创建示例订阅者')

  console.log('🎉 数据库填充完成!')
}

main()
  .catch((e) => {
    console.error('❌ 数据库填充失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })