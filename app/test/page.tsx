export default function TestPage() {
  return (
    <div className="p-8">
      <h1>测试页面</h1>
      <p>如果你能看到这个页面，说明路由系统正常工作。</p>
      <p>时间戳: {new Date().toISOString()}</p>
    </div>
  )
}