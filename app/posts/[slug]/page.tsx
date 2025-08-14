import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import PostContent from '@/components/posts/PostContent'
import PostHeader from '@/components/posts/PostHeader'
import PostComments from '@/components/posts/PostComments'
import PostSidebar from '@/components/posts/PostSidebar'
import RelatedPosts from '@/components/posts/RelatedPosts'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getPostBySlug } from '@/lib/db'

interface PostPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  // Return the list of known slugs for static generation
  return [
    { slug: 'gpt-5-gemini-2025-ai-breakthroughs' }
  ]
}

export async function generateMetadata({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found'
    }
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || `Read ${post.title} on Personal Blog`,
    keywords: post.tags.map((t: any) => t.tag.name),
    authors: [{ name: post.author.name || 'Anonymous' }],
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt || post.createdAt,
      authors: [post.author.name || 'Anonymous'],
      tags: post.tags.map((t: any) => t.tag.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
    }
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
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