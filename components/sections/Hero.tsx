'use client'

import { motion } from 'framer-motion'
import { ChevronDown, Camera, Code, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute top-40 right-20 w-32 h-32 rounded-full bg-gradient-to-r from-pink-400/20 to-red-400/20 blur-xl"
        />
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 2, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute bottom-40 left-1/4 w-16 h-16 rounded-full bg-gradient-to-r from-green-400/20 to-blue-400/20 blur-xl"
        />
      </div>

      {/* Main content */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="relative z-10 text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          variants={fadeInUp}
          className="mb-6"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="gradient-text">分享见解</span>
            <br />
            <span className="text-foreground">创造价值</span>
          </h1>
        </motion.div>

        <motion.p
          variants={fadeInUp}
          className="text-xl sm:text-2xl text-foreground/80 mb-12 leading-relaxed max-w-3xl mx-auto"
        >
          在这里，我分享关于计算机技术、摄影艺术和生活感悟的见解。
          <br />
          与志同道合的朋友一起探索、学习、成长。
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Button asChild size="lg" className="px-8 py-6 text-lg">
            <Link href="/explore">
              开始探索
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg">
            <Link href="/write">
              分享见解
            </Link>
          </Button>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-effect rounded-2xl p-6 text-center card-hover"
          >
            <Code className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-semibold mb-2">技术分享</h3>
            <p className="text-foreground/70">
              最新的技术趋势、编程技巧和开发经验分享
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-effect rounded-2xl p-6 text-center card-hover"
          >
            <Camera className="h-12 w-12 mx-auto mb-4 text-purple-500" />
            <h3 className="text-xl font-semibold mb-2">摄影艺术</h3>
            <p className="text-foreground/70">
              用镜头记录美好瞬间，分享摄影技巧和创作心得
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-effect rounded-2xl p-6 text-center card-hover"
          >
            <Heart className="h-12 w-12 mx-auto mb-4 text-pink-500" />
            <h3 className="text-xl font-semibold mb-2">生活感悟</h3>
            <p className="text-foreground/70">
              生活中的思考与感悟，与你分享人生的美好
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          variants={fadeInUp}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="flex flex-col items-center"
          >
            <span className="text-sm text-foreground/60 mb-2">继续探索</span>
            <ChevronDown className="h-6 w-6 text-foreground/60" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}