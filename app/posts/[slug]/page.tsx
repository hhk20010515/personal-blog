'use client'

import { useState, useEffect } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import PostContent from '@/components/posts/PostContent'
import PostHeader from '@/components/posts/PostHeader'
import PostComments from '@/components/posts/PostComments'
import PostSidebar from '@/components/posts/PostSidebar'
import RelatedPosts from '@/components/posts/RelatedPosts'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface PostPageProps {
  params: {
    slug: string
  }
}

export default function PostPage({ params }: PostPageProps) {
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadPost = async () => {
      try {
        // Use mock data instead of API call for now
        const mockPost = {
          id: '1',
          slug: 'gpt-5-gemini-2025-ai-breakthroughs',
          title: 'GPT-5与Gemini 2.5：2025年AI大语言模型新突破',
          content: `# GPT-5与Gemini 2.5：2025年AI大语言模型新突破

2025年对人工智能领域来说是令人兴奋的一年。我们见证了两个重要的大语言模型发布：OpenAI的GPT-5和Google的Gemini 2.5。这两个模型都在各自的基础上实现了显著的改进。

## GPT-5的主要改进

GPT-5在多个方面都有了质的飞跃：

### 推理能力提升
- 复杂数学问题解决能力提升40%
- 逻辑推理准确率达到95%
- 支持多步骤问题分解

### 多模态集成
- 原生支持图像、音频、视频理解
- 实时语音对话能力
- 3D空间理解

### 效率优化
- 推理速度提升3倍
- 能耗降低50%
- 支持边缘设备部署

## Gemini 2.5的特色功能

Google的Gemini 2.5也带来了令人印象深刻的功能：

### 科学研究助手
- 专业论文分析
- 实验设计建议
- 数据可视化生成

### 代码生成优化
- 支持200+编程语言
- 自动化测试生成
- 性能优化建议

### 实时协作
- 多用户同时交互
- 上下文共享
- 版本控制集成

## 对开发者的影响

这些新模型为开发者带来了更多可能性：

1. **更智能的应用**：集成这些模型可以创建更智能、更有用的应用程序
2. **降低门槛**：更好的API和工具使得AI集成变得更加容易
3. **新的商业模式**：AI能力的提升开辟了新的商业机会

## 结论

GPT-5和Gemini 2.5的发布标志着AI技术的又一次重大进步。作为开发者和技术爱好者，我们应该紧跟这些发展，探索如何将这些强大的工具应用到我们的项目中。

这只是AI革命的开始，让我们期待更多令人兴奋的发展！`,
          excerpt: '探索2025年最新发布的GPT-5和Gemini 2.5两大AI模型的突破性功能和对开发者的影响。',
          metaTitle: 'GPT-5与Gemini 2.5：2025年AI大语言模型新突破',
          metaDescription: '深入了解2025年最新AI模型GPT-5和Gemini 2.5的核心功能、技术突破和实际应用场景。',
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          createdAt: '2025-01-10T10:00:00Z',
          updatedAt: '2025-01-10T10:00:00Z',
          publishedAt: '2025-01-10T10:00:00Z',
          author: {
            id: 'admin',
            name: 'Administrator',
            email: 'admin@example.com',
            image: null,
            bio: 'Tech enthusiast and AI researcher'
          },
          category: {
            id: 'tech',
            name: '技术',
            slug: 'tech'
          },
          tags: [
            { tag: { id: 'ai', name: 'AI', slug: 'ai' } },
            { tag: { id: 'gpt', name: 'GPT', slug: 'gpt' } },
            { tag: { id: 'gemini', name: 'Gemini', slug: 'gemini' } }
          ],
          media: [],
          viewCount: 125,
          likeCount: 15,
          commentCount: 8,
          _count: {
            likes: 15,
            comments: 8
          }
        }

        if (params.slug === mockPost.slug) {
          setPost(mockPost)
        } else {
          // Post not found
          router.push('/404')
          return
        }
      } catch (error) {
        console.error('Failed to load post:', error)
        router.push('/404')
      } finally {
        setLoading(false)
      }
    }

    loadPost()
  }, [params.slug, router])

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    )
  }

  if (!post) {
    return notFound()
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      image: post.author.image,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Personal Blog',
      logo: {
        '@type': 'ImageObject',
        url: '/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://yourdomain.com/posts/${post.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Header />
      
      <article className="min-h-screen bg-background">
        <PostHeader post={{
          ...post,
          createdAt: post.createdAt,
          publishedAt: post.publishedAt || null,
        }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <PostContent post={post} />
              <PostComments postId={post.id} />
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <PostSidebar post={{
                ...post,
                createdAt: post.createdAt,
                publishedAt: post.publishedAt || null,
              }} />
            </div>
          </div>
        </div>
        
        {/* Related Posts */}
        <RelatedPosts 
          currentPostId={post.id}
          categoryId={post.category?.id}
          tags={post.tags.map((t: any) => t.tag.id)}
        />
      </article>
      
      <Footer />
    </>
  )
}