import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface StaticPageProps {
  title: string
  description: string
  children: React.ReactNode
}

export default function StaticPage({ title, description, children }: StaticPageProps) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
        <section className="pt-28 pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{title}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10">{description}</p>
            <div className="prose prose-lg max-w-none text-foreground/80 space-y-6">
              {children}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
