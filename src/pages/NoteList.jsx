import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicNotes } from '../lib/api'
import { useAuth } from '../lib/auth'

export default function NoteList() {
  const [notes, setNotes] = useState(null)
  const [error, setError] = useState(null)
  const { session } = useAuth()

  useEffect(() => {
    getPublicNotes()
      .then(setNotes)
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="empty">加载失败:{error}</div>
  if (!notes) return <div className="empty">加载中…</div>
  if (notes.length === 0) {
    return (
      <div className="empty">
        <p>还没有公开笔记。</p>
        {session ? (
          <Link to="/admin">去写一篇 →</Link>
        ) : (
          <Link to="/admin">管理入口</Link>
        )}
      </div>
    )
  }

  return (
    <div className="note-list">
      <h1 className="page-title">笔记</h1>
      {notes.map((n) => (
        <Link key={n.id} to={`/notes/${n.id}`} className="note-card">
          <h2>{n.title}</h2>
          {n.summary && <p>{n.summary}</p>}
          <div className="note-meta">
            <time>{new Date(n.created_at).toLocaleDateString('zh-CN')}</time>
            {n.tags && n.tags.length > 0 && (
              <span className="tags">
                {n.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}