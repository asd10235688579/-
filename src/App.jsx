import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import Layout from './components/Layout'
import Home from './pages/Home'
import LongYeye from './pages/LongYeye'
import NoteList from './pages/NoteList'
import NoteDetail from './pages/NoteDetail'
import AdminLogin from './pages/AdminLogin'
import Admin from './pages/Admin'

function AdminGuard({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="empty">加载中…</div>
  if (!session) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 首页:独立全屏展示页,不套导航 */}
          <Route index element={<Home />} />
          <Route element={<Layout />}>
            <Route path="longyeyeye" element={<LongYeye />} />
            <Route path="notes" element={<NoteList />} />
            <Route path="notes/:id" element={<NoteDetail />} />
          </Route>
          <Route path="admin/login" element={<AdminLogin />} />
          <Route
            path="admin"
            element={
              <AdminGuard>
                <Admin />
              </AdminGuard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}