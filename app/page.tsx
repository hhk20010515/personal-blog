import Hero from '@/components/sections/Hero'
import FeaturedPosts from '@/components/sections/FeaturedPosts'
import GearReviews from '@/components/sections/GearReviews'
import Categories from '@/components/sections/Categories'
import Newsletter from '@/components/sections/Newsletter'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturedPosts />
        <GearReviews />
        <Categories />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
