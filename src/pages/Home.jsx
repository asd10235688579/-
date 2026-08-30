// 首页:纯展示页,无导航无按钮无入口。游客看到的只有介绍文字和背景图。
// 浏览入口在 /longyeyeye(访客通过网址后缀进入)。
export default function Home() {
  return (
    <div className="home-cover">
      <div className="cover-content">
        <h1 className="cover-title">夜与月</h1>
        <p className="cover-subtitle">个人笔记 · 慢思考的地方</p>
        <p className="cover-about">
          这里是我记录思考、收藏灵感与日常碎片的一处安静角落。
          山月无声,夜长灯明。欢迎在月色好的时候来坐坐。
        </p>
      </div>
    </div>
  )
}