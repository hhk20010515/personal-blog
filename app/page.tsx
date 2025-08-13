import Hero from '@/components/sections/Hero'
import FeaturedPosts from '@/components/sections/FeaturedPosts'
import Categories from '@/components/sections/Categories'
import Newsletter from '@/components/sections/Newsletter'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturedPosts />
        <Categories />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}