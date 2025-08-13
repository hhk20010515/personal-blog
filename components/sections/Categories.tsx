'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Code, Camera, Heart, ArrowRight } from 'lucide-react'

const categories = [
  {
    id: 'tech',
    name: '技术',
    description: '编程、开发经验和技术趋势分享',
    icon: Code,
    color: 'from-blue-500 to-cyan-500',
    count: 24,
    href: '/tech'
  },
  {
    id: 'photography',
    name: '摄影',
    description: '摄影作品展示和技巧分享',
    icon: Camera,
    color: 'from-purple-500 to-pink-500',
    count: 18,
    href: '/photography'
  },
  {
    id: 'life',
    name: '生活',
    description: '生活感悟和个人思考',
    icon: Heart,
    color: 'from-orange-500 to-red-500',
    count: 12,
    href: '/life'
  }
]

export default function Categories() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            探索<span className="gradient-text">内容分类</span>
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            按照不同主题探索我的见解和分享
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={category.href}>
                  <div className="group glass-effect rounded-2xl p-8 text-center card-hover relative overflow-hidden">
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    
                    <p className="text-foreground/70 mb-6 leading-relaxed">
                      {category.description}
                    </p>

                    {/* Stats and CTA */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/60">
                        {category.count} 篇文章
                      </span>
                      <ArrowRight className="h-5 w-5 text-primary transform group-hover:translate-x-1 transition-transform" />
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className={`h-full bg-gradient-to-r ${category.color}`} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Browse all categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link 
            href="/categories" 
            className="inline-flex items-center text-lg font-medium text-primary hover:text-primary/80 transition-colors group"
          >
            浏览所有分类
            <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}