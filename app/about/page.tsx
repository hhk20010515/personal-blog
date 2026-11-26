import Link from 'next/link'
import StaticPage from '@/components/static/StaticPage'

export default function AboutPage() {
  return (
    <StaticPage
      title="关于"
      description="一个用胶片记录日常的人，也是一个写代码的工程师。"
    >
      <p>
        你好，我是 Kai。这里主要放我的胶片摄影作品，以及拍摄过程中关于器材、胶卷和冲扫的笔记。
      </p>
      <p>
        我偏爱老相机，常用的是 Leica M5 和 Bronica ETRS：一台旁轴，一台中画幅。
        胶片的慢让我更在意每一次按下快门之前的观察，也更珍惜那些不完美的颗粒和色彩。
      </p>
      <p>
        平时我做网络、计算机视觉和 3D 重建相关的工作，所以这里也会偶尔写一些技术文章。
      </p>
      <p>
        想看作品可以去 <Link href="/photography">摄影</Link>，用过的器材在 <Link href="/gear">器材</Link>，
        有任何想法欢迎 <Link href="/contact">联系我</Link>。
      </p>
    </StaticPage>
  )
}
