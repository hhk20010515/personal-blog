'use client'

import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Heart, Compass, Lightbulb, TreePine, Brain, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const lifeTopics = [
  {
    title: '正念生活',
    description: '在快节奏的现代生活中，探索内心的平静与专注',
    icon: Heart,
    color: 'from-pink-500 to-rose-600',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
  },
  {
    title: '人生哲学',
    description: '思考生命的意义，探索存在的价值与人生的方向',
    icon: Compass,
    color: 'from-blue-500 to-indigo-600',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'
  },
  {
    title: '个人成长',
    description: '持续学习与自我提升，成为更好的自己',
    icon: Lightbulb,
    color: 'from-amber-500 to-orange-600',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
  },
  {
    title: '自然连接',
    description: '回归自然，在大自然中寻找内心的宁静与力量',
    icon: TreePine,
    color: 'from-green-500 to-emerald-600',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop'
  }
]

const wellness2025Trends = [
  {
    title: '整体健康整合',
    description: '2025年，正念不再是独立的练习，而是成为整体心理健康和个人发展的基础。温和的自我提升和可持续的进步成为主流。',
    trend: '全面整合',
    icon: Brain
  },
  {
    title: '数字化断连',
    description: '随着对AI操控、在线虚假信息和算法成瘾担忧的加剧，人们越来越多地寻求与数字世界断连的方式。',
    trend: '数字排毒',
    icon: Heart
  },
  {
    title: '社区驱动的健康',
    description: '尽管技术不断进步，人们对真实人际连接的渴望却越来越强烈。这一趋势正在重新定义实践社区和教学方法。',
    trend: '真实连接',
    icon: Users
  },
  {
    title: '自然环境意识',
    description: '练习正在从室内空间转移到森林、山脉和海洋中。这不仅仅是关于地点，更是将正念与环境意识和自然节律相连接。',
    trend: '自然回归',
    icon: TreePine
  }
]

const lifeInsights = [
  {
    title: '慢生活的智慧',
    description: '在这个快速变化的世界里，学会放慢脚步，享受当下的美好。慢生活不是懒惰，而是一种智慧的生活方式。',
    category: '生活方式'
  },
  {
    title: '内心平衡的艺术',
    description: '如何在工作与生活、理想与现实、个人与社会之间找到平衡点，这是每个人都需要面对的人生课题。',
    category: '心理健康'
  },
  {
    title: '简约主义的力量',
    description: '拥有更少，体验更多。简约不仅仅是物质上的减法，更是精神上的加法，让我们专注于真正重要的事物。',
    category: '生活哲学'
  },
  {
    title: '感恩与觉察',
    description: '培养感恩的心态，保持对生活的觉察，这是通往内心平静和幸福的重要路径。',
    category: '精神成长'
  }
]

export default function LifePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                生活感悟与智慧
              </h1>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                探索内心的平静，发现生活的美好。
                在快节奏的现代生活中，寻找属于自己的人生哲学与生活智慧。
              </p>
            </motion.div>

            {/* Life Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {lifeTopics.map((topic, index) => {
                const Icon = topic.icon
                return (
                  <motion.div
                    key={topic.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="glass-effect rounded-xl overflow-hidden card-hover h-full">
                      <div className="aspect-video relative overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${topic.image})` }}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${topic.color} opacity-60 group-hover:opacity-40 transition-opacity duration-300`} />
                        <div className="absolute top-4 left-4">
                          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold mb-3">{topic.title}</h3>
                        <p className="text-muted-foreground text-sm">{topic.description}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 2025 Wellness Trends */}
        <section className="py-16 bg-muted/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">2025年健康生活趋势</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                了解今年最重要的健康与生活方式趋势，引领更好的生活
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {wellness2025Trends.map((trend, index) => {
                const Icon = trend.icon
                return (
                  <motion.div
                    key={trend.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <div className="glass-effect rounded-xl p-6 card-hover h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-rose-500 to-purple-500 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                            {trend.title}
                          </h3>
                        </div>
                        <span className="text-sm text-muted-foreground bg-gradient-to-r from-rose-500/20 to-purple-500/20 px-3 py-1 rounded-full">
                          {trend.trend}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {trend.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Life Insights Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">生活智慧分享</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                从日常生活中汲取智慧，分享关于人生、成长与幸福的思考
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {lifeInsights.map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="glass-effect rounded-xl p-6 card-hover h-full">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {insight.title}
                      </h3>
                      <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        {insight.category}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/5">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">分享你的生活感悟</h2>
              <p className="text-muted-foreground mb-8">
                每个人都有独特的人生体验和智慧，与我们分享你的生活故事和感悟
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/posts?category=life">
                    查看生活感悟
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/write">
                    分享你的故事
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}