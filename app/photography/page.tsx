'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Camera, Eye, Aperture, Image } from 'lucide-react'
import { motion } from 'framer-motion'

const photographyTypes = [
  {
    title: '街头摄影',
    description: '捕捉城市生活的真实瞬间，记录人们的日常故事',
    icon: Camera,
    color: 'from-amber-500 to-orange-600',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'
  },
  {
    title: '人像摄影',
    description: '展现人物的情感与个性，创造有感染力的肖像作品',
    icon: Eye,
    color: 'from-rose-500 to-pink-600',
    image: 'https://images.unsplash.com/photo-1494790108755-2616c88ca90a?w=400&h=300&fit=crop'
  },
  {
    title: '风光摄影',
    description: '记录自然的壮美与宁静，探索光影与构图的艺术',
    icon: Aperture,
    color: 'from-green-500 to-blue-600',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
  },
  {
    title: '创意摄影',
    description: '突破传统界限，用创新的视角诠释摄影艺术',
    icon: Image,
    color: 'from-purple-500 to-indigo-600',
    image: 'https://images.unsplash.com/photo-1452457807411-4979b707c5be?w=400&h=300&fit=crop'
  }
]

const featured2025Trends = [
  {
    title: '明亮大胆的色彩',
    description: '2025年摄影将回归鲜艳色彩，高对比度的鲜明构图将成为主流趋势。',
    trend: '色彩潮流'
  },
  {
    title: '真实性与情感连接',
    description: '摄影师更注重捕捉原始、真实的瞬间，反映真实的情感，特别是在人像摄影中。',
    trend: '情感表达'
  },
  {
    title: '包容性摄影',
    description: '展示不同种族、年龄、性别和能力的多元化模特，体现社会包容性。',
    trend: '多元化'
  },
  {
    title: '自然摄影回归',
    description: '摄影师探索偏远地区，捕捉令人屏息的自然场景，回归自然本真。',
    trend: '自然主义'
  }
]

const notablePhotographers = [
  {
    name: 'Joel Meyerowitz',
    specialty: '街头摄影传奇',
    description: '出版了30多本摄影集，举办过350多场展览的真正传奇人物'
  },
  {
    name: 'Phil Penman',
    specialty: '纽约街头记录者',
    description: '25年来一直在记录纽约市的生活，被评为52位最具影响力的街头摄影师之一'
  },
  {
    name: 'Clarissa Bonet',
    specialty: '芝加哥艺术摄影师',
    description: '作品曾在《卫报》和《华尔街日报》发表的芝加哥艺术家'
  }
]

interface PhotographyPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
	  publishedAt: string | null
	  createdAt: string
	  camera?: string | null
	  lens?: string | null
	  focalLength?: string | null
	  aperture?: string | null
	  shutterSpeed?: string | null
	  iso?: number | null
	  takenAt?: string | null
	  locationName?: string | null
	  photoSeries?: string | null
	  media: Array<{
    media: {
      url: string
      alt?: string | null
    }
  }>
}

export default function PhotographyPage() {
  const [latestPosts, setLatestPosts] = useState<PhotographyPost[]>([])

  const getPhotoSummary = (post: PhotographyPost) => {
    return [post.camera, post.lens, post.focalLength, post.locationName]
      .filter(Boolean)
      .slice(0, 3)
      .join(' · ')
  }

  useEffect(() => {
    const loadLatestPhotography = async () => {
      const response = await fetch('/api/posts?category=photography&limit=6')
      if (!response.ok) return

      const data = await response.json()
      setLatestPosts(data.posts)
    }

    loadLatestPhotography()
  }, [])

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
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-600 via-rose-600 to-purple-800 bg-clip-text text-transparent">
                摄影艺术世界
              </h1>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                探索光影的魅力，记录生活的美好瞬间。
                从街头摄影到风光大片，发现摄影的无限可能。
              </p>
            </motion.div>

            {/* Photography Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {photographyTypes.map((type, index) => {
                const Icon = type.icon
                return (
                  <motion.div
                    key={type.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="glass-effect rounded-xl overflow-hidden card-hover h-full">
                      <div className="aspect-video relative overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${type.image})` }}
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${type.color} opacity-60 group-hover:opacity-40 transition-opacity duration-300`} />
                        <div className="absolute top-4 left-4">
                          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold mb-3">{type.title}</h3>
                        <p className="text-muted-foreground text-sm">{type.description}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {latestPosts.length > 0 && (
          <section className="py-16 bg-muted/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold mb-4">最新摄影作品</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  从真实发布内容中生成的摄影作品入口
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.08 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <Link href={`/posts/${post.slug}`}>
                      <div className="glass-effect rounded-xl overflow-hidden card-hover h-full">
                        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                          {post.media[0]?.media.url ? (
                            <img
                              src={post.media[0].media.url}
                              alt={post.media[0].media.alt || post.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-amber-500/20 to-rose-500/20" />
                          )}
                        </div>
                        <div className="p-6">
	                          <p className="text-xs text-muted-foreground mb-2">
	                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('zh-CN')}
	                          </p>
	                          {getPhotoSummary(post) && (
	                            <p className="text-xs text-primary mb-2 flex items-center gap-1">
	                              <Camera className="h-3 w-3" />
	                              {getPhotoSummary(post)}
	                            </p>
	                          )}
	                          <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 2025 Photography Trends */}
        <section className="py-16 bg-muted/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">2025年摄影趋势</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                了解今年最重要的摄影趋势和艺术方向
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featured2025Trends.map((trend, index) => (
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
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {trend.title}
                      </h3>
                      <span className="text-sm text-muted-foreground bg-gradient-to-r from-amber-500/20 to-rose-500/20 px-3 py-1 rounded-full">
                        {trend.trend}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {trend.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Notable Photographers Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">值得关注的摄影师</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                了解当代最具影响力的摄影师及其作品风格
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {notablePhotographers.map((photographer, index) => (
                <motion.div
                  key={photographer.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="glass-effect rounded-xl p-6 card-hover h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 mx-auto mb-4 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{photographer.name}</h3>
                    <p className="text-primary text-sm font-medium mb-3">{photographer.specialty}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {photographer.description}
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
              <h2 className="text-3xl font-bold mb-6">分享你的摄影作品</h2>
              <p className="text-muted-foreground mb-8">
                展示你的摄影才华，与摄影爱好者们分享创作经验和技巧
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/posts?category=photography">
                    查看摄影作品集
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/write">
                    分享你的作品
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
