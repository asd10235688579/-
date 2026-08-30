import { Link, Outlet, useLocation } from 'react-router-dom'
import { SITE } from '../lib/config'

export default function Layout() {
  const location = useLocation()
  const isBlog = location.pathname.startsWith('/notes')

  return (
    <div className="site">
      <header className="site-header">
        <Link to="/" className="logo">
          {SITE.name}
        </Link>
        <nav className="nav">
          <Link to="/" className={!isBlog ? 'active' : ''}>
            首页
          </Link>
          <Link to="/notes" className={isBlog ? 'active' : ''}>
            笔记
          </Link>
        </nav>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>{SITE.name}</span>
        <Link to="/admin" className="muted-link">
          管理
        </Link>
      </footer>
    </div>
  )
}