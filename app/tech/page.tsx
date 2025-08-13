'use client'

import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Cpu, Code, Brain, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export const metadata: Metadata = {
  title: '技术分享 - 个人博客',
  description: '最新的人工智能、机器学习、前端开发、后端技术分享，探索科技前沿',
}

const featuredTopics = [
  {
    title: 'GPT-5 与 Gemini 2.5',
    description: '2025年最新的大语言模型突破，了解最前沿的AI技术发展',
    icon: Brain,
    color: 'from-blue-500 to-purple-600'
  },
  {
    title: 'SAM 2 视频跟踪',
    description: '革命性的视频对象识别与跟踪技术，计算机视觉新突破',
    icon: Cpu,
    color: 'from-green-500 to-blue-500'
  },
  {
    title: 'Next.js 14 全栈开发',
    description: '现代Web开发的最佳实践，App Router和Server Components',
    icon: Code,
    color: 'from-orange-500 to-red-500'
  },
  {
    title: '机器人AI集成',
    description: 'Google Gemini Robotics引领的物理世界AI应用',
    icon: Zap,
    color: 'from-purple-500 to-pink-500'
  }
]

const aiBreakthroughs = [
  {
    title: '大语言模型新突破',
    description: 'GPT-5现已在Crescendo平台可用，Google扩展了Gemini 2.5系列模型，包括Flash和Pro版本的全面开放。',
    date: '2025年1月'
  },
  {
    title: 'SAM 2：视频理解革命',
    description: 'Meta推出的SAM 2能够追踪和识别视频中的对象，而不仅仅是静态图像，标志着计算机视觉的重大进步。',
    date: '2025年初'
  },
  {
    title: '生成式虚拟世界',
    description: 'Google DeepMind发布Genie 2，能够从单张图像生成完整的虚拟世界，继图像和视频生成之后的新突破。',
    date: '2025年'
  },
  {
    title: 'AI智能体的崛起',
    description: '2025年将看到75%的企业从AI试点转向大规模运营，智能体AI和多模态模型继续塑造行业。',
    date: '2025年预测'
  }
]

export default function TechPage() {
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
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                技术前沿探索
              </h1>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                深入了解人工智能、机器学习、Web开发的最新突破和趋势。
                从GPT-5到生成式虚拟世界，探索塑造未来的技术革命。
              </p>
            </motion.div>

            {/* Featured Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {featuredTopics.map((topic, index) => {
                const Icon = topic.icon
                return (
                  <motion.div
                    key={topic.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="glass-effect rounded-xl p-6 card-hover h-full">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${topic.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-3">{topic.title}</h3>
                      <p className="text-muted-foreground text-sm">{topic.description}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* AI Breakthroughs Section */}
        <section className="py-16 bg-muted/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">2025年AI重大突破</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                了解今年最重要的人工智能突破和技术进展
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {aiBreakthroughs.map((breakthrough, index) => (
                <motion.div
                  key={breakthrough.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="glass-effect rounded-xl p-6 card-hover h-full">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {breakthrough.title}
                      </h3>
                      <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        {breakthrough.date}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {breakthrough.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">探索更多技术内容</h2>
              <p className="text-muted-foreground mb-8">
                查看所有技术相关文章，深入了解最新的技术趋势和实践经验
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/posts?category=tech">
                    查看所有技术文章
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/write">
                    分享你的技术见解
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