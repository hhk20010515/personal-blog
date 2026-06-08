import StaticPage from '@/components/static/StaticPage'

export default function CopyrightPage() {
  return (
    <StaticPage
      title="版权声明"
      description="关于文章、摄影作品和引用内容的版权说明。"
    >
      <p>
        除特别注明外，本站原创文字与摄影作品版权归作者所有。转载或商业使用前请先取得授权。
      </p>
      <p>
        文章中引用的第三方图片、商标和资料归原权利人所有。
      </p>
    </StaticPage>
  )
}
