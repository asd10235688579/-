import { Link } from 'react-router-dom'

// 入口页:访客通过网址后缀 /longyeyeye 进入,点按钮前往笔记列表
export default function LongYeye() {
  return (
    <div className="gate">
      <div className="gate-card">
        <p className="gate-tip">/ 长廊 /</p>
        <h1 className="gate-title">夜与月的笔记</h1>
        <p className="gate-desc">
          文字、代码、影像与声音,都收在这条长廊里。
          挑一篇,慢慢读。
        </p>
        <Link to="/notes" className="btn btn-primary btn-gate">
          浏览笔记
        </Link>
      </div>
    </div>
  )
}